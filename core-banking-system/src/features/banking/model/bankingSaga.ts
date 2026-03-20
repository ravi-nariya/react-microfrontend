import { delay, put, select, takeLatest } from 'redux-saga/effects';
import { selectCashAvailable } from '../../investments/model/investmentsSelectors';
import { selectLoans } from '../../loans/model/loansSelectors';
import {
  internalTransferFailed,
  internalTransferRequested,
  internalTransferSucceeded,
} from '../../transfers/model/transferActions';
import { selectBanking } from './bankingSelectors';
import {
  realtimeTickReceived,
  transferFailed,
  transferRequested,
  transferSucceeded,
} from './bankingSlice';

function createRiskScore() {
  return Math.floor(18 + Math.random() * 20);
}

function createLiquidityIndex() {
  return Math.floor(74 + Math.random() * 20);
}

function* handleInternalTransfer(action: ReturnType<typeof internalTransferRequested>) {
  const { amount, destination, loanId, source } = action.payload;
  yield delay(450);

  if (Number.isNaN(amount) || amount <= 0) {
    yield put(
      internalTransferFailed({
        ...action.payload,
        reason: 'amount must be greater than zero',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (source === destination) {
    yield put(
      internalTransferFailed({
        ...action.payload,
        reason: 'source and destination cannot be the same',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (source === 'banking') {
    const banking: ReturnType<typeof selectBanking> = yield select(selectBanking);
    if (amount > banking.availableBalance) {
      yield put(
        internalTransferFailed({
          ...action.payload,
          reason: 'insufficient core banking balance',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }
  }

  if (source === 'investments') {
    const cashAvailable: ReturnType<typeof selectCashAvailable> = yield select(selectCashAvailable);
    if (destination !== 'banking') {
      yield put(
        internalTransferFailed({
          ...action.payload,
          reason: 'investments transfers are only supported back to core banking',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }
    if (amount > cashAvailable) {
      yield put(
        internalTransferFailed({
          ...action.payload,
          reason: 'insufficient investment cash balance',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }
  }

  if (destination === 'loans') {
    const loans: ReturnType<typeof selectLoans> = yield select(selectLoans);
    const targetLoan = loanId
      ? loans.find((entry) => entry.id === loanId)
      : loans.find((entry) => entry.status === 'active');

    if (!targetLoan) {
      yield put(
        internalTransferFailed({
          ...action.payload,
          reason: 'no active loan is available for payment',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }
  }

  yield put(
    internalTransferSucceeded({
      source,
      destination,
      amount,
      loanId,
      timestamp: new Date().toISOString(),
    })
  );
}

function* handleTransfer(action: ReturnType<typeof transferRequested>) {
  const { amount, to } = action.payload;
  yield delay(650);

  if (amount > 50000) {
    yield put(
      transferFailed({
        reason: 'requires second-level authorization over 50,000',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  yield put(
    transferSucceeded({
      to,
      amount,
      timestamp: new Date().toISOString(),
    })
  );
}

export function* watchBankingTransferSaga() {
  yield takeLatest(transferRequested.type, handleTransfer);
}

export function* watchInternalTransferSaga() {
  yield takeLatest(internalTransferRequested.type, handleInternalTransfer);
}

export function* watchBankingRealtimeSaga() {
  while (true) {
    yield delay(3000);
    yield put(
      realtimeTickReceived({
        riskScore: createRiskScore(),
        liquidityIndex: createLiquidityIndex(),
        timestamp: new Date().toISOString(),
      })
    );
  }
}
