const express = require('express');
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { completeOnboardingValidation } = require('./onboarding.validation');
const { User } = require('../../models/User');
const { Vault } = require('../../models/Vault');
const { VaultMember } = require('../../models/VaultMember');
const { Task } = require('../../models/Task');
const { generateText, generateImageStub } = require('../../providers/aiProvider');
const Tesseract = require('tesseract.js');

const upload = multer({
  dest: path.resolve(process.cwd(), 'backend/uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

router.post('/demo', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { vaultName, prompt } = req.body;
    const promptText = (prompt || 'What are the main benefits of a private AI vault for personal data?').trim();

    let vault = await Vault.findOne({ ownerId: req.user.id, isDeleted: false });
    if (!vault) {
      vault = await Vault.create({
        ownerId: req.user.id,
        name: vaultName || 'My Private Vault',
        theme: 'aurora',
        avatar: 'shield'
      });
      await VaultMember.create({
        vaultId: vault._id,
        userId: req.user.id,
        role: 'owner',
        acceptedAt: new Date()
      });
    }

    let ocrText = '';
    if (req.file && req.file.mimetype?.startsWith('image/')) {
      try {
        const ocr = await Tesseract.recognize(req.file.path, 'eng');
        ocrText = ocr.data?.text?.slice(0, 2000) || '';
      } catch {
        ocrText = '';
      }
    }

    const fullPrompt = ocrText ? `${promptText}\n\nExtracted text from image:\n${ocrText}` : promptText;
    const textResponse = await generateText({ prompt: fullPrompt });
    const imageResponse = ocrText ? await generateImageStub({ prompt: promptText }) : null;

    const task = await Task.create({
      vaultId: vault._id,
      userId: req.user.id,
      type: req.file ? 'image' : 'text',
      prompt: promptText,
      input: { hasFile: Boolean(req.file) },
      status: 'completed',
      output: { text: textResponse, image: imageResponse },
      metadata: { ocrText: ocrText || null, isDemo: true }
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.get('/state', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json({
      onboardingCompleted: user?.onboardingCompleted || false,
      preferences: user?.preferences || {}
    });
  } catch (error) {
    next(error);
  }
});

router.post('/complete', requireAuth, completeOnboardingValidation, validate, async (req, res, next) => {
  try {
    const { vaultName, theme, avatar, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        onboardingCompleted: true,
        ...(preferences ? { preferences } : {})
      },
      { new: true }
    );

    const existingVault = await Vault.findOne({ ownerId: req.user.id, isDeleted: false });
    let vault = existingVault;
    if (!vault) {
      vault = await Vault.create({
        ownerId: req.user.id,
        name: vaultName,
        theme: theme || 'slate',
        avatar: avatar || 'shield'
      });
      await VaultMember.create({
        vaultId: vault._id,
        userId: req.user.id,
        role: 'owner',
        acceptedAt: new Date()
      });
    } else {
      vault = await Vault.findByIdAndUpdate(
        vault._id,
        { name: vaultName || vault.name, theme: theme || vault.theme, avatar: avatar || vault.avatar },
        { new: true }
      );
    }

    res.json({
      onboardingCompleted: user.onboardingCompleted,
      vaultId: vault._id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { onboardingRouter: router };
