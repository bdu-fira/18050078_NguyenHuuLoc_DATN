import React from 'react';
import { Button, message } from 'antd';
import { BulbFilled, BulbOutlined, AlertFilled, AlertOutlined, WindowsFilled, WindowsOutlined } from '@ant-design/icons';
import { ttnApi } from '../../services/api';

const DeviceFunction = ({ deviceId, alertState = false, ledState = false, doorState = false }) => {

  const toggleLED = async () => {
    try {
      await ttnApi.sendDownlink(deviceId, ledState ? 'led_off' : 'led_on');
      message.success('Đã gửi lệnh điều khiển LED, vui lòng đợi phản hồi...');
    } catch (error) {
      console.error('Error toggling LED:', error);
    }
  };

  const toggleAlert = async () => {
    try {
      await ttnApi.sendDownlink(deviceId, alertState ? 'alert_off' : 'alert_on');
      message.success('Đã gửi lệnh điều khiển cảnh báo, vui lòng đợi phản hồi...');
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const toggleDoor = async () => {
    try {
      await ttnApi.sendDownlink(deviceId, doorState ? 'door_close' : 'door_open');
      message.success('Đã gửi lệnh điều khiển cửa, vui lòng đợi phản hồi...');
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
        type={ledState ? "primary" : "default"}
        icon={ledState ? <BulbFilled /> : <BulbOutlined />}
        onClick={toggleLED}
      >
        LED
      </Button>

      {/* <Button
        type={alertState ? "primary" : "default"}
        icon={alertState ? <AlertFilled /> : <AlertOutlined />}
        onClick={toggleAlert}
      >
        Cảnh báo
      </Button> */}

      {/* <Button
        type={doorState ? "primary" : "default"}
        icon={doorState ? <WindowsFilled /> : <WindowsOutlined />}
        onClick={toggleDoor}
      >
        {doorState ? 'Tắt Servo' : 'Bật Servo'}
      </Button> */}
    </div>
  );
};

export default DeviceFunction;