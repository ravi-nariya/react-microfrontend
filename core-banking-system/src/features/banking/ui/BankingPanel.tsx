import { FormEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks.ts';
import { selectBanking, selectBankingEvents } from '../model/bankingSelectors';
import { selectCashAvailable } from '../../investments/model/investmentsSelectors';
import { selectLoans, selectTotalOutstanding } from '../../loans/model/loansSelectors';
import { internalTransferRequested } from '../../transfers/model/transferActions';

export function BankingPanel() {
  const dispatch = useAppDispatch();
  const banking = useAppSelector(selectBanking);
  const events = useAppSelector(selectBankingEvents);
  const investmentCash = useAppSelector(selectCashAvailable);
  const loans = useAppSelector(selectLoans);
  const totalOutstanding = useAppSelector(selectTotalOutstanding);

  const [destination, setDestination] = useState<'investments' | string>('investments');
  const [amount, setAmount] = useState('850');

  const submitTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const isLoanDestination = destination.startsWith('loan:');

    dispatch(
      internalTransferRequested({
        source: 'banking',
        destination: isLoanDestination ? 'loans' : 'investments',
        amount: parsedAmount,
        loanId: isLoanDestination ? destination.replace('loan:', '') : undefined,
      })
    );

    setAmount('');
  };

  return (
    <section className="card">
      <h2>Banking Control Tower (Real-Time)</h2>
      <div className="kpis">
        <div className="kpi">
          <span>Available Balance</span>
          <strong>${banking.availableBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
        </div>
        <div className="kpi">
          <span>Risk Score</span>
          <strong>{banking.riskScore}</strong>
        </div>
        <div className="kpi">
          <span>Liquidity Index</span>
          <strong>{banking.liquidityIndex}</strong>
        </div>
        <div className="kpi">
          <span>Investment Cash</span>
          <strong>${investmentCash.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
        </div>
        <div className="kpi">
          <span>Loan Outstanding</span>
          <strong>${totalOutstanding.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <form className="transfer-form" onSubmit={submitTransfer}>
        <select value={destination} onChange={(e) => setDestination(e.target.value)}>
          <option value="investments">Investments cash wallet</option>
          {loans.map((loan) => (
            <option key={loan.id} value={`loan:${loan.id}`}>
              {loan.loanType} repayment
            </option>
          ))}
        </select>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Transfer amount"
          type="number"
          min="1"
          step="0.01"
        />
        <button type="submit" disabled={banking.transferInFlight}>
          {banking.transferInFlight ? 'Processing...' : 'Move Balance'}
        </button>
      </form>

      <p className="hint">
        Core banking can fund investments and repay loans. Investments can send balance back to core banking.
      </p>
      <p className="hint">Last Core Banking sync: {new Date(banking.lastSyncTime).toLocaleTimeString()}</p>

      <ul className="event-list">
        {events.map((entry) => (
          <li key={entry.id}>
            <span className={`badge badge-${entry.type}`}>{entry.type.toUpperCase()}</span>
            <span>{entry.description}</span>
            <strong>
              {entry.amount > 0
                ? `$${entry.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : '-'}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
