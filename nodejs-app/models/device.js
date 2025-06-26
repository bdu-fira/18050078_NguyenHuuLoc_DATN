const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  location: {
    lat: {
      type: Number,
      required: false,
      default: 0
    },
    lng: {
      type: Number,
      required: false,
      default: 0
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Sensor values object
  // Format: { temperature: number, humidity: number, ... }
  sensors: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: false,
  collection: 'devices',
  strict: false // Allow dynamic fields in the payload
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
