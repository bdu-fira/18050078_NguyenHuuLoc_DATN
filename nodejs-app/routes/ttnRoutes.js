const express = require('express');
const router = express.Router();
const { handleLed } = require('../controllers/ttnController');

router.post('/led', handleLed);

module.exports = router;