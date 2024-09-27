import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import { useDispatch, useSelector } from "react-redux";
import { getColumns } from "./components/getColumns";
import { createRows } from "./components/getRows";
import {
  fetchOpeningBalance,
  updateOpeningBalance,
} from "../../store/plv2/openingBalance";
import { ReactGrid } from "@silevis/reactgrid";
import { Grid } from "@mui/material";
import "@silevis/reactgrid/styles.css";

export default function OpeningBalance() {
  const dispatch = useDispatch();
  const openingBalanceStore = useSelector((state) => state.openingBalance);
  const [cellChanges, setCellChanges] = useState([]);
  const [cellChangesIndex, setCellChangesIndex] = useState(-1);

  const getOpeningBalance = () => {
    const data = [];
    openingBalanceStore.data.forEach((cat) => {
      data.push({
        id: 0,
        type: "group_header",
        name: cat.category,
        value: 0,
        tag: "",
      });

      let categoryTotal = 0;
      cat.coas.forEach((coa) => {
        categoryTotal += coa.value;
        data.push({
          id: coa.id,
          type: "opening_balance",
          name: coa.name,
          value: coa.value,
          tag: cat.category,
        });
      });

      data.push({
        id: 0,
        type: "group_total",
        name: `Total ${cat.category}`,
        value: categoryTotal,
        tag: cat.category,
      });
    });
    return data;
  };

  const [openingBalanceRowData, setOpeningBalanceRowData] = useState(
    getOpeningBalance()
  );
  const [rows, setRows] = useState(createRows(openingBalanceRowData));
  const columns = getColumns();

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchOpeningBalance())
      .then((res) => {
        if (res?.error?.message === 401) {
          // Handle unauthorized access if necessary
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  // Update row data when the store changes
  useEffect(() => {
    setOpeningBalanceRowData(getOpeningBalance());
  }, [openingBalanceStore]);

  // Update rows when row data changes
  useEffect(() => {
    setRows(createRows(openingBalanceRowData));
  }, [openingBalanceRowData]);

  const applyChangesToOpeningBalance = (changes, prevOB) => {
    changes.forEach((change) => {
      const rowIndex = prevOB.findIndex((ob) => ob.id === change.rowId);
      if (rowIndex !== -1) {
        const newOb = prevOB.filter(
          (data) => data.name === `Total ${prevOB[rowIndex].tag}`
        );
        if (newOb.length > 0) {
          newOb[0].value =
            newOb[0].value - change.previousCell.value + change.newCell.value;
        }
        prevOB[rowIndex][change.columnId] = change.newCell.value;
      }
    });
    return [...prevOB];
  };

  const handleChanges = (changes) => {
    setOpeningBalanceRowData((prevData) => {
      const updatedData = applyChangesToOpeningBalance(changes, prevData);
      setCellChanges((prevChanges) => [
        ...prevChanges.slice(0, cellChangesIndex + 1),
        changes,
      ]);
      setCellChangesIndex((index) => index + 1);
      return updatedData;
    });

    changes.forEach((change) => {
      dispatch(
        updateOpeningBalance({
          coa: Number(change.rowId),
          value: change.newCell.value,
        })
      );
    });
  };

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      const undoChanges = cellChanges[cellChangesIndex];
      setOpeningBalanceRowData((prevData) => {
        const updatedData = applyChangesToOpeningBalance(
          undoChanges.map((change) => ({
            ...change,
            newCell: change.previousCell,
          })),
          prevData
        );
        setCellChangesIndex((index) => index - 1);
        dispatch(
          updateOpeningBalance({
            coa: undoChanges[0].rowId,
            value: undoChanges[0].previousCell.value,
          })
        );
        return updatedData;
      });
    }
  };

  const handleRedoChanges = () => {
    if (cellChangesIndex + 1 < cellChanges.length) {
      const redoChanges = cellChanges[cellChangesIndex + 1];
      setOpeningBalanceRowData((prevData) => {
        const updatedData = applyChangesToOpeningBalance(redoChanges, prevData);
        setCellChangesIndex((index) => index + 1);
        dispatch(
          updateOpeningBalance({
            coa: redoChanges[0].rowId,
            value: redoChanges[0].newCell.value,
          })
        );
        return updatedData;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "z":
          e.preventDefault();
          handleUndoChanges();
          break;
        case "y":
          e.preventDefault();
          handleRedoChanges();
          break;
        default:
          break;
      }
    }
  };

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4" onKeyDown={handleKeyDown}>
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Opening Balances</h4>
          </div>
        </div>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <div className="plv2_rg">
              <ReactGrid
                rows={rows}
                columns={columns}
                onCellsChanged={handleChanges}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
}
