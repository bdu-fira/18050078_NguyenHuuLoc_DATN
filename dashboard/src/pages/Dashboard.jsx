import React, { useState } from 'react';
import {
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Collapse,
  Card,
  Statistic,
  Space,
  Layout
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllDevices } from '../features/device/deviceSlice';
import DeviceContent from '../components/Device/DeviceContent';
import MapComponent from '../components/MapComponent';

const { Text } = Typography;
const { Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const devices = useSelector(selectAllDevices);

  const handleViewAllDevices = () => {
    navigate('/devices');
  };

  const listDevicesColapse = devices.map((device) => {
    return {
      key: device.deviceId,
      label: device.name,
      children: <DeviceContent device={device} />,
    };
  });

  return (
    <Content className="site-layout" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Left Sidebar */}
        <Col xs={24} md={8}>
          <Card
            className="site-layout-background"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Statistic
              title="Tổng số thiết bị"
              value={devices.length}
              valueStyle={{ color: '#1890ff' }}
              style={{ marginBottom: 24 }}
            />

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Text strong style={{ marginBottom: 12, fontSize: 16 }}>
                Danh sách thiết bị
              </Text>
              <div style={{ flex: 1, overflow: 'auto', paddingRight: 8 }}>
                <Collapse
                  items={listDevicesColapse}
                  defaultActiveKey={[]}
                />
              </div>
            </div>

            <Button
              type="primary"
              block
              onClick={handleViewAllDevices}
              style={{ marginTop: 'auto' }}
            >
              Xem tất cả thiết bị
            </Button>
          </Card>
        </Col>


        {/* Right Content */}
        <Col xs={24} md={16}>
          <Card
            className="site-layout-background"
            style={{ height: '100%', minHeight: '500px' }}
          >
            <MapComponent center={devices?.[0]?.location || [10.967038337798492, 106.72305285930635]} zoom={15} listDevices={devices} />
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Dashboard;