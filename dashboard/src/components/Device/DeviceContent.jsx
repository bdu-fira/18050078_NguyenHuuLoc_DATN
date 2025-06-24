import React from 'react';
import { Space, Tag, Typography } from 'antd';
import { SENSOR_OPTIONS } from '../../constants/sensors';

const { Text } = Typography;

// Create a lookup object for sensor configurations
const getSensorConfig = (sensorName) => {
  return SENSOR_OPTIONS.find(sensor => sensor.name === sensorName) || {};
};

const DeviceContent = ({ device }) => {
  console.log(device);
  
  return (
    <div style={{ textAlign: 'start' }}>
      <Space direction="vertical" size="small">
        <Text>Device ID: {device.deviceId}</Text>
        <Text>Description: {device.description}</Text>
        <Space direction="horizontal" size="small">
          {Object.keys(device?.sensorConfigurations || {}).map((key) => {
            const sensor = getSensorConfig(key);
            const IconComponent = sensor.icon;
            
            return (
              <Tag 
                key={key} 
                style={{ 
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#f0f5ff',
                  borderColor: '#d6e4ff',
                  color: '#1d39c4'
                }}
                icon={IconComponent && <IconComponent style={{ color: sensor.color || '#1d39c4' }} />}
              >
                {sensor.label || key}
              </Tag>
            );
          })}
        </Space>
      </Space>
    </div>
  );
};

export default DeviceContent;