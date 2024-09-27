import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentEntity,
  getCurrentEntityIMVs,
} from "../../helpers/entitiyHelpers";
import { fetchImTemplate } from "../../store/plv2/imTemplate";
import {
  formatDate,
  getDateRangeInMonths,
  parseDate,
} from "../../utils/get-daterange";
import {
  headerCell,
  headerChevronCell,
  hideZero,
  nonEditable,
  numberCell,
  percentCell,
  textCell,
} from "../../views/components/reactGrid/cells";
import moment from "moment";
import { updateIMVersion } from "../../store/plv2/imVersion";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import { ReactGrid } from "@silevis/reactgrid";
import ReactLoaderRound from "../../components/ReactLoader/ReactLoader";
import Loader from "@/components/Loader/Loader";

export default function IM() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const activeEntity = getCurrentEntity();
  const imvs = getCurrentEntityIMVs();
  const active_imv = imvs?.find(
    (imv) => imv.id === activeEntity?.active_im_version
  );

  const [average, setAverage] = useState(0);
  const [sum, setSum] = useState(0);
  const [count, setCount] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  const modelStructure = useSelector((state) => state.imTemplate);

  const [activeIMV, setActiveIMV] = useState(active_imv);

  // Initialize dates as null
  const [dates, setDates] = useState({ startDate: null, endDate: null });

  // State for model date range
  const [modelDateRange, setModelDateRange] = useState(null);

  // Fetching IM Template
  useEffect(() => {
    setLoading(true);
    dispatch(fetchImTemplate())
      .then((res) => {
        setLoading(false);
        if (res?.error?.message === "401") {
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [dispatch]);

  // Effect to update dates based on active entity
  useEffect(() => {
    if (activeEntity) {
      const startDate = parseDate(activeEntity.start_date);
      const endDate = parseDate(activeEntity.end_date);

      // Only update dates if they have changed
      if (startDate !== dates.startDate || endDate !== dates.endDate) {
        setDates({ startDate, endDate });
      }
    }
    // Dependency array should only include activeEntity
    // to avoid unnecessary re-renders
  }, [activeIMV]);

  // Effect to calculate model date range when dates change
  useEffect(() => {
    if (dates.startDate && dates.endDate) {
      const dateRange = getDateRangeInMonths(
        dates.startDate,
        dates.endDate,
        "yyyy-MM-01"
      );
      setModelDateRange(dateRange);
    }
  }, [dates]);

  // Other states and logic remain unchanged...
  const ROW_HEIGHT = 32;
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [rowsToRender, setRowsToRender] = useState([]);
  const [cellCssStyles, setCellCssStyles] = useState();

  const getSectionRowCells = (section) => {
    const rowCellsList = [];
    rowCellsList.push(
      headerChevronCell(
        section?.__attrs?.name,
        true,
        true,
        0,
        1,
        "section-title " + section?.__attrs.tech_name.toString()
      )
    );
    modelDateRange?.forEach((d) => {
      if (d) {
        rowCellsList.push(
          textCell(
            formatDate(moment(d).toDate(), "MMM-yyyy"),
            "justify-content-center section-row " + section?.__attrs.tech_name
          )
        );
      }
    });
    return rowCellsList;
  };

  const getGroupRowCells = (group, parentId, sectionTechname) => {
    const rowCellsList = [];
    rowCellsList.push(
      headerChevronCell(
        group.__attrs.name,
        true,
        true,
        parentId,
        2,
        "group-title " + sectionTechname + " " + group.__attrs.tech_name
      )
    );
    modelDateRange?.forEach((d) => {
      if (d) {
        rowCellsList.push(
          headerCell(
            "",
            "justify-content-center group-row " +
              sectionTechname +
              " " +
              group.__attrs.tech_name
          )
        );
      }
    });
    return rowCellsList;
  };

  const getFormulaRowCells = (formula, parentId, sectionTechname) => {
    const rowCellsList = [];

    rowCellsList.push(
      headerChevronCell(
        formula.name,
        false,
        false,
        parentId,
        3,
        "formula-title " + sectionTechname
      )
    );

    if ("data" in formula) {
      modelDateRange?.forEach((d) => {
        if (d) {
          if (formula.type === "PERCENTAGE") {
            rowCellsList.push(
              nonEditable(
                hideZero(
                  percentCell(
                    formula.data[d] / 100,
                    "justify-content-end formula-row " +
                      sectionTechname +
                      (formula.data[d] < 0 ? " text-red" : "")
                  )
                )
              )
            );
          } else {
            rowCellsList.push(
              nonEditable(
                hideZero(
                  numberCell(
                    formula.data[d],
                    "justify-content-end formula-row " +
                      sectionTechname +
                      (formula.data[d] < 0 ? " text-red" : "")
                  )
                )
              )
            );
          }
        }
      });
    }

    return rowCellsList;
  };

  const commaSeperator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getColumns = () => {
    const columns = [];
    columns.push({ columnId: "name", width: 250 });

    let previousYear = null;

    modelDateRange?.forEach((d) => {
      if (d) {
        const currentYear = new Date(d).getFullYear();
        if (currentYear !== previousYear && previousYear !== null) {
          columns.push({ columnId: `${previousYear}_total`, width: 120 }); // Add the "Total" column for the previous year
        }
        columns.push({ columnId: d, width: 120 });
        previousYear = currentYear;
      }
    });

    // Add total for the last year in the range
    if (previousYear !== null) {
      columns.push({ columnId: `${previousYear}_total`, width: 120 });
    }

    return columns;
  };

  const prepareModelStructure = () => {
    const rows = [];
    const cellCssStylesList = [];

    Object.entries(modelStructure.data).forEach(([sectionName, section]) => {
      // console.log(sectionName);
      const sectionRowId = "section_" + section.__attrs.id.toString();
      rows.push({
        rowId: sectionRowId,
        cells: getSectionRowCells(section),
        height: ROW_HEIGHT,
      });

      if (
        section.__attrs.bold ||
        section.__attrs.bg_color ||
        section.__attrs.font_color
      ) {
        cellCssStylesList.push(`
          .plv2_rg .section-row.${section.__attrs.tech_name}{
            background-color: ${section.__attrs.bg_color} !important;
            color: ${section.__attrs.font_color} !important;
            font-weight: ${section.__attrs.bold ? "bold" : "normal"} !important;
          }
          .plv2_rg .section-title.${section.__attrs.tech_name}{
            background-color: ${section.__attrs.bg_color} !important;
            color: ${section.__attrs.font_color} !important;
            font-weight: ${section.__attrs.bold ? "bold" : "normal"} !important;
          }
          `);
      }

      Object.entries(section).forEach(([groupName, group]) => {
        // console.log(groupName);
        if ("id" in group) {
          // console.log("id");
        } else {
          const groupRowId = "group_" + group.__attrs.id.toString();
          rows.push({
            rowId: groupRowId,
            cells: getGroupRowCells(
              group,
              sectionRowId,
              section.__attrs.tech_name.toString()
            ),
            height: ROW_HEIGHT,
          });
          if (
            group.__attrs.bold ||
            group.__attrs.bg_color ||
            group.__attrs.font_color
          ) {
            cellCssStylesList.push(`
                .plv2_rg .group-row.${section.__attrs.tech_name}.${
              group.__attrs.tech_name
            }{
                  background-color: ${
                    group.__attrs.bg_color ? group.__attrs.bg_color : "inherit"
                  } !important;
                  color: ${group.__attrs.font_color} !important;
                  font-weight: ${
                    group.__attrs.bold ? "bold" : "normal"
                  } !important;
                }
                .plv2_rg .group-title.${section.__attrs.tech_name}.${
              group.__attrs.tech_name
            }{
                  
                  background-color: ${
                    group.__attrs.bg_color ? group.__attrs.bg_color : "inherit"
                  } !important;
                  color: ${group.__attrs.font_color} !important;
                  font-weight: ${
                    group.__attrs.bold ? "bold" : "normal"
                  } !important;
                }
                `);
          }

          Object.entries(group).forEach(([formulaName, formula]) => {
            // console.log(formulaName);
            if ("data" in formula && formula.show === true) {
              const formulaRowId = "formula_" + formula.id.toString();
              rows.push({
                rowId: formulaRowId,
                cells: getFormulaRowCells(
                  formula,
                  groupRowId,
                  section.__attrs.tech_name.toString() +
                    " " +
                    group.__attrs.tech_name.toString() +
                    " formula_" +
                    formula.tech_name
                ),
                height: ROW_HEIGHT,
              });

              if (formula.bold || formula.bg_color || formula.font_color) {
                cellCssStylesList.push(`
                      .plv2_rg .formula-row.${section.__attrs.tech_name}.${
                  group.__attrs.tech_name
                }.formula_${formula.tech_name}{
                        background-color: ${
                          formula.bg_color ? formula.bg_color : "inherit"
                        } !important;
                        color: ${formula.font_color} !important;
                        font-weight: ${
                          formula.bold ? "bold" : "normal"
                        } !important;
                      }
                      .plv2_rg .formula-title.${section.__attrs.tech_name}.${
                  group.__attrs.tech_name
                }.formula_${formula.tech_name}{
                        background-color: ${
                          formula.bg_color ? formula.bg_color : "inherit"
                        } !important;
                        color: ${
                          formula.font_color ? formula.font_color : "inherit"
                        } !important;
                        font-weight: ${
                          formula.bold ? "bold" : "normal"
                        } !important;
                      }
                      `);
              }
            }
          });
        }
      });
    });

    setCellCssStyles(cellCssStylesList.join(""));
    return rows;
  };

  /* 
  searches for a chevron cell in given row
*/
  const findChevronCell = (row) =>
    row.cells.find((cell) => cell.type === "chevron");

  /* 
  searches for a parent of given row
*/
  const findParentRow = (rows, row) =>
    rows.find((r) => {
      const foundChevronCell = findChevronCell(row);
      return foundChevronCell ? r.rowId === foundChevronCell.parentId : false;
    });

  /* 
  check if the row has children
*/
  const hasChildren = (rows, row) =>
    rows.some((r) => {
      const foundChevronCell = findChevronCell(r);
      return foundChevronCell ? foundChevronCell.parentId === row.rowId : false;
    });

  /* 
  Checks is row expanded
*/
  const isRowFullyExpanded = (rows, row) => {
    const parentRow = findParentRow(rows, row);
    if (parentRow) {
      const foundChevronCell = findChevronCell(parentRow);
      if (foundChevronCell && !foundChevronCell.isExpanded) return false;
      return isRowFullyExpanded(rows, parentRow);
    }
    return true;
  };

  const getExpandedRows = (rows) =>
    rows.filter((row) => {
      const areAllParentsExpanded = isRowFullyExpanded(rows, row);
      return areAllParentsExpanded !== undefined ? areAllParentsExpanded : true;
    });

  const getDirectChildRows = (rows, parentRow) =>
    rows.filter(
      (row) =>
        !!row.cells.find(
          (cell) => cell.type === "chevron" && cell.parentId === parentRow.rowId
        )
    );

  const assignIndentAndHasChildren = (rows, parentRow, indent = 0) => {
    ++indent;
    getDirectChildRows(rows, parentRow).forEach((row) => {
      const foundChevronCell = findChevronCell(row);
      const hasRowChildrens = hasChildren(rows, row);
      if (foundChevronCell) {
        foundChevronCell.hasChildren = hasRowChildrens;
      }
      if (hasRowChildrens) assignIndentAndHasChildren(rows, row, indent);
    });
  };

  const buildTree = (rows) =>
    rows.map((row) => {
      const foundChevronCell = findChevronCell(row);
      if (foundChevronCell && !foundChevronCell.parentId) {
        const hasRowChildrens = hasChildren(rows, row);
        foundChevronCell.hasChildren = hasRowChildrens;
        if (hasRowChildrens) assignIndentAndHasChildren(rows, row);
      }
      return row;
    });

  const handleChanges = (changes) => {
    const newRows = [...rows];
    changes.forEach((change) => {
      const changeRowIdx = rows.findIndex((el) => el.rowId === change.rowId);
      const changeColumnIdx = columns.findIndex(
        (el) => el.columnId === change.columnId
      );
      newRows[changeRowIdx].cells[changeColumnIdx] = change.newCell;
    });
    setRows(buildTree(newRows));
    setRowsToRender(getExpandedRows(newRows));
  };

  useEffect(() => {
    const _r = prepareModelStructure();
    setRows(buildTree(_r));
    setRowsToRender(getExpandedRows(_r));
    setColumns(getColumns());
  }, [modelStructure]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setActiveIMV((prevState) => ({
      ...prevState,
      [id]: parseInt(value),
    }));
  };

  const handleSaveClick = () => {
    // console.log("save clicked");
    dispatch(updateIMVersion(activeIMV));
  };

  const validatePercentageValue = (value) => {
    const numericValue = Number(value);
    return numericValue > 0 && numericValue <= 100;
  };
  const validateDaysValue = (value) => {
    const numericValue = Number(value);
    return numericValue > 0 && numericValue <= 90;
  };

  const generateDynamicCss = () => {
    return cellCssStyles;
  };

  const handleCellsSelection = (selections) => {
    let selectedCells = [];
    let totalColumns = 0;
    let totalRows = 0;

    selections?.forEach((selection) => {
      const selectedColumns = selection?.columns?.map((column) => column?.idx); // Extract column indices

      selection?.rows?.forEach((row) => {
        const rowIndex = row?.idx; // Use the index directly from the selection
        selectedColumns?.forEach((colIdx) => {
          // Iterate over the selected column indices
          const cell = rows[rowIndex]?.cells[colIdx];
          if (cell && cell?.value) {
            selectedCells?.push(Math.round(cell?.value)); // Round off the value
          }
        });
      });

      totalColumns += selection?.columns?.length;
      totalRows += selection?.rows?.length;
    });

    const sum = selectedCells?.reduce((acc, value) => acc + value, 0);
    const count = selectedCells?.length;
    const average = count === 0 ? 0 : sum / count;

    setSum(sum);
    setCount(count);
    setAverage(average);
    const minValue = Math.min(...selectedCells);
    const maxValue = Math.max(...selectedCells);
    setMinValue(minValue);
    setMaxValue(maxValue);
  };
  return (
    <React.Fragment>
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Integrated Model</h4>
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
        <div className="plv2_rg">
          <style>{generateDynamicCss()}</style>

          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  id="panel1-header"
                  expandIcon={<GridExpandMoreIcon></GridExpandMoreIcon>}
                >
                  Configuration variables
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="income_tax_rate"
                        label="Income Tax Rate"
                        title="Income Tax Rate"
                        variant="standard"
                        size="small"
                        value={activeIMV?.income_tax_rate}
                        onChange={handleInputChange}
                        error={
                          !validatePercentageValue(activeIMV?.income_tax_rate)
                        }
                        helperText={
                          !validatePercentageValue(activeIMV?.income_tax_rate)
                            ? "Value must be between 0 and 100"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="interest_rate_on_deposits"
                        label="Interest Rate On Deposits"
                        title="Interest Rate On Deposits"
                        variant="standard"
                        size="small"
                        value={activeIMV?.interest_rate_on_deposits}
                        onChange={handleInputChange}
                        error={
                          !validatePercentageValue(
                            activeIMV?.interest_rate_on_deposits
                          )
                        }
                        helperText={
                          !validatePercentageValue(
                            activeIMV?.interest_rate_on_deposits
                          )
                            ? "Value must be between 0 and 100"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="inventory_days"
                        label="Inventory Days"
                        title="Inventory Days"
                        variant="standard"
                        size="small"
                        value={activeIMV?.inventory_days}
                        onChange={handleInputChange}
                        error={!validateDaysValue(activeIMV?.inventory_days)}
                        helperText={
                          !validateDaysValue(activeIMV?.inventory_days)
                            ? "Value must be between 1 and 90"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="accounts_payable_days_costs_of_sales"
                        label="Accounts Payable Days CoS"
                        title="Accounts Payable Days Cost of sales"
                        variant="standard"
                        size="small"
                        value={activeIMV?.accounts_payable_days_costs_of_sales}
                        onChange={handleInputChange}
                        error={
                          !validateDaysValue(
                            activeIMV?.accounts_payable_days_costs_of_sales
                          )
                        }
                        helperText={
                          !validateDaysValue(
                            activeIMV?.accounts_payable_days_costs_of_sales
                          )
                            ? "Value must be between 1 and 90"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="interest_rate_on_operating_line"
                        label="Interest Rate On Operating Line"
                        title="Interest Rate On Operating Line"
                        variant="standard"
                        size="small"
                        value={activeIMV?.interest_rate_on_operating_line}
                        onChange={handleInputChange}
                        error={
                          !validatePercentageValue(
                            activeIMV?.interest_rate_on_operating_line
                          )
                        }
                        helperText={
                          !validatePercentageValue(
                            activeIMV?.interest_rate_on_operating_line
                          )
                            ? "Value must be between 0 and 100"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="accounts_receivable_days"
                        label="Accounts Receivable Days"
                        title="Accounts Receivable Days"
                        variant="standard"
                        size="small"
                        value={activeIMV?.accounts_receivable_days}
                        onChange={handleInputChange}
                        error={
                          !validateDaysValue(
                            activeIMV?.accounts_receivable_days
                          )
                        }
                        helperText={
                          !validateDaysValue(
                            activeIMV?.accounts_receivable_days
                          )
                            ? "Value must be between 1 and 90"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="accounts_receivable_days_others"
                        label="Accounts Receivable Days Others"
                        title="Accounts Receivable Days Others"
                        variant="standard"
                        size="small"
                        value={activeIMV?.accounts_receivable_days_others}
                        onChange={handleInputChange}
                        error={
                          !validateDaysValue(
                            activeIMV?.accounts_receivable_days_others
                          )
                        }
                        helperText={
                          !validateDaysValue(
                            activeIMV?.accounts_receivable_days_others
                          )
                            ? "Value must be between 1 and 90"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="accounts_payable_days_others"
                        label="Accounts Payable Days Others"
                        title="Accounts Payable Days Other"
                        variant="standard"
                        size="small"
                        value={activeIMV?.accounts_payable_days_others}
                        onChange={handleInputChange}
                        error={
                          !validateDaysValue(
                            activeIMV?.accounts_payable_days_others
                          )
                        }
                        helperText={
                          !validateDaysValue(
                            activeIMV?.accounts_payable_days_others
                          )
                            ? "Value must be between 1 and 90"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        type="number"
                        id="cash_conversion_cycle"
                        disabled
                        label="Cash Conversion Cycle"
                        title="Cash Conversion Cycle"
                        variant="standard"
                        size="small"
                        value={activeIMV?.cash_conversion_cycle}
                        onChange={handleInputChange}
                        error={
                          !validateDaysValue(activeIMV?.cash_conversion_cycle)
                        }
                        helperText={
                          !validateDaysValue(activeIMV?.cash_conversion_cycle)
                            ? "Value must be between 1 and 90"
                            : ""
                        }
                      ></TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Button
                        id="saveConfig"
                        variant="contained"
                        onClick={handleSaveClick}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <div className="plv2_grid">
                {loading ? (
                  <Loader title={"Loading"} />
                ) : (
                  <ReactGrid
                    rows={rowsToRender}
                    columns={columns}
                    stickyLeftColumns={1}
                    stickyTopRows={1}
                    // enableRowSelection={true}
                    enableFillHandle
                    // enableColumnSelection={true}
                    enableRangeSelection={true}
                    // enableCellsSelection={true}

                    onCellsChanged={handleChanges}
                    enableFullWidthHeader={true}
                    onSelectionChanged={handleCellsSelection}
                  />
                )}
              </div>
            </Grid>

            {count > 1 && (
              <Grid item xs={12}>
                <div
                  style={{
                    // height: "30px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "15px",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "fixed",
                    bottom: 10,
                    right: 30,
                    padding: "10px",
                    background: "white",
                    border: "1px solid #e3d2d2",
                    fontSize: " 12px",
                    fontWeight: "600",
                  }}
                >
                  <div>Sum: {commaSeperator(sum)}</div>
                  <div>Avg: {commaSeperator(Math.round(average))}</div>
                  <div>Count: {commaSeperator(count)}</div>
                  <div>Min: {commaSeperator(minValue)}</div>
                  <div>Max: {commaSeperator(maxValue)}</div>
                </div>
              </Grid>
            )}
          </Grid>
        </div>
      </div>
    </React.Fragment>
  );
}
