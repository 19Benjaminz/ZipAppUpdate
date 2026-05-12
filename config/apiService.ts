import { capitalizeFirstLetter, formatPhoneNumber } from '@/Actions/Utils';
import apiClient from '@/app/config/apiClient';

import { API_ENDPOINTS } from './endpoints';

export const authApi = {
  login: async (credentials: { email?: string; phoneNum?: string; userid?: string; password: string; deviceId?: string }) => {
    const payload = new URLSearchParams();
    if (credentials.email) payload.append('email', credentials.email);
    if (credentials.phoneNum) payload.append('phoneNum', credentials.phoneNum);
    if (credentials.userid) payload.append('userid', credentials.userid);
    payload.append('psd', credentials.password);
    if (credentials.deviceId) payload.append('deviceId', credentials.deviceId);

    return apiClient.post(API_ENDPOINTS.LOGIN.LOGIN, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  register: async (credentials: { firstName: string; lastName: string; email: string; phone: string; psd1: string; psd2: string; vcode: string }) => {
    const payload = new FormData();
    payload.append('firstName', credentials.firstName);
    payload.append('lastName', credentials.lastName);
    payload.append('email', credentials.email);
    payload.append('phone', credentials.phone);
    payload.append('psd1', credentials.psd1);
    payload.append('psd2', credentials.psd2);
    payload.append('vcode', credentials.vcode);
    return apiClient.post(API_ENDPOINTS.LOGIN.REGISTER, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  sendRegisterVcode: async (email: string, flag: string = '') => {
    const requestURL = API_ENDPOINTS.LOGIN.SEND_VCODE;
    const formData = new FormData();
    formData.append('email', email);
    formData.append('flag', flag);

    return apiClient.post(requestURL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  resetPassword: async (credentials: { memberId: string; psd1: string; psd2: string; vcode: string }) => {
    const payload = new FormData();
    payload.append('memberId', credentials.memberId);
    payload.append('psd1', credentials.psd1);
    payload.append('psd2', credentials.psd2);
    payload.append('vcode', credentials.vcode);
    return apiClient.post(API_ENDPOINTS.LOGIN.RESET_PASSWORD, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  sendForgotPasswordVcode: async (email: string) => {
    const payload = new FormData();
    payload.append('email', email);
    return apiClient.post(API_ENDPOINTS.LOGIN.FORGOT_PASSWORD_VCODE, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  logout: async (accessToken: string, memberId: string) => {
    const payload = new FormData();
    payload.append('_accessToken', accessToken);
    payload.append('_memberId', memberId);
    return apiClient.post(API_ENDPOINTS.LOGIN.LOGOUT, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const profileApi = {
  getMemberInfo: async (credentials: { accessToken: string; memberId: string }, needLogin = true) => {
    let requestURL = API_ENDPOINTS.PROFILE.GET_MEMBER;

    if (needLogin) {
      const params = new URLSearchParams();
      params.append('_accessToken', credentials.accessToken);
      params.append('_memberId', credentials.memberId);

      requestURL += `?${params.toString()}`;
    }

    try {
      const response = await apiClient.get(requestURL);
      return response.data;
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
    birth?: string;
    sex?: string;
    avatar?: string;
    username?: string;
  }) => {
    const payload = new FormData();

    payload.append('_accessToken', profileData._accessToken);
    payload.append('_memberId', profileData._memberId);

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
      const response = await apiClient.post(requestURL, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error: any) {
      console.error('Error fetching member information:', error.message);
      throw error;
    }
  },
  updateHouseholdMember: async (profileData: {
    _accessToken: string;
    _memberId: string;
    householderMember: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', profileData._accessToken);
    payload.append('_memberId', profileData._memberId);
    payload.append('householderMember', profileData.householderMember);

    const requestURL = API_ENDPOINTS.PROFILE.UPDATE_HOUSEHOLD_MEMBER;
    try {
      const response = await apiClient.post(requestURL, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile API service:', error.message);
      throw error;
    }
  },
};

export const apartmentApi = {
  getApartmentList: async (credentials: { accessToken: string; memberId: string; zipcode: string }) => {
    const params = new URLSearchParams({
      _accessToken: credentials.accessToken,
      _memberId: credentials.memberId,
      zipcode: credentials.zipcode,
    });

    try {
      const response = await apiClient.get(`${API_ENDPOINTS.ZIP.GET_APT_LIST}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting Apartment List: ', error.message);
      throw error;
    }
  },
  getUnitList: async (credentials: { accessToken: string; memberId: string; apartmentId: string }) => {
    const params = new URLSearchParams({
      _accessToken: credentials.accessToken,
      _memberId: credentials.memberId,
      apartmentId: credentials.apartmentId,
    });

    return apiClient.get(`${API_ENDPOINTS.ZIP.GET_UNIT_LIST}?${params.toString()}`);
  },
  bindApartment: async (credentials: { accessToken: string; memberId: string; apartmentId: string; unitId: string }) => {
    let requestURL = API_ENDPOINTS.ZIP.BIND_APT;
    const params = new URLSearchParams({
      _accessToken: credentials.accessToken,
      _memberId: credentials.memberId,
      apartmentId: credentials.apartmentId,
      unitId: credentials.unitId,
    });

    requestURL += `?${params.toString()}`;

    try {
      const response = await apiClient.get(requestURL);
      return response.data;
    } catch (error: any) {
      console.error('Error Binding Apartment: ', error.message);
      throw error;
    }
  },
  unsubscribeApartment: async (credentials: { accessToken: string; memberId: string; apartmentId: string }) => {
    let requestURL = API_ENDPOINTS.ZIP.CANCEL_APT;
    const params = new URLSearchParams({
      _accessToken: credentials.accessToken,
      _memberId: credentials.memberId,
      apartmentId: credentials.apartmentId,
    });

    requestURL += `?${params.toString()}`;
    try {
      const response = await apiClient.get(requestURL);
      return response.data;
    } catch (error: any) {
      console.error('Error unsubscribe APT: ', error.message);
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
        return response.data;
      }

      throw new Error(response.data.msg || 'Failed to fetch Zippora list');
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
        return response.data;
      }

      throw new Error(response.data.msg || 'Failed to fetch ZIPPORA LOGS');
    } catch (error: any) {
      console.error('Error fetching ZIPPORA LOGS:', error.message);
      throw error;
    }
  },
  qrCodeScan: async (credentials: { accessToken: string; memberId: string; text: string }) => {
    const params = new URLSearchParams();
    params.append('_accessToken', credentials.accessToken);
    params.append('_memberId', credentials.memberId);
    params.append('text', credentials.text);

    const requestURL = `${API_ENDPOINTS.QRCODE.SCAN}?${params.toString()}`;
    try {
      const response = await apiClient.get(requestURL);

      if (response.data.ret === 0) {
        return response.data;
      }
      if (response.data.ret === 2) {
        throw new Error(response.data.msg || 'Empty Scan text');
      }
      if (response.data.ret === 3) {
        throw new Error(response.data.msg || 'Not Supported QR code');
      }
      if (response.data.ret === 4) {
        throw new Error(response.data.msg || 'QR code Expired');
      }

      throw new Error(response.data.msg || 'QR code Fail to SCAN due to unexpected error');
    } catch (error: any) {
      console.error('Error Scanning QRcode', error.message);
      throw error;
    }
  },
  validatePickupChargeRule: async (credentials: {
    accessToken: string;
    memberId: string;
    targetMemberId?: string;
    storeId?: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);
    if (credentials.targetMemberId) {
      payload.append('memberId', credentials.targetMemberId);
    }
    if (credentials.storeId) {
      payload.append('storeId', credentials.storeId);
    }

    const response = await apiClient.post(API_ENDPOINTS.ZIP.VALIDATE_PICKUP_CHARGE_RULE, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
  payPickupPenalty: async (credentials: {
    accessToken: string;
    memberId: string;
    targetMemberId?: string;
    storeId?: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);
    if (credentials.targetMemberId) {
      payload.append('memberId', credentials.targetMemberId);
    }
    if (credentials.storeId) {
      payload.append('storeId', credentials.storeId);
    }

    const response = await apiClient.post(API_ENDPOINTS.ZIP.PAY_PICKUP_PENALTY, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};

export const walletApi = {
  getWallet: async (credentials: { accessToken: string; memberId: string }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.GET_WALLET, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getCreditCardList: async (credentials: { accessToken: string; memberId: string }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.GET_CREDIT_CARD_LIST, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStatementList: async (credentials: { accessToken: string; memberId: string; type?: string }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);
    if (credentials.type) payload.append('type', credentials.type);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.GET_STATEMENT_LIST, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getTransactionList: async (credentials: { accessToken: string; memberId: string; type?: string }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);
    if (credentials.type) payload.append('type', credentials.type);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.GET_TRANSACTION_LIST, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getRechargeConfig: async (credentials: { accessToken: string; memberId: string }) => {
    const payload = new FormData();
    payload.append('_accessToken', credentials.accessToken);
    payload.append('_memberId', credentials.memberId);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.GET_RECHARGE_CONFIG, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  rechargeWithCreditCard: async (data: {
    accessToken: string;
    memberId: string;
    amount: number;
    cardId: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', data.accessToken);
    payload.append('_memberId', data.memberId);
    payload.append('amount', data.amount.toString());
    payload.append('cardId', data.cardId);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.PAY_CREDIT_CARD, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  insertCreditCard: async (data: {
    accessToken: string;
    memberId: string;
    cardNum: string;
    cardHolderName: string;
    expDate: string;
    cvv2: string;
    zipcode: string;
    isDefault?: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', data.accessToken);
    payload.append('_memberId', data.memberId);
    payload.append('cardNum', data.cardNum);
    payload.append('cardHolderName', data.cardHolderName);
    payload.append('expDate', data.expDate);
    payload.append('cvv2', data.cvv2);
    payload.append('zipcode', data.zipcode);
    if (data.isDefault) payload.append('isDefault', data.isDefault);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.INSERT_CREDIT_CARD, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Insert Credit Card Response:', response.data);
    return response.data;
  },

  deleteCreditCard: async (data: {
    accessToken: string;
    memberId: string;
    cardId: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', data.accessToken);
    payload.append('_memberId', data.memberId);
    payload.append('cardId', data.cardId);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.DELETE_CREDIT_CARD, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  setDefaultCard: async (data: {
    accessToken: string;
    memberId: string;
    cardId: string;
  }) => {
    const payload = new FormData();
    payload.append('_accessToken', data.accessToken);
    payload.append('_memberId', data.memberId);
    payload.append('cardId', data.cardId);

    const response = await apiClient.post(API_ENDPOINTS.WALLET.SET_DEFAULT_CARD, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  payWithPayPal: async (data: {
    accessToken: string;
    memberId: string;
    amount: number;
    paymentMethodNonce: string;
  }) => {
    console.log('PayPal payment initiated with nonce:', data.paymentMethodNonce);
    console.log('Amount In SLICE:', data.amount);
    const params = new URLSearchParams();
    params.append('_accessToken', data.accessToken);
    params.append('_memberId', data.memberId);
    params.append('payment_method_nonce', data.paymentMethodNonce);
    params.append('amount', data.amount.toString());

    const url = `paypal/checkout?${params.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  },
};