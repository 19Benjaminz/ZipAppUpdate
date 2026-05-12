import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import apartmentReducer from '@/app/features/apartmentSlice';
import authReducer from '@/app/features/authSlice';
import userInfoReducer from '@/app/features/userInfoSlice';
import walletReducer from '@/app/features/walletSlice';
import zipporaReducer from '@/app/features/zipporaInfoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userInfo: userInfoReducer,
    zipporaInfo: zipporaReducer,
    apartment: apartmentReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;