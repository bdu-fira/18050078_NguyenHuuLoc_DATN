const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  systemPrompt: {
    type: String,
    default: 'Bạn là một trợ lý thông minh chuyên phân tích dữ liệu môi trường. Hãy trả lời một cách ngắn gọn, chính xác dựa trên dữ liệu được cung cấp.'
  },
  userPrompt: {
    type: String,
    default: 'Hãy phân tích dữ liệu cảm biến và đưa ra nhận xét ngắn gọn. Chỉ trả lời bằng tiếng Việt.'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'prompts'
});

// Create a single document
promptSchema.statics.initialize = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.create({});
  }
  return this.findOne();
};

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
