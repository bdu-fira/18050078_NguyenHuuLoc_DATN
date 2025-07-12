
import React, { useEffect } from 'react';
import { Form, Input, Button, Spin, Typography } from 'antd';

export const PromptSetting = ({
  loading,
  operation,
  onSave,
  initialValues = {}
}) => {
  const [form] = Form.useForm();

  // Initialize form with initial values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        systemPrompt: initialValues.system || '',
        userPrompt: initialValues.user || ''
      });
    }
  }, [initialValues, form]);

  return (
    <Spin 
      spinning={loading && operation === 'fetching'}
      tip="Đang tải..."
      style={{ minHeight: '200px' }}
    >
      <Form 
        form={form} 
        onFinish={onSave}
        layout="vertical"
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
            Lưu prompt
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default PromptSetting;