import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deviceApi } from '../../services/api';

// Async thunks
export const fetchDevices = createAsyncThunk(
  'devices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deviceApi.getAllDevices();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch devices');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewDevice = createAsyncThunk(
  'devices/addNew',
  async (deviceData, { rejectWithValue }) => {
    try {
      const response = await deviceApi.createDevice(deviceData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to add device');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDeviceById = createAsyncThunk(
  'devices/update',
  async ({ deviceId, ...deviceData }, { rejectWithValue }) => {
    try {
      const response = await deviceApi.updateDevice(deviceId, deviceData);
      if (response.success) {
        return { ...response.data, deviceId }; // Include deviceId in the returned data
      }
      return rejectWithValue(response.message || 'Failed to update device');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDeviceById = createAsyncThunk(
  'devices/delete',
  async (deviceId, { rejectWithValue }) => {
    try {
      const response = await deviceApi.deleteDevice(deviceId);
      if (response.success) {
        return deviceId;
      }
      return rejectWithValue(response.message || 'Failed to delete device');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  devices: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentDevice: null,
};

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setCurrentDevice: (state, action) => {
      state.currentDevice = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch devices
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add new device
      .addCase(addNewDevice.fulfilled, (state, action) => {
        state.devices.push(action.payload);
      })
      .addCase(addNewDevice.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update device
      .addCase(updateDeviceById.fulfilled, (state, action) => {
        const index = state.devices.findIndex(device => device._id === action.payload._id);
        if (index !== -1) {
          state.devices[index] = action.payload;
        }
      })
      .addCase(updateDeviceById.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete device
      .addCase(deleteDeviceById.fulfilled, (state, action) => {
        state.devices = state.devices.filter(device => device._id !== action.payload);
      })
      .addCase(deleteDeviceById.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setCurrentDevice, clearError } = deviceSlice.actions;

export const selectAllDevices = (state) => state.device.devices;
export const getDeviceStatus = (state) => state.device.status;
export const getDeviceError = (state) => state.device.error;
export const getCurrentDevice = (state) => state.device.currentDevice;

export default deviceSlice.reducer;
