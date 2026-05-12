import axios from 'axios';
import { Platform } from 'react-native';

const RAW_ENV_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const API_BASE_URL = RAW_ENV_BASE_URL && RAW_ENV_BASE_URL.length > 0
  ? RAW_ENV_BASE_URL
  : 'https://apis.zipcodexpress.com/zpi/';

let needLoginHandler: (() => void) | null = null;
let isHandlingNeedLogin = false;

export const NEED_LOGIN_MESSAGE = 'Need login!';

const isNeedLoginResponse = (data: any): boolean => {
  return data?.ret === 1 && String(data?.msg || '').toLowerCase() === NEED_LOGIN_MESSAGE.toLowerCase();
};

export const isNeedLoginMessage = (value: unknown): boolean => {
  return String(value || '').toLowerCase() === NEED_LOGIN_MESSAGE.toLowerCase();
};

export const triggerNeedLogin = () => {
  if (isHandlingNeedLogin) {
    return;
  }

  isHandlingNeedLogin = true;
  needLoginHandler?.();

  setTimeout(() => {
    isHandlingNeedLogin = false;
  }, 800);
};

export const forceResetToLogin = () => {
  isHandlingNeedLogin = false;
  needLoginHandler?.();
};

export const setNeedLoginHandler = (handler: (() => void) | null) => {
  needLoginHandler = handler;
};

if (__DEV__) {
  console.log('[apiClient] Active base URL:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    ...(Platform.OS === 'web' ? {} : { 'X-FROM': 'app' }),
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (__DEV__) {
    const base = config.baseURL ?? '';
    const url = config.url ?? '';
    const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
    const method = (config.method ?? 'get').toUpperCase();
    console.log(`[apiClient] ${method} ${fullUrl}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (isNeedLoginResponse(response?.data)) {
      triggerNeedLogin();
    }
    return response;
  },
  (error) => {
    if (__DEV__ && !error?.response) {
      const base = error?.config?.baseURL ?? '';
      const url = error?.config?.url ?? '';
      const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
      console.log('[apiClient] Network error', {
        message: error?.message,
        code: error?.code,
        fullUrl,
      });
    }

    if (isNeedLoginResponse(error?.response?.data)) {
      triggerNeedLogin();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
