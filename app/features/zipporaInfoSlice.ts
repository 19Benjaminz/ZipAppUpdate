import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { zipporaApi } from '@/config/apiService';

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

export interface PenaltyPackage {
  storeId: string;
  boxModelId?: string;
  storeTime?: number;
  overdueDays: number;
  penaltyAmount: number;
  isPenaltyPaid: boolean;
  paidAmount?: number;
  paidTime?: number;
}

interface PenaltyValidationResult {
  allowPickup: boolean;
  totalPenalty: number;
  packages: PenaltyPackage[];
}

interface PenaltyPaymentResult {
  paidAmount: number;
  remainingBalance: number;
  paidPackages: Array<{
    storeId: string;
    paidAmount: number;
    overdueDays: number;
  }>;
}

interface ZipporaState {
  apartmentList: Apartment[];
  selfStoreList: SelfStore[];
  zipporaLog: ZipporaLog[];
  penaltyValidation: PenaltyValidationResult | null;
  penaltyByStore: Record<string, PenaltyPackage>;
  penaltyLoading: boolean;
  penaltyError: string | null;
  payingPenaltyStoreId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ZipporaState = {
  apartmentList: [],
  selfStoreList: [],
  zipporaLog:[],
  penaltyValidation: null,
  penaltyByStore: {},
  penaltyLoading: false,
  penaltyError: null,
  payingPenaltyStoreId: null,
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

export const validatePickupChargeRule = createAsyncThunk(
  'zippora/validatePickupChargeRule',
  async (payload: { storeId?: string } | undefined, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const { accessToken, memberId } = state.userInfo;

    try {
      const response = await zipporaApi.validatePickupChargeRule({
        accessToken,
        memberId,
        targetMemberId: memberId,
        storeId: payload?.storeId,
      });

      if (__DEV__) {
        console.log('[Penalty][RAW full response]', JSON.stringify(response));
      }

      const { ret, data, msg } = response;

      if (__DEV__) {
        const packages = data?.packages || [];
        console.log('[Penalty][validatePickupChargeRule] response', {
          memberId,
          storeId: payload?.storeId,
          ret,
          msg,
          allowPickup: data?.allowPickup,
          totalPenalty: data?.totalPenalty,
          packageCount: packages.length,
          packages: packages.map((item: any) => ({
            storeId: String(item.storeId),
            overdueDays: item.overdueDays,
            penaltyAmount: item.penaltyAmount,
            isPenaltyPaid: item.isPenaltyPaid,
            paidAmount: item.paidAmount,
          })),
        });
      }

      if (ret === 0 || ret === 1) {
        return {
          allowPickup: data?.allowPickup ?? true,
          totalPenalty: Number(data?.totalPenalty || 0),
          packages: (data?.packages || []).map((item: any) => ({
            storeId: String(item.storeId),
            boxModelId: item.boxModelId,
            storeTime: item.storeTime,
            overdueDays: Number(item.overdueDays || 0),
            penaltyAmount: Number(item.penaltyAmount || 0),
            isPenaltyPaid: item.isPenaltyPaid === true || item.isPenaltyPaid === 1 || item.isPenaltyPaid === '1' || item.isPenaltyPaid === 'true',
            paidAmount: Number(item.paidAmount || 0),
            paidTime: Number(item.paidTime || 0),
          })),
          message: msg,
        };
      }

      return thunkAPI.rejectWithValue(msg || 'Failed to validate pickup penalty rules');
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Unexpected error occurred');
    }
  }
);

export const payPickupPenalty = createAsyncThunk(
  'zippora/payPickupPenalty',
  async (payload: { storeId?: string } | undefined, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const { accessToken, memberId } = state.userInfo;

    if (__DEV__) {
      console.log('[Penalty][payPickupPenalty] calling with:', {
        accessToken,
        memberId,
        targetMemberId: memberId,
        storeId: payload?.storeId,
      });
    }

    try {
      const response = await zipporaApi.payPickupPenalty({
        accessToken,
        memberId,
        targetMemberId: memberId,
        storeId: payload?.storeId,
      });

      if (__DEV__) {
        console.log('[Penalty][payPickupPenalty] raw response:', JSON.stringify(response));
      }

      const { ret, data, msg } = response;

      if (ret === 0) {
        return {
          paidAmount: Number(data?.paidAmount || 0),
          remainingBalance: Number(data?.remainingBalance || 0),
          paidPackages: (data?.paidPackages || []).map((pkg: any) => ({
            storeId: String(pkg.storeId),
            paidAmount: Number(pkg.paidAmount || 0),
            overdueDays: Number(pkg.overdueDays || 0),
          })),
        } as PenaltyPaymentResult;
      }

      if (ret === 2) {
        return thunkAPI.rejectWithValue({
          code: 2,
          message: msg || 'Insufficient wallet balance',
          requiredAmount: Number(data?.requiredAmount || 0),
          currentBalance: Number(data?.currentBalance || 0),
        });
      }

      return thunkAPI.rejectWithValue({
        code: ret,
        message: msg || 'Failed to pay pickup penalty',
      });
    } catch (error: any) {
      if (__DEV__) {
        console.log('[Penalty][payPickupPenalty] error caught:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }
      return thunkAPI.rejectWithValue({
        code: -1,
        message: error.response?.data?.msg || error.response?.data?.message || error.message || 'Unexpected error occurred',
      });
    }
  }
);

const zipporaInfoSlice = createSlice({
  name: 'zipporaInfo',
  initialState,
  reducers: {
    clearPenaltyError: (state) => {
      state.penaltyError = null;
    },
    mergePenaltyPackages: (state, action: PayloadAction<PenaltyPackage[]>) => {
      // Merge individually-fetched per-storeId penalty amounts into existing map
      action.payload.forEach((pkg) => {
        const key = String(pkg.storeId);
        if (state.penaltyByStore[key]) {
          state.penaltyByStore[key] = { ...state.penaltyByStore[key], ...pkg };
        } else {
          state.penaltyByStore[key] = pkg;
        }
      });
      // Recalculate totalPenalty in penaltyValidation
      if (state.penaltyValidation) {
        state.penaltyValidation.totalPenalty = Object.values(state.penaltyByStore)
          .filter((p) => !p.isPenaltyPaid)
          .reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);
        state.penaltyValidation.packages = Object.values(state.penaltyByStore);
      }
    },
  },
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

      builder
      .addCase(validatePickupChargeRule.pending, (state) => {
        state.penaltyLoading = true;
        state.penaltyError = null;
      })
      .addCase(
        validatePickupChargeRule.fulfilled,
        (state, action: PayloadAction<{ allowPickup: boolean; totalPenalty: number; packages: PenaltyPackage[]; message?: string }>) => {
          state.penaltyLoading = false;
          state.penaltyValidation = {
            allowPickup: action.payload.allowPickup,
            totalPenalty: action.payload.totalPenalty,
            packages: action.payload.packages,
          };

          const mapped = action.payload.packages.reduce((acc, pkg) => {
            acc[pkg.storeId] = pkg;
            return acc;
          }, {} as Record<string, PenaltyPackage>);

          state.penaltyByStore = mapped;
        }
      )
      .addCase(validatePickupChargeRule.rejected, (state, action) => {
        state.penaltyLoading = false;
        state.penaltyError = action.payload as string | null;
      });

      builder
      .addCase(payPickupPenalty.pending, (state, action) => {
        state.penaltyError = null;
        state.payingPenaltyStoreId = action.meta.arg?.storeId || 'ALL';
      })
      .addCase(payPickupPenalty.fulfilled, (state) => {
        state.payingPenaltyStoreId = null;
      })
      .addCase(payPickupPenalty.rejected, (state, action: any) => {
        state.payingPenaltyStoreId = null;
        state.penaltyError = action.payload?.message || action.payload || 'Failed to pay penalty';
      });
  },
});

export const { clearPenaltyError, mergePenaltyPackages } = zipporaInfoSlice.actions;

export default zipporaInfoSlice.reducer;
