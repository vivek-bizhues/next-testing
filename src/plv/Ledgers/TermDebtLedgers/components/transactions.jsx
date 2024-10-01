import * as React from "react";
import { useEffect, useState } from "react";
import { ReactGrid } from "@silevis/reactgrid";
import { format } from "date-fns";
import "@silevis/reactgrid/styles.css";
import { useDispatch } from "react-redux";
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
import { updateTermDebtTransactionData } from "../../../../store/plv2/termDebtTransactions";
import { getCurrentEntity } from "../../../../helpers/entitiyHelpers";
import {
  getDateRangeInMonths,
  parseDate,
} from "../../../../utils/get-daterange";
import {
  rightBorder,
  nonEditable,
  textCell,
  numberCell,
  percentCell,
  hideZero,
  noSideBorders,
  headerCell,
} from "../../../../views/components/reactGrid/cells";

export default function TermDebtLedgerView(props) {
  const ROW_HEIGHT = 32;
  const HEADING_ROW_HEIGHT = 70;

  const dispatch = useDispatch();
  const activeEntity = getCurrentEntity();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const prepareTermDebtLedgerData = (termDebtsTransactionsData) => {
    let minDate = new Date(activeEntity.end_date);
    let maxDate = new Date(activeEntity.end_date);

    termDebtsTransactionsData.forEach((item) => {
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

    const termDebtLedgerDateRange = getDateRangeInMonths(
      minDate,
      maxDate,
      "yyyy-MM-01"
    );
    const termDebtLedgerDateRangeFormatted = getDateRangeInMonths(
      modifiedStartDate,
      modifiedEndDate,
      "MMM yyyy"
    );

    const dataObject = termDebtLedgerDateRange.map((date, index) => {
      const formattedDate = termDebtLedgerDateRangeFormatted[index];
      const entry = {
        date: date,
        formattedDate: formattedDate,
      };

      termDebtsTransactionsData.forEach((transaction) => {
        const { id, transactions, balloonpayments } = transaction;

        const matchingTransaction = transactions.find((t) => t.date === date);
        const matchingBalloonPayment = balloonpayments.find(
          (t) => t.ledger_date === date
        );

        entry[formattedDate + id] = {
          closing_principal: matchingTransaction
            ? matchingTransaction.closing_principal
            : 0,
          current_portion: matchingTransaction
            ? matchingTransaction.current_portion
            : 0,
          opening_balance: matchingTransaction
            ? matchingTransaction.opening_balance
            : 0,
          term_dept_interest: matchingTransaction
            ? matchingTransaction.term_dept_interest
            : 0,
          term_dept_monthly_payment: matchingTransaction
            ? matchingTransaction.term_dept_monthly_payment
            : 0,
          term_dept_principal_advance: matchingTransaction
            ? matchingTransaction.term_dept_principal_advance
            : 0,
          term_dept_interest_rate_change: matchingBalloonPayment
            ? matchingBalloonPayment.interest_rate_change / 100
            : 0,
          term_dept_balloonpayment: matchingBalloonPayment
            ? matchingBalloonPayment.balloon_payment
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

  const getColumns = (termDebtsTransactionsData) => {
    const columns = [];

    columns.push({ columnId: "month", width: 100 });
    columns.push({
      columnId: "interest_total",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "payment_total",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "advance_total",
      width: 120,
      resizable: true,
    });

    columns.push({
      columnId: "balloon_payment_total",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "current_portion",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "long_term_portion",
      width: 120,
      resizable: true,
    });

    termDebtsTransactionsData.forEach((tdl) => {
      if (tdl) {
        columns.push({ columnId: "opening_principle__" + tdl.id, width: 110 });
        columns.push({ columnId: "interest__" + tdl.id, width: 110 });
        columns.push({
          columnId: "monthly_payment__" + tdl.id,
          width: 110,
        });
        columns.push({ columnId: "closing_principle__" + tdl.id, width: 110 });
        columns.push({ columnId: "current_portion__" + tdl.id, width: 110 });
        columns.push({ columnId: "principle_advance__" + tdl.id, width: 110 });
        columns.push({
          columnId: "interest_rate_change__" + tdl.id,
          width: 110,
        });
        columns.push({ columnId: "balloon_payment__" + tdl.id, width: 110 });
      }
    });

    return columns;
  };

  const getHeaderCells = (termDebtsTransactionsData) => {
    const headerCells = [];

    headerCells.push(
      nonEditable(rightBorder(headerCell("Date", "justify-content-end ")))
    );
    headerCells.push(
      nonEditable(
        headerCell("Interest on Long Term Debt", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        headerCell("Term Debt Payments	", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        headerCell("Term Debt Advance", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        headerCell("Term Debt Balloon Payments", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(headerCell("Current Portion", "justify-content-end wraptext"))
    );
    headerCells.push(
      nonEditable(
        rightBorder(
          headerCell("Long Term Portion", "justify-content-end wraptext")
        )
      )
    );

    termDebtsTransactionsData.map((tdl) => {
      headerCells.push(
        nonEditable(
          headerCell(
            "Opening Principal",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Term Debt Interest",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Term Debt Monthly Payments",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Closing Principal",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Current Portion",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Term Debt Principal Advance",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Interest Rate Change",
            "justify-content-center wraptext " + tdl.id
          )
        )
      );

      headerCells.push(
        nonEditable(
          rightBorder(
            headerCell(
              "Balloon Payments",
              "justify-content-center wraptext " + tdl.id
            )
          )
        )
      );
    });

    return headerCells;
  };

  const headerRow = {
    rowId: "header",
    height: HEADING_ROW_HEIGHT,
    cells: getHeaderCells(props.ledgerData),
  };

  const getTermDebtHeaderRows = (termDebtsTransactionsData) => {
    const headerTitleCells = [];
    const headerTDStartDateCells = [];
    const headerTDPrinciplleAmountCells = [];
    const headerTDAnnualInterestRateCells = [];
    const headerTDTermsInMonthsCells = [];
    const headerTDMonthlyPaymentCells = [];

    // total cell with colspan (number of attribute for totals ) and rowspan (number of attribute for each term debt)
    headerTitleCells.push(
      rightBorder(headerCell("", "justify-content-center font-bold", 1, 6))
    );

    headerTitleCells.push(
      rightBorder(
        headerCell("Totals", "justify-content-center font-bold", 6, 6)
      )
    );
    // created 6 emtpy  cells for colspan (for adding spacing)
    Array.from({ length: 5 }, () => {
      headerTitleCells.push(headerCell("", "justify-content-center"));
    });

    // populating each header cell array with emtpy cells for the rowspan configured above in headerTitleCells
    Array.from({ length: 7 }, (_, index) => {
      headerTDStartDateCells.push(
        rightBorder(
          noSideBorders(
            headerCell(
              "",
              "justify-content-center font-bold",
              index === 0 ? 7 : 0
            )
          )
        )
      );
      headerTDPrinciplleAmountCells.push(
        headerCell("", "justify-content-center", index === 0 ? 7 : 0)
      );
      headerTDAnnualInterestRateCells.push(
        headerCell("", "justify-content-center", index === 0 ? 7 : 0)
      );
      headerTDTermsInMonthsCells.push(
        headerCell("", "justify-content-center", index === 0 ? 7 : 0)
      );
      headerTDMonthlyPaymentCells.push(
        headerCell("", "justify-content-center", index === 0 ? 7 : 0)
      );
    });

    // populating term ledger attributes
    termDebtsTransactionsData.map((tdl) => {
      //headerTitleCells
      headerTitleCells.push(
        rightBorder(
          headerCell(tdl.desciption, "justify-content-center font-bold", 8)
        )
      );
      Array.from({ length: 7 }, () => {
        headerTitleCells.push(headerCell("", "justify-content-center"));
      });

      //headerTDStartDateCells
      headerTDStartDateCells.push(
        rightBorder(
          headerCell(
            "Start Date: " +
              format(
                new Date(
                  parseDate(
                    new Date(tdl.start_date).toISOString().split("T")[0]
                  )
                ),
                "MMM yyyy"
              ),
            "justify-content-center font-bold",
            8
          )
        )
      );
      Array.from({ length: 7 }, () => {
        headerTDStartDateCells.push(headerCell("", "justify-content-center"));
      });

      //headerTDPrinciplleAmountCells
      headerTDPrinciplleAmountCells.push(
        rightBorder(
          headerCell(
            "Principle Amount: " + formatNumber(tdl.principal_amount),
            "justify-content-center font-bold",
            8
          )
        )
      );
      Array.from({ length: 7 }, () => {
        headerTDPrinciplleAmountCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDAnnualInterestRateCells
      headerTDAnnualInterestRateCells.push(
        rightBorder(
          headerCell(
            "Annual Intrest Rate: " + tdl.interest_rate + "%",
            "justify-content-center font-bold",
            8
          )
        )
      );
      Array.from({ length: 7 }, () => {
        headerTDAnnualInterestRateCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDTermsInMonthsCells
      headerTDTermsInMonthsCells.push(
        rightBorder(
          headerCell(
            "Months Covered: " +
              tdl.terms_in_months.toString() +
              " month" +
              (tdl.terms_in_months > 1 ? "s" : ""),
            "justify-content-center font-bold",
            8
          )
        )
      );
      Array.from({ length: 7 }, () => {
        headerTDTermsInMonthsCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDMonthlyPaymentCells
      headerTDMonthlyPaymentCells.push(
        rightBorder(
          headerCell(
            "Monthly " +
              (tdl.term_debt_ledger_type == 1
                ? "Blended"
                : "Linear Principal") +
              " Payment: " +
              (tdl.term_debt_ledger_type == 1
                ? formatNumber(tdl.monthly_payment)
                : formatNumber(tdl.principal_amount / tdl.terms_in_months)),
            "justify-content-center font-bold",
            8
          )
        )
      );
      Array.from({ length: 7 }, () => {
        headerTDMonthlyPaymentCells.push(
          headerCell("", "justify-content-center")
        );
      });
    });

    const headers = [
      {
        rowId: "headerTitleRow",
        height: ROW_HEIGHT,
        cells: headerTitleCells,
      },
      {
        rowId: "headerTDStartDateRow",
        height: ROW_HEIGHT,
        cells: headerTDStartDateCells,
      },
      {
        rowId: "headerTDPrinciplleAmountRow",
        height: ROW_HEIGHT,
        cells: headerTDPrinciplleAmountCells,
      },
      {
        rowId: "headerTDAnnualInterestRateRow",
        height: ROW_HEIGHT,
        cells: headerTDAnnualInterestRateCells,
      },
      {
        rowId: "headerTDTermsInMonthsRow",
        height: ROW_HEIGHT,
        cells: headerTDTermsInMonthsCells,
      },
      {
        rowId: "headerTDMonthlyPaymentRow",
        height: ROW_HEIGHT,
        cells: headerTDMonthlyPaymentCells,
      },
    ];

    return headers;
  };

  const getRowCells = (tr) => {
    const rowCells = [];

    rowCells.push(
      nonEditable(
        rightBorder(
          textCell(
            tr.formattedDate,
            "padding-left-lg font-bold  disabled text-md"
          )
        )
      )
    );

    const matchingTransaction = props.ledgerDataTotals.find(
      (t) => t.date === tr.date
    );

    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            Number(matchingTransaction?.term_dept_interest),
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            Number(matchingTransaction?.term_dept_monthly_payment),
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            Number(matchingTransaction?.term_dept_principal_advance),
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            Number(matchingTransaction?.balloon_payment),
            Number(matchingTransaction?.balloon_payment) < 0
              ? "padding-left-lg disabled text-red"
              : "padding-left-lg disabled"
            // "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            Number(matchingTransaction?.current_portion),
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        rightBorder(
          hideZero(
            numberCell(
              Number(matchingTransaction?.long_term_portion),
              "padding-left-lg disabled"
            )
          )
        )
      )
    );

    Object.keys(tr).map((key) => {
      {
        if (key !== "date" && key !== "formattedDate") {
          const d = tr[key];
          const balloonPayment = Number(d.term_dept_balloonpayment);
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d?.opening_balance),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.term_dept_interest),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.term_dept_monthly_payment),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.closing_principal),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.current_portion),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.term_dept_principal_advance),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            hideZero(
              percentCell(
                d.term_dept_interest_rate_change,
                "padding-left-lg editable"
              )
            )
          );

          rowCells.push(
            rightBorder(
              hideZero(
                numberCell(
                  balloonPayment,
                  balloonPayment < 0
                    ? "padding-left-lg editable text-red"
                    : "padding-left-lg editable"
                )
              )
            )
          );
        }
      }
    });

    return rowCells;
  };

  const getRows = (ledgerRowData) => {
    const termDebtHeaderRows = getTermDebtHeaderRows(props.ledgerData);

    return [
      termDebtHeaderRows[0],
      termDebtHeaderRows[1],
      termDebtHeaderRows[2],
      termDebtHeaderRows[3],
      termDebtHeaderRows[4],
      termDebtHeaderRows[5],
      headerRow,
      ...ledgerRowData.map((lrd) => ({
        rowId: lrd.date.toString(),
        cells: getRowCells(lrd),
      })),
    ];
  };

  const handleChanges = (changes) => {
    changes.forEach((change) => {
      const d = change.columnId.toString().split("__");

      const attribute = d[0];
      const tll_id = Number(d[1]);
      const ledger_date = change.rowId.toString();
      let attribute_value = 0;
      if (attribute === "interest_rate_change") {
        attribute_value = change.newCell.value;

        if (attribute_value < 1) {
          attribute_value = attribute_value * 100;
        }
      } else {
        attribute_value = change.newCell.value;
      }

      dispatch(
        updateTermDebtTransactionData({
          tll: tll_id,
          ledger_date: ledger_date,
          attribute: attribute,
          attribute_value: attribute_value,
        })
      );
    });
  };

  useEffect(() => {
    if (props.show) {
      const termDebtLedgerData = prepareTermDebtLedgerData(props.ledgerData);

      setColumns(getColumns(props.ledgerData));
      setRows(getRows(termDebtLedgerData));
    }
  }, [props.show, props.ledgerData]);

  return (
    <Dialog fullScreen open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>
        Term Debt Ledger View
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
              stickyLeftColumns={1}
              stickyTopRows={7}
              enableRowSelection={true}
              enableRangeSelection={true}
              enableFillHandle={true}
              onCellsChanged={handleChanges}
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
