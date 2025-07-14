const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Get all settings
router.get('/', settingController.getSettings);

// Get setting by id or type
// You can use either:
// - /api/v1/settings/1234567890abcdef12345678 (24 character ObjectId)
// - /api/v1/settings/prompt (type name)
router.get('/:id', settingController.getSetting);

// Create or update a setting
router.post('/', settingController.upsertSetting);

// Delete a setting by id or type
// You can use either:
// - /api/v1/settings/1234567890abcdef12345678 (24 character ObjectId)
// - /api/v1/settings/prompt (type name)
router.delete('/:id', settingController.deleteSetting);

module.exports = router;
