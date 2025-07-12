import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, message, Spin } from 'antd';
import { SENSOR_OPTIONS } from '../constants/sensors';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSettings, upsertSetting, updateSetting } from '../features/setting/settingsSlice';
import { ThresholdSettings } from '../components/ThresholdSettings';

const Setting = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const {
    prompt = { system: '', user: '' },
    thresholds = {},
    loading,
    operation = 'fetching',
    settingsByType = {}
  } = useSelector((state) => state.settings);

  const [activeTab, setActiveTab] = useState('prompt');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load all settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await dispatch(fetchAllSettings()).unwrap();
      } catch (error) {
        message.error('Không thể tải cài đặt: ' + (error.message || 'Lỗi không xác định'));
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadSettings();
  }, [dispatch]);

  // Update prompt form when settings change
  useEffect(() => {
    if (prompt && (prompt.system !== undefined || prompt.user !== undefined)) {
      form.setFieldsValue({
        systemPrompt: prompt.system || '',
        userPrompt: prompt.user || ''
      });
    }
  }, [prompt, form]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Save settings to server
  const saveSetting = async (type, values) => {
    try {
      // Format values based on setting type
      let data = values;
      if (type === 'prompt') {
        data = {
          system: values.systemPrompt,
          user: values.userPrompt
        };
      }
      
      await dispatch(upsertSetting({
        type,
        data
      })).unwrap();

      // Update local state immediately
      dispatch(updateSetting({
        type,
        data
      }));

      message.success(`Đã cập nhật ${type === 'prompt' ? 'prompt' : 'ngưỡng'} thành công`);
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      message.error(`Lỗi khi lưu ${type === 'prompt' ? 'prompt' : 'ngưỡng'}: ${error.message || 'Lỗi không xác định'}`);
      return false;
    }
  };

  // Handle save prompt
  const handleSavePrompt = async (values) => {
    await saveSetting('prompt', values);
  };

  // Handle save threshold
  const handleThresholdSubmit = async (values) => {
    await saveSetting('threshold', values);
  };

  if (isInitialLoad) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Spin size="large">
          <div style={{ padding: '24px' }}>Đang tải cài đặt...</div>
        </Spin>
      </div>
    );
  }

  const items = [
    {
      key: 'prompt',
      label: 'Cài đặt Prompt',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePrompt}
          disabled={loading && operation === 'updating'}
        >
          <Form.Item
            name="systemPrompt"
            label="System Prompt"
            rules={[{ required: true, message: 'Vui lòng nhập system prompt' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập system prompt..."
              disabled={loading && operation === 'updating'}
            />
          </Form.Item>
          <Form.Item
            name="userPrompt"
            label="User Prompt"
            rules={[{ required: true, message: 'Vui lòng nhập user prompt' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập user prompt..."
              disabled={loading && operation === 'updating'}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading && operation === 'updating'}
              disabled={loading && operation === 'fetching'}
            >
              Lưu Prompt
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'thresholds',
      label: 'Ngưỡng cảnh báo',
      children: (
        <ThresholdSettings
          sensors={SENSOR_OPTIONS}
          loading={loading}
          operation={operation}
          initialValues={thresholds}
          onSave={handleThresholdSubmit}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={items}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default Setting;
