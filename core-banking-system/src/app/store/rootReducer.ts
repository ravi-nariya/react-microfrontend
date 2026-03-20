import { combineReducers } from '@reduxjs/toolkit';
import { bankingReducer } from '../../features/banking/model/bankingSlice';
import { investmentsReducer } from '../../features/investments/model/investmentsSlice';
import { loansReducer } from '../../features/loans/model/loansSlice';

export const rootReducer = combineReducers({
  banking: bankingReducer,
  investments: investmentsReducer,
  loans: loansReducer,
});
