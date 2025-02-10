import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../config/apiService'; // Adjust the import path based on your project structure
import * as SecureStore from 'expo-secure-store';

export interface AuthState {
    loading: boolean;
    error: string | null;
    user: any | null;
}

const initialState: AuthState = {
    loading: false,
    error: null,
    user: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email?: string; phoneNum?: string; userid?: string; password: string; deviceId?: string }, thunkAPI) => {
        try {
            const response = await authApi.login(credentials);
            const { ret, data, msg } = response.data;

            if (ret === 0) {
                // Successful login
                const value = await SecureStore.getItemAsync("password");
                if (!value) {
                    SecureStore.setItemAsync("password", credentials.password);
                }
                return data;
            } else {
                // Reject with the error message from the API
                return thunkAPI.rejectWithValue(msg || 'Login failed');
            }
        } catch (error: any) {
            // Handle other unexpected errors
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (credentials: { firstName: string, lastName: string, email: string; phone: string; psd1: string, psd2: string, vcode: string }, thunkAPI) => {
        try {
            const response = await authApi.register(credentials);
            const { ret, data, msg } = response.data;

            if (ret === 0) {
                // Successful register
                SecureStore.setItemAsync("password", credentials.psd1);
                return response.data;
            } else {
                // Reject with the error message from the API
                return response.data.ret;
            }
        } catch (error: any) {
            // Handle other unexpected errors
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
        }
    }
);

export const sendRegisterVcode = createAsyncThunk(
    'auth/sendVcode',
    async (email: string, { rejectWithValue }) => {
      try {
        const response = await authApi.sendRegisterVcode(email, '');
        const { ret, data, msg } = response.data;
  
        if (ret === 0) {
          return data; // Return the data if successful
        } else {
          return rejectWithValue(msg || "Failed to send verification code");
        }
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Unexpected error occurred");
      }
    }
);

export const sendForgotPasswordVcode = createAsyncThunk(
    'auth/sendForgotPasswordVcode',
    async (email: string, { rejectWithValue }) => {
      try {
        const response = await authApi.sendForgotPasswordVcode(email);
        const { ret, data, msg } = response.data;
  
        if (ret === 0) {
          return data; // Return the data if successful
        } else {
          return rejectWithValue(msg || "Failed to send verification code");
        }
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Unexpected error occurred");
      }
    }
);

export const resetPassword = createAsyncThunk (
    'auth/modifyPassword',
    async (credentials: { memberId: string, psd1: string; psd2: string; vcode: string }, thunkAPI) => {
        try {
            const response = await authApi.resetPassword(credentials);
            const { ret, data, msg } = response.data;

            if (ret === 0) {
                // Successful register
                return response.data;
            } else {
                // Reject with the error message from the API
                return thunkAPI.rejectWithValue(msg || 'Reset Password failed');
            }
        } catch (error: any) {
            // Handle other unexpected errors
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
        }
    }
  )

  export const logout = createAsyncThunk (
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            const state: any = thunkAPI.getState();
            const { accessToken, memberId } = state.userInfo;
            const response = await authApi.logout(accessToken, memberId);
            const { ret, msg } = response.data;

            if (ret === 0) {
                // Successful register
                const storedAccessToken = await SecureStore.getItemAsync('accessToken');
                return response.data;
            } else {
                // Reject with the error message from the API
                return thunkAPI.rejectWithValue(msg || 'Reset Password failed');
            }
        } catch (error: any) {
            // Handle other unexpected errors
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
        }
    }
  )


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                SecureStore.setItemAsync("accessToken", action.payload.accessToken);
                SecureStore.setItemAsync("memberId", action.payload.memberId);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                console.log("Register Success")
                state.loading = false;
                state.user = action.payload;
                SecureStore.setItemAsync("accessToken", action.payload.accessToken);
                SecureStore.setItemAsync("memberId", action.payload.memberId);
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.loading = false;
                SecureStore.deleteItemAsync("accessToken");
                SecureStore.deleteItemAsync("memberId");
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});
export default authSlice.reducer;

