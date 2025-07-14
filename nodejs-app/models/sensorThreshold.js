const mongoose = require('mongoose');

const sensorThresholdSchema = new mongoose.Schema({
  sensorType: {
    type: String,
    enum: ['temperature', 'humidity', 'co2', 'pm25'],
    required: true
  },
  threshold: {
    type: Number,
    default: null
  },
  unit: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'sensor_thresholds'
});

// Create indexes
sensorThresholdSchema.index({ sensorType: 1 });

const SensorThreshold = mongoose.model('SensorThreshold', sensorThresholdSchema);

module.exports = SensorThreshold;
