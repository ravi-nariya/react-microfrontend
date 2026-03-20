import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  internalTransferFailed,
  internalTransferRequested,
  internalTransferSucceeded,
} from '../../transfers/model/transferActions';

export interface BankingEvent {
  id: string;
  type: 'credit' | 'debit' | 'alert';
  description: string;
  amount: number;
  timestamp: string;
}

export interface BankingState {
  accountName: string;
  availableBalance: number;
  ledgerBalance: number;
  transferInFlight: boolean;
  riskScore: number;
  liquidityIndex: number;
  lastSyncTime: string;
  recentEvents: BankingEvent[];
}

interface TransferPayload {
  to: string;
  amount: number;
}

interface RealtimeTickPayload {
  riskScore: number;
  liquidityIndex: number;
  timestamp: string;
}

function createEventDescription(direction: 'in' | 'out', destination: string) {
  if (direction === 'out') {
    return destination === 'loans' ? 'Loan payment from core banking' : `Transfer to ${destination}`;
  }

  return `Transfer from ${destination}`;
}

const initialState: BankingState = {
  accountName: 'Ravi Nariya - Business Current',
  availableBalance: 128450.75,
  ledgerBalance: 130120.75,
  transferInFlight: false,
  riskScore: 22,
  liquidityIndex: 84,
  lastSyncTime: new Date().toISOString(),
  recentEvents: [
    {
      id: 'evt-seed-1',
      type: 'credit',
      description: 'POS settlement from merchant gateway',
      amount: 2140.35,
      timestamp: new Date().toISOString(),
    },
  ],
};

const bankingSlice = createSlice({
  name: 'banking',
  initialState,
  reducers: {
    transferRequested: (state, _action: PayloadAction<TransferPayload>) => {
      state.transferInFlight = true;
    },
    transferSucceeded: (state, action: PayloadAction<TransferPayload & { timestamp: string }>) => {
      state.transferInFlight = false;
      state.availableBalance -= action.payload.amount;
      state.ledgerBalance -= action.payload.amount;
      state.lastSyncTime = action.payload.timestamp;
      state.recentEvents.unshift({
        id: `evt-${Date.now()}`,
        type: 'debit',
        description: `Transfer to ${action.payload.to}`,
        amount: action.payload.amount,
        timestamp: action.payload.timestamp,
      });
      state.recentEvents = state.recentEvents.slice(0, 6);
    },
    transferFailed: (state, action: PayloadAction<{ reason: string; timestamp: string }>) => {
      state.transferInFlight = false;
      state.lastSyncTime = action.payload.timestamp;
      state.recentEvents.unshift({
        id: `evt-${Date.now()}`,
        type: 'alert',
        description: `Transfer blocked: ${action.payload.reason}`,
        amount: 0,
        timestamp: action.payload.timestamp,
      });
      state.recentEvents = state.recentEvents.slice(0, 6);
    },
    realtimeTickReceived: (state, action: PayloadAction<RealtimeTickPayload>) => {
      state.riskScore = action.payload.riskScore;
      state.liquidityIndex = action.payload.liquidityIndex;
      state.lastSyncTime = action.payload.timestamp;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(internalTransferRequested, (state) => {
      state.transferInFlight = true;
    });

    builder.addCase(internalTransferSucceeded, (state, action) => {
      state.transferInFlight = false;
      state.lastSyncTime = action.payload.timestamp;

      if (action.payload.source === 'banking') {
        state.availableBalance -= action.payload.amount;
        state.ledgerBalance -= action.payload.amount;
        state.recentEvents.unshift({
          id: `evt-${Date.now()}`,
          type: 'debit',
          description: createEventDescription('out', action.payload.destination),
          amount: action.payload.amount,
          timestamp: action.payload.timestamp,
        });
      }

      if (action.payload.destination === 'banking') {
        state.availableBalance += action.payload.amount;
        state.ledgerBalance += action.payload.amount;
        state.recentEvents.unshift({
          id: `evt-${Date.now()}`,
          type: 'credit',
          description: createEventDescription('in', action.payload.source),
          amount: action.payload.amount,
          timestamp: action.payload.timestamp,
        });
      }

      state.recentEvents = state.recentEvents.slice(0, 6);
    });

    builder.addCase(internalTransferFailed, (state, action) => {
      state.transferInFlight = false;
      state.lastSyncTime = action.payload.timestamp;
      state.recentEvents.unshift({
        id: `evt-${Date.now()}`,
        type: 'alert',
        description: `Internal transfer blocked: ${action.payload.reason}`,
        amount: 0,
        timestamp: action.payload.timestamp,
      });
      state.recentEvents = state.recentEvents.slice(0, 6);
    });
  },
});

export const {
  transferRequested,
  transferSucceeded,
  transferFailed,
  realtimeTickReceived,
} = bankingSlice.actions;

export const bankingReducer = bankingSlice.reducer;
