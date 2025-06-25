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
    const collection = mongoose.connection.db.collection('webhookdata');
    const indexes = await collection.indexes();
    
    for (const index of indexes) {
      // Check if this is a TTL index
      if (index.expireAfterSeconds) {
        await collection.dropIndex(index.name);
        console.log(`Dropped TTL index: ${index.name} from webhookdata`);
      }
    }
  } catch (error) {
    console.error('Error removing TTL indexes from webhookdata:', error);
  }
};

// Run this when the model is loaded
if (mongoose.connection.readyState === 1) { // 1 = connected
  removeTTLIndexes();
} else {
  mongoose.connection.once('open', removeTTLIndexes);
}

module.exports = WebhookData;
