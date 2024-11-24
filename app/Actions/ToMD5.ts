import CryptoJS from 'react-native-crypto-js';

export const md5Hash = (input: string): string => {
  return CryptoJS.MD5(input).toString();
};
