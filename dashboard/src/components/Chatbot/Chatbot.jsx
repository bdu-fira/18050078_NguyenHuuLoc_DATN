import React, { useState, useRef, useEffect } from 'react';
import { FloatButton, Input, Button, Spin, message } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined, 
  CloseOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import { chatApi } from '../../services/api';
import './Chatbot.css';

// Generate a unique user ID if not exists
const getUserId = () => {
  let userId = localStorage.getItem('chatbot_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatbot_user_id', userId);
  }
  return userId;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: 'Xin chào! Tôi là trợ lý ảo của hệ thống giám sát môi trường. Tôi có thể giúp gì cho bạn hôm nay?',
      sender: 'bot',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(getUserId());
  const messagesEndRef = useRef(null);
  
  const suggestedQuestions = [
    {
      key: '1',
      label: 'Chất lượng môi trường 24h qua',
      question: 'Cho tôi biết chất lượng môi trường trong 24 giờ qua',
      icon: '📊'
    },
    {
      key: '2',
      label: 'Dự báo thời tiết',
      question: 'Dự báo thời tiết hôm nay như thế nào?',
      icon: '⛅'
    },
    {
      key: '3',
      label: 'Chỉ số AQI hiện tại',
      question: 'Chỉ số AQI hiện tại là bao nhiêu?',
      icon: '📈'
    },
    {
      key: '4',
      label: 'Cảnh báo môi trường',
      question: 'Có cảnh báo môi trường nào gần đây không?',
      icon: '⚠️'
    }
  ];

  const handleSendMessage = async (messageText = newMessage) => {
    if ((messageText || '').trim() === '') return;
    
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      const response = await chatApi.sendMessage(userId, messageText);
      
      if (response.success) {
        const botResponse = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <RobotOutlined style={{ marginRight: 8 }} />
              Trợ lý giám sát môi trường
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              className="close-button"
            />
          </div>
          
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-avatar">
                  {msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <RobotOutlined />
                </div>
                <div className="message-content">
                  <div className="message-text">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} /> Đang xử lý...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="quick-questions">
            {suggestedQuestions.map((item) => (
              <div 
                key={item.key} 
                className="quick-question"
                onClick={() => handleQuickQuestion(item.question)}
              >
                <span className="quick-question-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <Input
              placeholder="Nhập câu hỏi về dữ liệu môi trường..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={() => handleSendMessage()}
              disabled={isLoading}
              suffix={
                <Button
                  type="text"
                  icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || isLoading}
                  loading={isLoading}
                />
              }
            />
          </div>
        </div>
      )}
      
      <FloatButton
        type="primary"
        icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
        onClick={() => setIsOpen(!isOpen)}
        tooltip="Trợ lý ảo"
        className="chatbot-float-button"
      />
    </div>
  );
};

export default Chatbot;
