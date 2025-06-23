import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from '../features/device/deviceSlice';

export const store = configureStore({
  reducer: {
    device: deviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
