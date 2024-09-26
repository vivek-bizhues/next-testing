import * as React from "react";
// ** MUI Imports
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ReactGrid } from "@silevis/reactgrid";
import { ToastContainer, toast } from "react-toastify";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { useDispatch } from "react-redux";
import moment from "moment";
import {
  convertToUTCDate,
  getDateRangeInMonths,
  parseDate,
} from "../../../utils/get-daterange";
import { useState } from "react";
import {
  headerCell,
  noBorders,
  percentCell,
  rightBorder,
  textCell,
} from "../../../views/components/reactGrid/cells";
import {
  dateCell,
  emptyTextCell,
  nonEditable,
  numberCell,
} from "../../Ledgers/components/cells";
import { getValueCssClass } from "../../../helpers/entitiyHelpers";
import {
  cloneBacklog,
  deleteBacklogData,
  updateContractData,
  updateContractTransactionData,
} from "../../../store/plv2/backlogFrontlog/backlog";

const BacklogItem = (props) => {
  const dispatch = useDispatch();

  const ROW_HEIGHT = 32;
  const modifiedStartDate = parseDate(props.project.start_date);
  const modifiedEndDate = parseDate(props.project.end_date);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const backLogFormattedDateRange = getDateRangeInMonths(
    modifiedStartDate,
    modifiedEndDate,
    "MMMyyyy"
  );

  const getColumns = () => {
    const columns = [];

    columns.push({ columnId: "attribute_name", width: 160 });
    columns.push({ columnId: "attribute_value", width: 140 });

    props.project.transactions.forEach((d) => {
      if (d) {
        columns.push({ columnId: d.id, width: 120 });
        columns.push({ columnId: d.id + "~", width: 65 });
      }
    });

    return columns;
  };

  const getRows = () => {
    const header_cells = [];
    const contractValue_cells = [];
    const spreadPercentage_cells = [];
    const materials_cells = [];
    const subContracts_cells = [];
    const directLabour_cells = [];
    const grossProfit_cells = [];
    const billing_cells = [];
    const billingPercentage_cells = [];

    //
    const spreadPercentage = [];
    const materials = [];
    const subContracts = [];
    const directLabour = [];
    const grossProfit = [];
    const billing = [];
    const billingPercentage = [];

    const backlog_project_name = [];
    const backlog_project_start_date = [];
    const backlog_project_end_date = [];
    backlog_project_name.push(
      headerCell("Project", "justify-content-left"),
      textCell(props.project.name, "justify-content-end editable")
    );
    backlog_project_start_date.push(
      headerCell("Start Date", "justify-content-left"),
      dateCell(
        new Date(convertToUTCDate(props.project.start_date)),
        "justify-content-end editable dateCell"
      )
    );
    backlog_project_end_date.push(
      headerCell("End Date", "justify-content-left"),
      dateCell(
        new Date(convertToUTCDate(props.project.end_date)),
        "justify-content-end editable dateCell "
      )
    );

    // 2 columns for attribute and attribute value
    header_cells.push(
      headerCell("", "justify-content-left"),
      headerCell("", "")
    );

    backLogFormattedDateRange.map((d) => {
      header_cells.push(
        nonEditable(headerCell(d, "justify-content-center", 2)),
        nonEditable(rightBorder(emptyTextCell))
      );
    });

    contractValue_cells.push(
      nonEditable(textCell("Contract Value", "justify-content-left disabled ")),
      numberCell(props.project.contract_val, "justify-content-end editable")
    );

    let _billingPercentage = 0;
    let _billing = 0;
    let _grossProfit = 0;
    let _spreadPercentage = 0;

    props.project.transactions.map((tr) => {
      backlog_project_name.push(
        noBorders(emptyTextCell),
        noBorders(emptyTextCell)
      );
      backlog_project_start_date.push(
        noBorders(emptyTextCell),
        noBorders(emptyTextCell)
      );
      backlog_project_end_date.push(
        noBorders(emptyTextCell),
        noBorders(emptyTextCell)
      );
      contractValue_cells.push(
        nonEditable(
          numberCell(
            tr.month_val,
            getValueCssClass(tr.month_val, "justify-content-end")
          )
        ),
        nonEditable(rightBorder(emptyTextCell))
      );
      spreadPercentage_cells.push(
        percentCell(tr.month_per / 100, "justify-content-end editable"),
        nonEditable(rightBorder(emptyTextCell))
      );
      materials_cells.push(
        nonEditable(numberCell(tr.material_val, "justify-content-end")),
        rightBorder(
          percentCell(tr.material_per / 100, "justify-content-end editable")
        )
      );
      subContracts_cells.push(
        nonEditable(numberCell(tr.subcontract_val, "justify-content-end")),
        rightBorder(
          percentCell(tr.subcontract_per / 100, "justify-content-end editable")
        )
      );
      directLabour_cells.push(
        nonEditable(numberCell(tr.directlabour_val, "justify-content-end")),
        rightBorder(
          percentCell(tr.directlabour_per / 100, "justify-content-end editable")
        )
      );
      grossProfit_cells.push(
        nonEditable(
          numberCell(
            tr.gross_profit,
            getValueCssClass(tr.gross_profit, "justify-content-end")
          )
        ),
        nonEditable(rightBorder(emptyTextCell))
      );
      billing_cells.push(
        nonEditable(
          numberCell(
            tr.monthly_billing_value,
            getValueCssClass(tr.monthly_billing_value, "justify-content-end")
          )
        ),
        nonEditable(rightBorder(emptyTextCell))
      );
      billingPercentage_cells.push(
        percentCell(tr.monthly_billing_per / 100, "editable"),
        nonEditable(rightBorder(emptyTextCell))
      );
      _billingPercentage += tr.monthly_billing_per / 100;
      _grossProfit += tr.gross_profit;
      _billing += tr.monthly_billing_value;
      _spreadPercentage += tr.month_per / 100;
    });

    //
    spreadPercentage.push(
      nonEditable(textCell("Spread %", "justify-content-left disabled")),
      nonEditable(
        percentCell(
          _spreadPercentage,
          _spreadPercentage == 1
            ? "justify-content-end disabled"
            : " text-red justify-content-end disabled"
        )
      )
    );

    materials.push(
      nonEditable(textCell("Materials %", "justify-content-left disabled")),
      percentCell(
        props.project.material_c_per / 100,
        "justify-content-end editable"
      )
    );

    subContracts.push(
      nonEditable(textCell("Sub Contracts %", "justify-content-left disabled")),
      percentCell(
        props.project.subcontract_c_per / 100,
        "justify-content-end editable"
      )
    );

    directLabour.push(
      nonEditable(textCell("Direct Labour %", "justify-content-left disabled")),
      percentCell(
        props.project.directlabour_c_per / 100,
        "justify-content-end editable"
      )
    );

    grossProfit.push(
      nonEditable(textCell("Gross Profit", "justify-content-left disabled")),
      nonEditable(
        numberCell(
          _grossProfit,
          getValueCssClass(_grossProfit, "justify-content-end disabled")
        )
      )
    );

    billing.push(
      nonEditable(textCell("Billings", "justify-content-left disabled")),
      nonEditable(
        numberCell(
          _billing,
          getValueCssClass(_billing, "justify-content-end disabled")
        )
      )
    );

    billingPercentage.push(
      nonEditable(textCell("Billings %", "justify-content-left disabled")),
      nonEditable(
        percentCell(
          _billingPercentage,

          _billingPercentage == 1
            ? "justify-content-end disabled"
            : " text-red justify-content-end disabled"
        )
      )
    );

    const rows = [
      {
        rowId: "name__" + props.project.id,
        height: ROW_HEIGHT,
        cells: backlog_project_name,
      },
      {
        rowId: "start_date__" + props.project.id,
        height: ROW_HEIGHT,
        cells: backlog_project_start_date,
      },
      {
        rowId: "end_date__" + props.project.id,
        height: ROW_HEIGHT,
        cells: backlog_project_end_date,
      },
      {
        rowId: "header",
        height: ROW_HEIGHT,
        cells: header_cells,
      },
      {
        rowId: "contract_val__" + props.project.id,
        height: ROW_HEIGHT,
        cells: contractValue_cells,
      },
      {
        rowId: "month_per__" + props.project.id,
        height: ROW_HEIGHT,
        cells: spreadPercentage.concat(spreadPercentage_cells),
      },
      {
        rowId: "material_per__" + props.project.id,
        height: ROW_HEIGHT,
        cells: materials.concat(materials_cells),
      },
      {
        rowId: "subcontract_per__" + props.project.id,
        height: ROW_HEIGHT,
        cells: subContracts.concat(subContracts_cells),
      },
      {
        rowId: "directlabour_per__" + props.project.id,
        height: ROW_HEIGHT,
        cells: directLabour.concat(directLabour_cells),
      },
      {
        rowId: "grossProfit_cells",
        height: ROW_HEIGHT,
        cells: grossProfit.concat(grossProfit_cells),
      },
      {
        rowId: "billing_cells",
        height: ROW_HEIGHT,
        cells: billing.concat(billing_cells),
      },
      {
        rowId: "monthly_billing_per__" + props.project.id,
        height: ROW_HEIGHT,
        cells: billingPercentage.concat(billingPercentage_cells),
      },
    ];

    return rows;
  };

  const handleChanges = (changes) => {
    changes.forEach((change) => {
      let attribute = "";
      let attribute_name = "";
      let attribute_value = 0;
      if (change.columnId === "attribute_value") {
        const row_spl = change.rowId.toString().split("__");
        attribute = row_spl[0];
        const contract_id = parseInt(row_spl[1]);
        if (change.type === "date") {
          attribute_value = moment
            .utc(change.newCell.value)
            .format("YYYY-MM-01");

          const isAfter1900 = moment(attribute_value).isAfter(
            moment("1900-01-01")
          );
          if (!isAfter1900) {
            return false;
          }
        } else if (change.type === "number") {
          attribute_value = change.newCell.value;
        } else {
          attribute_value = change.newCell.text;
        }

        switch (attribute) {
          case "material_per":
            attribute_name = "material_c_per";
            break;
          case "subcontract_per":
            attribute_name = "subcontract_c_per";
            break;
          case "directlabour_per":
            attribute_name = "directlabour_c_per";
            break;
          case "contract_val":
            attribute_name = "contract_val";
            break;
          default:
            attribute_name = attribute;
        }
        dispatch(
          updateContractData({
            id: contract_id,
            attribute: attribute_name,
            attribute_value: attribute_value,
            filter: props.filter,
          })
        );
      } else {
        const id = parseInt(change.columnId.toString().replace("~", ""));
        const row_spl = change.rowId.toString().split("__");

        attribute = row_spl[0];
        attribute_value = change.newCell.value;
        const contract_id = parseInt(row_spl[1]);
        if (attribute_value < 1) {
          attribute_value = attribute_value * 100;
        }
        dispatch(
          updateContractTransactionData({
            id: id,
            contract_id: contract_id,
            attribute: attribute,
            attribute_value: attribute_value,
            filter: props.filter,
          })
        );
      }
    });
  };

  const handleDeleteDialog = (e) => {
    // console.log(e);
    setDeleteDialogOpen(true);
  };

  const handleMoveProjectDialog = (e) => {
    // console.log(e);
    setMoveDialogOpen(true);
  };

  const handleDeleteProject = (e) => {
    // console.log(e);
    dispatch(
      deleteBacklogData({
        id: props.project.id,
        filter: props.filter,
      })
    );
    setDeleteDialogOpen(false);
    // toast.success(`Project ${props.project.name} is deleted`);
  };

  const handleMoveProject = (e) => {
    // console.log(e);
    dispatch(
      updateContractData({
        id: props.project.id,
        attribute: "is_bl",
        attribute_value: false,
        filter: props.filter,
      })
    );
  };

  const handleCloneBacklogProject = () => {
    dispatch(
      cloneBacklog({
        id: props.project.id,
        filter: props.filter,
      })
    );
  };

  const handleArchiveFrontlogProject = () => {
    const updatedIsArchive = !props.project.is_archive;

    dispatch(
      updateContractData({
        id: props.project.id,
        attribute: "is_archive",
        attribute_value: updatedIsArchive,
        filter: props.filter,
      })
    );
  };

  const columns = getColumns();
  const rows = getRows();

  return (
    <Box sx={{ mb: 8 }}>
      <div className="plv2_rg">
        {props.project.transactions && (
          <>
            <ReactGrid
              rows={rows}
              columns={columns}
              enableRowSelection={true}
              stickyLeftColumns={2}
              onCellsChanged={handleChanges}
            />
            <div className="flex gap-4">
              <Button
                variant="text"
                size="small"
                color="error"
                onClick={handleDeleteDialog}
              >
                Delete
              </Button>
              <Button
                variant="text"
                size="small"
                color="warning"
                onClick={handleMoveProjectDialog}
              >
                Move to Frontlog
              </Button>
              <Button
                variant="text"
                size="small"
                color="secondary"
                onClick={handleCloneBacklogProject}
              >
                Clone
              </Button>
              {props.project.is_archive ? (
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  onClick={handleArchiveFrontlogProject}
                >
                  Unarchive
                </Button>
              ) : (
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  onClick={handleArchiveFrontlogProject}
                >
                  Archive
                </Button>
              )}
              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  Are you sure you want to delete this project?
                </DialogTitle>

                <DialogActions className="dialog-actions-dense">
                  <Button onClick={handleDeleteProject}>Delete</Button>
                  <Button onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog
                open={moveDialogOpen}
                onClose={() => setMoveDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  Are you sure to move this project to Frontlog?
                </DialogTitle>

                <DialogActions className="dialog-actions-dense">
                  <Button onClick={handleMoveProject}>Move</Button>
                  <Button onClick={() => setMoveDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </Box>
  );
};

export default BacklogItem;
