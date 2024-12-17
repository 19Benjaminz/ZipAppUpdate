import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { capitalizeFirstLetter, formatPhoneNumber } from '../Actions/Utils';

// Example: Authentication API Calls
export const authApi = {
    login: async (credentials: { email?: string; phoneNum?: string; password: string }) => {
        // Create FormData for the payload
        const payload = new FormData();
        if (credentials.email) payload.append('email', credentials.email);
        if (credentials.phoneNum) payload.append('phoneNum', credentials.phoneNum);
        payload.append('psd', credentials.password); 
        // Make the API call with FormData
        return apiClient.post(API_ENDPOINTS.LOGIN.LOGIN, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Ensure correct headers
        });
    },
    register: async (credentials: { firstName: string, lastName: string, email: string; phone: string; psd1: string, psd2: string, vcode: string }) => {
        const payload = new FormData();
        payload.append('firstName', credentials.firstName);
        payload.append('lastName', credentials.lastName);
        payload.append('email', credentials.email);
        payload.append('phone', credentials.phone);
        payload.append('psd1', credentials.psd1);
        payload.append('psd2', credentials.psd2);
        payload.append('vcode', credentials.vcode);
        return apiClient.post(API_ENDPOINTS.LOGIN.REGISTER, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Ensure correct headers
        });
    },
    sendRegisterVcode: async (email: string, flag: string = '') => {
        const requestURL = API_ENDPOINTS.LOGIN.SEND_VCODE;
        console.log("Email for registration: ", email);
    
        // Create form-data payload
        const formData = new FormData();
        formData.append('email', email);
        formData.append('flag', flag);
    
        // Make POST request with the form-data payload
        return apiClient.post(requestURL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Explicitly specify content type
            },
        });
    },
    resetPassword: async (credentials: { memberId: string, psd1: string; psd2: string; vcode: string }) => {
        const payload = new FormData();
        payload.append('memberId', credentials.memberId);
        payload.append('psd1', credentials.psd1);
        payload.append('psd2', credentials.psd2);
        payload.append('vcode', credentials.vcode);
        return apiClient.post(API_ENDPOINTS.LOGIN.RESET_PASSWORD, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Ensure correct headers
        });
    },
    sendForgotPasswordVcode: async (email: string) => {
        const payload = new FormData();
        payload.append('email', email);
        return apiClient.post(API_ENDPOINTS.LOGIN.FORGOT_PASSWORD_VCODE, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Ensure correct headers
        });
    },
    logout: async (accessToken: string, memberId: string) => {
        const payload = new FormData();
        payload.append('_accessToken', accessToken);
        payload.append('_memberId', memberId);
        return apiClient.post(API_ENDPOINTS.LOGIN.LOGOUT, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Ensure correct headers
        });
    }
};

// Example: Profile API Calls
export const profileApi = {
    getMemberInfo: async (credentials: { accessToken: string; memberId: string; }, needLogin = true) => {
        let requestURL = API_ENDPOINTS.PROFILE.GET_MEMBER;
    
        if (needLogin) {
            const params = new URLSearchParams();
            params.append('_accessToken', credentials.accessToken);
            params.append('_memberId', credentials.memberId);
    
            requestURL += `?${params.toString()}`;
        }
    
        try {
            const response = await apiClient.get(requestURL);
            return response.data; // Assume the response structure matches expectations
        } catch (error: any) {
            console.error('Error fetching member information:', error.message);
            throw error;
        }
    },
    updateProfile: async (profileData: {
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
        username?: string;
    }) => {
        const payload = new FormData();

        // Append required fields
        payload.append('_accessToken', profileData._accessToken);
        payload.append('_memberId', profileData._memberId);

        // Append optional fields if they are provided
        if (profileData.nickName) payload.append('nickName', capitalizeFirstLetter(profileData.nickName));
        if (profileData.firstName) payload.append('firstName', capitalizeFirstLetter(profileData.firstName));
        if (profileData.lastName) payload.append('lastName', capitalizeFirstLetter(profileData.lastName));
        if (profileData.householderMember) payload.append('householderMember', profileData.householderMember);
        if (profileData.state) payload.append('state', profileData.state);
        if (profileData.city) payload.append('city', capitalizeFirstLetter(profileData.city));
        if (profileData.zipcode) payload.append('zipcode', profileData.zipcode);
        if (profileData.addressline1) payload.append('addressline1', profileData.addressline1);
        if (profileData.addressline2) payload.append('addressline2', profileData.addressline2);
        if (profileData.phone) payload.append('phone', formatPhoneNumber(profileData.phone));
        if (profileData.email) payload.append('email', profileData.email);
        if (profileData.birth) payload.append('birth', profileData.birth);
        if (profileData.sex) payload.append('sex', profileData.sex);
        if (profileData.avatar) payload.append('avatar', profileData.avatar);
        if (profileData.username) payload.append('username', profileData.username);

        const requestURL = API_ENDPOINTS.PROFILE.UPDATE;
        try {
            const response = await apiClient.post(
                requestURL, // Replace with actual API endpoint
                payload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Ensure correct handling of form data
                    },
                }
            );
            return response.data; // Assume the response contains success status
        } catch (error: any) {
            console.error('Error updating profile API service:', error.message);
            throw error;
        }
    },
    changePassword: async (credentials: { accessToken: string; memberId: string; oldPsd: string; psd1: string; psd2: string }, needLogin = true) => {
        const payload = new FormData();
        if (needLogin) {
            payload.append('_accessToken', credentials.accessToken);
            payload.append('_memberId', credentials.memberId);
            payload.append('oldPsd', credentials.oldPsd);
            payload.append('psd1', credentials.psd1);
            payload.append('psd2', credentials.psd2);
        }
    
        try {
            return apiClient.post(API_ENDPOINTS.LOGIN.CHANGE_PASSWORD, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }, // Ensure correct headers
            });
        } catch (error: any) {
            console.error('Error fetching member information:', error.message);
            throw error;
        }
    },
};

// Example: Apartment API Calls
export const apartmentApi = {
    getApartmentList: async (credentials: { accessToken: string; memberId: string, zipcode: string }) => {
        const params = new URLSearchParams({
            _accessToken: credentials.accessToken,
            _memberId: credentials.memberId,
            zipcode: credentials.zipcode
        })

        try {
            const response = await apiClient.get(`${API_ENDPOINTS.ZIP.GET_APT_LIST}?${params.toString()}`);
            return response.data
        } catch (error: any) {
            console.error("Error getting Apartment List: ", error.message)
            throw error;
        }
    },
    getUnitList: async (credentials: { accessToken: string; memberId: string, apartmentId: string }) => {
        const params = new URLSearchParams({
            _accessToken: credentials.accessToken,
            _memberId: credentials.memberId,
            apartmentId: credentials.apartmentId
        })
        
        return apiClient.get(`${API_ENDPOINTS.ZIP.GET_UNIT_LIST}?${params.toString()}`);
    },
    bindApartment: async (credentials: { accessToken: string, memberId: string, apartmentId: string, unitId: string }) => {
        let requestURL = API_ENDPOINTS.ZIP.BIND_APT;
        const params = new URLSearchParams({
            _accessToken: credentials.accessToken,
            _memberId: credentials.memberId,
            apartmentId: credentials.apartmentId,
            unitId: credentials.unitId
        })

        requestURL += `?${params.toString()}`;

        try {
            const response = await apiClient.get(requestURL);
            return response.data; // Assume the response structure matches expectations
        } catch (error: any) {
            console.error('Error Binding Apartment: ', error.message);
            throw error;
        }
    },
    unsubscribeApartment: async (credentials: {accessToken: string, memberId: string, apartmentId: string}) => {
        let requestURL = API_ENDPOINTS.ZIP.CANCEL_APT;
        const params = new URLSearchParams({
            _accessToken: credentials.accessToken,
            _memberId: credentials.memberId,
            apartmentId: credentials.apartmentId,
        })

        requestURL += `?${params.toString()}`;

        try {
            const response = await apiClient.get(requestURL);
            return response.data; // Assume the response structure matches expectations
        } catch (error: any) {
            console.error('Error unsubscribe APT: ', error.message);
            throw error;
        }
    }
};

export const zipporaApi = {
    getZipporaList: async (credentials: { accessToken: string; memberId: string }) => {
        const params = new URLSearchParams();
        params.append('_accessToken', credentials.accessToken);
        params.append('_memberId', credentials.memberId);
    
        const requestURL = `${API_ENDPOINTS.ZIP.GET_ZIPPORA_LIST}?${params.toString()}`;
        try {
          const response = await apiClient.get(requestURL);
    
          if (response.data.ret === 0) {
            return response.data; // Successful response
          } else {
            throw new Error(response.data.msg || 'Failed to fetch Zippora list');
          }
        } catch (error: any) {
          console.error('Error fetching Zippora list:', error.message);
          throw error;
        }
    },
    getZipporaLogs: async (credentials: { accessToken: string; memberId: string }) => {
        const params = new URLSearchParams();
        params.append('_accessToken', credentials.accessToken);
        params.append('_memberId', credentials.memberId);
    
        const requestURL = `${API_ENDPOINTS.STORE.GET_LIST}?${params.toString()}`;
        try {
          const response = await apiClient.get(requestURL);
    
          if (response.data.ret === 0) {
            return response.data; // Successful response
          } else {
            throw new Error(response.data.msg || 'Failed to fetch ZIPPORA LOGS');
          }
        } catch (error: any) {
          console.error('Error fetching ZIPPORA LOGS:', error.message);
          throw error;
        }
    },
    qrCodeScan: async (credentials: { accessToken: string; memberId: string, text: string}) => {
        const params = new URLSearchParams();
        params.append('_accessToken', credentials.accessToken);
        params.append('_memberId', credentials.memberId);
        params.append('text', credentials.text);

        const requestURL = `${API_ENDPOINTS.QRCODE.SCAN}?${params.toString()}`;
        try {
            const response = await apiClient.get(requestURL);
      
            if (response.data.ret === 0) {
              return response.data; // Successful response
            } else if (response.data.ret === 2) {
              throw new Error(response.data.msg || 'Empty Scan text');
            } else if (response.data.ret === 3) {
                throw new Error(response.data.msg || 'Not Supported QR code');
            } else if (response.data.ret === 4) {
                throw new Error(response.data.msg || 'QR code Expired');
            } else {
                throw new Error(response.data.msg || 'QR code Fail to SCAN due to unexpected error');
            }
            
          } catch (error: any) {
            console.error('Error Scanning QRcode', error.message);
            throw error;
          }
    }
};