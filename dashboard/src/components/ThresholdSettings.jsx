import React, { useEffect } from 'react';
import { Form, InputNumber, Button, Card, Row, Col, Space, Typography, Spin } from 'antd';

export const ThresholdSettings = ({
  sensors,
  loading,
  operation,
  onSave,
  initialValues = {}
}) => {
  const [form] = Form.useForm();

  // Initialize form with initial values
  useEffect(() => {
    if (initialValues) {
      // Filter out the _id field
      const values = { ...initialValues };
      delete values._id;
      form.setFieldsValue(values);
    }
  }, [initialValues, form]);

  return (
    <Spin 
      spinning={loading && operation === 'fetching'}
      tip="Đang tải..."
      style={{ minHeight: '200px' }}
    >
      <Form form={form} onFinish={onSave}>
        <Row gutter={[16, 16]}>
          {sensors.map(sensor => (
            <Col xs={24} sm={12} md={8} lg={6} key={sensor.name}>
              <Card
                hoverable
                size="small"
                styles={{
                  body: {
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    gap: '12px',
                    height: '100%'
                  }
                }}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                  backgroundColor: `${sensor.color}10`,
                  borderLeft: `4px solid ${sensor.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Space size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      fontSize: '20px',
                      color: sensor.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: `${sensor.color}15`
                    }}>
                      {React.createElement(sensor.icon, { style: { fontSize: '18px' } })}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#333' }}>
                        {sensor.label}
                      </div>
                      {sensor.unit && (
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                          {sensor.unit}
                        </Typography.Text>
                      )}
                    </div>
                  </Space>
                </div>

                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>
                    Ngưỡng cảnh báo
                  </div>
                  <Form.Item 
                    name={sensor.name}
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                  >
                    <InputNumber
                      size="small"
                      style={{ width: '100%' }}
                      min={0}
                      max={sensor.name === 'temperature' ? 100 : 1000}
                      formatter={value => `${value}${sensor.unit ? ` ${sensor.unit}` : ''}`}
                      parser={value => {
                        const numValue = parseFloat(value.replace(new RegExp(`\\s*${sensor.unit || ''}$`), ''));
                        return isNaN(numValue) ? 0 : numValue;
                      }}
                      disabled={loading && operation === 'updating'}
                    />
                  </Form.Item>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        <div style={{ marginTop: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading && operation === 'updating'}
            disabled={loading && operation === 'fetching'}
          >
            Lưu ngưỡng cảnh báo
          </Button>
        </div>
      </Form>
    </Spin>
  );
};

export default ThresholdSettings;
