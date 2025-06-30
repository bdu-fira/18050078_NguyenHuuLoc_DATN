const SensorData = require('../models/sensorData');

/**
 * Get sensor data by device ID and time range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSensorDataByTimeRange = async (req, res) => {
  try {
    const { deviceId, hours = 24 } = req.query; // Lấy cả deviceId và hours từ query
    
    // Validate required fields
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }
    
    // Validate hours is a positive number
    const hoursNum = parseInt(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hours must be a positive number'
      });
    }
    
    // Calculate the start date based on hours
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hoursNum);
    
    // Query the database
    console.log(deviceId);
    console.log(startDate);
    const data = await SensorData.find({
      deviceId: deviceId,
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: 1 }) // Sort by createdAt in ascending order
    .select('-__v -_id') // Exclude unnecessary fields
    .lean();

    // Return empty array if no data found
    res.status(200).json({
      success: true,
      count: data.length,
      data: data || []
    });

  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getSensorDataByTimeRange
};
