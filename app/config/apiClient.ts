import axios from 'axios';

const API_BASE_URL = "https://apis.zipcodexpress.com/zpi/";
const TEST_API_BASE_URL = "http://zipcodexpress.unibox.com.cn/zpi/";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: {
        'X-FROM': 'app',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
  // console.log(`Making request to: ${config.baseURL}${config.url}`);
  return config;
});

export default apiClient;
