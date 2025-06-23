const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Create a new device
router.post('/', deviceController.createDevice);

// Get all devices or a single device by deviceId
router.get('/', (req, res) => {
  if (req.query.deviceId) {
    return deviceController.getDevice(req, res);
  }
  return deviceController.getDevices(req, res);
});

// Update device by deviceId (query parameter)
router.put('/', deviceController.updateDevice);

// Delete device by deviceId (query parameter)
router.delete('/', deviceController.deleteDevice);

module.exports = router;
