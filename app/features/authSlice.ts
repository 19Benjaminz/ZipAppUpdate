import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../config/apiService'; // Adjust the import path based on your project structure

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

// export const login = createAsyncThunk(
//     'auth/login',
//     async (credentials: { email?: string; phoneNum?: string; password: string }, thunkAPI) => {
//         try {
//             console.log("********WAITING***************")
//             const response = await authApi.login(credentials);
//             return response.data;
//         } catch (error: any) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
//         }
//     }
// );

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email?: string; phoneNum?: string; password: string }, thunkAPI) => {
        try {
            const response = await authApi.login(credentials);
            const { ret, data, msg } = response.data;

            if (ret === 0) {
                // Successful login
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
            console.log(ret)
            console.log(data)
            console.log(msg)

            if (ret === 0) {
                // Successful register
                return response.data;
            } else {
                // Reject with the error message from the API
                return thunkAPI.rejectWithValue(msg || 'Register failed');
            }
        } catch (error: any) {
            // Handle other unexpected errors
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
        }
    }
);

export const sendVcode = createAsyncThunk(
    'auth/sendVcode',
    async (email: string, { rejectWithValue }) => {
      try {
        const response = await authApi.sendVcode(email, '');
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
                console.log("Login Success")
                console.log(action.payload)
                state.loading = false;
                state.user = action.payload;
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
                console.log(action.payload)
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

console.log('Exported authSlice.reducer:', authSlice.reducer);
export default authSlice.reducer;

