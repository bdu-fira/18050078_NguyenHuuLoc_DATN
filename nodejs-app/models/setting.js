const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['prompt', 'threshold'],
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
settingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Setting', settingSchema);
