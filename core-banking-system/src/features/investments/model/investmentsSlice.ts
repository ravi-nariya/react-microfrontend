import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { internalTransferSucceeded } from '../../transfers/model/transferActions';

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface InvestmentsState {
  portfolio: Investment[];
  totalPortfolioValue: number;
  cashAvailable: number;
  totalGainLoss: number;
  lastSyncTime: string;
}

interface TransferToInvestmentPayload {
  amount: number;
  timestamp: string;
}

interface TransferFromInvestmentPayload {
  amount: number;
  timestamp: string;
}

const initialState: InvestmentsState = {
  portfolio: [
    {
      id: 'inv-001',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 25,
      unitPrice: 175.45,
      totalValue: 4386.25,
      gainLoss: 486.25,
      gainLossPercent: 12.4,
    },
    {
      id: 'inv-002',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 15,
      unitPrice: 380.25,
      totalValue: 5703.75,
      gainLoss: 703.75,
      gainLossPercent: 14.1,
    },
    {
      id: 'inv-003',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 10,
      unitPrice: 140.5,
      totalValue: 1405.0,
      gainLoss: 155.0,
      gainLossPercent: 12.4,
    },
  ],
  totalPortfolioValue: 11495.0,
  cashAvailable: 25000.0,
  totalGainLoss: 1345.0,
  lastSyncTime: new Date().toISOString(),
};

const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    transferToInvestmentRequested: (_state, _action: PayloadAction<TransferToInvestmentPayload>) => {
      // Handle transfer to investments
    },
    transferToInvestmentSucceeded: (state, action: PayloadAction<TransferToInvestmentPayload>) => {
      state.cashAvailable += action.payload.amount;
      state.lastSyncTime = action.payload.timestamp;
    },
    transferFromInvestmentSucceeded: (state, action: PayloadAction<TransferFromInvestmentPayload>) => {
      state.cashAvailable -= action.payload.amount;
      state.lastSyncTime = action.payload.timestamp;
    },
    portfolioUpdated: (state, action: PayloadAction<{ portfolio: Investment[]; timestamp: string }>) => {
      state.portfolio = action.payload.portfolio;
      state.totalPortfolioValue = action.payload.portfolio.reduce((sum, inv) => sum + inv.totalValue, 0);
      state.totalGainLoss = action.payload.portfolio.reduce((sum, inv) => sum + inv.gainLoss, 0);
      state.lastSyncTime = action.payload.timestamp;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(internalTransferSucceeded, (state, action) => {
      if (action.payload.destination === 'investments') {
        state.cashAvailable += action.payload.amount;
        state.lastSyncTime = action.payload.timestamp;
      }

      if (action.payload.source === 'investments') {
        state.cashAvailable -= action.payload.amount;
        state.lastSyncTime = action.payload.timestamp;
      }
    });
  },
});

export const {
  transferToInvestmentRequested,
  transferToInvestmentSucceeded,
  transferFromInvestmentSucceeded,
  portfolioUpdated,
} = investmentsSlice.actions;

export const investmentsReducer = investmentsSlice.reducer;
