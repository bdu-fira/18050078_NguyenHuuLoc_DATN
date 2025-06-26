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

const WebhookData = mongoose.model('WebhookData', webhookDataSchema);

module.exports = WebhookData;
