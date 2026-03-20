import { useEffect, useState } from 'react';

interface Loan {
  id: string;
  loanType: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  emi: number;
  paidMonths: number;
  tenureMonths: number;
}

interface SharedStateSnapshot {
  banking: {
    availableBalance: number;
    lastSyncTime: string;
  };
  loans: {
    loans: Loan[];
    totalOutstanding: number;
    monthlyEMI: number;
    nextPaymentDue: string;
    lastSyncTime: string;
  };
}

const SHARED_STATE_KEY = 'core-banking-system-shared-state';
const STATE_CHANGED_EVENT = 'core-banking-system:state-changed';

function getInitialSnapshot(): SharedStateSnapshot | null {
  try {
    const serializedState = window.localStorage.getItem(SHARED_STATE_KEY);
    return serializedState ? (JSON.parse(serializedState) as SharedStateSnapshot) : null;
  } catch {
    return null;
  }
}

function getFallbackLoans(): Loan[] {
  return [
    {
      id: 'loan-001',
      loanType: 'Business Loan',
      principal: 500000,
      outstandingBalance: 385000,
      interestRate: 8.5,
      emi: 12500,
      paidMonths: 10,
      tenureMonths: 60,
    },
    {
      id: 'loan-002',
      loanType: 'Working Capital Loan',
      principal: 250000,
      outstandingBalance: 180000,
      interestRate: 9.25,
      emi: 6500,
      paidMonths: 12,
      tenureMonths: 48,
    },
  ];
}

declare global {
  interface WindowEventMap {
    'core-banking-system:state-changed': CustomEvent<SharedStateSnapshot>;
  }
}

function App() {
  const [snapshot, setSnapshot] = useState<SharedStateSnapshot | null>(() => getInitialSnapshot());

  const loans = snapshot?.loans.loans ?? getFallbackLoans();
  const totalOutstanding = snapshot?.loans.totalOutstanding ?? loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const monthlyEMI = snapshot?.loans.monthlyEMI ?? loans.reduce((sum, loan) => sum + loan.emi, 0);
  const coreBankingBalance = snapshot?.banking.availableBalance ?? 128450.75;
  const nextPaymentDue = snapshot?.loans.nextPaymentDue;

  useEffect(() => {
    const handleStateChanged = (event: CustomEvent<SharedStateSnapshot>) => {
      setSnapshot(event.detail);
    };

    window.addEventListener(STATE_CHANGED_EVENT, handleStateChanged as EventListener);
    return () => window.removeEventListener(STATE_CHANGED_EVENT, handleStateChanged as EventListener);
  }, []);

  return (
    <div style={{ padding: '1rem', background: '#fde8e8', borderRadius: '6px' }}>
      <h3>Loans Management Widget</h3>
      <p>
        <strong>Total Outstanding:</strong> ${totalOutstanding.toFixed(2)}
      </p>
      <p>
        <strong>Monthly EMI:</strong> ${monthlyEMI.toFixed(2)}
      </p>
      <p>
        <strong>Core Banking Balance:</strong> ${coreBankingBalance.toFixed(2)}
      </p>
      {nextPaymentDue ? (
        <p>
          <strong>Next Payment Due:</strong> {new Date(nextPaymentDue).toLocaleDateString()}
        </p>
      ) : null}
      <h4>Active Loans:</h4>
      <ul style={{ marginTop: '0.4rem', paddingLeft: '1rem', fontSize: '0.9rem' }}>
        {loans.map((loan) => (
          <li key={loan.id}>
            <strong>{loan.loanType}</strong> - Outstanding: ${loan.outstandingBalance.toFixed(2)} | EMI: $
            {loan.emi.toFixed(2)} | Interest: {loan.interestRate}% | Progress: {loan.paidMonths}/{loan.tenureMonths}
            months
          </li>
        ))}
      </ul>
      <p style={{ color: '#52606d', marginTop: '0.6rem' }}>
        Loan repayments are initiated from Core Banking. This widget updates automatically when funds are moved here.
      </p>
    </div>
  );
}

export default App;
