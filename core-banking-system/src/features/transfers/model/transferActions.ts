import { createAction } from '@reduxjs/toolkit';

export type TransferSource = 'banking' | 'investments';
export type TransferDestination = 'banking' | 'investments' | 'loans';

export interface InternalTransferPayload {
  source: TransferSource;
  destination: TransferDestination;
  amount: number;
  loanId?: string;
}

export interface InternalTransferSucceededPayload extends InternalTransferPayload {
  timestamp: string;
}

export interface InternalTransferFailedPayload extends InternalTransferPayload {
  reason: string;
  timestamp: string;
}

export const internalTransferRequested = createAction<InternalTransferPayload>('transfers/internalTransferRequested');

export const internalTransferSucceeded = createAction<InternalTransferSucceededPayload>(
  'transfers/internalTransferSucceeded'
);

export const internalTransferFailed = createAction<InternalTransferFailedPayload>('transfers/internalTransferFailed');