import React, { useState } from 'react';
import { Button } from 'antd';
import { BulbFilled, BulbOutlined, AlertFilled, AlertOutlined, WindowsFilled, WindowsOutlined } from '@ant-design/icons';
import { ttnApi } from '../../services/api';

const DeviceFunction = ({ deviceId }) => {
  const [isLedOn, setIsLedOn] = useState(false);
  const [isAlertOn, setIsAlertOn] = useState(false);
  const [isOpenDoor, setIsOpenDoor] = useState(false);

  const toggleLED = async () => {
    try {
      await ttnApi.sendDownlink(deviceId, isLedOn ? 'led_off' : 'led_on');
      setIsLedOn(!isLedOn);
    } catch (error) {
      console.error('Error toggling LED:', error);
    }
  };

  const toggleAlert = async () => {
    try {
      await ttnApi.sendDownlink(deviceId, isAlertOn ? 'alert_off' : 'alert_on');
      setIsAlertOn(!isAlertOn);
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const toggleDoor = async () => {
    try {
      await ttnApi.sendDownlink(deviceId, isOpenDoor ? 'door_close' : 'door_open');
      setIsOpenDoor(!isOpenDoor);
    } catch (error) {
      console.error('Error toggling door:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '16px'
    }}>
      <Button
        type={isLedOn ? "primary" : "default"}
        icon={isLedOn ? <BulbFilled /> : <BulbOutlined />}
        onClick={toggleLED}
      >
        LED
      </Button>
      <Button
        type={isAlertOn ? "primary" : "default"}
        icon={isAlertOn ? <AlertFilled /> : <AlertOutlined />}
        onClick={toggleAlert}
      >
        Cảnh báo
      </Button>

      <Button
        type={isOpenDoor ? "primary" : "default"}
        icon={isOpenDoor ? <WindowsFilled /> : <WindowsOutlined />}
        onClick={toggleDoor}
      >
        {isOpenDoor ? 'Đóng cửa' : 'Mở cửa'}
      </Button>
    </div>
  );
};

export default DeviceFunction;