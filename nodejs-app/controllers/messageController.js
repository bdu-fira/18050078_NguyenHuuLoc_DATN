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

    const data = messages.map(message => (message?.data?.rx_metadata?.[0]));
    res.status(200).json({ success: true, count: messages.length, data });

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

    const query = { deviceId, timestamp: { $gte: start, $lte: end } };

    let signals;
    if (type === 'uplink') {
      signals = await UplinkMessage.find(query)
        .select('data.rx_metadata data.packet_error_rate data.consumed_airtime data.confirmed')
        .lean();
    } else {
      signals = await DownlinkMessage.find(query)
        .select('rawData.downlink_ack.correlation_ids rawData.downlink_ack.confirmed_retry rawData.downlink_ack.confirmed')
        .lean();
    }

    if (!signals || !Array.isArray(signals) || signals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No messages found for the specified time range and device ID'
      });
    }

    const calcMedian = arr => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const metrics = type === 'uplink' ? {
      rssi: { values: [], average: 0, median: 0 },
      snr: { values: [], average: 0, median: 0 },
      packetErrorRate: { values: [], average: 0, median: 0 },
      airtime: { values: [], average: 0, median: 0 },
      // confirmed: { total: 0, percentage: 0 },
      count: 0
    } : {
      correlationIds: { values: [], average: 0, median: 0 },
      retryAttempts: { values: [], average: 0, median: 0 },
      confirmed: { total: 0, percentage: 0 },
      count: 0
    };

    signals.forEach(msg => {
      metrics.count++;

      if (type === 'uplink') {
        if (msg.data?.rx_metadata) {
          msg.data.rx_metadata.forEach(gateway => {
            if (gateway.rssi !== undefined) metrics.rssi.values.push(gateway.rssi);
            if (gateway.snr !== undefined) metrics.snr.values.push(gateway.snr);
          });
        }

        if (msg.data?.packet_error_rate !== undefined) {
          metrics.packetErrorRate.values.push(msg.data.packet_error_rate);
        }

        if (msg.data?.consumed_airtime) {
          const match = msg.data.consumed_airtime.match(/(\d+\.?\d*)s/);
          if (match) metrics.airtime.values.push(parseFloat(match[1]));
        }

        // if (msg.data?.confirmed) metrics.confirmed.total++;
      } else {
        if (msg.rawData?.downlink_ack?.correlation_ids) {
          metrics.correlationIds.values.push(msg.rawData.downlink_ack.correlation_ids.length);
        }
        if (msg.rawData?.downlink_ack?.confirmed_retry?.attempt) {
          metrics.retryAttempts.values.push(msg.rawData.downlink_ack.confirmed_retry.attempt);
        }
        if (msg.rawData?.downlink_ack?.confirmed) metrics.confirmed.total++;
      }
    });

    // Tính trung bình và trung vị
    if (type === 'uplink') {
      if (metrics.rssi.values.length > 0) {
        metrics.rssi.average = metrics.rssi.values.reduce((a, b) => a + b, 0) / metrics.rssi.values.length;
        metrics.rssi.median = calcMedian(metrics.rssi.values);
      }
      if (metrics.snr.values.length > 0) {
        metrics.snr.average = metrics.snr.values.reduce((a, b) => a + b, 0) / metrics.snr.values.length;
        metrics.snr.median = calcMedian(metrics.snr.values);
      }
      if (metrics.packetErrorRate.values.length > 0) {
        metrics.packetErrorRate.average = metrics.packetErrorRate.values.reduce((a, b) => a + b, 0) / metrics.packetErrorRate.values.length;
        metrics.packetErrorRate.median = calcMedian(metrics.packetErrorRate.values);
      }
      if (metrics.airtime.values.length > 0) {
        metrics.airtime.average = metrics.airtime.values.reduce((a, b) => a + b, 0) / metrics.airtime.values.length;
        metrics.airtime.median = calcMedian(metrics.airtime.values);
      }
      // if (metrics.count > 0) metrics.confirmed.percentage = (metrics.confirmed.total / metrics.count) * 100;
    } else {
      if (metrics.correlationIds.values.length > 0) {
        metrics.correlationIds.average = metrics.correlationIds.values.reduce((a, b) => a + b, 0) / metrics.correlationIds.values.length;
        metrics.correlationIds.median = calcMedian(metrics.correlationIds.values);
      }
      if (metrics.retryAttempts.values.length > 0) {
        metrics.retryAttempts.average = metrics.retryAttempts.values.reduce((a, b) => a + b, 0) / metrics.retryAttempts.values.length;
        metrics.retryAttempts.median = calcMedian(metrics.retryAttempts.values);
      }
      if (metrics.count > 0) metrics.confirmed.percentage = (metrics.confirmed.total / metrics.count) * 100;
    }

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Error calculating signal metrics:', error);
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
