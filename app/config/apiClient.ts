import axios from 'axios';

const API_BASE_URL = "https://apis.zipcodexpress.com/zpi/";
const TEST_API_BASE_URL = "http://zipcodexpress.unibox.com.cn/zpi/";
const envBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const baseURL = envBaseURL || (__DEV__ ? TEST_API_BASE_URL : API_BASE_URL);

const apiClient = axios.create({
    baseURL,
    timeout: 20000,
    headers: {
        'X-FROM': 'app',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
  if (__DEV__) {
    console.log('API base URL:', config.baseURL ?? baseURL);
  }
  return config;
});

export default apiClient;
