const SensorData = require('../models/sensorData');

/**
 * Get sensor data by device ID and time range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSensorDataByTimeRange = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, hours } = req.query;
    
    // Validate required fields
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    // Build query conditions
    const query = { deviceId };
    
    // Handle date range or hours parameter
    if (startDate && endDate) {
      // Handle date range
      const start = new Date(parseInt(startDate));
      const end = new Date(parseInt(endDate));
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Please provide valid timestamps.'
        });
      }
      
      query.createdAt = { $gte: start, $lte: end };
    } else if (hours) {
      // Handle hours parameter (legacy support)
      const hoursNum = parseInt(hours) || 24; // Default to 24 hours if invalid
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hoursNum);
      
      query.createdAt = { $gte: startDate };
    }
    
    // Query the database
    const data = await SensorData.find(query)
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
