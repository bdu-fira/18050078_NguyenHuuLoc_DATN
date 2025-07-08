const { GoogleGenerativeAI } = require('@google/generative-ai');
const SensorData = require('../models/sensorData');
const Device = require('../models/device');
const Prompt = require('../models/prompt');
const ChatHistory = require('../models/chatHistory');
require('dotenv').config();

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat history storage (in memory for current session)
const chatHistory = new Map();

// Save chat history to database
const saveChatHistory = async (userId, message, sender) => {
  try {
    // Get or create chat history document
    let chatDoc = await ChatHistory.findOne({ userId });

    if (!chatDoc) {
      chatDoc = new ChatHistory({ userId });
    }

    // Add new message
    chatDoc.messages.push({
      role: sender,
      text: message,
      timestamp: new Date()
    });

    // Keep only last 50 messages
    if (chatDoc.messages.length > 50) {
      chatDoc.messages = chatDoc.messages.slice(-50);
    }

    // Update last updated timestamp
    chatDoc.lastUpdated = new Date();

    // Save to database
    await chatDoc.save();

  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

// Get sensor data from the last 24 hours, grouped by device with names
const getSensorData = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get all devices with their names
    const devices = await Device.find({}, 'deviceId name').lean();
    const deviceMap = new Map(devices.map(d => [d.deviceId, d.name || 'Chưa đặt tên']));

    // Get all unique device IDs with recent data
    const deviceIds = await SensorData.distinct('deviceId', {
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (!deviceIds || deviceIds.length === 0) {
      return 'Không có dữ liệu cảm biến nào trong 24 giờ qua.';
    }

    let result = '';

    // Process each device
    for (const deviceId of deviceIds) {
      const deviceName = deviceMap.get(deviceId) || `Thiết bị ${deviceId}`;

      // Get recent data for this device
      const deviceData = await SensorData.find({
        deviceId,
        createdAt: { $gte: twentyFourHoursAgo }
      })
        .select('TempC_SHT Hum_SHT CO2_ppm createdAt')
        .sort({ createdAt: 1 })
        .lean();

      if (!deviceData || deviceData.length === 0) continue;

      // Sample data points (max 5 per device)
      const sampleSize = Math.min(deviceData.length, 5);
      const step = Math.max(1, Math.floor(deviceData.length / sampleSize));
      const sampledData = [];

      for (let i = 0; i < deviceData.length; i += step) {
        if (sampledData.length < sampleSize) {
          sampledData.push(deviceData[i]);
        }
      }

      // Add the last data point if not included
      if (sampledData[sampledData.length - 1] !== deviceData[deviceData.length - 1]) {
        sampledData.push(deviceData[deviceData.length - 1]);
      }

      // Format device data with name
      result += `\n${deviceName} (${deviceId}):\n`;

      sampledData.forEach((data) => {
        const { TempC_SHT, Hum_SHT, CO2_ppm, createdAt } = data;
        const formattedDate = new Date(createdAt).toLocaleString('vi-VN');

        result += `\n${formattedDate}\n`;
        if (TempC_SHT !== undefined) result += `- Nhiệt độ: ${TempC_SHT}°C\n`;
        if (Hum_SHT !== undefined) result += `- Độ ẩm: ${Hum_SHT}%\n`;
        if (CO2_ppm !== undefined) result += `- CO2: ${CO2_ppm} ppm\n`;
      });

      // Add trend analysis if we have multiple data points
      if (deviceData.length > 1) {
        const firstTemp = deviceData[0].TempC_SHT;
        const lastTemp = deviceData[deviceData.length - 1].TempC_SHT;

        if (firstTemp !== undefined && lastTemp !== undefined) {
          const tempDiff = lastTemp - firstTemp;
          result += '\nPhân tích xu hướng:\n';
          result += `- Nhiệt độ đã ${tempDiff > 0 ? 'tăng' : 'giảm'} ${Math.abs(tempDiff).toFixed(1)}°C\n`;
        }
      }

      result += '\n' + '-'.repeat(30) + '\n';
    }
    console.log(result)
    return result || 'Không có dữ liệu cảm biến nào để hiển thị.';
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return 'Không thể lấy dữ liệu cảm biến.';
  }
};

// Generate response from Gemini
const generateResponse = async (userId, message) => {
  try {
    // Get or initialize chat history for the user
    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, []);
    }
    const history = chatHistory.get(userId);

    // Get sensor data from last 24 hours
    const sensorData = await getSensorData();

    // Get prompts from database
    const prompt = await Prompt.findOne();
    if (!prompt) {
      // Initialize prompts if not exists
      await Prompt.initialize();
      throw new Error('Đang khởi tạo prompt hệ thống, vui lòng thử lại sau');
    }

    // For Gemini 1.5 or later, you can use chat history
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
      systemInstruction: prompt.systemPrompt
    });

    // Combine sensor data context with user message using userPrompt template
    const combinedPrompt = `[Dữ liệu cảm biến 24h gần đây] ${sensorData}
${prompt.userPrompt}
[Yêu cầu] ${message}`;

    // Start chat with empty history and system instruction
    const chat = model.startChat({
      history: [
        ...history,
        { role: 'user', parts: [{ text: combinedPrompt }] }
      ]
    });

    // Send the combined prompt as user message and get the response
    const result = await chat.sendMessage(combinedPrompt);

    // Get the response
    const response = await result.response;
    const text = response.text();

    // Add the assistant's response to the history
    history.push({ role: 'model', parts: [{ text }] });

    // Save chat messages to database
    await saveChatHistory(userId, message, 'user');
    await saveChatHistory(userId, text, 'bot');

    // Keep only the last 5 message pairs (5 Q&A) to manage context size
    const maxPairs = 5;
    if (history.length > maxPairs * 2) {
      // Remove oldest messages from in-memory history
      history.splice(0, history.length - (maxPairs * 2));

      // Update database history
      const chatDoc = await ChatHistory.findOne({ userId });
      if (chatDoc) {
        chatDoc.messages = chatDoc.messages.slice(-maxPairs * 2);
        await chatDoc.save();
      }
    }

    return {
      success: true,
      message: text
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      message: `Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu: ${error.message}`
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
