import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

const APP_STORE_URL = "https://apps.apple.com/us/app/zipcodexpress/id1320712564";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.zipcodexpress1&hl=en_US";

export const requestReview = async () => {
  if (!(await StoreReview.isAvailableAsync())) return;

  // Some builds/environments support the API but do not allow submitting a review action.
  if (typeof StoreReview.hasAction === 'function') {
    const hasReviewAction = await StoreReview.hasAction();
    if (!hasReviewAction) return;
  }

  await StoreReview.requestReview();
};
