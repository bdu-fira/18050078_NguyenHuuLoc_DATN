import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsApi } from '../../services/api';

// Fetch all settings
export const fetchAllSettings = createAsyncThunk(
  'settings/fetchAll',
  async () => {
    const response = await settingsApi.getAllSettings();
    return response;
  }
);

// Get setting by ID or type
export const fetchSetting = createAsyncThunk(
  'settings/fetchOne',
  async (id) => {
    const response = await settingsApi.getSetting(id);
    return response;
  }
);

// Create or update a setting
export const upsertSetting = createAsyncThunk(
  'settings/upsert',
  async ({ type, data }) => {
    const response = await settingsApi.upsertSetting(type, data);
    return response;
  }
);

// Delete a setting
export const deleteSetting = createAsyncThunk(
  'settings/delete',
  async (id) => {
    await settingsApi.deleteSetting(id);
    return id; // Return the deleted setting's ID
  }
);

// For backward compatibility
export const fetchPrompt = createAsyncThunk(
  'settings/fetchPrompt',
  async () => {
    const response = await settingsApi.getPrompt();
    return response.data;
  }
);

export const updatePrompt = createAsyncThunk(
  'settings/updatePrompt',
  async ({ systemPrompt, userPrompt }) => {
    const response = await settingsApi.updatePrompt({ systemPrompt, userPrompt });
    return response.data;
  }
);

export const fetchThresholds = createAsyncThunk(
  'settings/fetchThresholds',
  async () => {
    const response = await settingsApi.getThresholds();
    return response.data;
  }
);

export const updateThresholds = createAsyncThunk(
  'settings/updateThresholds',
  async (thresholds) => {
    const response = await settingsApi.updateThresholds(thresholds);
    return response.data;
  }
);



const initialState = {
  // All settings in an array
  settings: [],
  
  // Settings organized by type for quick access
  settingsByType: {},
  
  // Current setting being viewed/edited
  currentSetting: null,
  loading: false,
  error: null,
  operation: null, // 'fetching', 'saving', 'deleting'
  
  // Default values for settings
  prompt: {
    system: '', 
    user: '' 
  },
  thresholds: {
    // Environment sensors
    temperature: 30,      // °C
    humidity: 70,         // %
    
    // Air quality sensors
    co2: 1000,           // ppm
    pm25: 35,            // µg/m³
    pm10: 50,            // µg/m³
    voc: 500,            // ppb
    o3: 70,              // ppb
    no2: 100,            // ppb
    so2: 75,             // ppb
    aqi: 100,            // AQI
    
    // Other sensors
    pressure: 1013,      // hPa
    noise: 70,           // dB
    light: 1000,         // lux
    uv: 8,               // UV index
    battery: 20          // %
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearCurrentSetting: (state) => {
      state.currentSetting = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Update specific setting in settingsByType
    updateSetting: (state, action) => {
      const { type, data } = action.payload;
      
      // Find and update the setting in the settings array
      const settingIndex = state.settings.findIndex(s => s.type === type);
      if (settingIndex >= 0) {
        // Update existing setting
        state.settings[settingIndex] = {
          ...state.settings[settingIndex],
          data: { ...data }
        };
      } else {
        // Add new setting
        state.settings.push({
          type,
          data: { ...data }
        });
      }
      
      // Update settingsByType
      state.settingsByType[type] = { ...data };
      
      // Update individual state for prompt and thresholds
      if (type === 'prompt') {
        state.prompt = { ...data };
      } else if (type === 'threshold') {
        state.thresholds = { ...data };
      }
    },
    resetSettingsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch all settings
    builder
      .addCase(fetchAllSettings.pending, (state) => {
        state.loading = true;
        state.operation = 'fetching';
        state.error = null;
      })
      .addCase(fetchAllSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.settings = action.payload;
        
        // Reset settingsByType
        state.settingsByType = {};
        
        // Process each setting
        action.payload.forEach(setting => {
          state.settingsByType[setting.type] = { ...setting.data };
          
          // Update individual state for prompt and thresholds
          if (setting.type === 'prompt') {
            state.prompt = { ...setting.data };
          } else if (setting.type === 'threshold') {
            state.thresholds = { ...setting.data };
          }
        });
      })
      .addCase(fetchAllSettings.rejected, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.error = action.error.message || 'Failed to fetch settings';
      });

    // Fetch single setting
    builder
      .addCase(fetchSetting.pending, (state) => {
        state.loading = true;
        state.operation = 'fetching';
        state.error = null;
      })
      .addCase(fetchSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.currentSetting = action.payload;
      })
      .addCase(fetchSetting.rejected, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.error = action.error.message;
      });

    // Upsert setting
    builder
      .addCase(upsertSetting.pending, (state) => {
        state.loading = true;
        state.operation = 'saving';
        state.error = null;
      })
      .addCase(upsertSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.operation = null;
        const { type, data } = action.payload;
        
        // Update the setting in the state
        state.settingsByType[type] = data;
        
        // Update prompt or thresholds if this is one of them
        if (type === 'prompt') {
          state.prompt = { ...data };
        } else if (type === 'threshold') {
          state.thresholds = { ...data };
        }
      })
      .addCase(upsertSetting.rejected, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.error = action.error.message || 'Failed to save setting';
      });

    // Delete setting
    builder
      .addCase(deleteSetting.pending, (state) => {
        state.loading = true;
        state.operation = 'deleting';
        state.error = null;
      })
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.settings = state.settings.filter(s => s.type !== action.payload);
        
        // Clear current setting if it's the one being deleted
        if (state.currentSetting?._id === action.payload) {
          state.currentSetting = null;
        }
      })
      .addCase(deleteSetting.rejected, (state, action) => {
        state.loading = false;
        state.operation = null;
        state.error = action.error.message;
      });
      
    // Backward compatibility - Prompt
    builder
      .addCase(fetchPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompt = {
          system: action.payload.systemPrompt || '',
          user: action.payload.userPrompt || ''
        };
      })
      .addCase(fetchPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompt = {
          system: action.payload.systemPrompt || '',
          user: action.payload.userPrompt || ''
        };
      })
      .addCase(updatePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      
    // Backward compatibility - Thresholds
    builder
      .addCase(fetchThresholds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThresholds.fulfilled, (state, action) => {
        state.loading = false;
        state.thresholds = { ...state.thresholds, ...action.payload };
      })
      .addCase(fetchThresholds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateThresholds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateThresholds.fulfilled, (state, action) => {
        state.loading = false;
        state.thresholds = { ...state.thresholds, ...action.payload };
      })
      .addCase(updateThresholds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

// Export actions
export const { 
  clearCurrentSetting, 
  clearError, 
  resetSettingsState,
  updateSetting 
} = settingsSlice.actions;

export default settingsSlice.reducer;
