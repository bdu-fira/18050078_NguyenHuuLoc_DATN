const UplinkMessage = require('../models/uplinkMessage');
const DownlinkMessage = require('../models/downlinkMessage');

/**
 * Get messages by device ID, type, and time range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessagesByTimeRange = async (req, res) => {
  try {
    const { deviceId, type, startDate, endDate } = req.query;
    
    if (!deviceId) return res.status(400).json({ success: false, message: 'Device ID is required' });
    if (!type || !['uplink', 'downlink'].includes(type)) return res.status(400).json({ success: false, message: 'Type must be either "uplink" or "downlink"' });
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate and endDate are required' });

    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Invalid date format' });

    const query = {
      deviceId,
      timestamp: { $gte: start, $lte: end }
    };

    const model = type === 'uplink' ? UplinkMessage : DownlinkMessage;
    const messages = await model.find(query)
      .sort({ timestamp: 1 })
      .select('-__v -_id')
      .lean();

    res.status(200).json({ success: true, count: messages.length, data: messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get average signal quality metrics for LoRa messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSignalMetrics = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, type } = req.query;
    
    if (!deviceId) return res.status(400).json({ success: false, message: 'Device ID is required' });
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    if (!type || !['uplink', 'downlink'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either "uplink" or "downlink"' });
    }

    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Invalid date format' });

    const query = {
      deviceId,
      timestamp: { $gte: start, $lte: end }
    };

    // Get messages based on type
    let signals;
    if (type === 'uplink') {
      signals = await UplinkMessage.find(query)
        .select('data.rx_metadata data.packet_error_rate data.consumed_airtime data.confirmed')
        .lean();
    } else if (type === 'downlink') {
      signals = await DownlinkMessage.find(query)
        .select('rawData.downlink_ack.correlation_ids rawData.downlink_ack.confirmed_retry rawData.downlink_ack.confirmed')
        .lean();
    }

    // If no messages found, return empty metrics
    if (!signals || !Array.isArray(signals) || signals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No messages found for the specified time range and device ID' 
      });
    }
    console.log("signals", signals);

    // Initialize metrics
    const metrics = type === 'uplink' ? {
      rssi: { count: 0, sum: 0, average: 0 },
      snr: { count: 0, sum: 0, average: 0 },
      packetErrorRate: { count: 0, sum: 0, average: 0 },
      airtime: { count: 0, sum: 0, average: 0 },
      confirmed: { count: 0, total: 0, percentage: 0 },
      count: 0
    } : {
      correlationIds: { count: 0, total: 0, average: 0 },
      retryAttempts: { count: 0, sum: 0, average: 0 },
      confirmed: { count: 0, total: 0, percentage: 0 },
      count: 0
    };

    // Process messages
    signals.forEach(msg => {
      if (type === 'uplink') {
        metrics.count++;
        
        // Process RSSI and SNR from all gateways
        if (msg.data?.rx_metadata) {
          msg.data.rx_metadata.forEach(gateway => {
            if (gateway.rssi !== undefined) {
              metrics.rssi.count++;
              metrics.rssi.sum += gateway.rssi;
            }
            if (gateway.snr !== undefined) {
              metrics.snr.count++;
              metrics.snr.sum += gateway.snr;
            }
          });
        }

        // Process packet error rate
        if (msg.data?.packet_error_rate !== undefined) {
          metrics.packetErrorRate.count++;
          metrics.packetErrorRate.sum += msg.data.packet_error_rate;
        }

        // Process airtime
        if (msg.data?.consumed_airtime) {
          const match = msg.data.consumed_airtime.match(/(\d+\.?\d*)s/);
          if (match) {
            const airtimeSeconds = parseFloat(match[1]);
            metrics.airtime.count++;
            metrics.airtime.sum += airtimeSeconds;
          }
        }

        // Process confirmed status
        metrics.confirmed.count++;
        metrics.confirmed.total += msg.data?.confirmed ? 1 : 0;
      } else { // downlink
        metrics.count++;
        
        // Process correlation IDs
        if (msg.rawData?.downlink_ack?.correlation_ids) {
          metrics.correlationIds.count++;
          metrics.correlationIds.total += msg.rawData.downlink_ack.correlation_ids.length;
        }

        // Process retry attempts
        if (msg.rawData?.downlink_ack?.confirmed_retry?.attempt) {
          metrics.retryAttempts.count++;
          metrics.retryAttempts.sum += msg.rawData.downlink_ack.confirmed_retry.attempt;
        }

        // Process confirmed status
        metrics.confirmed.count++;
        metrics.confirmed.total += msg.rawData?.downlink_ack?.confirmed ? 1 : 0;
      }
    });

    // Calculate averages
    if (type === 'uplink') {
      if (metrics.rssi.count > 0) metrics.rssi.average = metrics.rssi.sum / metrics.rssi.count;
      if (metrics.snr.count > 0) metrics.snr.average = metrics.snr.sum / metrics.snr.count;
      if (metrics.packetErrorRate.count > 0) metrics.packetErrorRate.average = metrics.packetErrorRate.sum / metrics.packetErrorRate.count;
      if (metrics.airtime.count > 0) metrics.airtime.average = metrics.airtime.sum / metrics.airtime.count;
      if (metrics.confirmed.count > 0) metrics.confirmed.percentage = (metrics.confirmed.total / metrics.confirmed.count) * 100;
    } else { // downlink
      if (metrics.correlationIds.count > 0) metrics.correlationIds.average = metrics.correlationIds.total / metrics.correlationIds.count;
      if (metrics.retryAttempts.count > 0) metrics.retryAttempts.average = metrics.retryAttempts.sum / metrics.retryAttempts.count;
      if (metrics.confirmed.count > 0) metrics.confirmed.percentage = (metrics.confirmed.total / metrics.confirmed.count) * 100;
    }

    // Prepare response
    const responseMetrics = {
      count: metrics.count,
      ...metrics
    };

    res.json({ success: true, metrics: responseMetrics });

  } catch (error) {
    console.error('Error calculating signal metrics:', {
      error: error.message,
      stack: error.stack,
      query: { deviceId, startDate, endDate, type }
    });
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating signal metrics',
      error: error.message 
    });
  }
};

module.exports = {
  getMessagesByTimeRange,
  getSignalMetrics
};
