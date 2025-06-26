import React from 'react';
import { Card, Row, Col, Typography, Space, InputNumber, Checkbox } from 'antd';

const { Text } = Typography;

const SensorList = ({ 
  sensorOptions, 
  categoryLabels, 
  selectedSensors, 
  onSensorToggle, 
  onThresholdChange 
}) => {
  return (
    <div style={{ width: '100%' }}>
      {Object.entries(
        sensorOptions.reduce((acc, sensor) => {
          if (!acc[sensor.category]) {
            acc[sensor.category] = [];
          }
          acc[sensor.category].push(sensor);
          return acc;
        }, {})
      ).map(([category, sensors]) => (
        <div key={category} style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: '16px' }}>
            {categoryLabels[category] || category}
          </Text>
          <Row gutter={[16, 16]}>
            {sensors.map(sensor => (
              <Col xs={24} sm={12} md={8} lg={6} key={sensor.name}>
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Card
                    hoverable
                    size="small"
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      transition: 'all 0.3s',
                      backgroundColor: selectedSensors.hasOwnProperty(sensor.name) ? '#f6ffed' : '#fafafa',
                      borderColor: selectedSensors.hasOwnProperty(sensor.name) ? '#b7eb8f' : '#f0f0f0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: selectedSensors.hasOwnProperty(sensor.name) ? 1 : 0.8,
                      minWidth: 0,
                      minHeight: 0,
                    }}
                    styles={{
                      body: {
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        gap: '12px'
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        cursor: 'pointer'
                      }}
                      onClick={() => onSensorToggle(sensor.name)}
                    >
                      <Checkbox
                        checked={selectedSensors.hasOwnProperty(sensor.name)}
                        style={{ marginTop: '2px', marginRight: '12px' }}
                        onClick={e => e.stopPropagation()}
                        onChange={e => onSensorToggle(sensor.name)}
                      />
                      <Space size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px' }}>
                          {sensor.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{sensor.label}</div>
                          {sensor.unit && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {sensor.unit}
                            </Text>
                          )}
                        </div>
                      </Space>
                    </div>

                    <div style={{ width: '100%' }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>Ngưỡng cảnh báo</div>
                      <InputNumber
                        size="small"
                        disabled={!selectedSensors.hasOwnProperty(sensor.name)}
                        style={{ width: '100%' }}
                        min={0}
                        max={sensor.name === 'temperature' ? 100 : 1000}
                        formatter={value => `${value}${sensor.unit ? ` ${sensor.unit}` : ''}`}
                        parser={value => value.replace(new RegExp(`\\s*${sensor.unit || ''}$`), '')}
                        value={selectedSensors[sensor.name] || 50}
                        onChange={(value) => onThresholdChange(sensor.name, value)}
                      />
                    </div>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default SensorList;