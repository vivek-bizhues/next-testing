// ** React Imports
import * as React from "react";
import { useEffect, useState } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";

import { ReactGrid } from "@silevis/reactgrid";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import {
  fetchTotalSummary,
  updateDirectLabourPool,
} from "../../../store/plv2/backlogFrontlog/totalSummary";
import {
  bottomLine,
  headerCell,
  nonEditable,
  numberCell,
  textCell,
} from "../../../views/components/reactGrid/cells";
import { formatDate, parseDate } from "../../../utils/get-daterange";
import { getValueCssClass } from "../../../helpers/entitiyHelpers";

const BlFlTotalSummary = () => {
  const ROW_HEIGHT = 32;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTotalSummary({ flag: "all" }));
  }, [dispatch]);

  const BlFlTotalSummaryStore = useSelector((state) => state.BlFlTotalSummary);
  const getColumns = () => {
    const columns = [];
    columns.push({ columnId: "attribute_name", width: 160 });
    columns.push({ columnId: "attribute_value", width: 140 });

    BlFlTotalSummaryStore &&
      Array.isArray(BlFlTotalSummaryStore.fl_bl_totals) &&
      BlFlTotalSummaryStore.fl_bl_totals.forEach((d) => {
        if (d) {
          columns.push({ columnId: "fl_bl_totals__" + d.date, width: 120 });
        }
      });
    return columns;
  };

  const getHeaderRow = () => {
    const header_cells = [];

    if (
      BlFlTotalSummaryStore &&
      BlFlTotalSummaryStore?.fl_bl_totals?.length > 0 &&
      Array.isArray(BlFlTotalSummaryStore.fl_bl_totals)
    ) {
      header_cells.push(
        headerCell("Summary", "justify-content-center font-bold", 2, 0),
        headerCell("", "justify-content-center font-bold")
      );
      BlFlTotalSummaryStore.fl_bl_totals.forEach((d) => {
        if (d) {
          header_cells.push(
            headerCell(
              formatDate(parseDate(d.date), "MMMyyyy").toString(),
              "justify-content-center font-bold"
            )
          );
        }
      });
    }

    return [
      {
        rowId: "heasder",
        height: ROW_HEIGHT,
        cells: header_cells,
      },
    ];
  };

  const getBacklogRows = () => {
    const bl_revenue_cells = [];
    const bl_material_cells = [];
    const bl_sub_contracts_cells = [];
    const bl_direct_labour_cells = [];
    const bl_gross_profit_cells = [];
    const bl_gross_billings_cells = [];

    let monthly_val = 0;
    let materail_value = 0;
    let subcontract_val = 0;
    let directlabour_val = 0;
    let gross_profit = 0;
    let monthly_billing_value = 0;

    if (
      BlFlTotalSummaryStore &&
      BlFlTotalSummaryStore?.fl_bl_totals?.length > 0 &&
      Array.isArray(BlFlTotalSummaryStore.backlog_totals)
    ) {
      bl_revenue_cells.push(
        nonEditable(
          headerCell("Backlog Revenue", "justify-content-left font-bold ")
        )
      );
      bl_material_cells.push(
        nonEditable(textCell("Materials", "justify-content-left disabled"))
      );
      bl_sub_contracts_cells.push(
        nonEditable(textCell("Sub-Contracts", "justify-content-left disabled"))
      );
      bl_direct_labour_cells.push(
        nonEditable(textCell("Direct Labour", "justify-content-left disabled"))
      );
      bl_gross_profit_cells.push(
        nonEditable(textCell("Gross Profit", "justify-content-left disabled"))
      );
      bl_gross_billings_cells.push(
        bottomLine(
          nonEditable(
            textCell("Backlog Billings", "justify-content-left disabled")
          )
        )
      );

      BlFlTotalSummaryStore.fl_bl_totals.map((total_tr) => {
        let tr = BlFlTotalSummaryStore.backlog_totals.find(
          (bl_tr) => bl_tr.date === total_tr.date
        );

        if (tr === undefined) {
          tr = {
            id: 0, // or some placeholder value
            date: total_tr.date, // or a placeholder if appropriate
            monthly_val: 0,
            materail_value: 0,
            subcontract_val: 0,
            directlabour_val: 0,
            gross_profit: 0,
            monthly_billing_value: 0,
          };
        }

        bl_revenue_cells.push(
          nonEditable(
            numberCell(
              tr.monthly_val,
              getValueCssClass(tr.monthly_val, "justify-content-end")
            )
          )
        );
        bl_material_cells.push(
          nonEditable(
            numberCell(
              tr.materail_value,
              getValueCssClass(tr.materail_value, "justify-content-end")
            )
          )
        );
        bl_sub_contracts_cells.push(
          nonEditable(
            numberCell(
              tr.subcontract_val,
              getValueCssClass(tr.subcontract_val, "justify-content-end")
            )
          )
        );
        bl_direct_labour_cells.push(
          nonEditable(
            numberCell(
              tr.directlabour_val,
              getValueCssClass(tr.directlabour_val, "justify-content-end")
            )
          )
        );
        bl_gross_profit_cells.push(
          nonEditable(
            numberCell(
              tr.gross_profit,
              getValueCssClass(tr.gross_profit, "justify-content-end")
            )
          )
        );
        bl_gross_billings_cells.push(
          bottomLine(
            nonEditable(
              numberCell(
                tr.monthly_billing_value,
                getValueCssClass(
                  tr.monthly_billing_value,
                  "justify-content-end"
                )
              )
            )
          )
        );

        monthly_val += tr.monthly_val;
        materail_value += tr.materail_value;
        subcontract_val += tr.subcontract_val;
        directlabour_val += tr.directlabour_val;
        gross_profit += tr.gross_profit;
        monthly_billing_value += tr.monthly_billing_value;
      });

      bl_revenue_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            monthly_val,
            getValueCssClass(monthly_val, "justify-content-end disabled")
          )
        )
      );

      bl_material_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            materail_value,
            getValueCssClass(materail_value, "justify-content-end disabled")
          )
        )
      );
      bl_sub_contracts_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            subcontract_val,
            getValueCssClass(subcontract_val, "justify-content-end disabled")
          )
        )
      );
      bl_direct_labour_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            directlabour_val,
            getValueCssClass(directlabour_val, "justify-content-end disabled")
          )
        )
      );
      bl_gross_profit_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            gross_profit,
            getValueCssClass(gross_profit, "justify-content-end disabled")
          )
        )
      );
      bl_gross_billings_cells.splice(
        1,
        0,
        bottomLine(
          nonEditable(
            numberCell(
              monthly_billing_value,
              getValueCssClass(
                monthly_billing_value,
                "justify-content-end disabled"
              )
            )
          )
        )
      );
    }

    const rows = [
      {
        rowId: "bl_revenue_cells",
        height: ROW_HEIGHT,
        cells: bl_revenue_cells,
      },
      {
        rowId: "bl_material_cells",
        height: ROW_HEIGHT,
        cells: bl_material_cells,
      },
      {
        rowId: "bl_sub_contracts_cells",
        height: ROW_HEIGHT,
        cells: bl_sub_contracts_cells,
      },
      {
        rowId: "bl_direct_labour_cells",
        height: ROW_HEIGHT,
        cells: bl_direct_labour_cells,
      },
      {
        rowId: "bl_gross_profit_cells",
        height: ROW_HEIGHT,
        cells: bl_gross_profit_cells,
      },
      {
        rowId: "bl_gross_billings_cells",
        height: ROW_HEIGHT,
        cells: bl_gross_billings_cells,
      },
    ];

    return rows;
  };

  const getFrontlogRows = () => {
    const fl_revenue_cells = [];
    const fl_material_cells = [];
    const fl_sub_contracts_cells = [];
    const fl_direct_labour_cells = [];
    const fl_gross_profit_cells = [];
    const fl_gross_billings_cells = [];

    let monthly_val = 0;
    let materail_value = 0;
    let subcontract_val = 0;
    let directlabour_val = 0;
    let gross_profit = 0;
    let monthly_billing_value = 0;

    if (
      BlFlTotalSummaryStore &&
      BlFlTotalSummaryStore?.fl_bl_totals?.length > 0 &&
      Array.isArray(BlFlTotalSummaryStore.frontlog_totals)
    ) {
      fl_revenue_cells.push(
        nonEditable(
          headerCell("Frontlog Revenue", "justify-content-left font-bold")
        )
      );
      fl_material_cells.push(
        nonEditable(textCell("Materials", "justify-content-left disabled"))
      );
      fl_sub_contracts_cells.push(
        nonEditable(textCell("Sub-Contracts", "justify-content-left disabled"))
      );
      fl_direct_labour_cells.push(
        nonEditable(textCell("Direct Labour", "justify-content-left disabled"))
      );
      fl_gross_profit_cells.push(
        nonEditable(textCell("Gross Profit", "justify-content-left disabled"))
      );
      fl_gross_billings_cells.push(
        bottomLine(
          nonEditable(
            textCell("Frontlog Billings", "justify-content-left disabled")
          )
        )
      );
      BlFlTotalSummaryStore.fl_bl_totals.map((total_tr) => {
        let tr = BlFlTotalSummaryStore.frontlog_totals.find(
          (bl_tr) => bl_tr.date === total_tr.date
        );

        if (tr === undefined) {
          tr = {
            id: 0,
            date: total_tr.date,
            monthly_val: 0,
            materail_value: 0,
            subcontract_val: 0,
            directlabour_val: 0,
            gross_profit: 0,
            monthly_billing_value: 0,
          };
        }
        fl_revenue_cells.push(
          nonEditable(
            numberCell(
              tr.monthly_val,
              getValueCssClass(tr.monthly_val, "justify-content-end")
            )
          )
        );
        fl_material_cells.push(
          nonEditable(
            numberCell(
              tr.materail_value,
              getValueCssClass(tr.materail_value, "justify-content-end")
            )
          )
        );
        fl_sub_contracts_cells.push(
          nonEditable(
            numberCell(
              tr.subcontract_val,
              getValueCssClass(tr.subcontract_val, "justify-content-end")
            )
          )
        );
        fl_direct_labour_cells.push(
          nonEditable(
            numberCell(
              tr.directlabour_val,
              getValueCssClass(tr.directlabour_val, "justify-content-end")
            )
          )
        );
        fl_gross_profit_cells.push(
          nonEditable(
            numberCell(
              tr.gross_profit,
              getValueCssClass(tr.gross_profit, "justify-content-end")
            )
          )
        );
        fl_gross_billings_cells.push(
          bottomLine(
            nonEditable(
              numberCell(
                tr.monthly_billing_value,
                getValueCssClass(
                  tr.monthly_billing_value,
                  "justify-content-end"
                )
              )
            )
          )
        );

        monthly_val += tr.monthly_val;
        materail_value += tr.materail_value;
        subcontract_val += tr.subcontract_val;
        directlabour_val += tr.directlabour_val;
        gross_profit += tr.gross_profit;
        monthly_billing_value += tr.monthly_billing_value;
      });

      fl_revenue_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            monthly_val,
            getValueCssClass(monthly_val, "justify-content-end disabled")
          )
        )
      );

      fl_material_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            materail_value,
            getValueCssClass(materail_value, "justify-content-end disabled")
          )
        )
      );
      fl_sub_contracts_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            subcontract_val,
            getValueCssClass(subcontract_val, "justify-content-end disabled")
          )
        )
      );
      fl_direct_labour_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            directlabour_val,
            getValueCssClass(directlabour_val, "justify-content-end disabled")
          )
        )
      );
      fl_gross_profit_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            gross_profit,
            getValueCssClass(gross_profit, "justify-content-end disabled")
          )
        )
      );
      fl_gross_billings_cells.splice(
        1,
        0,
        bottomLine(
          nonEditable(
            numberCell(
              monthly_billing_value,
              getValueCssClass(
                monthly_billing_value,
                "justify-content-end disabled"
              )
            )
          )
        )
      );
    }

    const rows = [
      {
        rowId: "fl_revenue_cells",
        height: ROW_HEIGHT,
        cells: fl_revenue_cells,
      },
      {
        rowId: "fl_material_cells",
        height: ROW_HEIGHT,
        cells: fl_material_cells,
      },
      {
        rowId: "fl_sub_contracts_cells",
        height: ROW_HEIGHT,
        cells: fl_sub_contracts_cells,
      },
      {
        rowId: "fl_direct_labour_cells",
        height: ROW_HEIGHT,
        cells: fl_direct_labour_cells,
      },
      {
        rowId: "fl_gross_profit_cells",
        height: ROW_HEIGHT,
        cells: fl_gross_profit_cells,
      },
      {
        rowId: "fl_gross_billings_cells",
        height: ROW_HEIGHT,
        cells: fl_gross_billings_cells,
      },
    ];

    return rows;
  };

  const getTotalRows = () => {
    const flbl_revenue_cells = [];
    const flbl_material_cells = [];
    const flbl_sub_contracts_cells = [];
    const flbl_direct_labour_cells = [];
    const flbl_direct_labour_pool_cells = [];
    const flbl_gross_profit_cells = [];
    const flbl_gross_billings_cells = [];
    const flbl_unutilized_labour_pool_cells = [];

    let monthly_val = 0;
    let materail_value = 0;
    let subcontract_val = 0;
    let directlabour_val = 0;
    let gross_profit = 0;
    let monthly_billing_value = 0;
    let direct_labour_pool = 0;
    let unitilized_labour = 0;

    if (
      BlFlTotalSummaryStore &&
      BlFlTotalSummaryStore?.fl_bl_totals?.length > 0 &&
      Array.isArray(BlFlTotalSummaryStore.fl_bl_totals)
    ) {
      flbl_revenue_cells.push(
        nonEditable(
          headerCell("Total Revenue", "justify-content-left font-bold")
        )
      );
      flbl_material_cells.push(
        nonEditable(textCell("Materials", "justify-content-left disabled"))
      );
      flbl_sub_contracts_cells.push(
        nonEditable(textCell("Sub-Contracts", "justify-content-left disabled"))
      );
      flbl_direct_labour_cells.push(
        nonEditable(textCell("Direct Labour", "justify-content-left disabled"))
      );
      flbl_gross_profit_cells.push(
        nonEditable(textCell("Gross Profit", "justify-content-left disabled"))
      );
      flbl_direct_labour_pool_cells.push(
        nonEditable(
          textCell("Production Labour Pool", "justify-content-left disabled")
        )
      );
      flbl_unutilized_labour_pool_cells.push(
        nonEditable(
          textCell("Unutilized Labour", "justify-content-left disabled")
        )
      );

      flbl_gross_billings_cells.push(
        bottomLine(
          nonEditable(
            textCell("Total Billings", "justify-content-left disabled")
          )
        )
      );

      BlFlTotalSummaryStore.fl_bl_totals.map((tr) => {
        flbl_revenue_cells.push(
          nonEditable(
            numberCell(
              tr.monthly_val,
              getValueCssClass(tr.monthly_val, "justify-content-end")
            )
          )
        );
        flbl_material_cells.push(
          nonEditable(
            numberCell(
              tr.materail_value,
              getValueCssClass(tr.materail_value, "justify-content-end")
            )
          )
        );
        flbl_sub_contracts_cells.push(
          nonEditable(
            numberCell(
              tr.subcontract_val,
              getValueCssClass(tr.subcontract_val, "justify-content-end")
            )
          )
        );
        flbl_direct_labour_cells.push(
          nonEditable(
            numberCell(
              tr.directlabour_val,
              getValueCssClass(tr.directlabour_val, "justify-content-end")
            )
          )
        );
        flbl_gross_profit_cells.push(
          nonEditable(
            numberCell(
              tr.gross_profit,
              getValueCssClass(tr.gross_profit, "justify-content-end")
            )
          )
        );
        flbl_direct_labour_pool_cells.push(
          numberCell(tr.direct_labour_pool, "justify-content-end editable")
        );

        const flbl_unutilized_labour_pool =
          tr.direct_labour_pool - tr.directlabour_val;
        flbl_unutilized_labour_pool_cells.push(
          nonEditable(
            numberCell(
              flbl_unutilized_labour_pool,
              getValueCssClass(
                flbl_unutilized_labour_pool,
                "justify-content-end"
              )
            )
          )
        );
        flbl_gross_billings_cells.push(
          bottomLine(
            nonEditable(
              numberCell(
                tr.monthly_billing_value,
                getValueCssClass(
                  tr.monthly_billing_value,
                  "justify-content-end"
                )
              )
            )
          )
        );

        monthly_val += tr.monthly_val;
        materail_value += tr.materail_value;
        subcontract_val += tr.subcontract_val;
        directlabour_val += tr.directlabour_val;
        gross_profit += tr.gross_profit;
        monthly_billing_value += tr.monthly_billing_value;
        direct_labour_pool += tr.direct_labour_pool;
        unitilized_labour += tr.direct_labour_pool - tr.directlabour_val;
      });

      flbl_revenue_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            monthly_val,
            getValueCssClass(monthly_val, "justify-content-end disabled")
          )
        )
      );

      flbl_material_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            materail_value,
            getValueCssClass(materail_value, "justify-content-end disabled")
          )
        )
      );
      flbl_sub_contracts_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            subcontract_val,
            getValueCssClass(subcontract_val, "justify-content-end disabled")
          )
        )
      );
      flbl_direct_labour_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            directlabour_val,
            getValueCssClass(directlabour_val, "justify-content-end disabled")
          )
        )
      );
      flbl_gross_profit_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            gross_profit,
            getValueCssClass(gross_profit, "justify-content-end disabled")
          )
        )
      );
      flbl_direct_labour_pool_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            direct_labour_pool,
            getValueCssClass(direct_labour_pool, "justify-content-end disabled")
          )
        )
      );
      flbl_unutilized_labour_pool_cells.splice(
        1,
        0,
        nonEditable(
          numberCell(
            unitilized_labour,
            getValueCssClass(unitilized_labour, "justify-content-end disabled")
          )
        )
      );
      flbl_gross_billings_cells.splice(
        1,
        0,
        bottomLine(
          nonEditable(
            numberCell(
              monthly_billing_value,
              getValueCssClass(
                monthly_billing_value,
                "justify-content-end disabled"
              )
            )
          )
        )
      );
    }

    const rows = [
      {
        rowId: "flbl_revenue_cells",
        height: ROW_HEIGHT,
        cells: flbl_revenue_cells,
      },
      {
        rowId: "flbl_material_cells",
        height: ROW_HEIGHT,
        cells: flbl_material_cells,
      },
      {
        rowId: "flbl_sub_contracts_cells",
        height: ROW_HEIGHT,
        cells: flbl_sub_contracts_cells,
      },
      {
        rowId: "flbl_direct_labour_cells",
        height: ROW_HEIGHT,
        cells: flbl_direct_labour_cells,
      },
      {
        rowId: "flbl_gross_profit_cells",
        height: ROW_HEIGHT,
        cells: flbl_gross_profit_cells,
      },
      {
        rowId: "flbl_direct_labour_pool_cells",
        height: ROW_HEIGHT,
        cells: flbl_direct_labour_pool_cells,
      },
      {
        rowId: "flbl_unutilized_labour_pool_cells",
        height: ROW_HEIGHT,
        cells: flbl_unutilized_labour_pool_cells,
      },

      {
        rowId: "flbl_gross_billings_cells",
        height: ROW_HEIGHT,
        cells: flbl_gross_billings_cells,
      },
    ];

    return rows;
  };

  const getRows = () => {
    const headerRow = getHeaderRow();
    const backlogRows = getBacklogRows();
    const frontlogRows = getFrontlogRows();
    const totalRows = getTotalRows();
    return headerRow.concat(totalRows.concat(backlogRows.concat(frontlogRows)));
    // return headerRow;
  };

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    setColumns(getColumns());
    setRows(getRows());
  }, [dispatch, BlFlTotalSummaryStore]);

  const handleChanges = (changes) => {
    setLoading(true);
    const updatedRows = [...rows];
    changes.forEach((change) => {
      const { rowId, columnId, newCell } = change;
      const rowIndex = updatedRows.findIndex((row) => row.rowId === rowId);
      const columnIndex = columns.findIndex(
        (column) => column.columnId === columnId
      );
      if (rowIndex !== -1 && columnIndex !== -1) {
        updatedRows[rowIndex].cells[columnIndex].value = newCell.value;
      }
    });
    setRows(updatedRows);

    // Dispatch update to backend
    changes.forEach((change) => {
      const { columnId, newCell } = change;
      const d = columnId.toString().split("__");

      // Dispatch updateDirectLabourPool with appropriate value
      dispatch(
        updateDirectLabourPool({
          date: d[1],
          direct_labour_pool: newCell.value,
        })
      );
    });
    setTimeout(() => {
      setLoading(false); // Set loading to false when changes are done
    }, 1000);
  };

  return (
    <>
      <Box sx={{ mb: 8 }}>
        <div className="plv2_rg">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            BlFlTotalSummaryStore?.fl_bl_totals?.length > 0 && (
              <ReactGrid
                rows={rows}
                columns={columns}
                enableRowSelection={true}
                stickyLeftColumns={2}
                enableFillHandle
                enableRangeSelection
                onCellsChanged={handleChanges}
              />
            )
          )}
        </div>
      </Box>
    </>
  );
};

export default BlFlTotalSummary;
