import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, message, Checkbox, Row, Col, Divider, Card, Typography, Space, Collapse } from 'antd';
import { SENSOR_OPTIONS, SENSOR_CATEGORIES } from '../../constants/sensors';
import { useDispatch } from 'react-redux';
import { addNewDevice, updateDeviceById } from '../../features/device/deviceSlice';
import SensorList from './SensorList';

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

  const items = [
    {
      key: '1',
      label: 'Cấu Hình Cảm Biến',
      children:
        (
          <Form.Item
            name="sensors"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một cảm biến' }]}
          >
            <SensorList
              sensorOptions={sensorOptions}
              categoryLabels={categoryLabels}
              selectedSensors={selectedSensors}
              onSensorToggle={handleSensorToggle}
              onThresholdChange={handleThresholdChange}
            />
          </Form.Item>
        ),
    },
    {
      key: '2',
      label: 'Vị trí đặt thiết bị',
      children:
        (
          <div>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  name={['location', 'lat']}
                  label={<span style={{ fontWeight: 500, color: '#434343' }}>Vĩ độ</span>}
                  rules={[]}
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
                  label={<span style={{ fontWeight: 500, color: '#434343' }}>Kinh độ</span>}
                  rules={[]}
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
        ),
    },
  ];

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

          <Collapse items={items} defaultActiveKey={['1']} onChange={() => { }} />
        </div>
      </Form>
    </Modal>
  );
};
export default DeviceForm;