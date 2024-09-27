import React, { useState, useEffect } from "react";
import Header from "../../layouts/Header";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentEntity } from "../../helpers/entitiyHelpers";
import { getDateRangeInMonths, parseDate } from "../../utils/get-daterange";
import {
  emptyTextCell,
  groupFooterNumberCell,
  groupFooterTextCell,
  headerCell,
  hideZero,
  nonEditable,
  numberCell,
  showZero,
  textCell,
} from "../../views/components/reactGrid/cells";
import {
  fetchCashDisbursementData,
  updateCashDisbursementData,
} from "../../store/plv2/cashDisbursement";
import { ReactGrid } from "@silevis/reactgrid";
import { Grid } from "@mui/material";
import ReactLoaderRound from "../../components/ReactLoader/ReactLoader";
import { useRouter } from "next/router";

export default function CashDisbursement() {
  const dispatch = useDispatch();
  const cashDisbursementStore = useSelector(
    (state) => state.cashDisbursementData
  );
  const activeEntity = getCurrentEntity();
  const [loading, setLoading] = useState(true);
  const [cashDisbursementData, setCashDisbursementData] = useState([]);
  const [modelDateRange, setModelDateRange] = useState([]);
  const [modelDateRangeFormatted, setModelDateRangeFormatted] = useState([]);

  const [cellChanges, setCellChanges] = useState([]);
  const [cellChangesIndex, setCellChangesIndex] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    if (activeEntity && activeEntity.start_date && activeEntity.end_date) {
      const modifiedStartDate = parseDate(activeEntity.start_date);
      const modifiedEndDate = parseDate(activeEntity.end_date);

      const dateRange = getDateRangeInMonths(
        modifiedStartDate,
        modifiedEndDate,
        "yyyy-MM-01"
      );
      const formattedDateRange = getDateRangeInMonths(
        modifiedStartDate,
        modifiedEndDate,
        "MMMyyyy"
      );

      // Only update state if the new date ranges are different from the current state
      if (
        JSON.stringify(dateRange) !== JSON.stringify(modelDateRange) ||
        JSON.stringify(formattedDateRange) !==
          JSON.stringify(modelDateRangeFormatted)
      ) {
        setModelDateRange(dateRange);
        setModelDateRangeFormatted(formattedDateRange);
      }
    }
  }, [activeEntity, modelDateRange, modelDateRangeFormatted]);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchCashDisbursementData())
      .then((res) => {
        setLoading(false);
        if (res?.error?.message == 401) {
          // Handle unauthorized, e.g., logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [dispatch, router.query.slug]);

  useEffect(() => {
    if (cashDisbursementStore.data) {
      setCashDisbursementData(cashDisbursementStore.data);
    }
  }, [cashDisbursementStore.data]);

  const getColumns = () => {
    const columns = [];
    columns.push({ columnId: "name", width: 250 });

    modelDateRange.forEach((d) => {
      if (d) {
        columns.push({ columnId: d, width: 120 });
      }
    });

    columns.push({ columnId: "row-total", width: 150 });
    return columns;
  };

  const ROW_HEIGHT = 32;

  const getHeaderCells = (dr) => {
    const headerCells = [];
    headerCells.push(nonEditable(emptyTextCell));

    dr.map((d) => {
      headerCells.push(nonEditable(headerCell(d, "justify-content-center")));
    });
    headerCells.push(nonEditable(headerCell("Totals", "justify-content-end")));
    return headerCells;
  };

  const headerRow = {
    rowId: "header",
    height: ROW_HEIGHT,
    cells: getHeaderCells(modelDateRangeFormatted),
  };

  const getRowCells = (tr) => {
    const rowCells = [];
    let rowTotal = 0;
    const rowCellsList = {};

    rowCells.push(nonEditable(textCell(tr.name, "padding-left-lg")));

    modelDateRange.forEach((d) => {
      rowCellsList[d] = hideZero(numberCell(0, ""));
    });

    if (tr.transaction) {
      tr.transaction.forEach((t) => {
        if (rowCellsList[t.date]) {
          rowCellsList[t.date].value = t.value || 0;
        }
      });
    }

    // calculating row totals
    modelDateRange.forEach((d) => {
      rowCells.push(hideZero(numberCell(rowCellsList[d].value, "")));
      rowTotal += rowCellsList[d].value;
    });

    rowCells.push(
      nonEditable(showZero(numberCell(rowTotal, "text-md disabled")))
    );

    return rowCells;
  };

  const getFooterCells = (cashDisbursement) => {
    const footerCells = [];
    let rowTotal = 0;
    footerCells.push(
      groupFooterTextCell("Monthly Total", "padding-right-lg text-md ")
    );

    const columnTotal = {};
    modelDateRange.forEach((d) => {
      columnTotal[d] = 0;
    });

    // calculating column total
    cashDisbursement.forEach((cd) => {
      cd.transaction.forEach((t) => {
        columnTotal[t.date] += Number(t.value);
      });
    });

    modelDateRange.forEach((d) => {
      footerCells.push(
        groupFooterNumberCell(columnTotal[d], "padding-right-lg text-md ")
      );
    });

    // Calculate the footer row total
    cashDisbursement.forEach((cd) => {
      cd.transaction.forEach((t) => {
        rowTotal += Number(t.value);
      });
    });

    footerCells.push(
      groupFooterNumberCell(rowTotal, "padding-right-lg text-md ")
    );

    return footerCells;
  };

  const getRows = (cashDisbursement) => [
    headerRow,
    ...cashDisbursement.map((cd) => ({
      rowId: cd.id.toString(),
      cells: getRowCells(cd),
      height: ROW_HEIGHT,
    })),
    {
      rowId: "footer",
      cells: getFooterCells(cashDisbursement),
      height: ROW_HEIGHT,
    },
  ];

  const rows = getRows(cashDisbursementData);
  const columns = getColumns();

  const applyChangesToCashDisbursement = (changes, prevCD) => {
    const updatedCD = JSON.parse(JSON.stringify(prevCD)); // Deep copy of prevCD

    changes.forEach((change) => {
      const obIndex = updatedCD.findIndex(
        (cd) => cd.id === Number(change.rowId)
      );
      if (obIndex !== -1) {
        const transactionIndex = updatedCD[obIndex].transaction.findIndex(
          (item) => item.date === change.columnId
        );
        if (transactionIndex !== -1) {
          updatedCD[obIndex].transaction[transactionIndex].value =
            change.newCell.value;
        }
      }
    });

    return updatedCD;
  };

  const handleChanges = (changes) => {
    setCashDisbursementData((prevData) => {
      const updatedData = applyChangesToCashDisbursement(changes, prevData);
      setCellChanges((prevChanges) => [
        ...prevChanges.slice(0, cellChangesIndex + 1),
        changes,
      ]);
      setCellChangesIndex(cellChangesIndex + 1);
      return updatedData;
    });

    const changesArray = changes.map((change) => ({
      coa: Number(change.rowId),
      value: change.newCell.value,
      date: change.columnId,
    }));

    dispatch(updateCashDisbursementData(changesArray));
  };

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      let undoChanges = [];

      setCashDisbursementData((prevData) => {
        undoChanges = cellChanges[cellChangesIndex];
        const updatedData = applyChangesToCashDisbursement(
          undoChanges.map((change) => ({
            ...change,
            newCell: change.previousCell,
          })),
          prevData
        );
        setCellChangesIndex(cellChangesIndex - 1);
        dispatch(
          updateCashDisbursementData({
            coa: undoChanges[0].rowId,
            value: undoChanges[0].previousCell.value,
            date: undoChanges[0].columnId,
          })
        );

        return updatedData;
      });
    }
  };

  const handleRedoChanges = () => {
    if (cellChangesIndex + 1 < cellChanges.length) {
      setCashDisbursementData((prevData) => {
        const redoChanges = cellChanges[cellChangesIndex + 1];

        const updatedData = applyChangesToCashDisbursement(
          redoChanges,
          prevData
        );
        setCellChangesIndex(cellChangesIndex + 1);
        dispatch(
          updateCashDisbursementData({
            coa: redoChanges[0].rowId,
            value: redoChanges[0].newCell.value,
            date: redoChanges[0].columnId,
          })
        );

        return updatedData;
      });
    }
  };

  return (
    <React.Fragment>
      <div
        className="plv2_rg"
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case "z":
                handleUndoChanges();
                return;
              case "y":
                handleRedoChanges();
                return;
            }
          }
        }}
      >
        <div className="main main-app p-3 p-lg-4">
          <div className="d-md-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="main-title mb-0">Cash Disbursements</h4>
            </div>
            {loading && (
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ReactLoaderRound />
              </div>
            )}
          </div>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <div className="plv2_grid">
                {modelDateRange.length && (
                  <ReactGrid
                    rows={rows}
                    columns={columns}
                    stickyLeftColumns={1}
                    stickyRightColumns={1}
                    stickyTopRows={1}
                    enableRowSelection={true}
                    enableFillHandle
                    enableRangeSelection
                    onCellsChanged={handleChanges}
                    loading={loading}
                  />
                )}
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </React.Fragment>
  );
}
