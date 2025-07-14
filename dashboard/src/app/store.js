import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from '../features/device/deviceSlice';
import settingsReducer from '../features/setting/settingsSlice';

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
