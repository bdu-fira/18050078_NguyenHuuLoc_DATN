import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsApi } from '../services/api';

export const fetchPrompt = createAsyncThunk(
  'settings/fetchPrompt',
  async () => {
    const response = await settingsApi.getPrompt();
    console.log(response)
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
  prompt: {
    system: '',
    user: ''
  },
  thresholds: {},
  loading: false,
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
      })
      .addCase(fetchThresholds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThresholds.fulfilled, (state, action) => {
        state.loading = false;
        state.thresholds = action.payload || {};
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
        state.thresholds = action.payload || {};
      })
      .addCase(updateThresholds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default settingsSlice.reducer;
