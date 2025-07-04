const Device = require('../models/device');

// Create a new device
exports.createDevice = async (req, res) => {
  try {
    const { deviceId, name, description, location, sensors = {} } = req.body;
    
    // Check if device with the same deviceId already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Device with this ID already exists' 
      });
    }

    // Create sensors map from the sensors object
    const sensorsMap = new Map(Object.entries(sensors));

    const device = new Device({
      deviceId,
      name,
      description: description || '',
      sensors: sensorsMap,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      }
    });

    await device.save();
    
    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating device',
      error: error.message
    });
  }
};

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching devices',
      error: error.message
    });
  }
};

// Get single device by deviceId
exports.getDevice = async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid deviceId is required as a query parameter'
      });
    }
    
    // Trim whitespace and ensure case-insensitive search
    const trimmedDeviceId = deviceId.trim();
    const device = await Device.findOne({ 
      deviceId: { $regex: new RegExp(`^${trimmedDeviceId}$`, 'i') } 
    }).select('-__v');
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device',
      error: error.message
    });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const { deviceId } = req.query;
    const { name, description, location, sensors = {} } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required as a query parameter'
      });
    }
    
    // Create sensors map from the sensors object
    const sensorsMap = new Map(Object.entries(sensors));
    
    const updateData = {
      name,
      description,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      sensors: sensorsMap
    };
    
    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedDevice) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedDevice
    });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating device',
      error: error.message
    });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required as a query parameter'
      });
    }
    
    const device = await Device.findOneAndDelete({ deviceId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting device',
      error: error.message
    });
  }
};
