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
    "Zippora/BarcodeScan": undefined; 
    "Profile/AboutUs": undefined;
    "Profile/PersonalInfo": undefined;
    "Profile/ModifyAddress": undefined;
    "Profile/ModifyPassword": undefined;
    "Profile/Wallet/Wallet": undefined;
    "Profile/Wallet/Recharge": undefined;
    "Profile/Wallet/Statement": undefined;
    "Profile/Wallet/TransactionHistory": undefined;
    "Profile/Wallet/CreditCards": undefined;
    "Zippora/SubToAPT": undefined;
    "Zippora/ZipporaInfo": undefined;
    "Zippora/ZipLogs": undefined;
  };