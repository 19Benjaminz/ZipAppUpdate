import { sendVcode } from '../features/authSlice';
import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

// Example: Authentication API Calls
export const authApi = {
    login: async (credentials: { email?: string; phoneNum?: string; password: string }) => {
        // Create FormData for the payload
        const payload = new FormData();
        if (credentials.email) payload.append('email', credentials.email);
        if (credentials.phoneNum) payload.append('phoneNum', credentials.phoneNum);
        payload.append('psd', credentials.password); // Assuming password is already hashed (MD5)
        //payload.append('deviceId', 'someDeviceId'); // Replace 'someDeviceId' with the correct device token
        console.log("****************")
        console.log(payload);
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
    forgetPassword: async (email: string) => {
        return apiClient.post(API_ENDPOINTS.LOGIN.FORGET_PASSWORD, { email });
    },
    sendVcode: async (email: string, flag: string = '') => {
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
            console.log(requestURL)
        }
    
        try {
            const response = await apiClient.get(requestURL);
            return response.data; // Assume the response structure matches expectations
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
    bindApartment: async (credentials: { accessToken: string; memberId: string, apartmentId: string, unitId: string }) => {
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
};
