import { Platform } from 'react-native';

import { secureStore } from './secureStore';

const DEVICE_TOKEN_KEY = 'zipcodexpress-device-token';

export const getStoredDeviceToken = async () => secureStore.getItemAsync(DEVICE_TOKEN_KEY);

export const getCurrentDeviceToken = async () => {
  const storedToken = await getStoredDeviceToken();

  if (Platform.OS === 'web') {
    return storedToken;
  }

  try {
    const messagingModule = require('@react-native-firebase/messaging').default;
    const messaging = messagingModule();

    await messaging.registerDeviceForRemoteMessages();

    const currentToken = await messaging.getToken();

    if (currentToken && currentToken !== storedToken) {
      await secureStore.setItemAsync(DEVICE_TOKEN_KEY, currentToken);
    }

    return currentToken || storedToken;
  } catch (error) {
    if (__DEV__) {
      console.log('[FCM] Failed to get live registration token, using stored token instead.', error);
    }

    return storedToken;
  }
};