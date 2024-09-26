// ** Toolkit imports
import { configureStore } from "@reduxjs/toolkit";

// ** Reducers
import entity from "./plv2/entity";
import businessDomain from "./plv2/businessDomain";
import openingBalance from "./plv2/openingBalance";
import cashReceiptData from "./plv2/cashReceipt";
import accountReceivedData from "./plv2/accountReceivableOthers";
import cashDisbursementData from "./plv2/cashDisbursement";
import accountPayableData from "./plv2/accountPayableData";
import chartsOfAccountsData from "./plv2/chartsOfAccounts";
import coaCategory from "./plv2/coaCategory";
import coa from "./plv2/coa";
import prepaidExpenses from "./plv2/prepaidExpenses";
import prepaidExpenseTransaction from "./plv2/prepaidExpenseTransactions";
import termDebts from "./plv2/termDebts";
import termDebtTransaction from "./plv2/termDebtTransactions";
import termDebtTransactionTotal from "./plv2/termDebtTransactionsTotal";
import fixedAssets from "./plv2/fixedAsset";
import fixedAssetTransactions from "./plv2/fixedAssetTransactions";
import fixedAssetTransactionsTotal from "./plv2/fixedAssetTransactionsTotal";
import dashboardChartSlice from "./plv2/dashboardChart";

import fixedAssetStraightLinePool from "./plv2/fixedAssetStraightLinePool";
import fixedAssetDecliningPool from "./plv2/fixedAssetDecliningPool";
import backlog from "./plv2/backlogFrontlog/backlog";
import frontlog from "./plv2/backlogFrontlog/frontlog";
import BlFlTotalSummary from "./plv2/backlogFrontlog/totalSummary";
import fixedAssetStraightLinePoolTransactions from "./plv2/fixedAssetStraightLinePoolTransactions";
import fixedAssetDecliningBalancePoolTransactions from "./plv2/fixedAssetDecliningBalancePoolTransactions";
import fixedAssetDecliningBalancePoolTransactionsTotal from "./plv2/fixedAssetDecliningBalancePoolTransactionsTotal";
import fixedAssetStraightLinePoolTransactionsTotal from "./plv2/fixedAssetStraightLinePoolTransactionsTotal";
import imTemplate from "./plv2/imTemplate";
import imVersionClone from "./plv2/imVersionClone";
export const store = configureStore({
  reducer: {
    businessDomain,
    entity,
    openingBalance,
    cashReceiptData,
    accountReceivedData,
    cashDisbursementData,
    accountPayableData,
    chartsOfAccountsData,
    coaCategory,
    coa,
    prepaidExpenses,
    prepaidExpenseTransaction,
    termDebts,
    termDebtTransaction,
    termDebtTransactionTotal,
    fixedAssets,
    fixedAssetTransactions,
    fixedAssetTransactionsTotal,
    fixedAssetStraightLinePool,
    fixedAssetStraightLinePoolTransactions,
    fixedAssetStraightLinePoolTransactionsTotal,
    fixedAssetDecliningPool,
    fixedAssetDecliningBalancePoolTransactions,
    fixedAssetDecliningBalancePoolTransactionsTotal,
    backlog,
    BlFlTotalSummary,
    frontlog,
    imTemplate,
    imVersionClone,
    dashboardChartSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
