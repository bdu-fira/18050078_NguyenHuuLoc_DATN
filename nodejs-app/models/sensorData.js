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

// Create model if it doesn't exist to prevent OverwriteModelError
const SensorData = mongoose.models.SensorData || 
  mongoose.model('SensorsData', sensorDataSchema);

// Ensure no TTL indexes exist on this collection
const removeTTLIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'sensors_data' }).toArray();
    
    // Only proceed if the collection exists
    if (collections.length > 0) {
      const collection = db.collection('sensors_data');
      const indexes = await collection.indexes();
      
      for (const index of indexes) {
        // Check if this is a TTL index and it's not the _id_ index
        if (index.expireAfterSeconds && index.name !== '_id_') {
          await collection.dropIndex(index.name);
          console.log(`Dropped TTL index: ${index.name} from sensors_data`);
        }
      }
    } else {
      console.log('Sensors_data collection does not exist yet, skipping TTL index check');
    }
  } catch (error) {
    // Ignore NamespaceNotFound errors
    if (error.code !== 26) {
      console.error('Error removing TTL indexes from sensors_data:', error);
    }
  }
};

// Run this when the model is loaded
if (mongoose.connection.readyState === 1) { // 1 = connected
  removeTTLIndexes();
} else {
  mongoose.connection.once('open', removeTTLIndexes);
}

module.exports = SensorData;
