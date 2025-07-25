import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
export const messageApi = {
  // Get signal metrics for device
  getSignalMetrics: async (deviceId, type, startDate, endDate) => {
    try {
      const response = await api.get('/message/signal-metrics', {
        params: {
          deviceId,
          type,
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching signal metrics:', error);
      throw error;
    }
  }
};

export const sensorDataApi = {
  // Get sensor data by device ID and time range or date range
  getSensorData: async (deviceId, params = {}) => {
    try {
      // Handle both object params and legacy hours parameter
      const queryParams = { deviceId };
      
      if (typeof params === 'number') {
        // Legacy format: (deviceId, hours)
        queryParams.hours = params;
      } else if (params && typeof params === 'object') {
        // New format with date range
        if (params.startDate && params.endDate) {
          // Use the timestamps directly as they're already in milliseconds
          queryParams.startDate = params.startDate;
          queryParams.endDate = params.endDate;
        } else if (params.hours) {
          queryParams.hours = params.hours;
        }
      }
      
      const response = await api.get('/sensor-data', { 
        params: queryParams,
        paramsSerializer: {
          indexes: null // Prevent array bracket notation in query params
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching sensor data for device ${deviceId}:`, error);
      throw error;
    }
  },
};

// Chat APIs
export const chatApi = {
  // Send a chat message
  sendMessage: async (userId, message) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        userId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },
  // Get chat history
  getChatHistory: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },
  // Clear chat history for a user
  clearChatHistory: async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/chat/clear`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
};

export const settingsApi = {
  // Get all settings
  getAllSettings: async () => {
    try {
      const response = await api.get('/v1/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting all settings:', error);
      throw error;
    }
  },
  
  // Get setting by id or type
  getSetting: async (id) => {
    try {
      const response = await api.get(`/v1/settings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting setting ${id}:`, error);
      throw error;
    }
  },
  
  // Create or update a setting
  upsertSetting: async (type, data) => {
    try {
      const response = await api.post('/v1/settings', { type, data });
      return response.data;
    } catch (error) {
      console.error('Error upserting setting:', error);
      throw error;
    }
  },
  
  // Delete a setting
  deleteSetting: async (id) => {
    try {
      const response = await api.delete(`/v1/settings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting setting ${id}:`, error);
      throw error;
    }
  },
  
  // Helper methods for prompt and thresholds for backward compatibility
  getPrompt: async () => {
    try {
      const response = await api.get('/v1/settings/prompt');
      return { data: response.data };
    } catch (error) {
      // If not found, return default values
      if (error.response?.status === 404) {
        return { data: { systemPrompt: '', userPrompt: '' } };
      }
      console.error('Error getting prompt:', error);
      throw error;
    }
  },
  
  updatePrompt: async ({ systemPrompt, userPrompt }) => {
    try {
      const response = await api.upsertSetting('prompt', { systemPrompt, userPrompt });
      return { data: response };
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  },
  
  getThresholds: async () => {
    try {
      const response = await api.get('/v1/settings/threshold');
      return { data: response.data };
    } catch (error) {
      // If not found, return default values
      if (error.response?.status === 404) {
        return { data: DEFAULT_THRESHOLDS };
      }
      console.error('Error getting thresholds:', error);
      throw error;
    }
  },
  
  updateThresholds: async (thresholds) => {
    try {
      const response = await api.upsertSetting('threshold', thresholds);
      return { data: response };
    } catch (error) {
      console.error('Error updating thresholds:', error);
      throw error;
    }
  }
};

export const ttnApi = {
  appId: "huuloc-datotnghiep-0",
  sendDownlink: async (deviceId, cmd, confirmed = true) => {
    try {
      const response = await api.post('/ttn', { deviceId, cmd, appId: ttnApi.appId, confirmed });
      return response.data;
    } catch (error) {
      console.error('Error sending downlink:', error);
      throw error;
    }
  },
};
