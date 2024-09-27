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
  fetchAccountPayableOtherData,
  updateAccountPayableOtherData,
} from "../../store/plv2/accountPayableData";

export default function AccountPayableOthers() {
  const dispatch = useDispatch();
  const accountPayableSTore = useSelector((state) => state.accountPayableData);
  const activeEntity = getCurrentEntity();
  const [loading, setLoading] = useState(true);
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

  const [payableData, setPayableData] = React.useState(
    accountPayableSTore.data
  );

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
  // const HEADING_ROW_HEIGHT = 40;

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

    return rowCells;
  };

  const getRows = (payableData) => [
    headerRow,
    ...payableData.map((ap) => ({
      rowId: ap.id.toString(),
      cells: getRowCells(ap),
      height: ROW_HEIGHT,
    })),
    {
      rowId: "footer",
      cells: getFooterCells(payableData),
      height: ROW_HEIGHT,
    },
  ];

  const getFooterCells = (payableData) => {
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
    payableData.forEach((ap) => {
      ap.transaction.forEach((t) => {
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
    payableData.forEach((ap) => {
      ap.transaction.forEach((t) => {
        rowTotal += Number(t.value);
      });
    });

    footerCells.push(
      groupFooterNumberCell(rowTotal, "padding-right-lg text-md  primary")
    );

    return footerCells;
  };

  const rows = getRows(payableData);
  const columns = getColumns();

  // const { logout } = useAuth();

  React.useEffect(() => {
    setLoading(true);
    dispatch(fetchAccountPayableOtherData())
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
    setPayableData(accountPayableSTore.data);
  }, [accountPayableSTore.data]);

  // @TODO: need improvement on this logic
  const applyChangesToPayableData = (changes, prevAP) => {
    const updatedAP = JSON.parse(JSON.stringify(prevAP)); // Deep copy of prevAP
    // console.log(updatedAP, "UpdatedAP");

    changes.forEach((change) => {
      const obIndex = updatedAP.findIndex(
        (ap) => ap.id === Number(change.rowId)
      );
      if (obIndex !== -1) {
        const transactionIndex = updatedAP[obIndex].transaction.findIndex(
          (item) => item.date === change.columnId
        );
        if (transactionIndex !== -1) {
          updatedAP[obIndex].transaction[transactionIndex].value =
            change.newCell.value;
        }
      }
    });

    return updatedAP;
  };

  const handleChanges = (changes) => {
    setPayableData((prevData) => {
      // console.log(prevData, "prevdata");
      const updatedData = applyChangesToPayableData(changes, prevData);
      // console.log(updatedData, "Updated data");
      setCellChanges((prevChanges) => [
        ...prevChanges.slice(0, cellChangesIndex + 1),
        changes,
      ]);

      setCellChangesIndex(cellChangesIndex + 1);
      return updatedData;
    });
    // console.log(changes, "changes");

    const changesArray = changes.map((change) => ({
      coa: Number(change.rowId),
      value: change.newCell.value,
      date: change.columnId,
    }));

    // console.log(changesArray, "array");

    dispatch(updateAccountPayableOtherData(changesArray));
  };

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      let undoChanges = [];

      setPayableData((prevData) => {
        undoChanges = cellChanges[cellChangesIndex];
        const updatedData = applyChangesToPayableData(
          undoChanges.map((change) => ({
            ...change,
            newCell: change.previousCell,
          })),
          prevData
        );
        setCellChangesIndex(cellChangesIndex - 1);
        dispatch(
          updateAccountPayableOtherData({
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
      setPayableData((prevData) => {
        const redoChanges = cellChanges[cellChangesIndex + 1];

        const updatedData = applyChangesToPayableData(redoChanges, prevData);
        setCellChangesIndex(cellChangesIndex + 1);
        dispatch(
          updateAccountPayableOtherData({
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
              <h4 className="main-title mb-0">Accounts Payable Other</h4>
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
