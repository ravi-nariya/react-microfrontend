import { RootState } from '../../app/store/store';

export const selectLoans = (state: RootState) => state.loans.loans;
export const selectTotalOutstanding = (state: RootState) => state.loans.totalOutstanding;
export const selectMonthlyEMI = (state: RootState) => state.loans.monthlyEMI;
export const selectNextPaymentDue = (state: RootState) => state.loans.nextPaymentDue;
export const selectLoansLastSyncTime = (state: RootState) => state.loans.lastSyncTime;
