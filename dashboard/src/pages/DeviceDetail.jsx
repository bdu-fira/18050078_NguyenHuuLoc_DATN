import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
import 'dayjs/locale/vi';
import DeviceFunction from '../components/Device/DeviceFunction';
import {
  Card,
  Row,
  Col,
  Typography,
  Empty,
  Button,
  Tabs,
  Select,
  Space,
  message,
  Collapse,
  Switch,
  DatePicker,
  Modal,
  Statistic,
  Spin,
  Tooltip,
  Divider,
  Dropdown,
  Menu
} from 'antd';
import {
  AreaChartOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  CloseOutlined,
  DownloadOutlined,
  MoreOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { sensorDataApi, messageApi } from '../services/api';
import { SENSOR_OPTIONS, SENSOR_CATEGORIES } from '../constants/sensors';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllDevices, updateDeviceById } from '../features/device/deviceSlice';
import SensorList from '../components/Device/SensorList';
import DeviceFunctions from '../components/Device/DeviceFunctions';
import ReactJson from 'react-json-view'
import dayjs from 'dayjs';
// Extend dayjs with plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const categoryLabels = SENSOR_CATEGORIES;
const sensorOptions = SENSOR_OPTIONS.map(sensor => ({
  ...sensor,
  icon: React.createElement(sensor.icon, {
    style: { color: sensor.color }
  })
}));

// Time range options in hours
const TIME_RANGES = [
  { value: 4, label: '4 giờ' },
  { value: 8, label: '8 giờ' },
  { value: 12, label: '12 giờ' },
  { value: 24, label: '24 giờ' },
];

// Format sensor data for charts and calculate averages
const formatSensorData = (data, device) => {
  if (!data || !Array.isArray(data)) return { data: [], averages: {} };

  const formattedData = data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp).getTime(),
    // Ensure all sensor values are numbers
    temperature: Number(item.TempC_SHT) || 0,
    humidity: Number(item.Hum_SHT) || 0,
    co2: Number(item.CO2_ppm) || 0,
    pm25: Number(item.PM25) || 0,
    pm10: Number(item.PM10) || 0,
    voc: Number(item.VOC) || 0,
    o3: Number(item.O3) || 0,
    no2: Number(item.NO2) || 0,
    so2: Number(item.SO2) || 0,
    aqi: Number(item.AQI) || 0,
    battery: Number(item.Bat_V) || 0,
  }));

  // Calculate averages for all sensors
  const averages = {};
  if (device?.sensorConfigurations) {
    Object.keys(device.sensorConfigurations).forEach(sensorKey => {
      averages[sensorKey] = calculateAverage(formattedData, sensorKey);
    });
  }

  return { data: formattedData, averages };
};

const chartStyle = {
  card: {
    marginBottom: 24,
    borderRadius: 8,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    minHeight: 0,
    minWidth: 0,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  chartContainer: {
    width: '100%',
    height: 300,
    marginTop: 16
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: '#fff',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontWeight: 500 }}>
          {dayjs(label).format('DD/MM/YYYY HH:mm:ss')}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: '4px 0',
            alignItems: 'center'
          }}>
            <span style={{ color: '#8c8c8c', marginRight: '12px' }}>{entry.name}:</span>
            <span style={{
              color: entry.color,
              fontWeight: 500,
              minWidth: '60px',
              textAlign: 'right'
            }}>
              {entry.value}{entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, dataKey, color, unit, domain, children, data, avgValue, threshold }) => {
  // Get the data from props or children
  const chartData = data || children?.props?.data || [];

  // Format X-axis tick to show date and time using moment.js
  const formatXAxis = (tickItem) => {
    const date = dayjs(tickItem);
    const now = dayjs();

    if (date.isSame(now, 'day')) {
      return date.format('HH:mm'); // Today - show time only
    } else if (date.isSame(now.clone().subtract(1, 'days'), 'day')) {
      return `Hôm qua ${date.format('HH:mm')}`; // Yesterday
    } else if (date.isSame(now, 'year')) {
      return date.format('DD/MM HH:mm'); // This year - show date and time without year
    }

    return date.format('DD/MM/YY HH:mm'); // Older dates - show with 2-digit year
  };

  return (
    <Card
      title={title}
      style={chartStyle.card}
      styles={{ header: { borderBottom: '1px solid #f0f0f0' }, body: { minHeight: '300px', } }}
    >
      <div style={chartStyle.chartContainer}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataKey ? chartData : undefined}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={domain || ['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickMargin={5}
                width={40}
                label={{ value: unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 100 }}
                labelFormatter={(label) => {
                  return `Thời gian: ${dayjs(label).format('DD/MM/YYYY HH:mm:ss')}`;
                }}
              />
              <Legend />
              {dataKey ? (
                <>
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    name={title}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    unit={unit}
                    isAnimationActive={false}
                  />
                  {threshold !== undefined && (
                    <Line
                      type="monotone"
                      dataKey={() => threshold}
                      name="Ngưỡng cảnh báo"
                      stroke="#faad14"
                      strokeDasharray="5 5"
                      dot={false}
                      strokeWidth={1}
                      isAnimationActive={false}
                    />
                  )}
                </>
              ) : (
                React.Children.map(children, child =>
                  child && React.cloneElement(child, { data: chartData })
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'rgba(0, 0, 0, 0.25)'
          }}>
            Không có dữ liệu
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>
          {data && data.length > 0 ? (
            <CountUp
              end={data[data.length - 1][dataKey] || 0}
              decimals={1}
              preserveValue
              suffix={unit}
            />
          ) : (
            `--${unit}`
          )}
        </div>
        {avgValue !== undefined && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Trung bình: {avgValue.toFixed(1)}{unit}
          </div>
        )}
      </div>
    </Card>
  );
};

const chartConfigs = {
  temperature: {
    title: 'Nhiệt độ',
    dataKey: 'temperature',
    color: '#ff4d4f',
    unit: '°C',
    domain: [0, 50]
  },
  humidity: {
    title: 'Độ ẩm',
    dataKey: 'humidity',
    color: '#1890ff',
    unit: '%',
    domain: [0, 100]
  },
  co2: {
    title: 'Nồng độ CO₂',
    dataKey: 'co2',
    color: '#52c41a',
    unit: 'ppm',
    domain: [300, 2000]
  },
  pm25: {
    title: 'Bụi mịn PM2.5',
    dataKey: 'pm25',
    color: '#722ed1',
    unit: 'µg/m³',
    domain: [0, 500]
  },
  pm10: {
    title: 'Bụi mịn PM10',
    dataKey: 'pm10',
    color: '#fa8c16',
    unit: 'µg/m³',
    domain: [0, 500]
  },
  voc: {
    title: 'VOC',
    dataKey: 'voc',
    color: '#faad14',
    unit: 'ppb',
    domain: [0, 5000]
  },
  o3: {
    title: 'O₃',
    dataKey: 'o3',
    color: '#13c2c2',
    unit: 'ppb',
    domain: [0, 500]
  },
  no2: {
    title: 'NO₂',
    dataKey: 'no2',
    color: '#eb2f96',
    unit: 'ppb',
    domain: [0, 5]
  },
  so2: {
    title: 'SO₂',
    dataKey: 'so2',
    color: '#f5222d',
    unit: 'ppb',
    domain: [0, 1]
  },
  aqi: {
    title: 'Chỉ số AQI',
    dataKey: 'aqi',
    color: '#fa541c',
    unit: '',
    domain: [0, 500]
  },
  battery: {
    title: 'Dung lượng pin',
    dataKey: 'battery',
    color: '#ff4d4f',
    unit: 'V',
    domain: [0, 5]
  }
};

const tooltipContents = {
  rssi: "RSSI (dBm): Cường độ tín hiệu thu được tại gateway. Giá trị càng gần 0 thì tín hiệu càng mạnh (thông thường từ -120 dBm đến -30 dBm).",
  snr: "SNR (dB): Tỷ lệ giữa tín hiệu và nhiễu. Giá trị dương cho thấy tín hiệu mạnh hơn nhiễu, giá trị âm nghĩa là tín hiệu đang chìm trong nhiễu.",
  packetErrorRate: "PER (%): Tỷ lệ gói tin bị lỗi hoặc mất trên tổng số gói gửi. Giá trị càng thấp thì kết nối càng ổn định.",
  airtime: "Airtime (s): Thời gian mà một gói LoRa chiếm kênh truyền khi phát. Phụ thuộc vào kích thước gói, tốc độ dữ liệu (SF) và băng thông.",
  correlationIds: "Correlation IDs: Số lượng ID liên kết được gán cho một gói tin khi nó đi qua hệ thống (ví dụ: gateway, network server, application server). Dùng để truy vết và gỡ lỗi trong toàn bộ chuỗi xử lý dữ liệu.",
  retryAttempts: "Retry Attempts: Số lần hệ thống phải thử gửi lại một gói tin (uplink hoặc downlink) do lỗi truyền hoặc mất gói. Giá trị cao có thể cho thấy chất lượng mạng kém hoặc nhiều xung đột kênh.",
  confirmed: "Confirmed: Tỷ lệ xác nhận nhận tin nhắn."
}


// Helper function to calculate average of an array of numbers
const calculateAverage = (arr, key) => {
  if (!arr || arr.length === 0) return 0;
  const values = arr.map(item => item[key]).filter(val => val !== undefined && val !== null);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const DeviceDetail = () => {
  const [signalMetrics, setSignalMetrics] = useState(null);
  const [signalMetricsLoading, setSignalMetricsLoading] = useState(false);
  const [signalMetricsType, setSignalMetricsType] = useState('uplink');
  const [signalMetricsDateRange, setSignalMetricsDateRange] = useState([]);
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const devices = useSelector(selectAllDevices);
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState([]);
  const [deviceFunctions, setDeviceFunctions] = useState([]);
  const [timeRange, setTimeRange] = useState(24);
  const [dateRange, setDateRange] = useState(null);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sensorAverages, setSensorAverages] = useState({});
  const [selectedSensors, setSelectedSensors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [chartData, setChartData] = useState({ data: [], averages: { rssi: 0, snr: 0, consumed_airtime: 0 } });

  const exportToCSV = async () => {
    try {
      setMessagesLoading(true);

      // Fetch fresh data before exporting
      const [start, end] = signalMetricsDateRange;
      if (!start || !end) {
        message.error('Vui lòng chọn khoảng thời gian');
        return;
      }

      const { data: freshMessages } = await messageApi.getMessagesByTimeRange(
        deviceId,
        signalMetricsType,
        start.valueOf(),
        end.valueOf()
      );

      if (!freshMessages || freshMessages.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      // Define CSV headers
      const headers = [
        'Thời gian',
        'Gateway ID',
        'RSSI (dBm)',
        'Channel RSSI (dBm)',
        'SNR (dB)',
        'Kênh',
        'Thời gian nhận',
        'Airtime (s)'
      ];

      // Convert messages to CSV rows with proper formatting
      const csvRows = freshMessages.map(msg => ({
        // Ensure proper CSV escaping for Excel
        time: `"${(msg.time || '').replace(/"/g, '""')}"`,
        gatewayId: `"${(msg.gateway_ids?.gateway_id || '').replace(/"/g, '""')}"`,
        rssi: msg.rssi ?? '',
        channelRssi: msg.channel_rssi ?? '',
        snr: msg.snr ?? '',
        channel: msg.channel_index ?? '',
        receivedAt: `"${(msg.received_at || '').replace(/"/g, '""')}"`
      }));

      // Create CSV content with proper Excel formatting
      const csvContent = [
        headers.join(';'),  // Use semicolon as delimiter for better Excel compatibility
        ...csvRows.map(row => Object.values(row).join(';'))
      ].join('\r\n');  // Use Windows line endings for Excel

      // Create download link with BOM for UTF-8
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      link.setAttribute('download', `signal_data_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Lỗi khi xuất dữ liệu');
      console.error('Export error:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const {
    thresholds = {}
  } = useSelector((state) => state.settings);
  const device = devices.find(device => device.deviceId === deviceId) || {};
  const dispatch = useDispatch();

  const fetchSignalMetrics = useCallback(async () => {
    if (!deviceId) return;

    setSignalMetricsLoading(true);
    try {
      const [start, end] = signalMetricsDateRange;
      if (!start || !end) {
        message.error('Vui lòng chọn khoảng thời gian');
        return;
      }

      const metrics = await messageApi.getSignalMetrics(
        deviceId,
        signalMetricsType,
        start.valueOf(),
        end.valueOf()
      );
      setSignalMetrics(metrics);
      message.success('Đã tải dữ liệu tín hiệu thành công');
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu tín hiệu');
      console.error('Error fetching signal metrics:', error);
    } finally {
      setSignalMetricsLoading(false);
    }
  }, [deviceId, signalMetricsDateRange, signalMetricsType]);

  const fetchMessages = useCallback(async (start, end, type) => {
    if (!deviceId) return [];

    try {
      const messages = await messageApi.getMessagesByTimeRange(
        deviceId,
        type || signalMetricsType,
        start.valueOf(),
        end.valueOf()
      );
      return Array.isArray(messages.data) ? messages.data : [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, [deviceId, signalMetricsType]);

  const showChartModal = async () => {
    const [start, end] = signalMetricsDateRange;
    if (!start || !end) {
      message.error('Vui lòng chọn khoảng thời gian');
      return;
    }

    setMessagesLoading(true);
    try {
      const chartMessages = await fetchMessages(start, end);

      if (chartMessages.length === 0) {
        message.warning('Không có dữ liệu để hiển thị biểu đồ');
        return;
      }
      console.log(chartMessages)
      // Process data for the chart
      const processedData = chartMessages.map(msg => ({
        time: new Date(msg.received_at).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        rssi: msg.rssi,
        channelRssi: msg.channel_rssi,
        snr: msg.snr,
        consumed_airtime: msg.consumed_airtime
      }));
      console.log(processedData)
      // Calculate averages
      const rssiAvg = processedData.reduce((sum, item) => sum + item.rssi, 0) / processedData.length;
      const snrAvg = processedData.reduce((sum, item) => sum + item.snr, 0) / processedData.length;
      const consumed_airtimeAvg = processedData.reduce((sum, item) => sum + item.consumed_airtime, 0) / processedData.length;

      setChartData({
        data: processedData,
        averages: {
          rssi: rssiAvg,
          snr: snrAvg,
          consumed_airtime: consumed_airtimeAvg
        }
      });
      setIsChartModalOpen(true);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu biểu đồ');
      console.error('Error loading chart data:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleCancelChartModal = () => {
    setIsChartModalOpen(false);
  };

  // Initialize device data when component mounts or device changes
  useEffect(() => {
    if (device) {
      if (device.sensors) {
        setSelectedSensors({ ...device.sensors });
      }
      if (device.functions) {
        setDeviceFunctions([...device.functions]);
      }
    }
  }, [device]);

  const handleTimeRangeApply = () => {
    fetchSensorsData();
    setIsTimeModalVisible(false);
  };

  const handleTimeRangeCancel = () => {
    setIsTimeModalVisible(false);
  };

  const handleOpenTimeModal = () => {
    setIsTimeModalVisible(true);
  };

  const fetchSensorsData = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);

      // Fetch sensor data
      let sensorResponse;
      if (useCustomDate && dateRange?.[0] && dateRange?.[1]) {
        // Convert to timestamps using dayjs
        const start = dayjs(dateRange[0]).valueOf();
        const end = dayjs(dateRange[1]).valueOf();
        sensorResponse = await sensorDataApi.getSensorData(deviceId, {
          startDate: start,
          endDate: end
        });
      } else {
        sensorResponse = await sensorDataApi.getSensorData(deviceId, timeRange);
      }

      if (sensorResponse?.success) {
        const { data: formattedData, averages } = formatSensorData(sensorResponse.data);
        setSensorData(formattedData);
        setSensorAverages(averages);
      } else {
        throw new Error(sensorResponse?.message || 'Failed to fetch sensor data');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [deviceId, timeRange, useCustomDate, dateRange]);

  // Handle refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSensorsData();
  };

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // Initial data fetch and refetch when time range changes
  useEffect(() => {
    fetchSensorsData();
  }, [fetchSensorsData]);

  // Handle sensor toggle
  const handleSensorToggle = (sensorName) => {
    const newSelectedSensors = { ...selectedSensors };
    if (newSelectedSensors.hasOwnProperty(sensorName)) {
      delete newSelectedSensors[sensorName];
    } else {
      const sensor = sensorOptions.find(s => s.name === sensorName);
      if (sensor) {
        newSelectedSensors[sensorName] = sensor.defaultThreshold || 50;
      }
    }
    setSelectedSensors(newSelectedSensors);
  };

  // Handle threshold change
  const handleThresholdChange = (sensorName, value) => {
    setSelectedSensors(prev => ({
      ...prev,
      [sensorName]: value
    }));
  };

  const hasSensorChanges = device?.sensors
    ? JSON.stringify(selectedSensors) !== JSON.stringify(device.sensors)
    : Object.keys(selectedSensors).length > 0;

  const hasFunctionChanges = device?.functions
    ? JSON.stringify(deviceFunctions) !== JSON.stringify(device.functions)
    : deviceFunctions.length > 0;

  // Save sensor configuration
  const handleSaveSensors = async () => {
    try {
      setIsSaving(true);
      // Create a new device object with the updated sensors
      const updatedDevice = {
        ...device,
        sensors: selectedSensors
      };

      const resultAction = await dispatch(updateDeviceById(updatedDevice));

      if (updateDeviceById.fulfilled.match(resultAction)) {
        message.success('Đã cập nhật cấu hình cảm biến thành công');
      } else {
        throw new Error(resultAction.payload || 'Failed to update device');
      }
    } catch (error) {
      console.error('Error saving sensor configuration:', error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  if (!device) {
    return (
      <Empty
        style={{ marginTop: 40 }}
        description={
          <span>
            Device not found
            <Button
              type="link"
              onClick={() => navigate(-1)}
              style={{ marginLeft: 8 }}
            >
              Go back
            </Button>
          </span>
        }
      />
    );
  }

  const deviceSettingsItems = [
    {
      key: '1',
      label: 'Cấu Hình Cảm Biến',
      children:
        (
          <SensorList
            sensorOptions={sensorOptions}
            categoryLabels={categoryLabels}
            selectedSensors={selectedSensors}
            onSensorToggle={handleSensorToggle}
            onThresholdChange={handleThresholdChange}
          />
        ),
    },
    {
      key: '2',
      label: 'Chức năng',
      children: (
        <DeviceFunctions
          functions={deviceFunctions}
          onChange={setDeviceFunctions}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>{device.name || 'Thiết bị'}</Title>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>ID: {device.deviceId}</div>
            {device.location && (
              <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                Vị trí: {typeof device.location === 'object'
                  ? `Lat: ${device.location.lat?.toFixed(6)}, Lng: ${device.location.lng?.toFixed(6)}`
                  : device.location}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: 'Tổng quan',
            children: (
              <div>
                {
                  device.deviceId == 'eui-70b3d17dd00653c8' && (
                    <DeviceFunction
                      deviceId={device.deviceId}
                      alertState={sensorData?.[sensorData?.length - 1]?.Alert_State}
                      ledState={sensorData?.[sensorData?.length - 1]?.LED_State}
                      doorState={sensorData?.[sensorData?.length - 1]?.Door_State}
                    />
                  )
                }
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<ClockCircleOutlined />}
                    onClick={handleOpenTimeModal}
                  >
                    {useCustomDate
                      ? dateRange?.[0] && dateRange?.[1]
                        ? `${dayjs(dateRange[0]).format('DD/MM/YYYY HH:mm')} - ${dayjs(dateRange[1]).format('DD/MM/YYYY HH:mm')}`
                        : 'Chọn khoảng thời gian'
                      : `Tự động (${timeRange} giờ)`
                    }
                  </Button>

                  <Modal
                    title="Chọn khoảng thời gian"
                    open={isTimeModalVisible}
                    onOk={handleTimeRangeApply}
                    onCancel={handleTimeRangeCancel}
                    width={600}
                    okText="Áp dụng"
                    cancelText="Hủy"
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Space>
                        <Text>Chế độ:</Text>
                        <Switch
                          checkedChildren="Tùy chỉnh"
                          unCheckedChildren="Tự động"
                          checked={useCustomDate}
                          onChange={checked => {
                            setUseCustomDate(checked);
                            if (!checked) {
                              setTimeRange(24);
                            }
                          }}
                        />
                      </Space>

                      {useCustomDate ? (
                        <RangePicker
                          value={dateRange}
                          showTime={{
                            format: 'HH:mm',
                            showNow: true
                          }}
                          format="DD/MM/YYYY HH:mm"
                          onChange={(val) => {
                            if (val && val[0] && val[1]) {
                              const start = dayjs(val[0]).startOf('minute');
                              const end = dayjs(val[1]).startOf('minute');
                              setDateRange([start, end]);
                            } else {
                              setDateRange([null, null]);
                            }
                          }}
                          style={{ width: '100%' }}
                          presets={[
                            {
                              label: 'Hôm nay',
                              value: [dayjs().startOf('day'), dayjs().endOf('day')]
                            },
                            {
                              label: 'Hôm qua',
                              value: [
                                dayjs().subtract(1, 'day').startOf('day'),
                                dayjs().subtract(1, 'day').endOf('day')
                              ]
                            },
                            {
                              label: '7 ngày gần đây',
                              value: [
                                dayjs().subtract(6, 'day').startOf('day'),
                                dayjs().endOf('day')
                              ]
                            },
                            {
                              label: '30 ngày gần đây',
                              value: [
                                dayjs().subtract(29, 'day').startOf('day'),
                                dayjs().endOf('day')
                              ]
                            }
                          ]}
                        />
                      ) : (
                        <Space>
                          <Text>Khoảng thời gian:</Text>
                          <Select
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            style={{ width: 150 }}
                            disabled={loading}
                          >
                            {TIME_RANGES.map(range => (
                              <Select.Option key={range.value} value={range.value}>
                                {range.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Space>
                      )}
                    </Space>
                  </Modal>

                  <Button
                    icon={<ReloadOutlined spin={isRefreshing} />}
                    onClick={handleRefresh}
                    loading={isRefreshing}
                    disabled={isRefreshing}
                  >
                    Làm mới
                  </Button>
                </Space>
                <Divider />
                <Row gutter={[24, 24]}>
                  {device?.sensors && Object.entries(device.sensors).map(([sensorKey, threshold]) => {
                    const config = chartConfigs[sensorKey];
                    if (!config) return null;
                    const sensorThreshold = thresholds[sensorKey] || threshold;
                    return (
                      <Col key={sensorKey} xs={24} md={12} lg={8}>
                        <ChartCard
                          title={config.title}
                          dataKey={config.dataKey}
                          color={config.color}
                          unit={config.unit}
                          domain={[0, sensorThreshold * 1.5]}
                          data={sensorData}
                          avgValue={sensorAverages[sensorKey]}
                          threshold={sensorThreshold}
                        >
                          <Line
                            type="monotone"
                            dataKey={config.dataKey}
                            name={config.title}
                            stroke={config.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            unit={config.unit}
                          />
                          {/* Threshold line */}
                          <Line
                            type="monotone"
                            dataKey={sensorThreshold}
                            name="Ngưỡng cảnh báo"
                            stroke="#faad14"
                            strokeDasharray="5 5"
                            dot={false}
                            strokeWidth={1}
                          />
                        </ChartCard>
                      </Col>
                    );
                  })}
                  {(!device?.sensors || Object.keys(device.sensors).length === 0) && (
                    <Col span={24}>
                      <Empty description="Không có cảm biến nào được cấu hình cho thiết bị này" />
                    </Col>
                  )}
                </Row>
              </div>
            )
          },
          {
            key: 'data',
            label: 'Dữ liệu thô',
            children: (
              <Card style={{ marginTop: 16, overflow: 'auto', minHeight: 0, minWidth: 0, height: '600px', textAlign: 'left' }}>
                <ReactJson src={sensorData} />
              </Card>
            )
          },
          {
            key: 'settings',
            label: 'Cài đặt',
            children: (
              <Card style={{ marginTop: 16, minHeight: 0, maxHeight: '100%', minWidth: 0, maxWidth: '100%' }}>
                <Collapse
                  items={deviceSettingsItems}
                  defaultActiveKey={['1']}
                />

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <Button onClick={() => {
                    setSelectedSensors({ ...device.sensors })
                    setDeviceFunctions([...device.functions])
                  }}>
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSaveSensors}
                    loading={isSaving}
                    disabled={!hasSensorChanges && !hasFunctionChanges}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </Card>
            )
          },
          {
            key: 'signal-metrics',
            label: 'Chất lượng tín hiệu',
            children: (
              <Card style={{ marginTop: 16, minHeight: 0, maxHeight: '100%', minWidth: 0, maxWidth: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space style={{ marginBottom: 16 }}>
                      <Select
                        value={signalMetricsType}
                        onChange={setSignalMetricsType}
                        style={{ width: 120 }}
                      >
                        <Option value="uplink">Uplink</Option>
                        <Option value="downlink">Downlink</Option>
                      </Select>
                      <RangePicker
                        value={signalMetricsDateRange}
                        showTime={{
                          format: 'HH:mm',
                          showNow: true
                        }}
                        format="DD/MM/YYYY HH:mm"
                        onChange={(val) => {
                          if (val && val[0] && val[1]) {
                            const start = dayjs(val[0]).startOf('minute');
                            const end = dayjs(val[1]).startOf('minute');
                            setSignalMetricsDateRange([start, end]);
                          } else {
                            setSignalMetricsDateRange([null, null]);
                          }
                        }}
                        style={{ width: '100%' }}
                        presets={[
                          {
                            label: 'Hôm nay',
                            value: [dayjs().startOf('day'), dayjs().endOf('day')]
                          },
                          {
                            label: 'Hôm qua',
                            value: [
                              dayjs().subtract(1, 'day').startOf('day'),
                              dayjs().subtract(1, 'day').endOf('day')
                            ]
                          },
                          {
                            label: '7 ngày gần đây',
                            value: [
                              dayjs().subtract(6, 'day').startOf('day'),
                              dayjs().endOf('day')
                            ]
                          },
                          {
                            label: '30 ngày gần đây',
                            value: [
                              dayjs().subtract(29, 'day').startOf('day'),
                              dayjs().endOf('day')
                            ]
                          }
                        ]}
                      />
                      <Button
                        type="primary"
                        onClick={fetchSignalMetrics}
                        loading={signalMetricsLoading}
                        icon={<ReloadOutlined />}
                      >
                        Tải lại
                      </Button>
                      <Button
                        type="primary"
                        onClick={exportToCSV}
                        icon={<DownloadOutlined />}
                        loading={messagesLoading}
                        disabled={messagesLoading}
                        style={{ marginRight: 8 }}
                      >
                        Xuất CSV
                      </Button>
                      <Button
                        type="primary"
                        onClick={showChartModal}
                        icon={<AreaChartOutlined />}
                        loading={messagesLoading}
                        disabled={messagesLoading}
                      >
                        Xem biểu đồ
                      </Button>
                    </Space>
                  </Col>
                  <Col span={24}>
                    {signalMetricsLoading ? (
                      <Spin size="large" />
                    ) : signalMetrics ? (
                      <Row gutter={[16, 16]}>
                        {Object.entries(signalMetrics.metrics).map(([key, value]) => (
                          key != "count" && <Col key={key} xs={24} sm={12} md={8}>
                            <Card title={
                              <Space>
                                {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                                <Tooltip
                                  title={
                                    key === 'rssi' ? tooltipContents.rssi :
                                      key === 'snr' ? tooltipContents.snr :
                                        key === 'packetErrorRate' ? tooltipContents.packetErrorRate :
                                          key === 'airtime' ? tooltipContents.airtime :
                                            key === 'correlationIds' ? tooltipContents.correlationIds :
                                              key === 'retryAttempts' ? tooltipContents.retryAttempts :
                                                key === 'confirmed' ? tooltipContents.confirmed :
                                                  'Thông tin chỉ số'
                                  }
                                >
                                  <QuestionCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                                </Tooltip>
                              </Space>
                            }>
                              <Statistic
                                title={key === 'packetErrorRate' ? 'Tỷ lệ lỗi' : "Trung bình"}
                                value={key === 'packetErrorRate' ? value.average * 100 : value.average}
                                precision={2}
                                suffix={key === 'rssi' ? ' dBm'
                                  : key === 'snr' ? ' dB'
                                    : key === 'packetErrorRate' ? ' %'
                                      : key === 'airtime' ? ' s'
                                        : key === 'correlationIds' ? ' lần'
                                          : key === 'retryAttempts' ? ' lần'
                                            : key === 'confirmed' ? '%'
                                              : ''}
                              />
                              <Statistic
                                title="Số lượng"
                                value={value.values?.length}
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description="Chưa có dữ liệu tín hiệu" />
                    )}
                  </Col>
                </Row>
              </Card>
            )
          }
        ]}
      />

      <Modal
        title="Biểu đồ tín hiệu"
        open={isChartModalOpen}
        onCancel={handleCancelChartModal}
        width={1000}
        footer={[
          <Button key="close" onClick={handleCancelChartModal}>
            Đóng
          </Button>
        ]}
      >
        <div style={{ height: 500 }}>
          <Tabs defaultActiveKey="rssi">
            <TabPane tab="RSSI" key="rssi">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" style={{ fontSize: 10 }} />
                  <YAxis label={{ value: 'dBm', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rssi" name="RSSI" fill="#1890ff" />
                </BarChart>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Text strong>Trung bình: {chartData.averages?.rssi?.toFixed(2)} dBm</Text>
                </div>
              </ResponsiveContainer>
            </TabPane>
            <TabPane tab="SNR" key="snr">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" style={{ fontSize: 10 }} />
                  <YAxis label={{ value: 'dB', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="snr" name="SNR" fill="#722ed1" />
                </BarChart>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Text strong>Trung bình: {chartData.averages?.snr?.toFixed(2)} dB</Text>
                </div>
              </ResponsiveContainer>
            </TabPane>

            <TabPane tab="Airtime" key="consumed_airtime">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" style={{ fontSize: 10 }} />
                  <YAxis label={{ value: 's', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumed_airtime" name="Airtime" fill="#d1752e" />
                </BarChart>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Text strong>Trung bình: {chartData.averages?.consumed_airtime?.toFixed(4)} s</Text>
                </div>
              </ResponsiveContainer>
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    </div>
  );
};

export default DeviceDetail;
