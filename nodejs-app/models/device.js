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
  // Sensor values object
  // Format: { temperature: number, humidity: number, ... }
  sensors: {
    type: Map,
    of: Number,
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

// Create model if it doesn't exist to prevent OverwriteModelError
const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);

// Ensure no TTL indexes exist on this collection
const removeTTLIndexes = async () => {
  try {
    const collection = mongoose.connection.db.collection('devices');
    const indexes = await collection.indexes();
    
    for (const index of indexes) {
      // Check if this is a TTL index
      if (index.expireAfterSeconds) {
        await collection.dropIndex(index.name);
        console.log(`Dropped TTL index: ${index.name}`);
      }
    }
  } catch (error) {
    console.error('Error removing TTL indexes:', error);
  }
};

// Run this when the model is loaded
if (mongoose.connection.readyState === 1) { // 1 = connected
  removeTTLIndexes();
} else {
  mongoose.connection.once('open', removeTTLIndexes);
}

module.exports = Device;
