import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, message, Checkbox, Row, Col, Divider, Card, Typography, Space } from 'antd';
import { 
  FireOutlined, 
  CloudOutlined, 
  DashboardOutlined, 
  AlertOutlined, 
  EnvironmentOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addNewDevice, updateDeviceById } from '../../features/device/deviceSlice';

const { Text } = Typography;

const sensorOptions = [
  { 
    name: 'temperature', 
    label: 'Nhiệt độ', 
    unit: '°C',
    icon: <FireOutlined style={{ color: '#ff4d4f' }} />,
    category: 'environment'
  },
  { 
    name: 'humidity', 
    label: 'Độ ẩm', 
    unit: '%',
    icon: <CloudOutlined style={{ color: '#1890ff' }} />,
    category: 'environment'
  },
  { 
    name: 'co2', 
    label: 'CO₂', 
    unit: 'ppm',
    icon: <DashboardOutlined style={{ color: '#52c41a' }} />,
    category: 'air_quality'
  },
  { 
    name: 'pm25', 
    label: 'Bụi PM2.5', 
    unit: 'µg/m³',
    icon: <AlertOutlined style={{ color: '#faad14' }} />,
    category: 'air_quality'
  },
  { 
    name: 'pm10', 
    label: 'Bụi PM10', 
    unit: 'µg/m³',
    icon: <AlertOutlined style={{ color: '#fa8c16' }} />,
    category: 'air_quality'
  },
  { 
    name: 'voc', 
    label: 'VOC', 
    unit: 'ppb',
    icon: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
    category: 'air_quality'
  },
  { 
    name: 'o3', 
    label: 'O₃', 
    unit: 'ppb',
    icon: <CloudServerOutlined style={{ color: '#13c2c2' }} />,
    category: 'air_quality'
  },
  { 
    name: 'no2', 
    label: 'NO₂', 
    unit: 'ppb',
    icon: <EnvironmentOutlined style={{ color: '#eb2f96' }} />,
    category: 'air_quality'
  },
  { 
    name: 'so2', 
    label: 'SO₂', 
    unit: 'ppb',
    icon: <CloudSyncOutlined style={{ color: '#f5222d' }} />,
    category: 'air_quality'
  },
  { 
    name: 'aqi', 
    label: 'Chỉ số AQI',
    unit: '',
    icon: <DashboardOutlined style={{ color: '#52c41a' }} />,
    category: 'air_quality'
  },
];

const categoryLabels = {
  environment: 'Môi trường',
  air_quality: 'Chất lượng không khí'
};

const DeviceForm = ({ open, onCancel, initialValues, isEditing = false, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [selectedSensors, setSelectedSensors] = React.useState([]);

  // Set form initial values
  useEffect(() => {
    if (open) {
      // Get sensors from sensorConfigurations if available, otherwise use sensors array
      const sensors = initialValues?.sensorConfigurations 
        ? Object.keys(initialValues.sensorConfigurations) 
        : initialValues?.sensors || [];
      
      setSelectedSensors(sensors);
      
      const formValues = {
        deviceId: initialValues?.deviceId || '',
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        location: {
          lat: initialValues?.location?.lat || 0,
          lng: initialValues?.location?.lng || 0,
        },
        sensors, // This will set the checkboxes
      };

      // Add min/max values for each sensor
      sensors.forEach(sensor => {
        if (initialValues?.sensorConfigurations?.[sensor]) {
          formValues[`${sensor}_min`] = initialValues.sensorConfigurations[sensor].min;
          formValues[`${sensor}_max`] = initialValues.sensorConfigurations[sensor].max;
        } else {
          // Fallback to direct properties if sensorConfigurations is not available
          formValues[`${sensor}_min`] = initialValues?.[`${sensor}_min`] || 0;
          formValues[`${sensor}_max`] = initialValues?.[`${sensor}_max`] || 100;
        }
      });
      
      // Use setTimeout to ensure the form is mounted before setting values
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
      setSelectedSensors([]);
    }
  }, [open, initialValues, form]);

  const handleSensorToggle = (sensorName) => {
    const newSelected = selectedSensors.includes(sensorName)
      ? selectedSensors.filter(s => s !== sensorName)
      : [...selectedSensors, sensorName];
    setSelectedSensors(newSelected);
    form.setFieldsValue({ sensors: newSelected });
  };

  const handleThresholdChange = (sensorName, field, value) => {
    form.setFieldsValue({
      [`${sensorName}_${field}`]: value
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Prepare device data
      const deviceData = {
        name: values.name,
        description: values.description,
        location: values.location?.lat ? {
          lat: parseFloat(values.location.lat),
          lng: parseFloat(values.location.lng)
        } : null,
        sensors: selectedSensors,
        ...selectedSensors.reduce((acc, sensor) => {
          acc[`${sensor}_min`] = values[`${sensor}_min`] || 0;
          acc[`${sensor}_max`] = values[`${sensor}_max`] || 0;
          return acc;
        }, {})
      };

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

  const renderSensorInputs = () => {
    return selectedSensors.map(sensor => {
      const option = sensorOptions.find(opt => opt.name === sensor);
      if (!option) return null;
      
      return (
        <Row gutter={16} key={sensor} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Form.Item
              label={`Ngưỡng dưới ${option.label}`}
              name={`${sensor}_min`}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={`Ngưỡng trên ${option.label}`}
              name={`${sensor}_max`}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      );
    });
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
                            backgroundColor: selectedSensors.includes(sensor.name) ? '#f6ffed' : '#fafafa',
                            borderColor: selectedSensors.includes(sensor.name) ? '#b7eb8f' : '#f0f0f0',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            opacity: selectedSensors.includes(sensor.name) ? 1 : 0.8
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
                              checked={selectedSensors.includes(sensor.name)}
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Tối thiểu</div>
                                <InputNumber 
                                  size="small"
                                  disabled={!selectedSensors.includes(sensor.name)}
                                  style={{ width: '100%' }}
                                  value={form.getFieldValue(`${sensor.name}_min`) || 0}
                                  onChange={(value) => handleThresholdChange(sensor.name, 'min', value)}
                                />
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Tối đa</div>
                                <InputNumber 
                                  size="small"
                                  disabled={!selectedSensors.includes(sensor.name)}
                                  style={{ width: '100%' }}
                                  value={form.getFieldValue(`${sensor.name}_max`) || 100}
                                  onChange={(value) => handleThresholdChange(sensor.name, 'max', value)}
                                />
                              </div>
                            </div>
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