import * as React from "react";
import { useEffect, useState } from "react";
import { ReactGrid } from "@silevis/reactgrid";
import { getCurrentEntity } from "../../../../helpers/entitiyHelpers";
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
import {
  noSideBorders,
  rightBorder,
  nonEditable,
  textCell,
  numberCell,
  hideZero,
  headerCell,
} from "../../../../views/components/reactGrid/cells";
import {
  parseDate,
  getDateRangeInMonths,
} from "../../../../utils/get-daterange";

export default function FixedAssetsLedgerView(props) {
  const ROW_HEIGHT = 32;
  const HEADING_ROW_HEIGHT = 70;

  const activeEntity = getCurrentEntity();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const prepareFixedAssetsLedgerData = (fixedAssetsTransactionsData) => {
    let minDate = new Date(activeEntity.end_date);
    let maxDate = new Date(activeEntity.end_date);

    fixedAssetsTransactionsData.forEach((item) => {
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

    const fixedAssetsLedgerDateRange = getDateRangeInMonths(
      minDate,
      maxDate,
      "yyyy-MM-01"
    );
    const fixedAssetsLedgerDateRangeFormatted = getDateRangeInMonths(
      modifiedStartDate,
      modifiedEndDate,
      "MMM yyyy"
    );

    const dataObject = fixedAssetsLedgerDateRange.map((date, index) => {
      const formattedDate = fixedAssetsLedgerDateRangeFormatted[index];
      const entry = {
        date: date,
        formattedDate: formattedDate,
      };

      fixedAssetsTransactionsData.forEach((transaction) => {
        const { id, transactions } = transaction;

        const matchingTransaction = transactions.find((t) => t.date === date);
        entry[formattedDate + id] = {
          net_book_value: matchingTransaction
            ? matchingTransaction.net_book_value
            : 0,
          straight_line_depreciation: matchingTransaction
            ? matchingTransaction.straight_line_depreciation
            : 0,
          declining_balance_depreciation: matchingTransaction
            ? matchingTransaction.declining_balance_depreciation
            : 0,
          purchase_amount: matchingTransaction
            ? matchingTransaction.purchase_amount
            : 0,
          disposal_amount: matchingTransaction
            ? matchingTransaction.disposal_amount
            : 0,
          gain_loss_disposal: matchingTransaction
            ? matchingTransaction.gain_loss_disposal
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

  const getColumns = (fixedAssetsTransactionsData) => {
    const columns = [];

    columns.push({ columnId: "month", width: 100 });
    columns.push({
      columnId: "net_book_value",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "total_depreciation",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "straight_line_depreciation",
      width: 120,
      resizable: true,
    });

    columns.push({
      columnId: "declining_balance_depreciation",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "fixed_asset_purchases",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "fixed_asset_disposal",
      width: 120,
      resizable: true,
    });
    columns.push({
      columnId: "gain_loss_disposal",
      width: 120,
      resizable: true,
    });

    fixedAssetsTransactionsData.forEach((fal) => {
      if (fal) {
        columns.push({ columnId: "net_book_value_" + fal.id, width: 110 });
        columns.push({
          columnId: "straight_line_depreciation_" + fal.id,
          width: 110,
        });
        columns.push({
          columnId: "declining_balance_depreciation_" + fal.id,
          width: 110,
        });
        columns.push({
          columnId: "fixed_asset_purchases_" + fal.id,
          width: 110,
        });
        columns.push({
          columnId: "fixed_asset_disposal_" + fal.id,
          width: 110,
        });
        columns.push({
          columnId: "gain_loss_disposal_" + fal.id,
          width: 110,
        });
      }
    });

    return columns;
  };

  const getHeaderCells = (fixedAssetsTransactionsData) => {
    const headerCells = [];

    headerCells.push(
      nonEditable(rightBorder(headerCell("Date", "justify-content-end ")))
    );
    headerCells.push(
      nonEditable(headerCell("Net Book Value", "justify-content-end wraptext"))
    );
    headerCells.push(
      nonEditable(
        headerCell("Total Depreciation", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        headerCell("Straight Line Depreciation", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        headerCell(
          "Declining Balance Depreciation",
          "justify-content-end wraptext"
        )
      )
    );
    headerCells.push(
      nonEditable(
        headerCell("Fixed Asset Purchases", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        headerCell("Fixed Asset Disposal", "justify-content-end wraptext")
      )
    );
    headerCells.push(
      nonEditable(
        rightBorder(
          headerCell("Gain/Loss on Disposal", "justify-content-end wraptext")
        )
      )
    );

    fixedAssetsTransactionsData.map((fal) => {
      headerCells.push(
        nonEditable(
          headerCell(
            "Net Book Value",
            "justify-content-center wraptext " + fal.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Straight Line Depreciation",
            "justify-content-center wraptext " + fal.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Declining Balance Depreciation",
            "justify-content-center wraptext " + fal.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Purchase Amount",
            "justify-content-center wraptext " + fal.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          headerCell(
            "Disposal Amount",
            "justify-content-center wraptext " + fal.id
          )
        )
      );
      headerCells.push(
        nonEditable(
          rightBorder(
            headerCell(
              "Gain/Loss on Disposal",
              "justify-content-center wraptext " + fal.id
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

  const getFixedAssetsHeaderRows = (fixedAssetsTransactionsData) => {
    // const headerTitleCells = [];
    // const headerTDStartDateCells = [];
    // const headerTDPrinciplleAmountCells = [];
    // const headerTDAnnualInterestRateCells = [];
    // const headerTDTermsInMonthsCells = [];
    // const headerTDMonthlyPaymentCells = [];

    const headerTitleCells = [];
    const headerTDPurchaseDateCells = [];
    const headerTDPurchaseAmountCells = [];
    const headerTDEconomicUsefullLifeCells = [];
    const headerTDDepreciationTypeCells = [];
    const headerTDDepreciationRateCells = [];
    const headerTDDisposalDateCells = [];
    const headerTDDisposalAmountCells = [];

    headerTitleCells.push(
      rightBorder(headerCell("", "justify-content-center font-bold", 1, 8))
    );
    // total cell with colspan (number of attribute for totals ) and rowspan (number of attribute for each term debt)
    headerTitleCells.push(
      rightBorder(
        headerCell("Totals", "justify-content-center font-bold", 7, 8)
      )
    );
    // created 6 emtpy  cells for colspan (for adding spacing)
    Array.from({ length: 6 }, () => {
      headerTitleCells.push(headerCell("", "justify-content-center"));
    });

    // populating each header cell array with emtpy cells for the rowspan configured above in headerTitleCells
    Array.from({ length: 8 }, (_, index) => {
      headerTDPurchaseDateCells.push(
        rightBorder(
          noSideBorders(
            headerCell(
              "",
              "justify-content-center font-bold",
              index === 0 ? 6 : 0
            )
          )
        )
      );
      // headerTDPurchaseAmountCells.push(
      //   headerCell("", "justify-content-center", index === 0 ? 7 : 0)
      // );
      headerTDPurchaseAmountCells.push(
        headerCell("", "justify-content-center", index === 0 ? 6 : 0)
      );
      headerTDEconomicUsefullLifeCells.push(
        headerCell("", "justify-content-center", index === 0 ? 6 : 0)
      );
      headerTDDepreciationTypeCells.push(
        headerCell("", "justify-content-center", index === 0 ? 6 : 0)
      );
      headerTDDepreciationRateCells.push(
        headerCell("", "justify-content-center", index === 0 ? 6 : 0)
      );
      headerTDDisposalDateCells.push(
        headerCell("", "justify-content-center", index === 0 ? 6 : 0)
      );
      headerTDDisposalAmountCells.push(
        headerCell("", "justify-content-center", index === 0 ? 6 : 0)
      );
    });

    // populating term ledger attributes
    fixedAssetsTransactionsData.map((fal) => {
      //headerTitleCells
      headerTitleCells.push(
        rightBorder(headerCell(fal.name, "justify-content-center font-bold", 6))
      );
      Array.from({ length: 5 }, () => {
        headerTitleCells.push(headerCell("", "justify-content-center"));
      });

      //headerTDPurchaseDateCells
      headerTDPurchaseDateCells.push(
        rightBorder(
          headerCell(
            "Purchase Date: " +
              format(
                parseDate(
                  new Date(fal.purchase_date).toISOString().split("T")[0]
                ),
                "MMM yyyy"
              ),
            "justify-content-center font-bold",
            6
          )
        )
      );

      Array.from({ length: 5 }, () => {
        headerTDPurchaseDateCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDPurchaseAmountCells
      headerTDPurchaseAmountCells.push(
        rightBorder(
          headerCell(
            "Purchase Amount: " + formatNumber(fal.purchase_amount),
            "justify-content-center font-bold",
            6
          )
        )
      );
      Array.from({ length: 5 }, () => {
        headerTDPurchaseAmountCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDEconomicUsefullLifeCells
      headerTDEconomicUsefullLifeCells.push(
        rightBorder(
          headerCell(
            "Economic Usefull Life (in months): " +
              fal.economic_userful_life.toString() +
              " month" +
              (fal.economic_userful_life > 1 ? "s" : ""),
            "justify-content-center font-bold",
            6
          )
        )
      );
      Array.from({ length: 5 }, () => {
        headerTDEconomicUsefullLifeCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDDepreciationTypeCells
      headerTDDepreciationTypeCells.push(
        rightBorder(
          headerCell(
            "Depreciation Type: " +
              (fal.depreciation_type === 1 ? "Straight" : "Declining"),
            "justify-content-center font-bold",
            6
          )
        )
      );
      Array.from({ length: 5 }, () => {
        headerTDDepreciationTypeCells.push(
          headerCell("", "justify-content-center")
        );
      });
      //headerTDDepreciationRateCells
      headerTDDepreciationRateCells.push(
        rightBorder(
          headerCell(
            "Depreciation Rate: " +
              (fal.depreciation_type === 2
                ? fal.declining_balance_rate + "%"
                : "-"),
            "justify-content-center font-bold",
            6
          )
        )
      );
      Array.from({ length: 5 }, () => {
        headerTDDepreciationRateCells.push(
          headerCell("", "justify-content-center")
        );
      });
      //headerTDDisposalDateCells
      headerTDDisposalDateCells.push(
        rightBorder(
          headerCell(
            "Disposal Date: " +
              format(
                parseDate(
                  new Date(fal.disposal_date).toISOString().split("T")[0]
                ),
                "MMM yyyy"
              ),
            "justify-content-center font-bold",
            6
          )
        )
      );

      Array.from({ length: 5 }, () => {
        headerTDDisposalDateCells.push(
          headerCell("", "justify-content-center")
        );
      });

      //headerTDDisposalAmountCells
      headerTDDisposalAmountCells.push(
        rightBorder(
          headerCell(
            "Disposal Amount: " + formatNumber(fal.disposal_amount),
            "justify-content-center font-bold",
            6
          )
        )
      );
      Array.from({ length: 5 }, () => {
        headerTDDisposalAmountCells.push(
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
        rowId: "headerTDPurchaseDateRow",
        height: ROW_HEIGHT,
        cells: headerTDPurchaseDateCells,
      },
      {
        rowId: "headerTDPurchaseAmountRow",
        height: ROW_HEIGHT,
        cells: headerTDPurchaseAmountCells,
      },
      {
        rowId: "headerTDEconomicUsefullLifeRow",
        height: ROW_HEIGHT,
        cells: headerTDEconomicUsefullLifeCells,
      },
      {
        rowId: "headerTDDepreciationTypeRow",
        height: ROW_HEIGHT,
        cells: headerTDDepreciationTypeCells,
      },
      {
        rowId: "headerTDDepreciationRateRow",
        height: ROW_HEIGHT,
        cells: headerTDDepreciationRateCells,
      },
      {
        rowId: "headerTDDisposalDateRow",
        height: ROW_HEIGHT,
        cells: headerTDDisposalDateCells,
      },
      {
        rowId: "headerTDDisposalAmountRow",
        height: ROW_HEIGHT,
        cells: headerTDDisposalAmountCells,
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
            matchingTransaction?.net_book_value,
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            matchingTransaction?.straight_line_depreciation +
              matchingTransaction?.declining_balance_depreciation,
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            matchingTransaction?.straight_line_depreciation,
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            matchingTransaction?.declining_balance_depreciation,
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            matchingTransaction?.purchase_amount,
            "padding-left-lg disabled"
          )
        )
      )
    );
    rowCells.push(
      nonEditable(
        hideZero(
          numberCell(
            matchingTransaction?.disposal_amount,
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
              matchingTransaction?.gain_loss_disposal,
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

          // opening_principle_row_total += Number(d.declining_balance_depreciation);
          // interest_row_total += Number(d.purchase_amount);
          // monthly_payment_row_total += Number(d.disposal_amount);
          // closing_principle_row_total += Number(d.net_book_value);
          // straight_line_depreciation_row_total += Number(d.straight_line_depreciation);
          // principle_advance_row_total += Number(d.gain_loss_disposal);
          // baloon_payment_row_total += 0;
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(Number(d.net_book_value), "padding-left-lg disabled")
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.straight_line_depreciation),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  d.declining_balance_depreciation,
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.purchase_amount),
                  "padding-left-lg disabled"
                )
              )
            )
          );
          rowCells.push(
            nonEditable(
              hideZero(
                numberCell(
                  Number(d.disposal_amount),
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
                    Number(d.gain_loss_disposal),
                    "padding-left-lg disabled"
                  )
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
    const fixedAssetsHeaderRows = getFixedAssetsHeaderRows(props.ledgerData);

    return [
      fixedAssetsHeaderRows[0],
      fixedAssetsHeaderRows[1],
      fixedAssetsHeaderRows[2],
      fixedAssetsHeaderRows[3],
      fixedAssetsHeaderRows[4],
      fixedAssetsHeaderRows[5],
      fixedAssetsHeaderRows[6],
      fixedAssetsHeaderRows[7],
      headerRow,
      ...ledgerRowData.map((lrd) => ({
        rowId: lrd.date.toString(),
        cells: getRowCells(lrd),
      })),
    ];
  };

  useEffect(() => {
    if (props.show) {
      const fixedAssetsLedgerData = prepareFixedAssetsLedgerData(
        props.ledgerData
      );

      setColumns(getColumns(props.ledgerData));
      setRows(getRows(fixedAssetsLedgerData));
    }
  }, [props.show]);

  return (
    <Dialog fullScreen open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>
        Fixed Asset Ledger View
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
              stickyTopRows={9}
              enableRowSelection={true}
              enableRangeSelection={true}
              // enableFullWidthHeader={true}
              // onCellsChanged={handleChanges}
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
