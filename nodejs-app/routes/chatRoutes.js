const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send a message to the chatbot
router.post('/chat', async (req, res) => {
    try {
        const { userId, message } = req.body;
        
        if (!userId || !message) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: userId và message'
            });
        }
        
        const response = await chatController.generateResponse(userId, message);
        res.json(response);
    } catch (error) {
        console.error('Chat route error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ nội bộ'
        });
    }
});

// Clear chat history for a user
router.post('/chat/clear', (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: userId'
            });
        }
        
        const result = chatController.clearChatHistory(userId);
        res.json(result);
    } catch (error) {
        console.error('Clear chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa lịch sử trò chuyện'
        });
    }
});

module.exports = router;
