import React, { useEffect } from 'react';
import { Card, List, Button, Spin, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDevices, 
  addNewDevice, 
  updateDeviceById, 
  deleteDeviceById,
  selectAllDevices,
  getDeviceStatus,
  getDeviceError,
  clearError
} from './deviceSlice';

const DeviceListReduxExample = () => {
  const dispatch = useDispatch();
  const devices = useSelector(selectAllDevices);
  const status = useSelector(getDeviceStatus);
  const error = useSelector(getDeviceError);

  // Load devices on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDevices());
    }
  }, [status, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      message.error(error);
      // Clear the error after showing the message
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Sample function to add a new device
  const handleAddDevice = () => {
    const newDevice = {
      deviceId: `device_${Date.now()}`,
      name: `Device ${devices.length + 1}`,
      description: 'Sample device added via Redux',
      location: {
        lat: 10.762622 + (Math.random() * 0.01 - 0.005),
        lng: 106.660172 + (Math.random() * 0.01 - 0.005)
      }
    };
    
    dispatch(addNewDevice(newDevice))
      .unwrap()
      .then(() => {
        message.success('Device added successfully!');
      });
  };

  // Sample function to update a device
  const handleUpdateDevice = (device) => {
    const updatedDevice = {
      ...device,
      name: `${device.name} (Updated)`,
      description: 'This device was updated via Redux',
    };
    
    dispatch(updateDeviceById({ id: device._id, deviceData: updatedDevice }))
      .unwrap()
      .then(() => {
        message.success('Device updated successfully!');
      });
  };

  // Sample function to delete a device
  const handleDeleteDevice = (deviceId) => {
    dispatch(deleteDeviceById(deviceId))
      .unwrap()
      .then(() => {
        message.success('Device deleted successfully!');
      });
  };

  if (status === 'loading' && devices.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card 
      title="Redux Example: Device Management" 
      style={{ margin: '20px' }}
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddDevice}
          loading={status === 'loading'}
        >
          Add Sample Device
        </Button>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={devices}
        renderItem={(device) => (
          <List.Item
            actions={[
              <Button 
                key="edit" 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleUpdateDevice(device)}
              />,
              <Button 
                key="delete" 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteDevice(device._id)}
              />
            ]}
          >
            <List.Item.Meta
              title={device.name}
              description={
                <Space direction="vertical" size={0}>
                  <div>ID: {device.deviceId}</div>
                  <div>{device.description}</div>
                  {device.location && (
                    <div>
                      Location: {device.location.lat?.toFixed(6)}, {device.location.lng?.toFixed(6)}
                    </div>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DeviceListReduxExample;
