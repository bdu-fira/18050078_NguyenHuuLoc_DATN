import React, { useState } from 'react';
import { Button, Form, Input, Select, Typography, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const FUNCTION_TYPES = [
  { value: 'led', label: 'Đèn LED' },
  { value: 'relay', label: 'Rơ-le' },
  { value: 'motor', label: 'Động cơ' },
  { value: 'fan', label: 'Quạt' },
  { value: 'pump', label: 'Máy bơm' }
];

const CONTROL_TYPES = [
  { value: 'switch', label: 'Công tắc' },
  { value: 'dimmer', label: 'Điều chỉnh độ sáng' },
  { value: 'button', label: 'Nút nhấn' }
];

const PIN_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `GPIO ${i + 1}`
}));

const ICON_OPTIONS = [
  { value: 'lightbulb', label: 'Bóng đèn' },
  { value: 'power', label: 'Nguồn' },
  { value: 'fan', label: 'Quạt' },
  { value: 'water', label: 'Nước' },
  { value: 'setting', label: 'Cài đặt' },
  { value: 'tool', label: 'Công cụ' },
];

const DeviceFunctions = ({ functions = [], onChange }) => {
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState(['1']);

  const onAddFunction = (values) => {
    const newFunction = {
      name: values.name,
      type: values.type,
      pin: values.pin,
      status: false,
      value: 0,
      label: values.label || FUNCTION_TYPES.find(f => f.value === values.name)?.label || values.name,
      icon: values.icon || 'setting'
    };
    
    onChange([...functions, newFunction]);
    form.resetFields();
    setActiveKey(['1']); // Reset to form panel
  };

  const removeFunction = (index) => {
    const newFunctions = [...functions];
    newFunctions.splice(index, 1);
    onChange(newFunctions);
  };

  const updateFunction = (index, field, value) => {
    const newFunctions = [...functions];
    newFunctions[index] = { ...newFunctions[index], [field]: value };
    
    // If changing to switch type, reset value to 0 or 1 based on status
    if (field === 'type' && value === 'switch') {
      newFunctions[index].value = newFunctions[index].status ? 255 : 0;
    }
    
    onChange(newFunctions);
  };

  return (
    <div className="device-functions">
      <style jsx>{`
        .device-functions {
          --function-item-bg: #f8f9fa;
          --function-item-border: #e9ecef;
          --function-item-hover: #e9ecef;
          --function-item-active: #e7f1ff;
          --function-item-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .function-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 16px;
          overflow: hidden;
          border: 1px solid var(--function-item-border);
        }
        
        .function-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--function-item-bg);
          border-bottom: 1px solid var(--function-item-border);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .function-header:hover {
          background: var(--function-item-hover);
        }
        
        .function-header.active {
          background: var(--function-item-active);
        }
        
        .function-content {
          padding: 16px;
          background: white;
        }
        
        .form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px dashed #f0f0f0;
          margin-top: 16px;
        }
      `}</style>
      
      <Collapse 
        activeKey={activeKey}
        onChange={setActiveKey}
        expandIconPosition="end"
        ghost
        className="function-collapse"
      >
        <Collapse.Panel 
          key="1" 
          header={
            <div className="function-header">
              <span style={{ fontWeight: 500 }}>Thêm chức năng mới</span>
              <PlusOutlined style={{ color: '#1677ff' }} />
            </div>
          }
          showArrow={false}
          className="function-panel"
        >
          <div className="function-content">
            <Form
              form={form}
              layout="vertical"
              onFinish={onAddFunction}
            >
              <div className="form-row">
                <Form.Item
                  name="name"
                  label="Loại chức năng"
                  rules={[{ required: true, message: 'Vui lòng chọn loại chức năng' }]}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <Select 
                    placeholder="Chọn chức năng"
                    optionLabelProp="label"
                  >
                    {FUNCTION_TYPES.map((func) => (
                      <Option key={func.value} value={func.value} label={func.label}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span>{func.label}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="type"
                  label="Loại điều khiển"
                  initialValue="switch"
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <Select>
                    {CONTROL_TYPES.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  name="pin"
                  label="Chân GPIO"
                  rules={[{ required: true, message: 'Vui lòng chọn chân GPIO' }]}
                  style={{ width: 150 }}
                >
                  <Select placeholder="GPIO">
                    {PIN_OPTIONS.map((pin) => (
                      <Option key={pin.value} value={pin.value}>
                        {pin.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="icon"
                  label="Biểu tượng"
                  style={{ width: 200 }}
                >
                  <Select 
                    placeholder="Chọn biểu tượng"
                    optionLabelProp="label"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <Option key={icon.value} value={icon.value} label={icon.label}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginLeft: 8 }}>{icon.label}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="label"
                label="Nhãn hiển thị"
                style={{ marginBottom: 16 }}
              >
                <Input placeholder="VD: Đèn phòng khách" />
              </Form.Item>

              <div className="form-actions">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlusOutlined />}
                >
                  Thêm chức năng
                </Button>
              </div>
            </Form>
          </div>
        </Collapse.Panel>
      </Collapse>

      {functions.length > 0 && (
        <div className="functions-list" style={{ marginTop: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16 }}>Danh sách chức năng</Text>
          <div style={{ display: 'grid', gap: '12px' }}>
            {functions.map((func, index) => (
              <div 
                key={index} 
                className="function-card"
              >
                <div className="function-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>
                      {func.label || FUNCTION_TYPES.find(f => f.value === func.name)?.label || func.name}
                    </span>
                    <span style={{ 
                      fontSize: 12, 
                      color: '#666',
                      backgroundColor: '#f0f0f0',
                      padding: '2px 6px',
                      borderRadius: 10
                    }}>
                      {func.type === 'switch' ? 'Công tắc' : 
                       func.type === 'dimmer' ? 'Điều chỉnh độ sáng' : 'Nút nhấn'}
                    </span>
                    <span style={{ 
                      fontSize: 12, 
                      color: '#666',
                      backgroundColor: '#e6f7ff',
                      padding: '2px 6px',
                      borderRadius: 10,
                      border: '1px solid #91d5ff'
                    }}>
                      GPIO {func.pin}
                    </span>
                  </div>
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFunction(index);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceFunctions;
