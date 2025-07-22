import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { zipporaApi } from '../config/apiService';

interface BoxPenalty {
  amount: string;
  pay_online: string;
  grace_day: number;
  box_model_name: string;
}

interface Store {
  storeId: string;
  pickCode: string;
  storeTime: string;
  courierCompanyName?: string;
}

interface Zippora {
  cabinetId: string;
  latitude: string;
  longitude: string;
  address: string;
  addressUrl: string;
  storeCount: number;
  storeList: Store[];
}

interface Apartment {
  memberId: string;
  apartmentId: string;
  apartmentName: string;
  unitName: string;
  chargeDay: string;
  boxPenalty: Record<string, BoxPenalty> | null;
  approveStatus: string;
  zipporaCount: number;
  zipporaList: Zippora[];
}

interface SelfStore {
  address: string;
  cabinetId: string;
  courierCompanyName: string;
  pickCode: string;
  storeId: string;
  storeTime: string;
}

interface ZipporaLog {
  storeId: string;
  courierCompanyName: string;
  pickCode: string;
  storeTime: string;
  pickupTime: string;
  cabinetId: string;
}

interface ZipporaState {
  apartmentList: Apartment[];
  selfStoreList: SelfStore[];
  zipporaLog: ZipporaLog[];
  loading: boolean;
  error: string | null;
}

const initialState: ZipporaState = {
  apartmentList: [],
  selfStoreList: [],
  zipporaLog:[],
  loading: false,
  error: null,
};

export const fetchUserApartments = createAsyncThunk(
  'zippora/fetchUserApartments',
  async (_, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const { accessToken, memberId } = state.userInfo;

    try {
      const response = await zipporaApi.getZipporaList({ accessToken, memberId });
      const { ret, data, msg } = response;

      if (ret === 0) {
        return {
          apartmentList: data.apartmentList,
          selfStoreList: data.StoreList,
        };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch apartments');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
    }
  }
);

export const fetchZipporaLogs = createAsyncThunk(
  'zippora/fetchZipporaLogs',
  async (_, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const { accessToken, memberId } = state.userInfo;
    try {
      const response = await zipporaApi.getZipporaLogs({ accessToken, memberId });
      const { ret, data, msg } = response;

      if (ret === 0) {
        return {
          zipporaLogs: data.storeList,
        };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch apartments');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
    }
  }
);

export const scanQRCode = createAsyncThunk(
  'zippora/scanQRCode',
  async (text: string, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const { accessToken, memberId } = state.userInfo;
    try {
      const response = await zipporaApi.qrCodeScan({ accessToken, memberId, text });
      const { ret, data, msg } = response;

      if (ret === 0) {
        return ret;
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch apartments');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred');
    }
  }
);

const zipporaInfoSlice = createSlice({
  name: 'zipporaInfo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserApartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserApartments.fulfilled,
        (state, action: PayloadAction<{ apartmentList: Apartment[]; selfStoreList: SelfStore[] }>) => {
          state.loading = false;
          state.apartmentList = action.payload.apartmentList || [];
          state.selfStoreList = action.payload.selfStoreList || []; // Handle empty or missing selfStoreList
        }
      )      
      .addCase(fetchUserApartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });

      builder
      .addCase(fetchZipporaLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchZipporaLogs.fulfilled,
        (state, action: PayloadAction<{ zipporaLogs: ZipporaLog[] }>) => {
          state.loading = false;
          state.zipporaLog = action.payload.zipporaLogs || []; // Handle empty or missing selfStoreList
          console.log('GETCHING LOGS SUCCESS')
        }
      )      
      .addCase(fetchZipporaLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export default zipporaInfoSlice.reducer;
