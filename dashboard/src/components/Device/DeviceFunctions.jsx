import React, { useState } from 'react';
import { Button, Input, Select, Typography, Collapse } from 'antd';
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
  const [formError, setFormError] = useState('');
  const [activeKey, setActiveKey] = useState(['1']);
  const [functionName, setFunctionName] = useState("");
  const [functionType, setFunctionType] = useState("");
  const [functionPin, setFunctionPin] = useState("");
  const [functionLabel, setFunctionLabel] = useState("");
  const [functionIcon, setFunctionIcon] = useState("");
  
  // Alias for consistency with parent component
  const deviceFunctions = functions;

  const onAddFunction = () => {
    // Validate required fields
    if (!functionName || !functionType || !functionPin) {
      setFormError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    setFormError('');
    
    const newFunctions = [...functions];
    newFunctions.push({
      name: functionName,
      type: functionType,
      pin: functionPin,
      status: false,
      value: functionType === 'dimmer' ? 100 : 0, // Default values based on type
      label: functionLabel || functionName, // Use name as default label if not provided
      icon: functionIcon || 'setting' // Default icon if not provided
    });
    
    onChange(newFunctions);
    
    // Reset form
    setActiveKey(['1']);
    setFunctionName('');
    setFunctionType('');
    setFunctionPin('');
    setFunctionLabel('');
    setFunctionIcon('');
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

  const collapseItems = [
    {
      key: '1',
      label: (
        <div className="function-header">
          <span style={{ fontWeight: 500 }}>Thêm chức năng mới</span>
          <PlusOutlined style={{ color: '#1677ff' }} />
        </div>
      ),
      showArrow: false,
      className: 'function-panel',
      children: (
        <div style={{ padding: 16, background: 'white' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 16, 
            marginBottom: 16 
          }}>
            <Select 
              placeholder="Chọn chức năng"
              optionLabelProp="label"
              onChange={setFunctionName}
              value={functionName || undefined}
              style={{ minWidth: 200 }}
            >
              {FUNCTION_TYPES.map((func) => (
                <Option key={func.value} value={func.value} label={func.label}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{func.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
            <Select
              style={{ minWidth: 200 }}
              placeholder="Loại điều khiển"
              onChange={setFunctionType}
              value={functionType || undefined}
            >
              {CONTROL_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 16, 
            marginBottom: 16 
          }}>
            <Select 
              placeholder="GPIO *" 
              onChange={setFunctionPin}
              value={functionPin || undefined}
              style={{ minWidth: 120 }}
            >
              {PIN_OPTIONS.map((pin) => (
                <Option key={pin.value} value={pin.value}>
                  {pin.label}
                </Option>
              ))}
            </Select>
            <Select 
              placeholder="Biểu tượng"
              optionLabelProp="label"
              onChange={setFunctionIcon}
              value={functionIcon || undefined}
              style={{ minWidth: 160 }}
            >
              {ICON_OPTIONS.map((icon) => (
                <Option key={icon.value} value={icon.value} label={icon.label}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: 8 }}>{icon.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          <Input 
            placeholder="Tên hiển thị (để trống sẽ dùng tên chức năng)" 
            value={functionLabel}
            onChange={(e) => setFunctionLabel(e.target.value)} 
            style={{ marginBottom: 16 }}
          />
          
          {formError && (
            <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
              {formError}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 8,
            borderTop: '1px dashed #f0f0f0',
            marginTop: 16
          }}>
            <Button 
              type="primary" 
              onClick={onAddFunction}
              icon={<PlusOutlined />}
            >
              Thêm chức năng
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{ width: '100%' }}>
      <Collapse 
        activeKey={activeKey}
        onChange={setActiveKey}
        className="function-collapse"
        items={collapseItems}
      />

      {deviceFunctions.length > 0 && (
        <div className="functions-list" style={{ marginTop: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16 }}>Danh sách chức năng</Text>
          <div style={{ display: 'grid', gap: '12px' }}>
            {deviceFunctions.map((func, index) => (
              <div 
                key={index} 
                style={{
                  background: 'white',
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  marginBottom: 16,
                  overflow: 'hidden',
                  border: '1px solid #e9ecef'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f8f9fa',
                  borderBottom: '1px solid #e9ecef',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#e9ecef'
                  }
                }}>
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
