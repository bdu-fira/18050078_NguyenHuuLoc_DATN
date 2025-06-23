import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Divider } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Sample data for the charts
const generateSampleData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: i,
    value: 25 + Math.sin(i / 2) * 5 + (Math.random() * 2 - 1)
  }));
};

const chartStyle = {
  card: { 
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: 'none',
    transition: 'all 0.3s ease'
  },
  chartContainer: {
    width: '100%',
    height: 150,
    marginTop: 16
  },
  deviceCard: {
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
    }
  },
  sidebar: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  deviceItem: {
    padding: '12px 16px',
    margin: '4px 0',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: '#f0f2f5',
      transform: 'translateX(4px)'
    }
  },
  viewAllBtn: {
    marginTop: 'auto',
    borderRadius: 8,
    height: 40,
    fontWeight: 500
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [chartData] = useState(generateSampleData());
  const [devices] = useState([
    { id: 1, name: 'Thiết bị 1', temp: 25.5, humidity: 65, co2: 450 },
    { id: 2, name: 'Thiết bị 2', temp: 24.8, humidity: 62, co2: 480 }
  ]);

  const handleDeviceClick = (deviceId) => {
    navigate(`/device-detail/${deviceId}`);
  };

  const handleViewAllDevices = () => {
    navigate('/devices');
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <Title level={3} style={{ 
        marginBottom: '24px', 
        textAlign: 'center',
        color: '#1a1a1a',
        fontWeight: 600
      }}>
        DASHBOARD
      </Title>
      
      <Row gutter={[24, 24]} style={{ height: '100%' }}>
        {/* Left Sidebar */}
        <Col xs={24} md={8}>
          <div style={chartStyle.sidebar}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '0.9rem',
                color: '#666',
                marginBottom: '8px'
              }}>
                Tổng số thiết bị
              </div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold',
                color: '#1890ff'
              }}>
                {devices.length}
              </div>
            </div>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '1rem',
                fontWeight: 500,
                marginBottom: '12px',
                color: '#1a1a1a'
              }}>
                Danh sách thiết bị
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {devices.map(device => (
                  <div 
                    key={device.id} 
                    style={{
                      ...chartStyle.deviceItem,
                      backgroundColor: window.location.pathname.includes(`/device-detail/${device.id}`) ? '#e6f7ff' : 'transparent'
                    }}
                    onClick={() => handleDeviceClick(device.id)}
                  >
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      backgroundColor: '#52c41a',
                      marginRight: '12px'
                    }} />
                    <span>{device.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              type="primary" 
              block 
              style={chartStyle.viewAllBtn}
              onClick={handleViewAllDevices}
            >
              Xem tất cả thiết bị
            </Button>
          </div>
        </Col>
        
        {/* Right Content */}
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]}>
            {devices.map(device => (
              <Col xs={24} key={device.id}>
                <Card 
                  title={device.name} 
                  style={chartStyle.deviceCard}
                  headStyle={{ 
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}
                  bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#fff7e6',
                          borderRadius: 8,
                          textAlign: 'center',
                          border: '1px solid #ffe7ba'
                        }}>
                          <div style={{ fontSize: '0.9rem', color: '#d46b08' }}>Nhiệt độ</div>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            color: '#d46b08'
                          }}>
                            {device.temp}°C
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#e6f7ff',
                          borderRadius: 8,
                          textAlign: 'center',
                          border: '1px solid #91d5ff'
                        }}>
                          <div style={{ fontSize: '0.9rem', color: '#096dd9' }}>Độ ẩm</div>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            color: '#096dd9'
                          }}>
                            {device.humidity}%
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#f6ffed',
                          borderRadius: 8,
                          textAlign: 'center',
                          border: '1px solid #b7eb8f'
                        }}>
                          <div style={{ fontSize: '0.9rem', color: '#389e0d' }}>CO₂</div>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            color: '#389e0d'
                          }}>
                            {device.co2}ppm
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  
                  <div style={{ flex: 1, minHeight: '150px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 10, fill: '#8c8c8c' }}
                          tickMargin={4}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: '#8c8c8c' }}
                          width={30}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1890ff" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ 
                            r: 4, 
                            stroke: '#fff', 
                            strokeWidth: 2 
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;