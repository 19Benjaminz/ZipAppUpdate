import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/authSlice'; // Ensure this path is correct
import userInfoReducer from "../features/userInfoSlice";
import zipporaReducer from "../features/zipporaInfoSlice"
import apartmentReducer from "../features/apartmentSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        userInfo: userInfoReducer,
        zipporaInfo: zipporaReducer,
        apartment: apartmentReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
