export type RootStackParamList = {
    "Login/Login": undefined;
    "Login/Register": undefined;
    "Login/RegistrationVerificationPage": {
      phoneNum: string;
      email: string;
      firstName: string;
      lastName: string;
      psd1: string;
      psd2: string;
    };
    "Login/ForgotPasswordEmail": undefined;
    "Login/ForgotPasswordForm": {
      memberId: string;
      email: string;
    };
    "Zippora/ZipporaHome": undefined; // Entry point to a tab navigator
    "Profile/AboutUs": undefined;
    "Profile/PersonalInfo": undefined;
    "Profile/ModifyAddress": undefined;
    "Profile/ModifyPassword": undefined;
    "Zippora/SubToAPT": undefined;
    "Zippora/ZipporaInfo": undefined;
    "Zippora/ZipLogs": undefined;
  };