import React, { useEffect, useState } from 'react';
import { Flex, Spin, Empty, Button, Card, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import DeviceCard from '../components/Device/DeviceCard';
import DeviceForm from '../components/Device/DeviceForm';
import { 
  fetchDevices, 
  selectAllDevices, 
  getDeviceStatus,
  deleteDeviceById
} from '../features/device/deviceSlice';

const Devices = () => {
  const dispatch = useDispatch();
  const devices = useSelector(selectAllDevices);
  const status = useSelector(getDeviceStatus);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    dispatch(fetchDevices());
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setIsModalVisible(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      await dispatch(deleteDeviceById(deviceId)).unwrap();
      message.success('Device deleted successfully');
      dispatch(fetchDevices());
    } catch (error) {
      message.error(error.message || 'Failed to delete device');
    }
  };

  // Fetch devices when component mounts
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDevices());
    }
  }, [status, dispatch]);

  // Handle add new device
  const handleAddDevice = () => {
    setEditingDevice(null);
    setIsModalVisible(true);
  };

  if (status === 'loading' && devices.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty description="Failed to load devices" />
        <Button type="primary" onClick={() => dispatch(fetchDevices())} style={{ marginTop: '16px' }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Devices</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddDevice}
        >
          Add Device
        </Button>
      </div>
      
      {devices.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {devices.map((device) => (
            <DeviceCard 
              key={device.deviceId} 
              device={device}
              onEdit={handleEditDevice}
              onDelete={handleDeleteDevice}
            />
          ))}
        </div>
      ) : (
        <Empty 
          description={
            <div>
              <div>No devices found</div>
              <Button 
                type="primary" 
                onClick={() => setIsModalVisible(true)}
                style={{ marginTop: '16px' }}
              >
                Add your first device
              </Button>
            </div>
          } 
          style={{ marginTop: '40px' }}
        />
      )}

      <DeviceForm
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        initialValues={editingDevice}
        isEditing={!!editingDevice}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Devices;
