import React from 'react';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card, Tag, Tooltip, message } from 'antd';
import GoogleMap from '../GoogleMap';


const { Meta } = Card;

const DeviceCard = ({ device, onEdit, onDelete }) => {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete?.(device.deviceId);
    } catch (error) {
      console.error('Error deleting device:', error);
      message.error(error.message || 'Error deleting device');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit?.(device);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      online: { color: 'success', label: 'Online' },
      offline: { color: 'error', label: 'Offline' },
      warning: { color: 'warning', label: 'Warning' },
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || { color: 'default', label: 'Unknown' };
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  return (
    <Card
      style={{ width: 300 }}
      loading={loading}
      cover={
        <div style={{ height: '160px', overflow: 'hidden' }}>
          {/* <GoogleMap 
            lat={device?.location?.lat} 
            lng={device?.location?.lng} 
            height="100%"
            zoom={15}
          /> */}
        </div>
      }
      actions={[
        <Tooltip title="Edit Device" key="edit">
          <EditOutlined onClick={handleEdit} />
        </Tooltip>,
        <Tooltip title="Delete Device" key="delete">
          <DeleteOutlined onClick={handleDelete} />
        </Tooltip>,
      ]}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{device?.name || 'Unnamed Device'}</span>
            {getStatusTag(device?.status)}
          </div>
        }
        description={
          <div>
            <div>{device?.description || 'No description provided'}</div>
            <div style={{ marginTop: '8px' }}>
              <small>ID: {device?.deviceId}</small>
            </div>
            {device?.lastSeen && (
              <div style={{ marginTop: '4px' }}>
                <small>Last seen: {new Date(device?.lastSeen).toLocaleString()}</small>
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default DeviceCard;