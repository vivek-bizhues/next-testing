import React, { useEffect, useState } from "react";
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
import { ReactGrid } from "@silevis/reactgrid";
import { Grid } from "@mui/material";
import ReactLoaderRound from "../../components/ReactLoader/ReactLoader";
import {
  fetchAccountReceivedData,
  updateAccountReceivedData,
} from "../../store/plv2/accountReceivableOthers";

export default function AccountReceivableOthers() {
  const dispatch = useDispatch();
  let totalOfTotal = 0;
  const accountReceivableStore = useSelector(
    (state) => state.accountReceivedData
  );
  const activeEntity = getCurrentEntity();
  const [modelDateRange, setModelDateRange] = useState([]);
  const [modelDateRangeFormatted, setModelDateRangeFormatted] = useState([]);

  const [cellChanges, setCellChanges] = useState([]);
  const [cellChangesIndex, setCellChangesIndex] = useState(-1);

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

  const [receivedData, setReceivedData] = React.useState(
    accountReceivableStore.data
  );
  const [loading, setLoading] = React.useState(true);

  const getColumns = () => {
    const columns = [];

    columns.push({ columnId: "name", width: 250 });

    modelDateRange.forEach((d) => {
      if (d) {
        columns.push({ columnId: d, width: 100 });
      }
    });

    columns.push({ columnId: "row-total", width: 100 });
    return columns;
  };

  const getHeaderCells = (dr) => {
    const headerCells = [];
    headerCells.push(nonEditable(emptyTextCell));

    dr.map((d) => {
      headerCells.push(nonEditable(headerCell(d, "justify-content-center")));
    });
    headerCells.push(nonEditable(headerCell("Totals", "justify-content-end")));
    return headerCells;
  };

  const ROW_HEIGHT = 32;

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
      // if (d) {
      rowCells.push(hideZero(numberCell(rowCellsList[d].value, "")));
      rowTotal += rowCellsList[d].value;
      // }
    });

    rowCells.push(
      nonEditable(showZero(numberCell(rowTotal, "text-md disabled ")))
    );
    totalOfTotal += rowTotal;
    return rowCells;
  };

  const getRows = (receivedData) => [
    headerRow,
    ...receivedData.map((ar) => ({
      rowId: ar.id.toString(),
      cells: getRowCells(ar),
      height: ROW_HEIGHT,
    })),
    {
      rowId: "footer",
      cells: getFooterCells(receivedData),
      height: ROW_HEIGHT,
    },
  ];

  const getFooterCells = (receivedData) => {
    const footerCells = [];
    let rowTotal = 0;
    footerCells.push(
      groupFooterTextCell("Monthly Total", "padding-right-lg text-md  primary")
    );

    const columnTotal = {};
    modelDateRange.forEach((d) => {
      columnTotal[d] = 0;
    });

    // calculating column total
    receivedData.forEach((ar) => {
      ar.transaction.forEach((t) => {
        columnTotal[t.date] += Number(t.value);
      });
    });

    modelDateRange.forEach((d) => {
      footerCells.push(
        groupFooterNumberCell(
          columnTotal[d],
          "padding-right-lg text-md  primary"
        )
      );
    });
    // Calculate the footer row total
    receivedData.forEach((ar) => {
      ar.transaction.forEach((t) => {
        rowTotal += Number(t.value);
      });
    });

    footerCells.push(
      groupFooterNumberCell(totalOfTotal, "padding-right-lg text-md  primary")
    );

    return footerCells;
  };

  const rows = getRows(receivedData);
  const columns = getColumns();

  // const { logout } = useAuth();

  React.useEffect(() => {
    setLoading(true);
    dispatch(fetchAccountReceivedData())
      .then((res) => {
        setLoading(false);
        if (res?.error?.message == 401) {
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [dispatch]);

  React.useEffect(() => {
    setReceivedData(accountReceivableStore.data);
  }, [accountReceivableStore.data]);

  // @TODO: need improvement on this logic
  const applyChangesToAR = (changes, prevAR) => {
    const updatedAR = JSON.parse(JSON.stringify(prevAR)); // Deep copy of prevAR

    changes.forEach((change) => {
      const obIndex = updatedAR.findIndex(
        (ar) => ar.id === Number(change.rowId)
      );
      if (obIndex !== -1) {
        const transactionIndex = updatedAR[obIndex].transaction.findIndex(
          (item) => item.date === change.columnId
        );
        if (transactionIndex !== -1) {
          updatedAR[obIndex].transaction[transactionIndex].value =
            change.newCell.value;
        }
      }
    });

    return updatedAR;
  };

  const handleChanges = (changes) => {
    setReceivedData((prevData) => {
      const updatedData = applyChangesToAR(changes, prevData);
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

    dispatch(updateAccountReceivedData(changesArray));
  };

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      let undoChanges = [];

      setReceivedData((prevData) => {
        undoChanges = cellChanges[cellChangesIndex];

        const updatedData = applyChangesToAR(
          undoChanges.map((change) => ({
            ...change,
            newCell: change.previousCell,
          })),
          prevData
        );
        setCellChangesIndex(cellChangesIndex - 1);
        dispatch(
          updateAccountReceivedData({
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
      setReceivedData((prevData) => {
        const redoChanges = cellChanges[cellChangesIndex + 1];

        const updatedData = applyChangesToAR(redoChanges, prevData);
        setCellChangesIndex(cellChangesIndex + 1);
        dispatch(
          updateAccountReceivedData({
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
      <Header />
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
              <h4 className="main-title mb-0">Accounts Receivable Other</h4>
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
                    enableRowSelection={true}
                    stickyLeftColumns={1}
                    stickyRightColumns={1}
                    stickyTopRows={1}
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
