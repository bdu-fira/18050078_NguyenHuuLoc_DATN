const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get messages by device ID, type, and time range
router.get('/messages', messageController.getMessagesByTimeRange);

// Get signal quality metrics
router.get('/signal-metrics', messageController.getSignalMetrics);

module.exports = router;
