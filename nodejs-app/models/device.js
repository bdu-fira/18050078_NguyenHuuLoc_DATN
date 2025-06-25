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
    const db = mongoose.connection.db;
    
    try {
      const collections = await db.listCollections({ name: 'devices' }).toArray();
      
      // Only proceed if the collection exists
      if (collections.length > 0) {
        const collection = db.collection('devices');
        const indexes = await collection.indexes();
        
        for (const index of indexes) {
          // Check if this is a TTL index and it's not the _id_ index
          if (index.expireAfterSeconds && index.name !== '_id_') {
            try {
              await collection.dropIndex(index.name);
              console.log(`Dropped TTL index: ${index.name} from devices`);
            } catch (dropError) {
              // Ignore errors when dropping non-existent indexes
              if (dropError.code !== 27) { // 27 = IndexNotFound
                console.error('Error dropping index:', dropError);
              }
            }
          }
        }
      } else {
        console.log('Devices collection does not exist yet, skipping TTL index check');
      }
    } catch (listError) {
      // Ignore NamespaceNotFound errors (code 26)
      if (listError.code !== 26) {
        console.error('Error listing collections:', listError);
      }
    }
  } catch (error) {
    // Catch any other errors
    console.error('Unexpected error in removeTTLIndexes:', error);
  }
};

// Run this when the model is loaded
if (mongoose.connection.readyState === 1) { // 1 = connected
  removeTTLIndexes();
} else {
  mongoose.connection.once('open', removeTTLIndexes);
}

module.exports = Device;
