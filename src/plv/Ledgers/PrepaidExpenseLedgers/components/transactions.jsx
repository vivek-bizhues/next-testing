import * as React from "react";
import { useEffect, useState } from "react";
import { ReactGrid } from "@silevis/reactgrid";
import {
  getDateRangeInMonths,
  parseDate,
} from "../../../../utils/get-daterange";
import { getCurrentEntity } from "../../../../helpers/entitiyHelpers";

import {
  rightBorder,
  nonEditable,
  textCell,
  numberCell,
  hideZero,
  noSideBorders,
  headerCell,
} from "../../../../views/components/reactGrid/cells";

import { format } from "date-fns";

import "@silevis/reactgrid/styles.css";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import Icon from "../../../../components/icon";

export default function PrepaidExpenseLedgerView(props) {
  const ROW_HEIGHT = 32;
  const activeEntity = getCurrentEntity();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const preparePrepaidExpenseLedgerData = (prepaidExpensesTransactionsData) => {
    let minDate = new Date(activeEntity.end_date);
    let maxDate = new Date(activeEntity.end_date);

    prepaidExpensesTransactionsData.forEach((item) => {
      item.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);

        if (minDate === null || date < minDate) {
          minDate = date;
        }
        if (maxDate === null || date > maxDate) {
          maxDate = date;
        }
      });
    });

    const modifiedStartDate = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate()
    );
    const modifiedEndDate = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate()
    );

    const prepaidExpenseLedgerDateRange = getDateRangeInMonths(
      minDate,
      maxDate,
      "yyyy-MM-01"
    );
    const prepaidExpenseLedgerDateRangeFormatted = getDateRangeInMonths(
      modifiedStartDate,
      modifiedEndDate,
      "MMM yyyy"
    );

    const dataObject = prepaidExpenseLedgerDateRange.map((date, index) => {
      const formattedDate = prepaidExpenseLedgerDateRangeFormatted[index];
      const entry = {
        date,
        formattedDate,
      };

      prepaidExpensesTransactionsData.forEach((transaction) => {
        const { id, transactions } = transaction;

        const matchingTransaction = transactions.find((t) => t.date === date);

        entry[formattedDate + id] = {
          prepaid_balance: matchingTransaction
            ? matchingTransaction.prepaid_balance
            : 0,
          expense_amount: matchingTransaction
            ? matchingTransaction.expense_amount
            : 0,
          invoice_amount: matchingTransaction
            ? matchingTransaction.invoice_amount
            : 0,
        };
      });

      return entry;
    });
    return dataObject;
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const getColumns = (prepaidExpensesTransactionsData) => {
    const columns = [];

    columns.push({ columnId: "month", width: 100 });
    columns.push({
      columnId: "prepaid_balance_row_total",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "expense_amount_row_total",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "invoice_amount_row_total",
      width: 120,
      resizable: true,
    });

    prepaidExpensesTransactionsData.forEach((ppel) => {
      if (ppel) {
        columns.push({ columnId: "prepaid_balance_" + ppel.id, width: 110 });
        columns.push({ columnId: "expense_amount_" + ppel.id, width: 110 });
        columns.push({ columnId: "invoice_amount_" + ppel.id, width: 110 });
      }
    });

    return columns;
  };

  const getHeaderCells = (prepaidExpensesTransactionsData) => {
    const headerCells = [];
    headerCells.push(nonEditable(headerCell("Date", "justify-content-end")));
    headerCells.push(nonEditable(headerCell("Balance", "justify-content-end")));
    headerCells.push(nonEditable(headerCell("Expense	", "justify-content-end")));
    headerCells.push(
      nonEditable(headerCell("Purchases", "justify-content-end"))
    );

    prepaidExpensesTransactionsData.map((ppel) => {
      headerCells.push(
        nonEditable(
          headerCell("Prepaid Balance", "justify-content-center " + ppel.id)
        )
      );
      headerCells.push(
        nonEditable(headerCell("Expense", "justify-content-center" + ppel.id))
      );
      headerCells.push(
        nonEditable(
          rightBorder(
            headerCell("Invoice Amount", "justify-content-center" + ppel.id)
          )
        )
      );
    });

    return headerCells;
  };

  const headerRow = {
    rowId: "header",
    height: ROW_HEIGHT,
    cells: getHeaderCells(props.ledgerData),
  };

  const getPrepaidExpenseHeaderRows = (prepaidExpensesTransactionsData) => {
    const headerTitleCells = [];
    const headerPPEPurchaseDateCells = [];
    const headerPPEPurchaseAmountCells = [];
    const headerPPEMonthsCoveredCells = [];
    const headerPPEMontlyExpenseCells = [];

    headerTitleCells.push(
      rightBorder(
        headerCell("Totals", "justify-content-center font-bold", 4, 5)
      )
    );
    headerTitleCells.push(headerCell("", "justify-content-center"));
    headerTitleCells.push(headerCell("", "justify-content-center"));
    headerTitleCells.push(headerCell("", "justify-content-center"));

    Array.from({ length: 4 }, (_, index) => {
      headerPPEPurchaseDateCells.push(
        rightBorder(
          noSideBorders(
            headerCell(
              "",
              "justify-content-center font-bold",
              index === 0 ? 4 : 0
            )
          )
        )
      );
      headerPPEPurchaseAmountCells.push(
        headerCell("", "justify-content-center", index === 0 ? 4 : 0)
      );
      headerPPEMonthsCoveredCells.push(
        headerCell("", "justify-content-center", index === 0 ? 4 : 0)
      );
      headerPPEMontlyExpenseCells.push(
        headerCell("", "justify-content-center", index === 0 ? 4 : 0)
      );
    });

    prepaidExpensesTransactionsData.map((ppel) => {
      headerTitleCells.push(
        rightBorder(
          headerCell(ppel.title, "justify-content-center font-bold", 3)
        )
      );
      headerTitleCells.push(headerCell("", "justify-content-center"));
      headerTitleCells.push(headerCell("", "justify-content-center"));

      headerPPEPurchaseDateCells.push(
        rightBorder(
          headerCell(
            "Purchase Date: " +
              format(
                new Date(
                  parseDate(
                    new Date(ppel.purchase_date).toISOString().split("T")[0]
                  )
                ),
                "MMM yyyy"
              ),
            "justify-content-center font-bold",
            3
          )
        )
      );
      headerPPEPurchaseDateCells.push(headerCell("", "justify-content-center"));
      headerPPEPurchaseDateCells.push(headerCell("", "justify-content-center"));

      headerPPEPurchaseAmountCells.push(
        rightBorder(
          headerCell(
            "Purchase Amount: " + formatNumber(ppel.purchase_amount),
            "justify-content-center font-bold",
            3
          )
        )
      );
      headerPPEPurchaseAmountCells.push(
        headerCell("", "justify-content-center")
      );
      headerPPEPurchaseAmountCells.push(
        headerCell("", "justify-content-center")
      );

      // headerPPEMonthsCoveredCells
      headerPPEMonthsCoveredCells.push(
        rightBorder(
          headerCell(
            "Months Covered: " +
              ppel.months_covered.toString() +
              " month" +
              (ppel.months_covered > 1 ? "s" : ""),
            "justify-content-center font-bold",
            3
          )
        )
      );
      headerPPEMonthsCoveredCells.push(
        headerCell("", "justify-content-center")
      );
      headerPPEMonthsCoveredCells.push(
        headerCell("", "justify-content-center")
      );

      // headerPPEMontlyExpenseCells
      headerPPEMontlyExpenseCells.push(
        rightBorder(
          headerCell(
            "Monthly Expense: " + formatNumber(ppel.monthly_expense),
            "justify-content-center font-bold",
            3
          )
        )
      );
      headerPPEMontlyExpenseCells.push(
        headerCell("", "justify-content-center")
      );
      headerPPEMontlyExpenseCells.push(
        headerCell("", "justify-content-center")
      );
    });

    const headers = [
      {
        rowId: "headerTitleRow",
        height: ROW_HEIGHT,
        cells: headerTitleCells,
      },
      {
        rowId: "headerPPEPurchaseDateRow",
        height: ROW_HEIGHT,
        cells: headerPPEPurchaseDateCells,
      },
      {
        rowId: "headerPPEPurchaseAmountRow",
        height: ROW_HEIGHT,
        cells: headerPPEPurchaseAmountCells,
      },
      {
        rowId: "headerPPEMonthsCoveredRow",
        height: ROW_HEIGHT,
        cells: headerPPEMonthsCoveredCells,
      },
      {
        rowId: "headerPPEMontlyExpenseRow",
        height: ROW_HEIGHT,
        cells: headerPPEMontlyExpenseCells,
      },
    ];

    return headers;
  };

  const getRowCells = (tr) => {
    const rowCells = [];
    rowCells.push(
      nonEditable(
        textCell(tr.formattedDate, "padding-left-lg font-bold text-md")
      )
    );

    let prepaid_balance_row_total = 0;
    let expense_amount_row_total = 0;
    let invoice_amount_row_total = 0;
    Object.keys(tr).map((key) => {
      {
        if (key !== "date" && key !== "formattedDate") {
          const d = tr[key];

          prepaid_balance_row_total += Number(d.prepaid_balance);
          expense_amount_row_total += Number(d.expense_amount);
          invoice_amount_row_total += Number(d.invoice_amount);
          rowCells.push(
            nonEditable(
              hideZero(numberCell(d.prepaid_balance, "padding-left-lg"))
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(numberCell(Number(d.expense_amount), "padding-left-lg"))
            )
          );
          rowCells.push(
            nonEditable(
              rightBorder(
                hideZero(
                  numberCell(Number(d.invoice_amount), "padding-left-lg")
                )
              )
            )
          );
        }
      }
    });

    rowCells.splice(
      1,
      0,
      nonEditable(
        rightBorder(
          hideZero(
            numberCell(Number(invoice_amount_row_total), "padding-left-lg")
          )
        )
      )
    );

    rowCells.splice(
      1,
      0,
      nonEditable(
        hideZero(
          numberCell(Number(expense_amount_row_total), "padding-left-lg")
        )
      )
    );

    rowCells.splice(
      1,
      0,
      nonEditable(
        hideZero(numberCell(prepaid_balance_row_total, "padding-left-lg"))
      )
    );

    return rowCells;
  };

  const getRows = (ledgerRowData) => {
    const prepaidExpenseHeaderRows = getPrepaidExpenseHeaderRows(
      props.ledgerData
    );

    return [
      prepaidExpenseHeaderRows[0],
      prepaidExpenseHeaderRows[1],
      prepaidExpenseHeaderRows[2],
      prepaidExpenseHeaderRows[3],
      prepaidExpenseHeaderRows[4],
      headerRow,
      ...ledgerRowData.map((lrd) => ({
        rowId: lrd.date.toString(),
        cells: getRowCells(lrd),
      })),
    ];
  };

  useEffect(() => {
    if (props.show) {
      const prepaidExpenseLedgerData = preparePrepaidExpenseLedgerData(
        props.ledgerData
      );

      setColumns(getColumns(props.ledgerData));
      setRows(getRows(prepaidExpenseLedgerData));
    }
  }, [props.show]);

  return (
    <Dialog fullScreen open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>
        Prepaid Expense Ledger View
        <IconButton
          aria-label="close"
          onClick={props.handleOnClose}
          sx={{ top: 8, right: 10, position: "absolute", color: "grey.500" }}
        >
          <Icon icon="mdi:close" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid item xs={12}>
          <div className="plv2_rg">
            <ReactGrid
              rows={rows}
              columns={columns}
              stickyLeftColumns={4}
              stickyTopRows={6}
              enableRowSelection={true}
              enableColumnSelection={true}
              enableRangeSelection={true}
            />
          </div>
        </Grid>
        <Grid container spacing={5}></Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleOnClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
