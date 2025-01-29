import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apartmentApi } from "../config/apiService";

export interface ApartmentInfo {
    apartmentId: string;
    apartmentName: string;
    address: string;
    hasBinded: string;
}

export interface unitInfo {
    unitId: string;
    unitName: string;
}

export interface ApartmentListState {
    loading: boolean;
    error: string | null;
    aptList: ApartmentInfo[];
    unitList: unitInfo[];
}

const initialState: ApartmentListState = {
    loading: false,
    error: null,
    aptList: [],
    unitList: [],
};

export const fetchApartmentList = createAsyncThunk(
    'apartment/fetchApartmentList',
    async (zipcode: string, thunkAPI) => {
        const state: any = thunkAPI.getState();
        const { accessToken, memberId } = state.userInfo

        try {
            const response = await apartmentApi.getApartmentList({accessToken, memberId, zipcode})
            const { ret, data, msg } = response;

            if (ret === 0) {
                return { apartmentList: data.apartmentList };
            } else {
                return thunkAPI.rejectWithValue(msg || 'Failed to fetch apartment List');
            }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unexpected error occurred Apartment List');
        }

    }
)

export const fetchUnitList = createAsyncThunk(
    'apartment/fetchUnitList',
    async (apartmentId: string, thunkAPI) => {
      const state: any = thunkAPI.getState();
      const { accessToken, memberId } = state.userInfo;
  
      try {
        const response = await apartmentApi.getUnitList({ accessToken, memberId, apartmentId });
        const { ret, data, msg } = response.data;
  
        if (ret === 0 && data.unitList) {
          return { unitList: data.unitList }; // Ensure unitList is defined
        } else {
          return thunkAPI.rejectWithValue(msg || 'Failed to fetch unit list');
        }
      } catch (error: any) {
        console.error('Error fetching unit list:', error.message);
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || 'Unexpected error occurred fetching unit list'
        );
      }
    }
  );

  export const bindApartment = createAsyncThunk(
    'apartment/bindApartment',
    async (credentials: {apartmentId: string; unitId: string}, thunkAPI) => {
      const state: any = thunkAPI.getState();
      const { accessToken, memberId } = state.userInfo;
      const apartmentId = credentials.apartmentId;
      const unitId = credentials.unitId;

      try {
        const response = await apartmentApi.bindApartment({accessToken, memberId, apartmentId, unitId})
        const { ret, data, msg } = response;
      } catch (error: any) {
        console.error('Error sub to APT:', error.message);
      }
    }
  )

  export const unsubscribeApartment = createAsyncThunk(
    'apartment/unsubscribeApartment',
    async (apartmentid: string, thunkAPI) => {
      const state: any = thunkAPI.getState();
      const { accessToken, memberId } = state.userInfo;
      const apartmentId = apartmentid;

      try {
        const response = await apartmentApi.unsubscribeApartment({accessToken, memberId, apartmentId})
        console.log(response)
        const { ret, data, msg } = response;
      } catch (error: any) {
        console.error('Error unsub to APT:', error.message);
      }
    }
  )

  const apartmentSlice = createSlice({
    name: 'apartment',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      // Handle fetchApartmentList lifecycle
      builder
        .addCase(fetchApartmentList.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          fetchApartmentList.fulfilled,
          (state, action: PayloadAction<{ apartmentList: ApartmentInfo[] }>) => {
            state.loading = false;
            state.aptList = action.payload.apartmentList; // Store the fetched apartment list
          }
        )
        .addCase(fetchApartmentList.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string | null;
        });
  
      // Handle fetchUnitList lifecycle
      builder
        .addCase(fetchUnitList.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          fetchUnitList.fulfilled,
          (state, action: PayloadAction<{ unitList: unitInfo[] }>) => {
            state.loading = false;
            state.unitList = action.payload.unitList; // Store the fetched unit list
          }
        )
        .addCase(fetchUnitList.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string | null;
        });
    },
  });

export default apartmentSlice.reducer