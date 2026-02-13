const path = require('path');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const ffmpeg = require('fluent-ffmpeg');
const { stringify } = require('csv-stringify/sync');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { recordAudit } = require('../../middleware/audit');
const { Task } = require('../../models/Task');
const { UserProgress } = require('../../models/UserProgress');
const { assertVaultAccess } = require('../common/vaultAccess');
const { generateText, generateImageStub, synthesizeSpeechStub } = require('../../providers/aiProvider');
const { getPagination } = require('../../utils/pagination');
const { emitTaskStream, emitNotification } = require('../../realtime/emitters');
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  listTaskValidation
} = require('./tasks.validation');

// TODO: extract to microservice (task-service boundary)
const upload = multer({
  dest: path.resolve(process.cwd(), 'backend/uploads'),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const router = express.Router();

async function processMultimodalInput(file, type) {
  const processed = { fileMeta: null, ocrText: null, transcript: null };
  if (!file) return processed;

  processed.fileMeta = {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  };

  if (type === 'image') {
    try {
      const meta = await sharp(file.path).metadata();
      processed.fileMeta.image = { width: meta.width, height: meta.height, format: meta.format };
      const ocr = await Tesseract.recognize(file.path, 'eng');
      processed.ocrText = ocr.data?.text?.slice(0, 4000) || '';
    } catch (error) {
      processed.ocrText = 'OCR unavailable for this file.';
    }
  }

  if (type === 'voice' || type === 'video') {
    try {
      await new Promise((resolve) => {
        ffmpeg(file.path)
          .format('wav')
          .on('end', resolve)
          .on('error', resolve)
          .save(`${file.path}.wav`);
      });
      processed.transcript = 'FFmpeg transcription stub completed (replace with STT provider).';
    } catch (error) {
      processed.transcript = 'Media processing fallback path used.';
    }
  }

  return processed;
}

router.get('/', requireAuth, listTaskValidation, validate, async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const query = { userId: req.user.id, isDeleted: false };

    if (req.query.vaultId) query.vaultId = req.query.vaultId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { prompt: { $regex: req.query.search, $options: 'i' } },
        { 'metadata.ocrText': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Task.countDocuments(query)
    ]);

    res.json({ items, page, limit, total });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, upload.single('file'), createTaskValidation, validate, async (req, res, next) => {
  try {
    const { vaultId, prompt = '', type = 'text' } = req.body;
    const access = await assertVaultAccess({ userId: req.user.id, vaultId, minRole: 'viewer' });
    if (!access) return res.status(404).json({ error: 'Vault not found' });

    const io = req.app.get('io');

    const task = await Task.create({
      vaultId,
      userId: req.user.id,
      type,
      prompt,
      input: { hasFile: Boolean(req.file) },
      status: 'processing'
    });

    const processed = await processMultimodalInput(req.file, type);

    const textResponse = await generateText({ prompt: `${prompt}\n${processed.ocrText || ''}`.trim() });
    const imageResponse = type === 'image' ? await generateImageStub({ prompt }) : null;
    const speechResponse = type === 'voice' ? await synthesizeSpeechStub({ text: textResponse }) : null;

    const output = {
      text: textResponse,
      image: imageResponse,
      speech: speechResponse
    };

    task.output = output;
    task.response = output;
    task.metadata = {
      ...task.metadata,
      ocrText: processed.ocrText,
      transcript: processed.transcript,
      estimatedTimeSavedMinutes: Math.max(5, Math.ceil(prompt.length / 40))
    };
    task.input = {
      ...task.input,
      fileMeta: processed.fileMeta
    };
    task.mediaUrl = processed.fileMeta ? `/uploads/${processed.fileMeta.filename}` : undefined;
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    const chunks = textResponse.match(/.{1,60}/g) || [textResponse];
    emitTaskStream(io, vaultId, task._id.toString(), chunks);

    const todayKey = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const progress = await UserProgress.findOne({ userId: req.user.id });
    if (!progress) {
      await UserProgress.create({
        userId: req.user.id,
        currentStreak: 1,
        longestStreak: 1,
        badges: ['first-task'],
        weeklyCompletedMinutes: task.metadata.estimatedTimeSavedMinutes,
        productivityScore: 3,
        level: 1,
        lastActiveDate: new Date()
      });
    } else {
      const lastKey = progress.lastActiveDate ? new Date(progress.lastActiveDate).toISOString().slice(0, 10) : null;
      if (lastKey !== todayKey) {
        if (lastKey === yesterdayKey) progress.currentStreak += 1;
        else progress.currentStreak = 1;
      }

      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
      progress.weeklyCompletedMinutes += task.metadata.estimatedTimeSavedMinutes;
      progress.productivityScore += 3;
      progress.level = Math.max(1, Math.floor(progress.productivityScore / 20) + 1);
      progress.lastActiveDate = new Date();

      const badgeSet = new Set(progress.badges || []);
      badgeSet.add('first-task');
      if (progress.currentStreak >= 3) badgeSet.add('streak-3');
      if (progress.currentStreak >= 7) badgeSet.add('streak-7');
      progress.badges = Array.from(badgeSet);

      await progress.save();
    }

    emitNotification(io, vaultId, 'Task completed privately in your vault.');

    await recordAudit({
      userId: req.user.id,
      vaultId,
      action: 'task.created',
      metadata: { taskId: task._id, type },
      ip: req.ip
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', requireAuth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id, isDeleted: false }).sort({ createdAt: -1 }).lean();
    const records = tasks.map((task) => ({
      id: task._id.toString(),
      vaultId: task.vaultId.toString(),
      type: task.type,
      status: task.status,
      prompt: task.prompt,
      createdAt: task.createdAt
    }));

    const csv = stringify(records, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get('/:taskId', requireAuth, taskIdValidation, validate, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id, isDeleted: false }).lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.patch('/:taskId', requireAuth, updateTaskValidation, validate, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.user.id, isDeleted: false },
      {
        ...(req.body.prompt ? { prompt: req.body.prompt } : {}),
        ...(req.body.status ? { status: req.body.status } : {})
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/:taskId', requireAuth, taskIdValidation, validate, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.user.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });
    await recordAudit({
      userId: req.user.id,
      vaultId: task.vaultId,
      action: 'task.deleted',
      metadata: { taskId: task._id },
      ip: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = { tasksRouter: router };
