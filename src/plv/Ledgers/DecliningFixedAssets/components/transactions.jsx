import * as React from "react";
import { useEffect, useState, forwardRef } from "react";
import { ReactGrid } from "@silevis/reactgrid";
import {
  convertToUTCDate,
  getDateRangeInMonths,
} from "../../../../utils/get-daterange";
import {
  rightBorder,
  nonEditable,
  textCell,
  numberCell,
  noSideBorders,
  headerCell,
} from "../../../../views/components/reactGrid/cells";
import { format, addMonths, subMonths } from "date-fns";

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
import {
  fetchFixedAssetDecliningBalancePoolTransactionData,
  updateFixedAssetDecliningBalancePoolTransactionData,
  updateFixedAssetDecliningBalancePoolLedger,
} from "../../../../store/plv2/fixedAssetDecliningBalancePoolTransactions";
import DatePicker from "react-datepicker";
import moment from "moment";
import ReactLoaderRound from "../../../../components/ReactLoader/ReactLoader";

const DatePickerCustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} autoComplete="off" />;
});
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function FixedAssetDecliningBalancePoolsLedgerView(props) {
  const ROW_HEIGHT = 32;
  const HEADING_ROW_HEIGHT = 70;

  const dispatch = useDispatch();
  const _start_date = subMonths(new Date(), 0);
  const _end_date = addMonths(new Date(), 5);
  const [startDate, setStartDate] = useState(
    new Date(_start_date.getFullYear(), _start_date.getMonth(), 1, 0, 0, 0, 0)
  );
  const [endDate, setEndDate] = useState(
    new Date(_end_date.getFullYear(), _end_date.getMonth(), 1, 0, 0, 0, 0)
  );
  const [dateRangeInMonths, setDateRangeInMonths] = React.useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [headerCells, setHeaderCells] = useState([]);
  const [headerMonthCells, setHeaderMonthCells] = useState([]);

  const [dataFrame, setDataFrame] = useState(new dfd.DataFrame());
  const [isLoading, setIsLoading] = useState(false);
  const fixedAssetDecliningBalancePoolTransactionStore = useSelector(
    (state) => state.fixedAssetDecliningBalancePoolTransactions
  );

  useEffect(() => {
    setDateRangeInMonths(
      getDateRangeInMonths(startDate, endDate, "yyyy-MM-dd")
    );
  }, [startDate, endDate]);

  useEffect(() => {
    if (props.poolId && props.show === true) {
      setIsLoading(true);
      dispatch(
        fetchFixedAssetDecliningBalancePoolTransactionData({
          pool_id: props.poolId,
          start_date: startDate,
          end_date: endDate,
        })
      ).then((r) => {
        prepareDGColumns();
        // console.log(r);
        setIsLoading(false);
      });
    } else if (props.show === false) {
      // resetState();
    }
  }, [props.show, dateRangeInMonths]);

  useEffect(() => {}, [fixedAssetDecliningBalancePoolTransactionStore]);

  useEffect(() => {
    prepareDF();
  }, [columns, fixedAssetDecliningBalancePoolTransactionStore]);
  useEffect(() => {
    prepareRows();
  }, [dataFrame]);

  const prepareDGColumns = () => {
    const _columns = [];
    const _headerCells = [];
    const _headerMonthCells = [];

    // Date
    // opening balance

    _headerCells.push(
      nonEditable(headerCell("Month", "justify-content-end wraptext"))
    );
    _headerCells.push(
      nonEditable(headerCell("Additions", "justify-content-end wraptext"))
    );

    _headerMonthCells.push(nonEditable(headerCell("", "")));
    _headerMonthCells.push(nonEditable(headerCell("", "")));

    _columns.push({ columnId: "month", width: 100 });
    _columns.push({ columnId: "ob", width: 100 });

    // Disposal Proceeds
    // Disposal Cost
    // Remaining Cost
    // Depreciation
    // NBV
    // Disposal Gain (Loss)

    dateRangeInMonths.forEach((fDate) => {
      // _headerMonthCells.push(nonEditable(headerCell(fDate, "", 6)));
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
        nonEditable(
          headerCell("Disposal Proceeds", "justify-content-end wraptext")
        )
      );
      _headerCells.push(
        nonEditable(headerCell("Disposal Cost", "justify-content-end wraptext"))
      );
      _headerCells.push(
        nonEditable(
          headerCell("Remaining Cost", "justify-content-end wraptext")
        )
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
        columnId: "disposal_proceeds__" + fDate,
        width: 110,
      });
      _columns.push({
        columnId: "disposal_cost__" + fDate,
        width: 110,
      });
      _columns.push({
        columnId: "remaining_cost__" + fDate,
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

    const rowIndexes = columnIds.length
      ? ["ob"].concat(dateRangeInMonths)
      : dateRangeInMonths;

    rowIndexes.forEach((m) => {
      const arrayOfZeros = new Array(columnIds.length).fill(0);
      if (m === "ob") {
        arrayOfZeros[0] = format(new Date(startDate), "MMMyyyy");
      } else {
        arrayOfZeros[0] = format(new Date(convertToUTCDate(m)), "MMMyyyy");
      }
      rowsList.push(arrayOfZeros);
    });

    if (rowsList.length > 0 && columnIds.length > 0) {
      const df = new dfd.DataFrame(rowsList, {
        columns: columnIds,
        index: rowIndexes,
      });
      window.document.df = df;

      if (df.columns.length > 0 && df.values.length > 0) {
        fixedAssetDecliningBalancePoolTransactionStore.data.forEach((asset) => {
          const rowIndex = asset.is_ob ? 0 : df.index.indexOf(asset.date);

          if (df.values[rowIndex]) {
            df.values[rowIndex][1] = {
              id: asset.id,
              value: asset.value,
              date: asset.date,
              type: "ob",
              is_ob: asset.is_ob,
            };
          }

          asset.transactions.forEach((transaction) => {
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
              if (disposalProceedsIndex > 0) {
                df.values[rowIndex][disposalProceedsIndex] = {
                  id: transaction.id,
                  date: transaction.date,
                  value: transaction.disposal_proceeds,
                  type: "disposal_proceeds",
                };
              }
            } catch (e) {
              // console.log(e);
            }

            try {
              if (disposalCostIndex > 0) {
                df.values[rowIndex][disposalCostIndex] = {
                  id: transaction.id,
                  date: transaction.date,
                  value: transaction.disposal_cost,
                  type: "disposal_cost",
                };
              }
            } catch (e) {
              // console.log(e);
            }

            try {
              if (remainingCostIndex > 0) {
                df.values[rowIndex][remainingCostIndex] = {
                  id: transaction.id,
                  date: transaction.date,
                  value: transaction.remaining_cost,
                  type: "remaining_cost",
                };
              }
            } catch (e) {
              // console.log(e);
            }

            try {
              if (depreciationIndex > 0) {
                df.values[rowIndex][depreciationIndex] = {
                  id: transaction.id,
                  date: transaction.date,
                  value: transaction.depreciation,
                  type: "depreciation",
                };
              }
            } catch (e) {
              // console.log(e);
            }

            try {
              if (nbvIndex > 0) {
                df.values[rowIndex][nbvIndex] = {
                  id: transaction.id,
                  date: transaction.date,
                  value: transaction.nbv,
                  type: "nbv",
                };
              }
            } catch (e) {
              // console.log(e);
            }

            try {
              if (disposalGainIndex > 0) {
                df.values[rowIndex][disposalGainIndex] = {
                  id: transaction.id,
                  date: transaction.date,
                  value: transaction.disposal_gain,
                  type: "disposal_gain_loss",
                };
              }
            } catch (e) {
              // console.log(e);
            }
          });
        });
      }

      setDataFrame(df);
    }
  };

  const getRowCells = (rowData, idx) => {
    const rowCells = [];

    const attribute_string = (d) => {
      return "data__" + d.type + "__" + d.id;
    };

    rowData &&
      rowData.forEach((d, i) => {
        if (i == 0) {
          if (idx == 0) {
            rowCells.push(
              nonEditable(
                textCell("", "padding-left-lg font-bold  disabled text-md")
              )
            );
          } else {
            rowCells.push(
              nonEditable(
                textCell(d, "padding-left-lg font-bold  disabled text-md")
              )
            );
          }
        } else if (i == 1) {
          if (idx == 0) {
            rowCells.push(
              nonEditable(
                textCell("", "padding-left-lg font-bold  disabled text-md")
              )
            );
          } else {
            rowCells.push(
              numberCell(d.value, "padding-left-lg " + attribute_string(d))
            );
          }
        } else if ((i - 1) % 6 == 1 || (i - 1) % 6 == 2) {
          rowCells.push(
            numberCell(d.value, "padding-left-lg " + attribute_string(d))
          );
        } else {
          rowCells.push(
            nonEditable(
              numberCell(
                d.value,
                "padding-left-lg disabled " + attribute_string(d)
              )
            )
          );
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
          rowCells.push(
            nonEditable(numberCell(d, "padding-left-lg font-bold disabled "))
          );
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
          rowId: values[0].toString() + (i == 0 ? "_ob" : ""),
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
      // columnTotals.
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

  const handleChanges = (changes) => {
    changes.forEach((change) => {
      if (change.columnId === "ob") {
        const regex = /data__\w+/g;
        const dataAttributeString = change.newCell.className;

        if (dataAttributeString != undefined) {
          const match = dataAttributeString.match(regex);
          if (match != undefined && match.length > 0) {
            const attributes = match[0].replace("data__", "").split("__");
            const ledger_id = parseInt(attributes[1]);

            dispatch(
              updateFixedAssetDecliningBalancePoolLedger({
                date: change.rowId.toString(),
                value: change.newCell.value,
                pool_id: props.poolId,
                ledger_id: ledger_id,
                start_date: startDate,
                end_date: endDate,
              })
            );
          }
        }
      } else {
        const regex = /data__\w+/g;
        const dataAttributeString = change.newCell.className;

        if (dataAttributeString != undefined) {
          const match = dataAttributeString.match(regex);
          if (match != undefined && match.length > 0) {
            const attributes = match[0].replace("data__", "").split("__");
            const type = attributes[0];
            const id = parseInt(attributes[1]);

            dispatch(
              updateFixedAssetDecliningBalancePoolTransactionData({
                pool_id: props.poolId,
                id: id,
                type: type,
                value: change.newCell.value,
                start_date: startDate,
                end_date: endDate,
              })
            );
          }
        }
      }
    });
  };

  return (
    props.poolId > 0 && (
      <Dialog fullScreen open={props.show} onClose={props.handleOnClose}>
        <DialogTitle>
          <Grid container spacing={2}>
            {isLoading ? (
              <>
                <Grid item xs={7}>
                  Declining Balance Fixed Asset Pool [{props.title}]
                </Grid>
                <ReactLoaderRound />
              </>
            ) : (
              <Grid item xs={7}>
                Declining Balance Fixed Asset Pool [{props.title}]
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
                stickyLeftColumns={2}
                // stickyTopRows={7}
                enableRowSelection={true}
                enableRangeSelection={true}
                // enableFullWidthHeader={true}
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
    )
  );
}
