import { importShared } from './__federation_fn_import-BMdLx5XD.js';
import { r as reactExports } from './index-Dm_EQZZA.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;

{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}

var jsxRuntimeExports = jsxRuntime.exports;

const {useEffect,useState} = await importShared('react');

const SHARED_STATE_KEY = "core-banking-system-shared-state";
const STATE_CHANGED_EVENT = "core-banking-system:state-changed";
function getInitialSnapshot() {
  try {
    const serializedState = window.localStorage.getItem(SHARED_STATE_KEY);
    return serializedState ? JSON.parse(serializedState) : null;
  } catch {
    return null;
  }
}
function getFallbackLoans() {
  return [
    {
      id: "loan-001",
      loanType: "Business Loan",
      principal: 5e5,
      outstandingBalance: 385e3,
      interestRate: 8.5,
      emi: 12500,
      paidMonths: 10,
      tenureMonths: 60
    },
    {
      id: "loan-002",
      loanType: "Working Capital Loan",
      principal: 25e4,
      outstandingBalance: 18e4,
      interestRate: 9.25,
      emi: 6500,
      paidMonths: 12,
      tenureMonths: 48
    }
  ];
}
function App() {
  const [snapshot, setSnapshot] = useState(() => getInitialSnapshot());
  const loans = snapshot?.loans.loans ?? getFallbackLoans();
  const totalOutstanding = snapshot?.loans.totalOutstanding ?? loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const monthlyEMI = snapshot?.loans.monthlyEMI ?? loans.reduce((sum, loan) => sum + loan.emi, 0);
  const coreBankingBalance = snapshot?.banking.availableBalance ?? 128450.75;
  const nextPaymentDue = snapshot?.loans.nextPaymentDue;
  useEffect(() => {
    const handleStateChanged = (event) => {
      setSnapshot(event.detail);
    };
    window.addEventListener(STATE_CHANGED_EVENT, handleStateChanged);
    return () => window.removeEventListener(STATE_CHANGED_EVENT, handleStateChanged);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1rem", background: "#fde8e8", borderRadius: "6px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Loans Management Widget" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Outstanding:" }),
      " $",
      totalOutstanding.toFixed(2)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Monthly EMI:" }),
      " $",
      monthlyEMI.toFixed(2)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Core Banking Balance:" }),
      " $",
      coreBankingBalance.toFixed(2)
    ] }),
    nextPaymentDue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Next Payment Due:" }),
      " ",
      new Date(nextPaymentDue).toLocaleDateString()
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Active Loans:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { marginTop: "0.4rem", paddingLeft: "1rem", fontSize: "0.9rem" }, children: loans.map((loan) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: loan.loanType }),
      " - Outstanding: $",
      loan.outstandingBalance.toFixed(2),
      " | EMI: $",
      loan.emi.toFixed(2),
      " | Interest: ",
      loan.interestRate,
      "% | Progress: ",
      loan.paidMonths,
      "/",
      loan.tenureMonths,
      "months"
    ] }, loan.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#52606d", marginTop: "0.6rem" }, children: "Loan repayments are initiated from Core Banking. This widget updates automatically when funds are moved here." })
  ] });
}

export { App as default, jsxRuntimeExports as j };
