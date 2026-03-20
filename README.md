# react-mfa-app

A production-grade **React Microfrontend (MFA)** application built with **Vite Module Federation**, demonstrating a real-time enterprise banking platform composed of three independently deployable micro-applications that share live state without a shared runtime bundle.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Applications](#applications)
  - [Core Banking System (Host)](#core-banking-system-host)
  - [Investments Console (Remote)](#investments-console-remote)
  - [Loans Console (Remote)](#loans-console-remote)
- [State Management](#state-management)
- [Cross-App Communication](#cross-app-communication)
- [Module Federation Configuration](#module-federation-configuration)
- [Transfer Workflows](#transfer-workflows)
- [Redux Saga Pipelines](#redux-saga-pipelines)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Port Reference](#port-reference)

---

## Overview

`react-mfa-app` is a microfrontend banking shell that coordinates three separate React applications running on different ports into a single cohesive UI. The host application (`core-banking-system`) owns all shared Redux state and exposes it to remote micro-apps (`investments-console` and `loans-console`) via a dual-channel bridge: **`localStorage`** for bootstrapping and **`CustomEvent`** for real-time push updates.

Key capabilities demonstrated:

- **Live balance synchronization** across banking, investments, and loans panels
- **Real-time risk & liquidity metrics** updated every 3 seconds via a saga polling loop
- **Cross-app fund transfers** with validation, saga middleware, and optimistic UI states
- **State persistence** across page refreshes using `redux-persist`
- **Zero shared runtime overhead** — remotes share only `react` and `react-dom` via Vite federation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser (Single Page)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Core Banking System  :3000  (HOST)          │  │
│  │                                                        │  │
│  │  ┌────────────────┐   ┌──────────────────────────┐   │  │
│  │  │  Redux Store   │   │   CrossAppSyncBridge      │   │  │
│  │  │  (RTK + Saga   │◄──│  (localStorage + events) │   │  │
│  │  │   + Persist)   │   └──────────────────────────┘   │  │
│  │  └───────┬────────┘                                   │  │
│  │          │ Lazy (Module Federation)                   │  │
│  │   ┌──────▼──────────────────────────────────────┐    │  │
│  │   │                                             │    │  │
│  │  ┌┴──────────────┐         ┌──────────────────┐│    │  │
│  │  │  Investments   │         │  Loans Console   ││    │  │
│  │  │  Console :3002 │         │      :3001       ││    │  │
│  │  │  (REMOTE)      │         │     (REMOTE)     ││    │  │
│  │  └───────────────┘         └──────────────────┘│    │  │
│  │                                                 ┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Each remote is a **standalone Vite application** that builds its own `remoteEntry.js`. The host consumes them via dynamic `import()` wrapped in `React.Suspense`. Remotes have no knowledge of Redux — they read state from `localStorage` and push actions back to the host via `CustomEvent`.

---

## Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Module Federation | `@originjs/vite-plugin-federation` |
| State Management | Redux Toolkit 2 |
| Async Middleware | Redux Saga |
| State Persistence | Redux Persist |
| React-Redux Bindings | React Redux 9 |
| Concurrent Dev Orchestration | `concurrently` |

---

## Project Structure

```
react-mfa-app/
├── package.json                        # Workspace root — npm workspaces + dev orchestration
│
├── core-banking-system/               # HOST app — owns Redux store, runs on :3000
│   ├── vite.config.ts                 # Federation host config (consumes loans, investments)
│   ├── package.json
│   └── src/
│       ├── main.tsx                   # React root — wraps app in StoreProvider
│       ├── App.tsx                    # Shell layout — lazy-loads remote widgets
│       ├── index.css                  # Global shell styles
│       ├── remotes.d.ts               # TypeScript declarations for federated remotes
│       │
│       └── app/
│           ├── bridge/
│           │   └── CrossAppSyncBridge.tsx   # Publishes state to localStorage + CustomEvents
│           ├── providers/
│           │   └── StoreProvider.tsx        # Redux Provider + PersistGate wrapper
│           └── store/
│               ├── store.ts                 # configureStore + persistReducer + sagaMiddleware
│               ├── rootReducer.ts           # combineReducers (banking + investments + loans)
│               ├── rootSaga.ts              # Forks all saga watchers
│               └── hooks.ts                 # useAppDispatch / useAppSelector typed hooks
│
│       └── features/
│           ├── banking/
│           │   ├── model/
│           │   │   ├── bankingSlice.ts      # Account balance, risk score, liquidity, events
│           │   │   ├── bankingSaga.ts       # Transfer saga + real-time tick (every 3s)
│           │   │   └── bankingSelectors.ts  # selectBanking, selectBankingEvents
│           │   └── ui/
│           │       └── BankingPanel.tsx     # KPIs + transfer form + event log
│           │
│           ├── investments/
│           │   └── model/
│           │       ├── investmentsSlice.ts  # Portfolio holdings + cash wallet
│           │       └── investmentsSelectors.ts
│           │
│           ├── loans/
│           │   └── model/
│           │       ├── loansSlice.ts        # Loan records + outstanding + EMI
│           │       └── loansSelectors.ts
│           │
│           └── transfers/
│               └── model/
│                   └── transferActions.ts   # Shared cross-feature action creators
│
├── investments-console/               # REMOTE app — portfolio widget, runs on :3002
│   ├── vite.config.ts                 # Exposes ./App via remoteEntry.js
│   └── src/
│       ├── main.tsx
│       └── App.tsx                    # Portfolio table + cash transfer to banking
│
└── loans-console/                     # REMOTE app — loans widget, runs on :3001
    ├── vite.config.ts                 # Exposes ./App via remoteEntry.js
    └── src/
        ├── main.tsx
        └── App.tsx                    # Loan list + outstanding + EMI summary
```

---

## Applications

### Core Banking System (Host)

**Port:** `3000` | **Role:** Federation Host

The central banking shell. It owns the entire Redux store for all three domains (banking, investments, and loans) and renders the other two micro-apps as lazy-loaded federated components.

**Features:**
- **Banking Control Tower** — displays available balance, ledger balance, risk score, and liquidity index
- **Transfer Form** — move funds from core banking to the investments cash wallet or directly repay any active loan
- **Real-time event log** — shows the last 6 credit/debit/alert events with badges
- **Risk & Liquidity ticker** — saga updates risk score and liquidity index every 3 seconds with randomized values within realistic bands
- **Embedded remote widgets** — `InvestmentsApp` and `LoansApp` rendered inside `<Suspense>` boundaries with loading fallbacks

**Initial seed data:**
```
Account: Ravi Nariya - Business Current
Available Balance: $128,450.75
Ledger Balance: $130,120.75
Risk Score: 22 (low)
Liquidity Index: 84
```

---

### Investments Console (Remote)

**Port:** `3002` | **Role:** Federation Remote — exposes `investments/App`

A standalone React app that displays the equity portfolio and provides a reverse-transfer UI back to the host. It has **no Redux dependency** — it reads state via `localStorage` on mount and subscribes to `core-banking-system:state-changed` CustomEvents for live updates.

**Features:**
- Portfolio holdings table (symbol, quantity, unit price, total value, gain/loss with colour coding)
- Total portfolio value and aggregate gain/loss
- Cash available wallet (receives transfers from core banking)
- **Transfer to Core Banking** form — dispatches `core-banking-system:transfer-request` CustomEvent back to the host

**Initial portfolio:**
| Symbol | Company | Qty | Unit Price | Total Value | Gain/Loss |
|---|---|---|---|---|---|
| AAPL | Apple Inc. | 25 | $175.45 | $4,386.25 | +$486.25 (+12.4%) |
| MSFT | Microsoft Corporation | 15 | $380.25 | $5,703.75 | +$703.75 (+14.1%) |
| GOOGL | Alphabet Inc. | 10 | $140.50 | $1,405.00 | +$155.00 (+12.4%) |

---

### Loans Console (Remote)

**Port:** `3001` | **Role:** Federation Remote — exposes `loans/App`

A read-only loan summary widget. It renders active loans, outstanding balances, EMI schedules, and payment progress. Loan repayments are **initiated from the Core Banking panel**, not from this widget — the widget updates reactively when funds are moved.

**Features:**
- Active loan list with outstanding balance, interest rate, EMI, and progress (paid/total months)
- Total outstanding and combined monthly EMI
- Core banking balance mirror for financial context
- Next payment due date display

**Initial loan book:**
| Loan | Principal | Outstanding | Rate | EMI | Progress |
|---|---|---|---|---|---|
| Business Loan | $500,000 | $385,000 | 8.5% | $12,500/mo | 10/60 months |
| Working Capital Loan | $250,000 | $180,000 | 9.25% | $6,500/mo | 12/48 months |

---

## State Management

The Redux store lives **exclusively in `core-banking-system`**. Remotes never import from it.

### Store Configuration

```
persistConfig:
  key: 'core-banking-system-root'
  storage: localStorage
  whitelist: ['banking', 'investments', 'loans']   ← all three slices persisted
```

Middleware chain: `redux-persist serializable check` → `redux-saga`

### Slice Summary

## Overview

`react-mfa-app` is a microfrontend banking shell that coordinates three separate React applications running on different ports into a single cohesive UI. The host application (`core-banking-system`) owns all shared Redux state and exposes it to remote micro-apps (`investments-console` and `loans-console`) via a dual-channel bridge: **`localStorage`** for bootstrapping and **`CustomEvent`** for real-time push updates.

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (workspace support required)

## Install

```bash
# From repository root — installs all three workspaces
npm install
```

## Development

```bash
npm run dev
```

This single command:
1. Kills any processes already holding ports 3000–3002
2. Starts `loans-console` and `investments-console` in **build watch** mode
3. Waits for each remote's `dist/remoteEntry.js` to appear, then starts their **preview** server
4. Starts `core-banking-system` in **Vite dev** mode (hot module replacement)

Open **http://localhost:3000** to view the application.

## Build

```bash
npm run build
```

Builds all three apps in dependency order: `loans-console` → `investments-console` → `core-banking-system`.

## Preview

```bash
npm run preview
```

Serves all three built apps concurrently on their respective ports.

## Port Reference

| Application | Port | Role |
|---|---|---|
| Core Banking System | `3000` | Federation Host |
| Loans Console | `3001` | Federation Remote (`loans/App`) |
| Investments Console | `3002` | Federation Remote (`investments/App`) |

### Transfer Guards (Saga Validation)

| Condition | Result |
|---|---|
| `amount <= 0` or `NaN` | `internalTransferFailed` — "amount must be greater than zero" |
| `source === destination` | `internalTransferFailed` — "source and destination cannot be the same" |
| Banking balance insufficient | `internalTransferFailed` — "insufficient core banking balance" |
| Investment cash insufficient | `internalTransferFailed` — "insufficient investment cash balance" |
| Investments → non-banking destination | `internalTransferFailed` — "investments transfers are only supported back to core banking" |
| No active loan found | `internalTransferFailed` — "no active loan is available for payment" |
| Direct banking transfer > $50,000 | `transferFailed` — "requires second-level authorization over 50,000" |

---

## Redux Saga Pipelines

Three saga watchers are forked from `rootSaga`:

| Watcher | Action Watched | Behaviour |
|---|---|---|
| `watchBankingTransferSaga` | `transferRequested` | Simulates direct banking transfer (650ms delay), blocks amounts over $50k |
| `watchInternalTransferSaga` | `internalTransferRequested` | Cross-feature transfer orchestrator (450ms delay), full validation chain |
| `watchBankingRealtimeSaga` | — (infinite loop) | Every 3 seconds: generates new `riskScore` (18–38) and `liquidityIndex` (74–94), dispatches `realtimeTickReceived` |

All watchers use `takeLatest` to automatically cancel in-flight sagas if a new action arrives.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (workspace support required)

### Install

```bash
# From repository root — installs all three workspaces
npm install
```

### Development

```bash
npm run dev
```

This single command:
1. Kills any processes already holding ports 3000–3002
2. Starts `loans-console` and `investments-console` in **build watch** mode
3. Waits for each remote's `dist/remoteEntry.js` to appear, then starts their **preview** server
4. Starts `core-banking-system` in **Vite dev** mode (hot module replacement)

# react-mfa-app

React microfrontend workspace built with Vite Module Federation.

## Apps

- `core-banking-system`: host app on port `3000`
- `loans-console`: remote app on port `3001`
- `investments-console`: remote app on port `3002`

## Tech Stack

- React
- TypeScript
- Vite
- `@originjs/vite-plugin-federation`
- Redux Toolkit
- React Redux
- Redux Saga
- Redux Persist
- npm workspaces

## Project Structure

```text
react-mfa-app/
├── package.json
├── core-banking-system/
├── loans-console/
└── investments-console/
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Install

Run from the repository root:

```bash
npm install
```

## Run In Development

Start the full workspace from the repository root:

```bash
npm run dev
```

This starts:

- the host app in Vite dev mode
- the loans remote on port `3001`
- the investments remote on port `3002`

Open `http://localhost:3000`.

## Build

Build all apps:

```bash
npm run build
```

## Preview

Preview all production builds:

```bash
npm run preview
```

## Useful Workspace Commands

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run dev --workspace=core-banking-system`
- `npm run build --workspace=core-banking-system`
- `npm run build --workspace=loans-console`
- `npm run build:watch --workspace=loans-console`
- `npm run build --workspace=investments-console`
- `npm run build:watch --workspace=investments-console`

## Ports

| App | Port | Role |
|---|---:|---|
| `core-banking-system` | `3000` | host |
| `loans-console` | `3001` | remote |
| `investments-console` | `3002` | remote |

## Notes

- Install dependencies from the repository root so npm workspaces resolve correctly.
- Remotes are exposed through `remoteEntry.js`.
- In local development, the host runs in dev mode while remotes are built and served for federation.
