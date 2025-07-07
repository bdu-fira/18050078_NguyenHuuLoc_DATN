const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const ChatHistory = require('../models/chatHistory');

// Send a message to the chatbot
router.post('/', async (req, res) => {
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

// Get chat history
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }
        
        const chatHistory = await ChatHistory.findOne({ userId });
        
        if (!chatHistory) {
            return res.json({
                success: true,
                messages: []
            });
        }
        
        // Sort messages by timestamp in ascending order
        chatHistory.messages.sort((a, b) => a.timestamp - b.timestamp);
        
        res.json({
            success: true,
            messages: chatHistory.messages.map(msg => ({
                id: Date.now() + Math.random(), // Generate unique ID
                text: msg.text,
                sender: msg.role === 'user' ? 'user' : 'bot',
                time: msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }))
        });
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ nội bộ'
        });
    }
});

// Clear chat history for a user
router.post('/clear', (req, res) => {
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
