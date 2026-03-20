import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { internalTransferRequested, InternalTransferPayload } from '../../features/transfers/model/transferActions';

const SHARED_STATE_KEY = 'core-banking-system-shared-state';
const STATE_CHANGED_EVENT = 'core-banking-system:state-changed';
const TRANSFER_REQUEST_EVENT = 'core-banking-system:transfer-request';

declare global {
  interface WindowEventMap {
    'core-banking-system:state-changed': CustomEvent<SharedStateSnapshot>;
    'core-banking-system:transfer-request': CustomEvent<InternalTransferPayload>;
  }
}

interface SharedStateSnapshot {
  banking: {
    accountName: string;
    availableBalance: number;
    ledgerBalance: number;
    transferInFlight: boolean;
    riskScore: number;
    liquidityIndex: number;
    lastSyncTime: string;
  };
  investments: {
    portfolio: Array<{
      id: string;
      symbol: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalValue: number;
      gainLoss: number;
      gainLossPercent: number;
    }>;
    totalPortfolioValue: number;
    cashAvailable: number;
    totalGainLoss: number;
    lastSyncTime: string;
  };
  loans: {
    loans: Array<{
      id: string;
      loanType: string;
      principal: number;
      outstandingBalance: number;
      interestRate: number;
      emi: number;
      tenureMonths: number;
      paidMonths: number;
      status: 'active' | 'closed' | 'pending';
    }>;
    totalOutstanding: number;
    monthlyEMI: number;
    nextPaymentDue: string;
    lastSyncTime: string;
  };
}

export function CrossAppSyncBridge() {
  const dispatch = useAppDispatch();
  const banking = useAppSelector((state) => state.banking);
  const investments = useAppSelector((state) => state.investments);
  const loans = useAppSelector((state) => state.loans);

  useEffect(() => {
    const snapshot: SharedStateSnapshot = {
      banking,
      investments,
      loans,
    };

    window.localStorage.setItem(SHARED_STATE_KEY, JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent(STATE_CHANGED_EVENT, { detail: snapshot }));
  }, [banking, investments, loans]);

  useEffect(() => {
    const handleTransferRequest = (event: CustomEvent<InternalTransferPayload>) => {
      dispatch(internalTransferRequested(event.detail));
    };

    window.addEventListener(TRANSFER_REQUEST_EVENT, handleTransferRequest as EventListener);
    return () => {
      window.removeEventListener(TRANSFER_REQUEST_EVENT, handleTransferRequest as EventListener);
    };
  }, [dispatch]);

  return null;
}