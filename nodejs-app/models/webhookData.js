const mongoose = require('mongoose');

const webhookDataSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  source: {
    type: String,
    index: true
  },
  receivedAt: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  processingError: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  strict: false // Allow dynamic fields in the payload
});

// Create indexes
webhookDataSchema.index({ eventType: 1, receivedAt: -1 });
webhookDataSchema.index({ source: 1, receivedAt: -1 });

// Create model if it doesn't exist to prevent OverwriteModelError
const WebhookData = mongoose.models.WebhookData || 
  mongoose.model('WebhookData', webhookDataSchema);

// Ensure no TTL indexes exist on this collection
const removeTTLIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'webhookdata' }).toArray();
    
    // Only proceed if the collection exists
    if (collections.length > 0) {
      const collection = db.collection('webhookdata');
      const indexes = await collection.indexes();
      
      for (const index of indexes) {
        // Check if this is a TTL index and it's not the _id_ index
        if (index.expireAfterSeconds && index.name !== '_id_') {
          await collection.dropIndex(index.name);
          console.log(`Dropped TTL index: ${index.name} from webhookdata`);
        }
      }
    } else {
      console.log('Webhookdata collection does not exist yet, skipping TTL index check');
    }
  } catch (error) {
    // Ignore NamespaceNotFound errors
    if (error.code !== 26) {
      console.error('Error removing TTL indexes from webhookdata:', error);
    }
  }
};

// Run this when the model is loaded
if (mongoose.connection.readyState === 1) { // 1 = connected
  removeTTLIndexes();
} else {
  mongoose.connection.once('open', removeTTLIndexes);
}

module.exports = WebhookData;
