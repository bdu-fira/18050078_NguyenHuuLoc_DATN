import React, { useState, useRef, useEffect } from 'react';
import { FloatButton, List, Input, Button, Dropdown } from 'antd';
import { MessageOutlined, SendOutlined, UserOutlined, RobotOutlined, CloseOutlined, ClockCircleOutlined, OrderedListOutlined } from '@ant-design/icons';
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
  
  const suggestedQuestions = [
    {
      key: '1',
      label: 'Chất lượng môi trường 24h qua',
      question: 'Cho tôi biết chất lượng môi trường trong 24 giờ qua'
    },
    {
      key: '2',
      label: 'Dự báo chất lượng môi trường 24h tới',
      question: 'Dự báo chất lượng môi trường trong 24 giờ tới như thế nào?'
    },
    {
      key: '3',
      label: 'Chỉ số AQI hiện tại',
      question: 'Chỉ số AQI hiện tại là bao nhiêu?'
    },
    {
      key: '4',
      label: 'Thông số môi trường 8h qua',
      question: 'Hiển thị thông số môi trường trong 8 giờ qua'
    },
    {
      key: '5',
      label: 'Dự báo thời tiết 12h tới',
      question: 'Dự báo thời tiết trong 12 giờ tới như thế nào?'
    },
    {
      key: '6',
      label: 'Cảnh báo môi trường',
      question: 'Có cảnh báo môi trường nào đang hoạt động không?'
    },
  ];
  
  const handleQuestionSelect = (question) => {
    setNewMessage(question);
  };

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
            <div className="input-wrapper">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onPressEnter={handleSendMessage}
                placeholder="Nhập tin nhắn..."
                className="chat-input"
                prefix={
                  <Dropdown
                    menu={{
                      items: suggestedQuestions.map(item => ({
                        key: item.key,
                        label: (
                          <div onClick={() => handleQuestionSelect(item.question)}>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            {item.label}
                          </div>
                        ),
                      })),
                    }}
                    placement="topLeft"
                    trigger={['click']}
                    overlayClassName="suggested-questions-dropdown"
                  >
                    <Button 
                      type="text" 
                      icon={<OrderedListOutlined />} 
                      className="suggestions-button"
                    />
                  </Dropdown>
                }
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
