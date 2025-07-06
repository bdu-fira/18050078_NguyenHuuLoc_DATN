const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat history storage (in production, you might want to use a database)
const chatHistory = new Map();

// Generate response from Gemini
const generateResponse = async (userId, message) => {
    try {
        // Get or initialize chat history for the user
        if (!chatHistory.has(userId)) {
            chatHistory.set(userId, []);
        }
        const history = chatHistory.get(userId);

        // For Gemini 1.5 or later, you can use chat history
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Add the new message to the history
        history.push({ role: 'user', parts: [{ text: message }] });
        
        // Start a chat session
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.9,
                topP: 0.1,
                topK: 16,
            },
        });

        // Send the message and get the response
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        // Add the assistant's response to the history
        history.push({ role: 'model', parts: [{ text }] });
        
        // Keep only the last 10 messages to manage context size
        if (history.length > 10) {
            history.splice(0, 2); // Remove the oldest Q&A pair
        }
        
        return {
            success: true,
            message: text
        };
    } catch (error) {
        console.error('Error generating response:', error);
        return {
            success: false,
            message: 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.'
        };
    }
};

// Clear chat history for a user
const clearChatHistory = (userId) => {
    if (chatHistory.has(userId)) {
        chatHistory.set(userId, []);
        return { success: true };
    }
    return { success: false, message: 'User not found' };
};

module.exports = {
    generateResponse,
    clearChatHistory
};
