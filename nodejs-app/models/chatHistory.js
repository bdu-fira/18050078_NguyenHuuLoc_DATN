const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    type: {
      role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'chat_history',
  strict: false
});

// Create indexes for better query performance
chatHistorySchema.index({ userId: 1, 'messages.timestamp': -1 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
