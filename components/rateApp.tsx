import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

const APP_STORE_URL = "https://apps.apple.com/us/app/zipcodexpress/id1320712564";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.zipcodexpress1&hl=en_US";

export const requestReview = async () => {
  if (await StoreReview.isAvailableAsync()) {
    StoreReview.requestReview();
  } else {
    const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(url);
  }
};
