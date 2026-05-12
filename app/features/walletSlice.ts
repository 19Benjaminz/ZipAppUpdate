import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { walletApi } from '@/config/apiService';

// Wallet data interfaces based on API documentation
interface WalletBalance {
  total: number;
  money: number;
  frozenMoney: number;
  refundMoney: number;
  ubi: number;
}

interface CreditCard {
  cardId: string;
  cardLast4: string;        // Last 4 digits display format: ****1234
  cardType: string;
  cardHolderName: string;
  createTime: string;
  updateTime: string;
  isDefault: string | number | boolean;        // "是否是默认卡片" - whether it's default card
  status: string | number;           // Card status: available, disabled, etc.
  statusMsg: string;        // Card status message
}

interface Statement {
  statementId: string;
  title: string;
  desc: string;
  amount: string;
  channel: string;
  money: string;
  createTime: string;
}

interface RechargeConfig {
  amount: number;
  plus: number;
  plusUbi: number;
}

interface Transaction {
  transactionId: string;
  type: string;
  deliverId?: string;
  from?: {
    zipcode: string;
    time: string;
  };
  to?: {
    zipcode: string;
    time: string;
  };
  cargo?: {
    cargoStatusText: string;
  };
  createTime: string;
}

interface WalletState {
  // Balance section
  balance: WalletBalance | null;
  balanceLoading: boolean;
  balanceError: string | null;

  // Credit cards section
  creditCards: CreditCard[];
  creditCardsLoading: boolean;
  creditCardsError: string | null;
  defaultCardIndex: number;

  // Statements section
  statements: Statement[];
  statementsLoading: boolean;
  statementsError: string | null;

  // Transactions section
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;

  // Recharge section
  rechargeConfig: RechargeConfig[] | null;
  rechargeConfigLoading: boolean;
  rechargeConfigError: string | null;
  selectedRechargeIndex: number;
  selectedPaymentMethod: 'credit' | 'stripe';
}

const initialState: WalletState = {
  // Balance
  balance: null,
  balanceLoading: false,
  balanceError: null,

  // Credit cards
  creditCards: [],
  creditCardsLoading: false,
  creditCardsError: null,
  defaultCardIndex: -1,

  // Statements
  statements: [],
  statementsLoading: false,
  statementsError: null,

  // Transactions
  transactions: [],
  transactionsLoading: false,
  transactionsError: null,

  // Recharge
  rechargeConfig: null,
  rechargeConfigLoading: false,
  rechargeConfigError: null,
  selectedRechargeIndex: 0,
  selectedPaymentMethod: 'credit',
};

// Async thunks for API calls
export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (credentials: { accessToken: string; memberId: string }, thunkAPI) => {
    try {
      const response = await walletApi.getWallet(credentials);
      const { ret, data, msg } = response;
      console.log('Wallet API Call Return Value:', ret)
      console.log('Wallet API Response:', data);

      if (ret === 0) {
        return data;
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch wallet balance');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const getCreditCards = createAsyncThunk(
  'wallet/getCreditCards',
  async (credentials: { accessToken: string; memberId: string }, thunkAPI) => {
    try {
      const response = await walletApi.getCreditCardList(credentials);
      const { ret, data, msg } = response;

      if (ret === 0) {
        return data.cardList || [];
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch credit cards');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const getStatements = createAsyncThunk(
  'wallet/getStatements',
  async (credentials: { accessToken: string; memberId: string; type?: string }, thunkAPI) => {
    try {
      const response = await walletApi.getStatementList(credentials);
      const { ret, data, msg } = response;

      if (ret === 0) {
        return data.list || [];
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch statements');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const getTransactions = createAsyncThunk(
  'wallet/getTransactions',
  async (credentials: { accessToken: string; memberId: string; type?: string }, thunkAPI) => {
    try {
      const response = await walletApi.getTransactionList(credentials);
      const { ret, data, msg } = response;

      if (ret === 0) {
        return data.list || [];
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const getRechargeConfig = createAsyncThunk(
  'wallet/getRechargeConfig',
  async (credentials: { accessToken: string; memberId: string }, thunkAPI) => {
    try {
      const response = await walletApi.getRechargeConfig(credentials);
      const { ret, data, msg } = response;

      if (ret === 0) {
        return data;
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to fetch recharge config');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const rechargeWithCreditCard = createAsyncThunk(
  'wallet/rechargeWithCreditCard',
  async (
    data: {
      accessToken: string;
      memberId: string;
      amount: number;
      cardId?: string;
      paymentMethodNonce?: string;
    },
    thunkAPI
  ) => {
    try {
      const response = data.cardId
        ? await walletApi.rechargeWithCreditCard({
            accessToken: data.accessToken,
            memberId: data.memberId,
            amount: data.amount,
            cardId: data.cardId,
          })
        : await walletApi.payWithPayPal({
            accessToken: data.accessToken,
            memberId: data.memberId,
            amount: data.amount,
            paymentMethodNonce: data.paymentMethodNonce || '',
          });
      const { ret, msg } = response;

      if (ret === 0) {
        // Refresh wallet balance after successful recharge
        thunkAPI.dispatch(getWalletBalance({ 
          accessToken: data.accessToken, 
          memberId: data.memberId 
        }));
        return { success: true, message: msg || 'Recharge successful' };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Recharge failed');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const rechargeWithPayPal = createAsyncThunk(
  'wallet/rechargeWithPayPal',
  async (
    data: {
      accessToken: string;
      memberId: string;
      amount: number;
      paymentMethodNonce: string;
    },
    thunkAPI
  ) => {
    console.log('Initiating PayPal recharge with data:', data);
    try {
      const response = await walletApi.payWithPayPal(data);
      const { ret, msg } = response;
      console.log('PayPal Recharge API Call Return Value:', ret)
      console.log('PayPal Recharge API Call Message:', msg)

      if (ret === 0) {
        // Refresh wallet balance after successful recharge
        thunkAPI.dispatch(
          getWalletBalance({ accessToken: data.accessToken, memberId: data.memberId })
        );
        return { success: true, message: msg || 'PayPal recharge successful' };
      } else {
        return thunkAPI.rejectWithValue(msg || 'PayPal recharge failed');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const insertCreditCard = createAsyncThunk(
  'wallet/insertCreditCard',
  async (
    data: {
      accessToken: string;
      memberId: string;
      cardNum: string;
      cardHolderName: string;
      expDate: string;
      cvv2: string;
      zipcode: string;
      isDefault?: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await walletApi.insertCreditCard(data);
      const { ret, msg } = response;
      console.log('Insert Credit Card API Call Return Value:', ret)
      console.log('Insert Credit Card API Call', msg)

      if (ret === 0) {
        // Refresh credit cards list after successful insertion
        thunkAPI.dispatch(getCreditCards({ 
          accessToken: data.accessToken, 
          memberId: data.memberId 
        }));
        return { success: true, message: msg || 'Credit card added successfully' };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to add credit card');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteCreditCard = createAsyncThunk(
  'wallet/deleteCreditCard',
  async (
    data: {
      accessToken: string;
      memberId: string;
      cardId: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await walletApi.deleteCreditCard(data);
      const { ret, msg } = response;

      if (ret === 0) {
        // Refresh credit cards list after successful deletion
        thunkAPI.dispatch(getCreditCards({ 
          accessToken: data.accessToken, 
          memberId: data.memberId 
        }));
        return { success: true, message: msg || 'Credit card deleted successfully' };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to delete credit card');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

export const setDefaultCreditCard = createAsyncThunk(
  'wallet/setDefaultCreditCard',
  async (
    data: {
      accessToken: string;
      memberId: string;
      cardId: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await walletApi.setDefaultCard(data);
      const { ret, msg } = response;

      if (ret === 0) {
        // Refresh credit cards list after successful default change
        thunkAPI.dispatch(getCreditCards({ 
          accessToken: data.accessToken, 
          memberId: data.memberId 
        }));
        return { success: true, message: msg || 'Default card updated successfully' };
      } else {
        return thunkAPI.rejectWithValue(msg || 'Failed to set default card');
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Recharge selection
    setSelectedRechargeIndex: (state, action: PayloadAction<number>) => {
      state.selectedRechargeIndex = action.payload;
    },
    setSelectedPaymentMethod: (state, action: PayloadAction<'credit' | 'stripe'>) => {
      state.selectedPaymentMethod = action.payload;
    },
    
    // Credit card management
    setDefaultCard: (state, action: PayloadAction<number>) => {
      state.defaultCardIndex = action.payload;
    },
    
    // Clear errors
    clearBalanceError: (state) => {
      state.balanceError = null;
    },
    clearCreditCardsError: (state) => {
      state.creditCardsError = null;
    },
    clearStatementsError: (state) => {
      state.statementsError = null;
    },
    clearTransactionsError: (state) => {
      state.transactionsError = null;
    },
    clearRechargeConfigError: (state) => {
      state.rechargeConfigError = null;
    },
  },
  extraReducers: (builder) => {
    // Get wallet balance
    builder
      .addCase(getWalletBalance.pending, (state) => {
        state.balanceLoading = true;
        state.balanceError = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.balanceLoading = false;
        state.balance = action.payload;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.balanceLoading = false;
        state.balanceError = action.payload as string;
      })

    // Get credit cards
    builder
      .addCase(getCreditCards.pending, (state) => {
        state.creditCardsLoading = true;
        state.creditCardsError = null;
      })
      .addCase(getCreditCards.fulfilled, (state, action) => {
        state.creditCardsLoading = false;
        state.creditCards = action.payload;
        const defaultIndex = action.payload.findIndex((card: CreditCard) => {
          const isDefaultValue = String(card.isDefault).toLowerCase();
          return isDefaultValue === '1' || isDefaultValue === 'true';
        });
        state.defaultCardIndex = defaultIndex;
      })
      .addCase(getCreditCards.rejected, (state, action) => {
        state.creditCardsLoading = false;
        state.creditCardsError = action.payload as string;
      })

    // Get statements
    builder
      .addCase(getStatements.pending, (state) => {
        state.statementsLoading = true;
        state.statementsError = null;
      })
      .addCase(getStatements.fulfilled, (state, action) => {
        state.statementsLoading = false;
        state.statements = action.payload;
      })
      .addCase(getStatements.rejected, (state, action) => {
        state.statementsLoading = false;
        state.statementsError = action.payload as string;
      })

    // Get transactions
    builder
      .addCase(getTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.transactionsError = action.payload as string;
      })

    // Get recharge config
    builder
      .addCase(getRechargeConfig.pending, (state) => {
        state.rechargeConfigLoading = true;
        state.rechargeConfigError = null;
      })
      .addCase(getRechargeConfig.fulfilled, (state, action) => {
        state.rechargeConfigLoading = false;
        state.rechargeConfig = action.payload;
      })
      .addCase(getRechargeConfig.rejected, (state, action) => {
        state.rechargeConfigLoading = false;
        state.rechargeConfigError = action.payload as string;
      })

    // Recharge with credit card
    builder
      .addCase(rechargeWithCreditCard.pending, (state) => {
        // Could add a recharging state if needed
      })
      .addCase(rechargeWithCreditCard.fulfilled, (state, action) => {
        // Success handling - balance will be updated by the dispatched getWalletBalance
      })
      .addCase(rechargeWithCreditCard.rejected, (state, action) => {
        // Error handling
      });
  },
});

export const {
  setSelectedRechargeIndex,
  setSelectedPaymentMethod,
  setDefaultCard,
  clearBalanceError,
  clearCreditCardsError,
  clearStatementsError,
  clearTransactionsError,
  clearRechargeConfigError,
} = walletSlice.actions;

export default walletSlice.reducer;