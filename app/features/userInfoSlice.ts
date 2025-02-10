import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi } from '../config/apiService';

interface Member {
  memberId: string;
  email: string;
  phone: string;
  status: string;
  statusText: string;
  statusDetail: {
    isEmailVerified: string;
    isProfileCompleted: string;
    hasCreditCard: string;
    hasBindAddress: string;
    hasBindCabinet: string;
  };
}

interface Profile {
  nickName?: string;
  firstName?: string;
  lastName?: string;
  houseHolderMember?: string;
  avatar?: string;
  sex?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  birth?: string;
}

interface DataState {
  accessToken: string;
  memberId: string;
  member: Member;
  profile: Profile;
}

const initialState: DataState = {
  accessToken: '',
  memberId: '',
  member: {
    memberId: '',
    email: '',
    phone: '',
    status: '',
    statusText: '',
    statusDetail: {
      isEmailVerified: '0',
      isProfileCompleted: '0',
      hasCreditCard: '0',
      hasBindAddress: '0',
      hasBindCabinet: '0',
    },
  },
  profile: {
    nickName: '',
    firstName: '',
    lastName: '',
    houseHolderMember: '',
    avatar: '',
    sex: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipcode: '',
    birth: '',
  },
};

export const getUser = createAsyncThunk(
  'userInfo/getUser',
  async (credentials: { accessToken: string; memberId: string }, thunkAPI) => {
    try {
      const response = await profileApi.getMemberInfo(credentials);
      const { ret, data, msg } = response;

      if (ret === 0) {
        return {
          accessToken: credentials.accessToken,
          memberId: data.member.memberId,
          member: {
            memberId: data.member.memberId,
            email: data.member.email,
            phone: data.member.phone,
            status: data.member.status,
            statusText: data.member.statusText,
            statusDetail: data.member.statusDetail,
          },
          profile: {
            nickName: data.profile.nickName,
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            houseHolderMember: data.profile.householderMember,
            avatar: data.profile.avatar,
            sex: data.profile.sex,
            addressLine1: data.profile.addressline1,
            addressLine2: data.profile.addressline2,
            city: data.profile.city,
            state: data.profile.state,
            zipcode: data.profile.zipcode,
            birth: data.profile.birth,
          },
        };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to get data');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Unexpected error occurred'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
    'userInfo/updateUserProfile',
    async (
      profileData: {
        _accessToken: string;
        _memberId: string;
        nickName?: string;
        firstName?: string;
        lastName?: string;
        householderMember?: string;
        state?: string;
        city?: string;
        zipcode?: string;
        addressline1?: string;
        addressline2?: string;
        phone?: string;
        email?: string;
        birth?: string; // Ensure proper format: YYYYMMDD or YYYY-MM-DD
        sex?: string; // "1" for male, "2" for female
        avatar?: string; // Assuming the avatar is a File object
        username?: string; // Optional
      },
      thunkAPI
    ) => {
      try {
        const state: any = thunkAPI.getState();
        const { accessToken, memberId } = state.userInfo;
  
        // Ensure required fields are added
        profileData._accessToken = accessToken;
        profileData._memberId = memberId;

        console.log("++++++++++++++++++++++++++++++++++")
        console.log(profileData)
        
        const response = await profileApi.updateProfile(profileData);
        const { ret, msg } = response;
        console.log("response: ", response);
        console.log(msg);
  
        if (ret === 0) {
          console.log('Profile update successful:', msg);
          // Return only the submitted profile data
          return profileData;
        } else {
          return thunkAPI.rejectWithValue(msg || 'Failed to update profile');
        }
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || 'Unexpected error occurred'
        );
      }
    }
  );

  export const changePassword = createAsyncThunk(
    'userInfo/changePassword',
    async (credentials: { oldPsd: string; psd1: string; psd2: string }, thunkAPI) => {
      try {
        const state: any = thunkAPI.getState();
        const { accessToken, memberId } = state.userInfo;

        const response = await profileApi.changePassword({ accessToken, memberId, ...credentials });
        const { ret, data, msg } = response.data;
  
        if (ret === 0) {
          return data;
        } else {
          return thunkAPI.rejectWithValue(msg || 'Failed to change password');
        }
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || 'Unexpected error occurred'
        );
      }
    }
  );

const dataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    setMemberId(state, action: PayloadAction<string>) {
      state.memberId = action.payload;
    },
    setMember(state, action: PayloadAction<Member>) {
      state.member = action.payload;
    },
    setProfile(state, action: PayloadAction<Profile>) {
      state.profile = action.payload;
    },
    updateMemberStatus(state, action: PayloadAction<string>) {
      state.member.status = action.payload;
    },
    updateProfileName(state, action: PayloadAction<{ firstName: string; lastName: string }>) {
      state.profile.firstName = action.payload.firstName;
      state.profile.lastName = action.payload.lastName;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        // Optionally handle loading state
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<DataState>) => {
        state.accessToken = action.payload.accessToken;
        state.memberId = action.payload.memberId;
        state.member = action.payload.member;
        state.profile = action.payload.profile;
      })
      .addCase(getUser.rejected, (state, action) => {
        console.error('Error fetching user data:', action.payload as string | undefined);
      })
      .addCase(updateUserProfile.pending, (state) => {
        // Optionally handle loading state
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<Partial<Profile>>) => {
        // Merge the updated profile fields into the current state
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        console.error('Error updating profile:', action.payload as string | undefined);
      });
  },
});

export const {
  setAccessToken,
  setMemberId,
  setMember,
  setProfile,
  updateMemberStatus,
  updateProfileName,
} = dataSlice.actions;

export default dataSlice.reducer;