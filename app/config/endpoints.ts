export const API_ENDPOINTS = {
    CABINET: {
      GET_LIST: 'cabinet/getCabinetList',
      SET: 'cabinet/setCabinet',
    },
    CARDCREDIT: {
      DELETE: 'CardCredit/delete',
      INSERT: 'CardCredit/insertCardCredit',
      SET_DEFAULT: 'CardCredit/setDefault',
    },
    DELIVER: {
      GET_LIST: 'deliver/getDeliverList',
      INSERT: 'deliver/insertDeliver',
      PAY: 'deliver/payDeliver',
      UPDATE: 'deliver/updateDeliver',
      CANCEL: 'deliver/cancelDeliver',
      GET_PRICE: 'deliver/getDeliverPrice',
      GET_INFO: 'deliver/getDeliver',
    },
    PICK: {
      GET_LIST: 'pick/getPickList',
      COMPLAIN: 'pick/complainPick',
    },
    STORE: {
      GET_LIST: 'store/getStoreList',
      INSERT: 'store/insertStore',
      GET_PRICE: 'store/getStorePrice',
    },
    PROFILE: {
      UPDATE: 'Address/insertAddress',
      SWITCH_SERVICE_MODE: 'member/switchServiceMode',
      GET_MEMBER: 'member/getMember',
      GET_STATEMENT_LIST: 'statement/getStatementList',
      GET_CREDIT_CARD_LIST: 'CardCredit/getCardCreditList',
      MODIFY: 'Profile/updateProfile',
      GET_STATE_LIST: 'state/getStateList',
      GET_TRANSACTION_LIST: 'transaction/getTransactionList',
    },
    VCODE: {
      CHECK: 'VCode/checkVCode',
      GET: 'VCode/getVCode',
      RE_LOGIN: 'VCode/login',
    },
    LOGIN: {
      REGISTER: 'login/registern',
      LOGIN: 'login/login',
      FORGET_PASSWORD: 'login/forgetPsd',
      RESET_PASSWORD: 'login/resetPsd',
      VERIFY_ACCOUNT: 'login/verifyAccount',
      RESEND_EMAIL: 'login/reSendEmail',
      CHANGE_PASSWORD: 'login/changePsd',
      VERIFY_EMAIL: 'login/verifyEmail',
      SEND_VCODE: 'login/sendvcode',
    },
    PHOTO: {
      UPLOAD: 'Photo/uploadPhoto',
    },
    CONFIG: {
      GET_CARGO: 'config/getConfig',
    },
    QRCODE: {
      SCAN: 'QrCode/scan',
    },
    WALLET: {
      GET_RECHARGE_CONFIG: 'wallet/getRechargeAmountConfig',
      PAY_CREDIT_CARD: 'wallet/recharge',
      PAY_PAYPAL: 'paypal/checkout',
    },
    ZIP: {
      GET_APT_LIST: 'zippora/getApartmentList',
      GET_UNIT_LIST: 'zippora/getUnitList',
      BIND_APT: 'zippora/bindApartment',
      CANCEL_APT: 'zippora/cancelBindApartment',
      GET_ZIPPORA_LIST: 'zippora/getZipporaList',
      GET_ZIPPORA_LOG: 'zippora/getStoreList',
    },
    APP: {
      VERSION: 'app/version',
    },
  };
  