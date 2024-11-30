export type RootStackParamList = {
    "Login/Login": undefined;
    "Login/Register": undefined;
    "Login/VerificationPage": {
      phoneNum: string;
      email: string;
      firstName: string;
      lastName: string;
      psd1: string;
      psd2: string;
    };
    "Zippora/ZipporaHome": undefined; // Entry point to a tab navigator
    "Profile/AboutUs": undefined;
    "Profile/PersonalInfo": undefined;
    "Profile/ModifyAddress": undefined;
    "Zippora/SubToAPT": undefined;
    "Zippora/ZipporaInfo": undefined;
  };