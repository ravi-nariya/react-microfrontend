import { RootState } from '../../app/store/store';

export const selectPortfolio = (state: RootState) => state.investments.portfolio;
export const selectTotalPortfolioValue = (state: RootState) => state.investments.totalPortfolioValue;
export const selectCashAvailable = (state: RootState) => state.investments.cashAvailable;
export const selectTotalGainLoss = (state: RootState) => state.investments.totalGainLoss;
export const selectInvestmentsLastSyncTime = (state: RootState) => state.investments.lastSyncTime;
