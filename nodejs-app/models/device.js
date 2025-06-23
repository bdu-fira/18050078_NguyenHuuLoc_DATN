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
      required: true
    },
    lng: {
      type: Number,
      required: true
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
  sensorConfigurations: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt timestamp before saving
deviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a compound index for location
// This is useful for geospatial queries if needed in the future
deviceSchema.index({ 'location.lat': 1, 'location.lng': 1 });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
