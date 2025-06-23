import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  },
  withCredentials: true
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Device APIs
export const deviceApi = {
  // Get all devices
  getAllDevices: async () => {
    try {
      const response = await api.get('/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  },

  // Get single device by ID
  getDeviceById: async (deviceId) => {
    try {
      const response = await api.get('/devices', { params: { deviceId } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching device ${deviceId}:`, error);
      throw error;
    }
  },

  // Create new device
  createDevice: async (deviceData) => {
    try {
      const response = await api.post('/devices', deviceData);
      return response.data;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  },

  // Update device
  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.put('/devices', deviceData, {
        params: { deviceId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating device ${deviceId}:`, error);
      throw error;
    }
  },

  // Delete device
  deleteDevice: async (deviceId) => {
    try {
      const response = await api.delete('/devices', { 
        params: { deviceId },
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting device ${deviceId}:`, error);
      throw error;
    }
  },
};

// Sensor Data APIs
export const sensorDataApi = {
  // Get sensor data by device ID and time range
  getSensorData: async (deviceId, hours = 24) => {
    try {
      const response = await api.get('/sensor-data', {
        params: { deviceId, hours }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sensor data for device ${deviceId}:`, error);
      throw error;
    }
  },
};

export default api;
