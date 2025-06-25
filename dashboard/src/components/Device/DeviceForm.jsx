import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, message, Checkbox, Row, Col, Divider, Card, Typography, Space } from 'antd';
import { SENSOR_OPTIONS, SENSOR_CATEGORIES } from '../../constants/sensors';
import { useDispatch } from 'react-redux';
import { addNewDevice, updateDeviceById } from '../../features/device/deviceSlice';

const { Text } = Typography;

const categoryLabels = SENSOR_CATEGORIES;

// Create a new array with icon components
const sensorOptions = SENSOR_OPTIONS.map(sensor => ({
  ...sensor,
  icon: React.createElement(sensor.icon, { 
    style: { color: sensor.color } 
  })
}));

const DeviceForm = ({ open, onCancel, initialValues, isEditing = false, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [selectedSensors, setSelectedSensors] = React.useState({});

  // Set form initial values
  useEffect(() => {
    if (open) {
      const formValues = {
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        deviceId: initialValues?.deviceId || '',
        location: initialValues?.location || { lat: 0, lng: 0 }
      };

      // Process sensor values
      const sensorValues = initialValues?.sensors || {};
      
      // Set sensor values in form
      Object.entries(sensorValues).forEach(([sensor, value]) => {
        formValues[sensor] = value;
      });

      // Initialize selectedSensors with sensors that have values
      setSelectedSensors(sensorValues);
      
      const timer = setTimeout(() => {
        if (form && typeof form.setFieldsValue === 'function') {
          form.setFieldsValue(formValues);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    } else {
      // Reset form when closing
      if (form && typeof form.resetFields === 'function') {
        form.resetFields();
      }
      setSelectedSensors({});
    }
  }, [open, initialValues, form]);

  const handleSensorToggle = (sensorName) => {
    const isCurrentlySelected = selectedSensors.hasOwnProperty(sensorName);
    const newSelected = { ...selectedSensors };
    
    if (isCurrentlySelected) {
      // Remove sensor
      delete newSelected[sensorName];
      // Clear the sensor's value when unselected
      form.setFieldsValue({ [sensorName]: undefined });
    } else {
      // Add sensor with default value
      newSelected[sensorName] = 50; // Default value for new sensor
      form.setFieldsValue({ [sensorName]: 50 });
    }
    
    setSelectedSensors(newSelected);
  };

  const handleThresholdChange = (sensorName, value) => {
    // Update both the form value and the selectedSensors state
    form.setFieldsValue({
      [sensorName]: value
    });
    
    // Also update the selectedSensors state to keep it in sync
    setSelectedSensors(prev => ({
      ...prev,
      [sensorName]: value
    }));
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Use the selectedSensors object directly since it's already in sync with the form
      const sensors = { ...selectedSensors };
      
      // Prepare device data
      const deviceData = {
        name: values.name,
        description: values.description || '',
        location: {
          lat: parseFloat(values.location?.lat) || 0,
          lng: parseFloat(values.location?.lng) || 0
        },
        sensors
      };
      
      console.log('Submitting device data:', deviceData);

      if (isEditing && initialValues?.deviceId) {
        await dispatch(updateDeviceById({
          deviceId: initialValues.deviceId,
          ...deviceData
        })).unwrap();
        message.success('Cập nhật thiết bị thành công');
      } else {
        await dispatch(addNewDevice({
          deviceId: values.deviceId,
          ...deviceData
        })).unwrap();
        message.success('Thêm thiết bị mới thành công');
      }

      form.resetFields();
      onCancel();
      onSuccess?.();
    } catch (error) {
      message.error(error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
      destroyOnHidden
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          deviceId: '',
          name: '',
          description: '',
          location: { lat: 0, lng: 0 },
        }}
        preserve={false}
        className="device-form"
      >
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1f1f1f', fontWeight: 600 }}>Thông tin cơ bản</h3>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="deviceId"
                label={
                  <span style={{ fontWeight: 500, color: '#434343' }}>
                    Mã thiết bị <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[
                  { required: !isEditing, message: 'Vui lòng nhập mã thiết bị' },
                  { min: 3, message: 'Tối thiểu 3 ký tự' },
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="VD: DEV001" 
                  disabled={isEditing}
                  style={{
                    borderRadius: '6px',
                    borderColor: '#d9d9d9',
                    transition: 'all 0.3s',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label={
                  <span style={{ fontWeight: 500, color: '#434343' }}>
                    Tên thiết bị <span style={{ color: '#ff4d4f' }}>*</span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên thiết bị' },
                  { min: 2, message: 'Tối thiểu 2 ký tự' },
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="VD: Cảm biến nhiệt độ phòng"
                  style={{
                    borderRadius: '6px',
                    borderColor: '#d9d9d9',
                    transition: 'all 0.3s',
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<span style={{ fontWeight: 500, color: '#434343' }}>Mô tả</span>}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về thiết bị"
              style={{
                borderRadius: '6px',
                borderColor: '#d9d9d9',
                resize: 'none',
                transition: 'all 0.3s',
              }}
            />
          </Form.Item>
        </div>

        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          padding: '20px',
          marginTop: '16px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1f1f1f', fontWeight: 600 }}>Vị trí đặt thiết bị</h3>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name={['location', 'lat']}
                label={<span style={{ fontWeight: 500, color: '#434343' }}>Vĩ độ <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập vĩ độ' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  size="large"
                  placeholder="VD: 10.762622"
                  step="0.000001"
                  min="-90"
                  max="90"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['location', 'lng']}
                label={<span style={{ fontWeight: 500, color: '#434343' }}>Kinh độ <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập kinh độ' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  size="large"
                  placeholder="VD: 106.660172"
                  step="0.000001"
                  min="-180"
                  max="180"
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '-12px', marginBottom: '8px' }}>
            Tọa độ GPS của vị trí đặt thiết bị
          </div>
        </div>

        <Divider orientation="left">Cấu Hình Cảm Biến</Divider>
        <Form.Item
          name="sensors"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một cảm biến' }]}
        >
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
                            opacity: selectedSensors.hasOwnProperty(sensor.name) ? 1 : 0.8
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
                            onClick={() => handleSensorToggle(sensor.name)}
                          >
                            <Checkbox 
                              checked={selectedSensors.hasOwnProperty(sensor.name)}
                              style={{ marginTop: '2px', marginRight: '12px' }}
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleSensorToggle(sensor.name)}
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
                              max={sensor.name === 'temperature' ? 100 : 1000} // Adjust max based on sensor type
                              formatter={value => `${value}${sensor.unit ? ` ${sensor.unit}` : ''}`}
                              parser={value => value.replace(new RegExp(`\\s*${sensor.unit || ''}$`), '')}
                              value={selectedSensors[sensor.name] || 50}
                              onChange={(value) => handleThresholdChange(sensor.name, value)}
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
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default DeviceForm;