const express = require('express');
const router = express.Router();
const { getSensorDataByTimeRange } = require('../controllers/sensorDataController');

/**
 * @route   GET /api/sensor-data
 * @desc    Get sensor data by device ID and time range
 * @access  Public
 * @query   deviceId - ID of the device (required)
 * @query   hours - Number of hours of data to retrieve (e.g., 8, 12, 24, default: 24)
 */
router.get('/', getSensorDataByTimeRange);

module.exports = router;
