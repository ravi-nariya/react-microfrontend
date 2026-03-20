import { Suspense, lazy } from 'react';
import { CrossAppSyncBridge } from './app/bridge/CrossAppSyncBridge';
import { BankingPanel } from './features/banking/ui/BankingPanel';

// Lazily load remote components via Module Federation
const InvestmentsApp = lazy(() => import('investments/App'));
const LoansApp = lazy(() => import('loans/App'));

function App() {
  return (
    <main className="shell">
      <CrossAppSyncBridge />
      <header className="shell-header">
        <h1>Core Banking System</h1>
        <p>Core Banking System owns real-time liquidity and risk state using Redux Toolkit, Saga, and Persist.</p>
      </header>

      <BankingPanel />

      <section className="card">
        <h2>Investments Console</h2>
        <Suspense fallback={<p>Loading Investments Console...</p>}>
          <InvestmentsApp />
        </Suspense>
      </section>

      <section className="card">
        <h2>Loans Console</h2>
        <Suspense fallback={<p>Loading Loans Console...</p>}>
          <LoansApp />
        </Suspense>
      </section>
    </main>
  );
}

export default App;
