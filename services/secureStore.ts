import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isNativeSecureStoreAvailable = () => {
  return (
    Platform.OS !== 'web' &&
    typeof SecureStore.getItemAsync === 'function' &&
    typeof SecureStore.setItemAsync === 'function' &&
    typeof SecureStore.deleteItemAsync === 'function'
  );
};

const getItemAsync = async (key: string): Promise<string | null> => {
  if (isNativeSecureStoreAvailable()) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
};

const setItemAsync = async (key: string, value: string): Promise<void> => {
  if (isNativeSecureStoreAvailable()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
};

const deleteItemAsync = async (key: string): Promise<void> => {
  if (isNativeSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
};

export const secureStore = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};