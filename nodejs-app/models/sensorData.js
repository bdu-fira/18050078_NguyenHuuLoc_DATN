const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Sensor data fields
  ADC_CH0V: {
    type: Number,
    required: false
  },
  BatV: {
    type: Number,
    required: false
  },
  Digital_IStatus: {
    type: String,
    enum: ['L', 'H'],
    required: false
  },
  Door_status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    required: false
  },
  EXTI_Trigger: {
    type: String,
    enum: ['TRUE', 'FALSE'],
    required: false
  },
  Hum_SHT: {
    type: Number,
    required: false
  },
  Node_type: {
    type: String,
    required: false
  },
  TempC1: {
    type: Number,
    required: false
  },
  TempC_SHT: {
    type: Number,
    required: false
  },
  Work_mode: {
    type: String,
    required: false
  },
  // Keep the original fields for backward compatibility
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'sensors_data',
  strict: false // Allow dynamic fields in the payload
});

// Create 2dsphere index for location-based queries
sensorDataSchema.index({ location: '2dsphere' });

// Create compound index for common query patterns
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

// Note: Removed text index on metadata as it's not supported with Map type
// Create model if it doesn't exist to prevent OverwriteModelError
module.exports = mongoose.models.SensorData || 
  mongoose.model('SensorsData', sensorDataSchema);
