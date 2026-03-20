import { RootState } from '../../../app/store/store';

export const selectBanking = (state: RootState) => state.banking;
export const selectBankingEvents = (state: RootState) => state.banking.recentEvents;
