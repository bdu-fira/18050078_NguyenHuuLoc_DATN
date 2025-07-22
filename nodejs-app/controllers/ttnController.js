const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const TTN_API_URL = process.env.TTN_API_URL;
const TTN_API_KEY = process.env.TTN_API_KEY;
const TTN_APP_ID = process.env.TTN_APP_ID;


/**
 * Send a downlink message to a TTN device
 * @param {string} appId - Application ID (e.g., 'huuloc-datotnghiep-0')
 * @param {string} deviceId - Device ID (e.g., 'eui-70b3d17dd00653c8')
 * @param {Object} payload - The payload to send
 * @param {number} [fPort=1] - The port number (default: 1)
 * @returns {Promise<Object>} The response from TTN API
 */
const sendDownlink = async (deviceId, payload, fPort = 1) => {
  try {
    const url = `${TTN_API_URL}/as/applications/${TTN_APP_ID}/devices/${deviceId}/down/push`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TTN_API_KEY}`
    };

    const data = {
      downlinks: [{
        f_port: fPort,
        confirmed: true,
        decoded_payload: payload
      }]
    };

    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error sending downlink to TTN:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to send downlink to TTN');
  }
};

/**
 * Example controller function to turn on LED
 * @route POST /api/ttn
 */
const handle = async (req, res) => {
  try {
    const { deviceId, cmd } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId is required' 
      });
    }

    const payload = { cmd };
    const result = await sendDownlink(deviceId, payload, 1);
    
    res.status(200).json({
      success: true,
      message: 'Command sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in handle:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send command'
    });
  }
};

module.exports = {
  sendDownlink,
  handle
};