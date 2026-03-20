import { useEffect, useState } from 'react';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface SharedStateSnapshot {
  banking: {
    availableBalance: number;
    transferInFlight: boolean;
    lastSyncTime: string;
  };
  investments: {
    portfolio: Investment[];
    totalPortfolioValue: number;
    cashAvailable: number;
    totalGainLoss: number;
    lastSyncTime: string;
  };
}

const SHARED_STATE_KEY = 'core-banking-system-shared-state';
const STATE_CHANGED_EVENT = 'core-banking-system:state-changed';
const TRANSFER_REQUEST_EVENT = 'core-banking-system:transfer-request';

function getInitialSnapshot(): SharedStateSnapshot | null {
  try {
    const serializedState = window.localStorage.getItem(SHARED_STATE_KEY);
    return serializedState ? (JSON.parse(serializedState) as SharedStateSnapshot) : null;
  } catch {
    return null;
  }
}

function getFallbackPortfolio(): Investment[] {
  return [
    {
      id: 'inv-001',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 25,
      unitPrice: 175.45,
      totalValue: 4386.25,
      gainLoss: 486.25,
      gainLossPercent: 12.4,
    },
    {
      id: 'inv-002',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 15,
      unitPrice: 380.25,
      totalValue: 5703.75,
      gainLoss: 703.75,
      gainLossPercent: 14.1,
    },
    {
      id: 'inv-003',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 10,
      unitPrice: 140.5,
      totalValue: 1405,
      gainLoss: 155,
      gainLossPercent: 12.4,
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
  const [transferAmount, setTransferAmount] = useState('');

  const portfolio = snapshot?.investments.portfolio ?? getFallbackPortfolio();
  const totalValue = snapshot?.investments.totalPortfolioValue ?? portfolio.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalGainLoss = snapshot?.investments.totalGainLoss ?? portfolio.reduce((sum, inv) => sum + inv.gainLoss, 0);
  const cashAvailable = snapshot?.investments.cashAvailable ?? 25000;
  const bankingBalance = snapshot?.banking.availableBalance ?? 128450.75;
  const isTransferInFlight = snapshot?.banking.transferInFlight ?? false;

  const handleTransferToBanking = () => {
    const parsedAmount = Number(transferAmount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > cashAvailable) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(TRANSFER_REQUEST_EVENT, {
        detail: {
          source: 'investments',
          destination: 'banking',
          amount: parsedAmount,
        },
      })
    );

    setTransferAmount('');
  };

  useEffect(() => {
    const handleStateChanged = (event: CustomEvent<SharedStateSnapshot>) => {
      setSnapshot(event.detail);
    };

    window.addEventListener(STATE_CHANGED_EVENT, handleStateChanged as EventListener);
    return () => window.removeEventListener(STATE_CHANGED_EVENT, handleStateChanged as EventListener);
  }, []);

  return (
    <div style={{ padding: '1rem', background: '#e8f4e8', borderRadius: '6px' }}>
      <h3>Investments Portfolio Widget</h3>
      <p style={{ marginTop: '0.4rem' }}>
        <strong>Total Portfolio Value:</strong> ${totalValue.toFixed(2)}
      </p>
      <p style={{ color: totalGainLoss >= 0 ? '#28a745' : '#dc3545' }}>
        <strong>Total Gain/Loss:</strong> ${totalGainLoss.toFixed(2)} ({totalGainLoss >= 0 ? '+' : ''}
        {((totalGainLoss / (totalValue - totalGainLoss)) * 100).toFixed(2)}%)
      </p>
      <p>
        <strong>Cash Available:</strong> ${cashAvailable.toFixed(2)}
      </p>
      <p>
        <strong>Core Banking Balance:</strong> ${bankingBalance.toFixed(2)}
      </p>
      <h4>Holdings:</h4>
      <ul style={{ marginTop: '0.4rem', paddingLeft: '1rem', fontSize: '0.9rem' }}>
        {portfolio.map((inv) => (
          <li key={inv.symbol}>
            {inv.symbol} ({inv.quantity}x @ ${inv.unitPrice.toFixed(2)}) - ${inv.totalValue.toFixed(2)}{' '}
            <span style={{ color: inv.gainLoss >= 0 ? '#28a745' : '#dc3545' }}>
              {inv.gainLoss >= 0 ? '+' : ''}
              {inv.gainLoss.toFixed(2)} ({inv.gainLossPercent.toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '0.6rem' }}>
        <input
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="Amount to transfer to banking"
          style={{ padding: '0.4rem', marginRight: '0.5rem', width: '200px' }}
        />
        <button
          onClick={handleTransferToBanking}
          style={{ padding: '0.4rem 0.8rem' }}
          disabled={isTransferInFlight}
        >
          {isTransferInFlight ? 'Syncing...' : 'Transfer to Core Banking'}
        </button>
      </div>
      <p style={{ color: '#52606d', marginTop: '0.6rem' }}>
        Transfers initiated here settle in the shared host store and update core banking instantly.
      </p>
    </div>
  );
}

export default App;
