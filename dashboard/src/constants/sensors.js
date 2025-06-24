import { 
  FireOutlined, 
  CloudOutlined, 
  DashboardOutlined, 
  AlertOutlined, 
  EnvironmentOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  CloudSyncOutlined 
} from '@ant-design/icons';

// Create a mapping of icon names to their corresponding components
const iconComponents = {
  FireOutlined: FireOutlined,
  CloudOutlined: CloudOutlined,
  DashboardOutlined: DashboardOutlined,
  AlertOutlined: AlertOutlined,
  EnvironmentOutlined: EnvironmentOutlined,
  ThunderboltOutlined: ThunderboltOutlined,
  CloudServerOutlined: CloudServerOutlined,
  CloudSyncOutlined: CloudSyncOutlined
};

export const SENSOR_OPTIONS = [
  { 
    name: 'temperature', 
    label: 'Nhiệt độ', 
    unit: '°C',
    icon: iconComponents.FireOutlined,
    color: '#ff4d4f',
    category: 'environment'
  },
  { 
    name: 'humidity', 
    label: 'Độ ẩm', 
    unit: '%',
    icon: iconComponents.CloudOutlined,
    color: '#1890ff',
    category: 'environment'
  },
  { 
    name: 'co2', 
    label: 'CO₂', 
    unit: 'ppm',
    icon: iconComponents.DashboardOutlined,
    color: '#52c41a',
    category: 'air_quality'
  },
  { 
    name: 'pm25', 
    label: 'Bụi PM2.5', 
    unit: 'µg/m³',
    icon: iconComponents.AlertOutlined,
    color: '#faad14',
    category: 'air_quality'
  },
  { 
    name: 'pm10', 
    label: 'Bụi PM10', 
    unit: 'µg/m³',
    icon: iconComponents.AlertOutlined,
    color: '#fa8c16',
    category: 'air_quality'
  },
  { 
    name: 'voc', 
    label: 'VOC', 
    unit: 'ppb',
    icon: iconComponents.ThunderboltOutlined,
    color: '#722ed1',
    category: 'air_quality'
  },
  { 
    name: 'o3', 
    label: 'O₃', 
    unit: 'ppb',
    icon: iconComponents.CloudServerOutlined,
    color: '#13c2c2',
    category: 'air_quality'
  },
  { 
    name: 'no2', 
    label: 'NO₂', 
    unit: 'ppb',
    icon: iconComponents.EnvironmentOutlined,
    color: '#eb2f96',
    category: 'air_quality'
  },
  { 
    name: 'so2', 
    label: 'SO₂', 
    unit: 'ppb',
    icon: iconComponents.CloudSyncOutlined,
    color: '#f5222d',
    category: 'air_quality'
  },
  { 
    name: 'aqi', 
    label: 'Chỉ số AQI',
    unit: '',
    icon: iconComponents.DashboardOutlined,
    color: '#52c41a',
    category: 'air_quality'
  },
];

export const SENSOR_CATEGORIES = {
  environment: 'Môi trường',
  air_quality: 'Chất lượng không khí'
};
