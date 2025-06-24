import React from 'react';
import { Space, Tag, Typography } from 'antd';
import { SENSOR_OPTIONS } from '../../constants/sensors';

const { Text } = Typography;

// Create a lookup object for sensor configurations
const getSensorConfig = (sensorName) => {
  return SENSOR_OPTIONS.find(sensor => sensor.name === sensorName) || {};
};

const DeviceContent = ({ device }) => {
  return (
    <div style={{ textAlign: 'start' }}>
      <Space direction="horizontal" size="small" style={{ flexWrap: 'wrap' }}>
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
                backgroundColor: `${sensor.color}1a`,  // Add 10% opacity to the color
                border: `1px solid ${sensor.color}80`,  // 50% opacity for border
                color: sensor.color,
                fontWeight: 500
              }}
              icon={IconComponent && <IconComponent style={{ color: sensor.color }} />}
            >
              {sensor.label || key}
            </Tag>
          );
        })}
      </Space>
    </div>
  );
};

export default DeviceContent;