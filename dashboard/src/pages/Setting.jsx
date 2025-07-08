import React from 'react';
import { Tabs, Form, Input, Button, message } from 'antd';
import { SENSOR_OPTIONS } from '../constants/sensors';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPrompt, fetchThresholds, updatePrompt, updateThresholds } from '../store/settingsSlice';
import { Space } from 'antd';

const { TabPane } = Tabs;

const Setting = () => {
  const [form] = Form.useForm();
  const [thresholdForm] = Form.useForm();
  const dispatch = useDispatch();
  const { prompt, thresholds, loading } = useSelector((state) => state.settings);

  // Load initial data when component mounts
  React.useEffect(() => {
    dispatch(fetchPrompt());
    dispatch(fetchThresholds());
  }, [dispatch]);

  // Update form values when prompt or thresholds change
  React.useEffect(() => {
    if (prompt) {
      form.setFieldsValue({
        systemPrompt: prompt.system,
        userPrompt: prompt.user
      });
    }
    if (thresholds) {
      thresholdForm.setFieldsValue(thresholds);
    }
  }, [prompt, thresholds, form, thresholdForm]);



  // Save thresholds to backend
  const handleSaveThresholds = async (values) => {
    try {
      await dispatch(updateThresholds(values));
      message.success('Đã lưu ngưỡng cảnh báo thành công');
    } catch (error) {
      console.error('Error saving thresholds:', error);
      message.error('Đã xảy ra lỗi khi lưu ngưỡng cảnh báo');
    }
  };

  // Save prompt to backend
  const handleSavePrompt = async (values) => {
    try {
      await dispatch(updatePrompt({
        systemPrompt: values.systemPrompt,
        userPrompt: values.userPrompt
      })).unwrap();
      message.success('Đã lưu prompt thành công');
    } catch (error) {
      console.error('Error saving prompt:', error);
      message.error(error.message || 'Đã xảy ra lỗi khi lưu prompt');
    }
  };

  const items = [
    {
      key: 'prompt',
      label: 'Prompt Gemini',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePrompt}
          initialValues={{ prompt }}
        >
          <Form.Item
            name="systemPrompt"
            label="System Prompt"
            tooltip="Định nghĩa vai trò và hành vi của AI"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập system prompt..."
            />
          </Form.Item>
          <Form.Item
            name="userPrompt"
            label="User Prompt"
            tooltip="Hướng dẫn cách AI xử lý yêu cầu người dùng"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập user prompt..."
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Lưu prompt
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'thresholds',
      label: 'Ngưỡng cảnh báo',
      children: (
        <Form
          form={thresholdForm}
          layout="vertical"
          onFinish={handleSaveThresholds}
          initialValues={thresholds}
        >
          {SENSOR_OPTIONS.map((sensor) => (
            <Form.Item
              key={sensor.name}
              name={sensor.name}
              label={
                <Space>
                  <sensor.icon style={{ marginRight: 8, color: sensor.color }} />
                  {sensor.label}
                </Space>
              }
            >
              <Input
                addonAfter={sensor.unit}
                placeholder={`Nhập ngưỡng ${sensor.label}`}
              />
            </Form.Item>
          ))}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Lưu ngưỡng cảnh báo
            </Button>
          </Form.Item>
        </Form>
      ),
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs items={items} />

      {/* Display loading state */}
      {loading && (
        <div style={{ color: '#1890ff', marginTop: '16px' }}>
          Đang tải dữ liệu...
        </div>
      )}
    </div>
  );
};

export default Setting;
