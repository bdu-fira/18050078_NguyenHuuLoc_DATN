const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  functions: [{
    name: {
      type: String,
      required: true,
      enum: ['led', 'relay', 'motor', 'fan', 'pump'],
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['switch', 'dimmer', 'button'],
      default: 'switch'
    },
    pin: {
      type: Number,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      min: 0,
      max: 255,
      default: 0
    },
    label: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      trim: true,
      default: ''
    }
  }],
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
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  // Sensor values object
  // Format: { temperature: number, humidity: number, ... }
  sensors: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'devices',
  strict: false // Allow dynamic fields in the payload
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
