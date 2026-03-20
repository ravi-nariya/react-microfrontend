import { all, fork } from 'redux-saga/effects';
import {
  watchBankingRealtimeSaga,
  watchInternalTransferSaga,
  watchBankingTransferSaga,
} from '../../features/banking/model/bankingSaga';

export function* rootSaga() {
  yield all([fork(watchBankingTransferSaga), fork(watchInternalTransferSaga), fork(watchBankingRealtimeSaga)]);
}
