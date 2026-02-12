const express = require('express');
const { validate } = require('../../middleware/validate');
const { edgeSyncValidation } = require('./webhooks.validation');
const { queue } = require('../../queue/eventBus');
const { federatedClient } = require('../../adapters/federated/client');
const { generateArPreview } = require('../../adapters/ar/previewAdapter');

const router = express.Router();

router.post('/edge-sync', edgeSyncValidation, validate, async (req, res, next) => {
  try {
    const { vaultId, deviceId, payload } = req.body;
    queue.publish('edge.sync.received', { vaultId, deviceId, payload, at: new Date() });

    const federatedResult = await federatedClient.trainLocalModel({
      userId: payload.userId || 'anonymous',
      vaultId,
      datasetRef: payload.datasetRef || 'local-dataset'
    });

    const arPreview = await generateArPreview({ taskId: payload.taskId || 'preview-task' });

    res.json({ accepted: true, federatedResult, arPreview });
  } catch (error) {
    next(error);
  }
});

module.exports = { webhooksRouter: router };
