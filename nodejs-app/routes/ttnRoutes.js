const express = require('express');
const router = express.Router();
const { handle } = require('../controllers/ttnController');

router.post('/', handle);

module.exports = router;