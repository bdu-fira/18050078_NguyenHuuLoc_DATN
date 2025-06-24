import React, { useEffect } from 'react';
import { AppstoreOutlined, PartitionOutlined, CodeOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices, selectAllDevices } from '../features/device/deviceSlice';

const AppMenu = (props) => {
  const dispatch = useDispatch();
  const devices = useSelector(selectAllDevices);
  const location = useLocation();

  // Fetch devices when component mounts
  useEffect(() => {
    if (devices.length === 0) {
      dispatch(fetchDevices());
    }
  }, [dispatch, devices.length]);

  // Generate menu items
  const menuItems = [
    {
      key: 'overview',
      label: <Link to="/">Tổng quan</Link>,
      icon: <AppstoreOutlined />,
    },
    {
      key: 'sensor-data',
      label: 'Dữ liệu cảm biến',
      icon: <PartitionOutlined />,
      children: devices.length > 0 ? devices.map(device => ({
        key: `device-${device._id}`,
        label: <Link to={`/devices/${device.deviceId}`}>{device.name || `Thiết bị ${device.deviceId}`}</Link>,
      })) : [
        {
          key: 'loading-devices',
          label: <span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>Đang tải thiết bị...</span>,
          disabled: true
        }
      ]
    },
    {
      key: 'devices',
      label: <Link to="/devices">Thiết bị</Link>,
      icon: <CodeOutlined />,
    },
  ];
  // Get the current path to set the selected keys
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['overview'];
    if (path === '/devices') return ['devices'];
    if (path.startsWith('/devices/')) {
      const deviceId = path.split('/devices/')[1];
      if (deviceId) {
        // Find the device in the devices array to get the correct _id for the key
        const device = devices.find(d => d.deviceId === deviceId);
        return device ? [`device-${device._id}`] : [];
      }
      return [];
    }
    return [];
  };

  return (
    <Menu
      selectedKeys={getSelectedKeys()}
      defaultOpenKeys={['devices']}
      mode="inline"
      items={menuItems}
      {...props}
    />
  );
};

export default AppMenu;