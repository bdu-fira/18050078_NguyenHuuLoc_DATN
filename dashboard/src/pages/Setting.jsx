import React, { useEffect, useState } from 'react';
import { Tabs, Input, Button, message, Spin } from 'antd';
import { SENSOR_OPTIONS } from '../constants/sensors';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSettings, upsertSetting, updateSetting } from '../features/setting/settingsSlice';
import { ThresholdSettings } from '../components/Setting/ThresholdSettings';
import { PromptSetting } from '../components/Setting/PromptSetting';

const Setting = () => {
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
        <PromptSetting
          loading={loading}
          operation={operation}
          initialValues={prompt}
          onSave={handleSavePrompt}
        />
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
