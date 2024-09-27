import * as React from "react";
import { useEffect, useState, forwardRef } from "react";
import { ReactGrid } from "@silevis/reactgrid";
import { getDateRangeInMonths } from "../../../../utils/get-daterange";

import {
  rightBorder,
  nonEditable,
  textCell,
  numberCell,
  noSideBorders,
  headerCell,
} from "../../../../views/components/reactGrid/cells";

import { addMonths, subMonths } from "date-fns";

import "@silevis/reactgrid/styles.css";
import { useSelector } from "react-redux";
import * as dfd from "danfojs";
import { useDispatch } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import Icon from "../../../../components/icon";
import { fetchFixedAssetStraightLineBalancePoolsTotalLedgerView } from "../../../../store/plv2/fixedAssetStraightLinePoolTransactionsTotal";
import DatePicker from "react-datepicker";
import moment from "moment";
import ReactLoaderRound from "../../../../components/ReactLoader/ReactLoader";

const DatePickerCustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} autoComplete="off" />;
});
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function FixedAssetStraightLineBalancePoolsTotalLedgerView(
  props
) {
  const ROW_HEIGHT = 32;
  const HEADING_ROW_HEIGHT = 70;

  const dispatch = useDispatch();
  const _start_date = subMonths(new Date(), 0);
  const _end_date = addMonths(new Date(), 5);
  const [startDate, setStartDate] = useState(
    new Date(_start_date.getFullYear(), _start_date.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(
    new Date(_end_date.getFullYear(), _end_date.getMonth(), 1)
  );
  const [dateRangeInMonths, setDateRangeInMonths] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [headerCells, setHeaderCells] = useState([]);
  const [headerMonthCells, setHeaderMonthCells] = useState([]);

  const [dataFrame, setDataFrame] = useState(new dfd.DataFrame());

  const fixedAssetStraightLinePoolTransactionsTotalStore = useSelector(
    (state) => state.fixedAssetStraightLinePoolTransactionsTotal
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDateRangeInMonths(
      getDateRangeInMonths(startDate, endDate, "yyyy-MM-dd")
    );
  }, [startDate, endDate]);

  useEffect(() => {
    if (props.show === true) {
      setIsLoading(true); // Set loading to true when fetching data
      dispatch(
        fetchFixedAssetStraightLineBalancePoolsTotalLedgerView({
          start_date: startDate,
          end_date: endDate,
        })
      ).then((r) => {
        prepareDGColumns();
        // console.log(r);
        setIsLoading(false); // Set loading to false after fetching data
      });
    } else if (props.show === false) {
      // resetState();
    }
  }, [props.show, dateRangeInMonths]);

  useEffect(() => {
    prepareDF();
  }, [columns, fixedAssetStraightLinePoolTransactionsTotalStore]);
  useEffect(() => {
    prepareRows();
  }, [dataFrame]);

  const prepareDGColumns = () => {
    const _columns = [];
    const _headerCells = [];
    const _headerMonthCells = [];

    _headerCells.push(
      nonEditable(headerCell("Pool", "justify-content-center wraptext"))
    );

    _headerMonthCells.push(nonEditable(headerCell("", "")));
    _columns.push({ columnId: "pool", width: 220 });
    dateRangeInMonths.forEach((fDate) => {
      Array.from({ length: 6 }, (_, index) => {
        _headerMonthCells.push(
          rightBorder(
            noSideBorders(
              headerCell(
                moment(fDate).format("MMMyyyy"),
                "justify-content-center font-bold",
                index === 0 ? 6 : 0
              )
            )
          )
        );
      });
      _headerCells.push(
        nonEditable(headerCell("Additions", "justify-content-end wraptext"))
      );
      _headerCells.push(
        nonEditable(
          headerCell("Disposal Proceeds", "justify-content-end wraptext")
        )
      );
      _headerCells.push(
        nonEditable(headerCell("Disposal Cost", "justify-content-end wraptext"))
      );
      _headerCells.push(
        nonEditable(headerCell("Depreciation", "justify-content-end wraptext"))
      );

      _headerCells.push(
        nonEditable(headerCell("NBV", "justify-content-end wraptext"))
      );
      _headerCells.push(
        nonEditable(
          rightBorder(
            headerCell("Disposal Gain (Loss)", "justify-content-end wraptext")
          )
        )
      );

      _columns.push({
        columnId: "purchase__" + fDate,
        width: 110,
      });
      _columns.push({
        columnId: "disposal_proceeds__" + fDate,
        width: 110,
      });
      _columns.push({
        columnId: "disposal_cost__" + fDate,
        width: 110,
      });
      _columns.push({ columnId: "depreciation__" + fDate, width: 110 });
      _columns.push({ columnId: "nbv__" + fDate, width: 110 });
      _columns.push({
        columnId: "disposal_gain_loss__" + fDate,
        width: 110,
      });
    });

    setHeaderCells(_headerCells);
    setColumns(_columns);
    setHeaderMonthCells(_headerMonthCells);
  };

  const prepareDF = () => {
    const columnIds = columns.length
      ? columns.map((column) => column.columnId.toString())
      : [];
    const rowsList = [];

    const rowIndexes =
      fixedAssetStraightLinePoolTransactionsTotalStore.data.map((pool) => {
        return pool.id.toString();
      });

    // Commented by Vivek - 12/Apr/24
    rowIndexes.length &&
      rowIndexes.forEach((m) => {
        const arrayOfZeros = new Array(columnIds.length).fill(0);
        arrayOfZeros[0] = m.name;
        rowsList.push(arrayOfZeros);
      });

    if (rowsList.length > 0 && columnIds.length > 0) {
      const df = new dfd.DataFrame(rowsList, {
        columns: columnIds,
        index: rowIndexes,
      });
      if (
        df.columns.length > 0 &&
        df.values.length > 0 &&
        fixedAssetStraightLinePoolTransactionsTotalStore.data.length
      ) {
        fixedAssetStraightLinePoolTransactionsTotalStore.data.forEach(
          (pool) => {
            const rowIndex = df.index.indexOf(pool.id.toString());
            if (df.values[rowIndex]) {
              df.values[rowIndex][0] = pool.name;
            }

            pool.transactions.forEach((transaction) => {
              const purchaseIndex = df.columns.indexOf(
                "purchase__" + transaction.date
              );

              const depreciationIndex = df.columns.indexOf(
                "depreciation__" + transaction.date
              );

              const remainingCostIndex = df.columns.indexOf(
                "remaining_cost__" + transaction.date
              );
              const nbvIndex = df.columns.indexOf("nbv__" + transaction.date);

              const disposalGainIndex = df.columns.indexOf(
                "disposal_gain_loss__" + transaction.date
              );

              const disposalCostIndex = df.columns.indexOf(
                "disposal_cost__" + transaction.date
              );

              const disposalProceedsIndex = df.columns.indexOf(
                "disposal_proceeds__" + transaction.date
              );

              try {
                if (purchaseIndex > 0) {
                  df.values[rowIndex][purchaseIndex] = transaction.purchase;
                }
              } catch (e) {
                // console.log(e);
              }

              try {
                if (disposalProceedsIndex > 0) {
                  df.values[rowIndex][disposalProceedsIndex] =
                    transaction.disposal_proceeds;
                }
              } catch (e) {
                // console.log(e);
              }

              try {
                if (disposalCostIndex > 0) {
                  df.values[rowIndex][disposalCostIndex] =
                    transaction.disposal_cost;
                }
              } catch (e) {
                // console.log(e);
              }

              try {
                if (remainingCostIndex > 0) {
                  df.values[rowIndex][remainingCostIndex] =
                    transaction.remaining_cost;
                }
              } catch (e) {
                // console.log(e);
              }

              try {
                if (depreciationIndex > 0) {
                  df.values[rowIndex][depreciationIndex] =
                    transaction.depreciation;
                }
              } catch (e) {
                // console.log(e);
              }

              try {
                if (nbvIndex > 0) {
                  df.values[rowIndex][nbvIndex] = transaction.nbv;
                }
              } catch (e) {
                // console.log(e);
              }

              try {
                if (disposalGainIndex > 0) {
                  df.values[rowIndex][disposalGainIndex] =
                    transaction.disposal_gain;
                }
              } catch (e) {
                // console.log(e);
              }
            });
          }
        );
      }

      setDataFrame(df);
    }
  };

  const getRowCells = (rowData) => {
    const rowCells = [];

    rowData &&
      rowData.forEach((d, i) => {
        if (i == 0) {
          rowCells.push(
            nonEditable(
              textCell(d, "padding-left-lg font-bold  disabled text-md")
            )
          );
        } else {
          if (i % 6 == 0) {
            rowCells.push(
              nonEditable(
                rightBorder(numberCell(d, "padding-left-lg disabled "))
              )
            );
          } else {
            rowCells.push(
              nonEditable(numberCell(d, "padding-left-lg disabled "))
            );
          }
        }
      });

    return rowCells;
  };

  const headerRow = {
    rowId: "header",
    height: HEADING_ROW_HEIGHT,
    cells: headerCells,
  };
  const headerMonthRow = {
    rowId: "headerMonthCells",
    height: HEADING_ROW_HEIGHT,
    cells: headerMonthCells,
  };

  const getFooterCells = (footerTotals) => {
    const rowCells = [];
    footerTotals &&
      footerTotals.forEach((d, i) => {
        if (i == 0) {
          rowCells.push(
            nonEditable(
              textCell(d, "padding-left-lg font-bold  disabled text-md")
            )
          );
        } else {
          if (i % 6 == 0) {
            rowCells.push(
              nonEditable(
                rightBorder(
                  numberCell(d, "padding-left-lg font-bold disabled ")
                )
              )
            );
          } else {
            rowCells.push(
              nonEditable(numberCell(d, "padding-left-lg font-bold disabled "))
            );
          }
        }
      });

    return rowCells;
  };

  const prepareRows = () => {
    const dataRows = [];

    dataFrame.values &&
      dataFrame.values.forEach((values, i) => {
        const _rCells = getRowCells(values, i);
        dataRows.push({
          rowId: i,
          cells: _rCells,
        });
      });
    if (dataRows.length > 0) {
      const columnTotals = dataRows[0].cells.map((col, columnIndex) =>
        dataRows.reduce((total, row) => {
          if (columnIndex > 0) {
            return (
              total +
              (row.cells[columnIndex].value == undefined
                ? 0
                : parseInt(row.cells[columnIndex].value))
            );
          }
        }, 0)
      );
      columnTotals[0] = "Totals";

      const footerRow = {
        rowId: "footer",
        cells: getFooterCells(columnTotals),
        height: ROW_HEIGHT,
      };

      setRows([headerMonthRow, headerRow].concat(dataRows).concat(footerRow));
    }
  };

  const handleStartDateChange = (selectedDate) => {
    setStartDate(selectedDate);
  };
  const handleEndDateChange = (selectedDate) => {
    setEndDate(selectedDate);
  };

  return (
    <Dialog fullScreen open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>
        <Grid container spacing={2}>
          {isLoading ? (
            <>
              <Grid item xs={7}>
                Total All Straight Line Balance Fixed Asset Pool
              </Grid>
              <ReactLoaderRound />
            </>
          ) : (
            <Grid item xs={7}>
              Total All Straight Line Balance Fixed Asset Pool
            </Grid>
          )}

          <Grid item xs={2}>
            <DatePicker
              popperPlacement="bottom-start"
              showYearDropdown
              showMonthDropdown
              showMonthYearPicker
              dropdownMode="select"
              dateFormat="MMM, yyyy"
              placeholderText="MMM, YYYY"
              onChange={handleStartDateChange}
              customInput={<DatePickerCustomInput />}
              id="startDate"
              name="startDate"
              minDate={moment(props.poolStartDate, "YYYY-MM-DD").toDate()}
              selected={startDate ? new Date(startDate) : new Date()}
              value={startDate ? new Date(startDate) : new Date()}
            />
          </Grid>
          <Grid item xs={2}>
            <DatePicker
              popperPlacement="bottom-start"
              showYearDropdown
              showMonthDropdown
              showMonthYearPicker
              dropdownMode="select"
              dateFormat="MMM, yyyy"
              placeholderText="MMM, YYYY"
              onChange={handleEndDateChange}
              customInput={<DatePickerCustomInput />}
              minDate={moment(props.poolStartDate, "YYYY-MM-DD").toDate()}
              id="endDate"
              name="endDate"
              selected={endDate ? new Date(endDate) : new Date()}
              value={endDate ? new Date(endDate) : new Date()}
            />
          </Grid>
        </Grid>

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
              stickyTopRows={2}
              enableRowSelection={true}
              enableRangeSelection={true}
              // enableFullWidthHeader={true}
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
