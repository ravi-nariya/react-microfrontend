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
const TRANSFER_REQUEST_EVENT = "core-banking-system:transfer-request";
function getInitialSnapshot() {
  try {
    const serializedState = window.localStorage.getItem(SHARED_STATE_KEY);
    return serializedState ? JSON.parse(serializedState) : null;
  } catch {
    return null;
  }
}
function getFallbackPortfolio() {
  return [
    {
      id: "inv-001",
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 25,
      unitPrice: 175.45,
      totalValue: 4386.25,
      gainLoss: 486.25,
      gainLossPercent: 12.4
    },
    {
      id: "inv-002",
      symbol: "MSFT",
      name: "Microsoft Corporation",
      quantity: 15,
      unitPrice: 380.25,
      totalValue: 5703.75,
      gainLoss: 703.75,
      gainLossPercent: 14.1
    },
    {
      id: "inv-003",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      quantity: 10,
      unitPrice: 140.5,
      totalValue: 1405,
      gainLoss: 155,
      gainLossPercent: 12.4
    }
  ];
}
function App() {
  const [snapshot, setSnapshot] = useState(() => getInitialSnapshot());
  const [transferAmount, setTransferAmount] = useState("");
  const portfolio = snapshot?.investments.portfolio ?? getFallbackPortfolio();
  const totalValue = snapshot?.investments.totalPortfolioValue ?? portfolio.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalGainLoss = snapshot?.investments.totalGainLoss ?? portfolio.reduce((sum, inv) => sum + inv.gainLoss, 0);
  const cashAvailable = snapshot?.investments.cashAvailable ?? 25e3;
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
          source: "investments",
          destination: "banking",
          amount: parsedAmount
        }
      })
    );
    setTransferAmount("");
  };
  useEffect(() => {
    const handleStateChanged = (event) => {
      setSnapshot(event.detail);
    };
    window.addEventListener(STATE_CHANGED_EVENT, handleStateChanged);
    return () => window.removeEventListener(STATE_CHANGED_EVENT, handleStateChanged);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1rem", background: "#e8f4e8", borderRadius: "6px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Investments Portfolio Widget" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: "0.4rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Portfolio Value:" }),
      " $",
      totalValue.toFixed(2)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: totalGainLoss >= 0 ? "#28a745" : "#dc3545" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Gain/Loss:" }),
      " $",
      totalGainLoss.toFixed(2),
      " (",
      totalGainLoss >= 0 ? "+" : "",
      (totalGainLoss / (totalValue - totalGainLoss) * 100).toFixed(2),
      "%)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cash Available:" }),
      " $",
      cashAvailable.toFixed(2)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Core Banking Balance:" }),
      " $",
      bankingBalance.toFixed(2)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Holdings:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { marginTop: "0.4rem", paddingLeft: "1rem", fontSize: "0.9rem" }, children: portfolio.map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      inv.symbol,
      " (",
      inv.quantity,
      "x @ $",
      inv.unitPrice.toFixed(2),
      ") - $",
      inv.totalValue.toFixed(2),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: inv.gainLoss >= 0 ? "#28a745" : "#dc3545" }, children: [
        inv.gainLoss >= 0 ? "+" : "",
        inv.gainLoss.toFixed(2),
        " (",
        inv.gainLossPercent.toFixed(1),
        "%)"
      ] })
    ] }, inv.symbol)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "0.6rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          value: transferAmount,
          onChange: (e) => setTransferAmount(e.target.value),
          placeholder: "Amount to transfer to banking",
          style: { padding: "0.4rem", marginRight: "0.5rem", width: "200px" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleTransferToBanking,
          style: { padding: "0.4rem 0.8rem" },
          disabled: isTransferInFlight,
          children: isTransferInFlight ? "Syncing..." : "Transfer to Core Banking"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#52606d", marginTop: "0.6rem" }, children: "Transfers initiated here settle in the shared host store and update core banking instantly." })
  ] });
}

export { App as default, jsxRuntimeExports as j };
