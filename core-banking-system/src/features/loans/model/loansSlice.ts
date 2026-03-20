import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { internalTransferSucceeded } from '../../transfers/model/transferActions';

export interface Loan {
  id: string;
  loanType: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  emi: number;
  tenureMonths: number;
  paidMonths: number;
  status: 'active' | 'closed' | 'pending';
}

export interface LoansState {
  loans: Loan[];
  totalOutstanding: number;
  monthlyEMI: number;
  nextPaymentDue: string;
  lastSyncTime: string;
}

interface TransferToLoansPayload {
  amount: number;
  timestamp: string;
}

interface EMIPaymentPayload {
  loanId: string;
  amount: number;
  timestamp: string;
}

const initialState: LoansState = {
  loans: [
    {
      id: 'loan-001',
      loanType: 'Business Loan',
      principal: 500000,
      outstandingBalance: 385000,
      interestRate: 8.5,
      emi: 12500,
      tenureMonths: 60,
      paidMonths: 10,
      status: 'active',
    },
    {
      id: 'loan-002',
      loanType: 'Working Capital Loan',
      principal: 250000,
      outstandingBalance: 180000,
      interestRate: 9.25,
      emi: 6500,
      tenureMonths: 48,
      paidMonths: 12,
      status: 'active',
    },
  ],
  totalOutstanding: 565000,
  monthlyEMI: 19000,
  nextPaymentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  lastSyncTime: new Date().toISOString(),
};

function updateDerivedLoanValues(state: LoansState) {
  state.totalOutstanding = state.loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  state.monthlyEMI = state.loans.filter((loan) => loan.status === 'active').reduce((sum, loan) => sum + loan.emi, 0);
}

const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    transferToLoansRequested: (_state, _action: PayloadAction<TransferToLoansPayload>) => {
      // Handle transfer to loans
    },
    emiPaymentSucceeded: (state, action: PayloadAction<EMIPaymentPayload>) => {
      const loan = state.loans.find((l) => l.id === action.payload.loanId);
      if (loan) {
        loan.outstandingBalance -= action.payload.amount;
        loan.paidMonths += 1;
        if (loan.outstandingBalance <= 0) {
          loan.status = 'closed';
          loan.outstandingBalance = 0;
        }
        updateDerivedLoanValues(state);
        state.lastSyncTime = action.payload.timestamp;
      }
    },
    emiPaymentFailed: (state, action: PayloadAction<{ reason: string; timestamp: string }>) => {
      state.lastSyncTime = action.payload.timestamp;
    },
    loansUpdated: (state, action: PayloadAction<{ loans: Loan[]; timestamp: string }>) => {
      state.loans = action.payload.loans;
      updateDerivedLoanValues(state);
      state.lastSyncTime = action.payload.timestamp;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(internalTransferSucceeded, (state, action) => {
      if (action.payload.destination !== 'loans') {
        return;
      }

      const loan = state.loans.find((entry) => entry.id === action.payload.loanId) ?? state.loans.find((entry) => entry.status === 'active');

      if (!loan) {
        return;
      }

      loan.outstandingBalance = Math.max(0, loan.outstandingBalance - action.payload.amount);
      if (action.payload.amount >= loan.emi && loan.status === 'active') {
        loan.paidMonths += 1;
      }
      if (loan.outstandingBalance === 0) {
        loan.status = 'closed';
      }

      updateDerivedLoanValues(state);
      state.lastSyncTime = action.payload.timestamp;
    });
  },
});

export const { transferToLoansRequested, emiPaymentSucceeded, emiPaymentFailed, loansUpdated } = loansSlice.actions;

export const loansReducer = loansSlice.reducer;
