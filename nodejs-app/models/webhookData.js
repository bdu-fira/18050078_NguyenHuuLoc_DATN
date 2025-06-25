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
    
    try {
      const collections = await db.listCollections({ name: 'webhookdata' }).toArray();
      
      // Only proceed if the collection exists
      if (collections.length > 0) {
        const collection = db.collection('webhookdata');
        const indexes = await collection.indexes();
        
        for (const index of indexes) {
          // Check if this is a TTL index and it's not the _id_ index
          if (index.expireAfterSeconds && index.name !== '_id_') {
            try {
              await collection.dropIndex(index.name);
              console.log(`Dropped TTL index: ${index.name} from webhookdata`);
            } catch (dropError) {
              // Ignore errors when dropping non-existent indexes
              if (dropError.code !== 27) { // 27 = IndexNotFound
                console.error('Error dropping index:', dropError);
              }
            }
          }
        }
      } else {
        console.log('Webhookdata collection does not exist yet, skipping TTL index check');
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

module.exports = WebhookData;
