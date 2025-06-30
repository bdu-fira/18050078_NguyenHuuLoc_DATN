import React, { useState, useRef, useEffect } from 'react';
import { FloatButton, List, Input, Button } from 'antd';
import { MessageOutlined, SendOutlined, UserOutlined, RobotOutlined, CloseOutlined } from '@ant-design/icons';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
      sender: 'bot',
      time: '10:00 AM'
    },
    {
      id: 2,
      text: 'Tôi muốn xem thông tin về các thiết bị của tôi',
      sender: 'user',
      time: '10:01 AM'
    },
    {
      id: 3,
      text: 'Bạn có thể vào mục "Thiết bị" để xem danh sách các thiết bị đang kết nối.',
      sender: 'bot',
      time: '10:01 AM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const chatWindowRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <RobotOutlined style={{ marginRight: 8 }} />
              Trợ lý ảo
            </div>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={() => setIsOpen(false)}
              className="close-button"
            />
          </div>
          <div className="chat-messages" ref={chatWindowRef}>
            <List
              dataSource={messages}
              renderItem={message => (
                <List.Item key={message.id} className={`message-item ${message.sender}`}>
                  <div className="message-content">
                    <div className="message-header">
                      {message.sender === 'bot' ? (
                        <RobotOutlined className="message-icon" />
                      ) : (
                        <UserOutlined className="message-icon" />
                      )}
                      <span className="message-time">{message.time}</span>
                    </div>
                    <div className="message-text">{message.text}</div>
                  </div>
                </List.Item>
              )}
            />
          </div>
          <div className="chat-input-container">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Nhập tin nhắn..."
              className="chat-input"
              suffix={
                <Button 
                  type="text" 
                  icon={<SendOutlined />} 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="send-button"
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
        className="chat-toggle-button"
      />
    </div>
  );
};

export default Chatbot;
