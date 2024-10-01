import * as React from "react";
import { useEffect, useState, forwardRef } from "react";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createOrUpdatePrepaidExpenseData } from "../../../../store/plv2/prepaidExpenses";

import { useDispatch } from "react-redux";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Select from "@mui/material/Select";
import "react-datepicker/dist/react-datepicker.css";
// ** CleaveJS Imports
import Cleave from "cleave.js/react";
import { DialogTitle, FormControl, Grid, MenuItem } from "@mui/material";

import InputLabel from "@mui/material/InputLabel";

import DatePicker from "react-datepicker";
import { parseDate } from "../../../../utils/get-daterange";

const DatePickerCustomInput = forwardRef((props, ref) => {
  return (
    <TextField
      fullWidth
      {...props}
      inputRef={ref}
      label="Purchase Date"
      autoComplete="off"
    />
  );
});
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function CRUDPrepaidExpense(props) {
  const dispatch = useDispatch();
  const [expense, setExpense] = useState(props.expenseData);
  const monthOptions = Array.from({ length: 36 }, (_, index) => index + 1);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setExpense((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePurchaseDateChange = (selectedDate) => {
    setExpense((prevState) => ({
      ...prevState,
      ["purchase_date"]: selectedDate,
    }));
  };

  const handlePurchaseAmountChange = (event) => {
    setExpense((prevState) => ({
      ...prevState,
      ["purchase_amount"]: event.target.rawValue.replace("$", ""),
    }));
  };

  const handleSave = (e) => {
    if (props.mode === "Clone") {
      setExpense((prevState) => ({
        ...prevState,
        ["id"]: 0,
      }));
    }
    dispatch(
      createOrUpdatePrepaidExpenseData({
        ...expense,
        search: props.search,
        page_size: props.pageSize,
        column: props.column,
        sort: props.sort,
      })
    );
    props.handleOnSave(e);
  };

  useEffect(() => {
    setExpense(props.expenseData);
  }, [props.expenseData]);

  return (
    <Dialog open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>{props.mode} Prepaid Expense</DialogTitle>
      <DialogContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={12}></Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Title"
              placeholder="Insurance or Tax"
              name="title"
              id="title"
              value={expense.title}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="form-layouts-separator-select-label">
                Expense Type
              </InputLabel>
              <Select
                label="COA"
                name="coa"
                id="coa"
                defaultValue=""
                value={expense.coa === 0 ? "" : expense.coa.toString() || ""}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {props.coaOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              popperPlacement="bottom-start"
              showYearDropdown
              showMonthDropdown
              showMonthYearPicker
              dropdownMode="select"
              dateFormat="MMM, yyyy"
              placeholderText="MMM, YYYY"
              onChange={handlePurchaseDateChange}
              customInput={<DatePickerCustomInput />}
              id="purchase_date"
              name="purchase_date"
              // selected={new Date(expense.purchase_date)}
              selected={
                new Date(
                  parseDate(
                    new Date(expense.purchase_date).toISOString().split("T")[0]
                  )
                )
              }
              // value={newRecord.purchase_date}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="months_covered">Months Covered</InputLabel>
              <Select
                label="months_covered"
                value={expense.months_covered}
                labelId="form-layouts-separator-select-label"
                onChange={handleInputChange}
                name="months_covered"
                id="months_covered"
              >
                {monthOptions.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month} Month{month > 1 && "s"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".75rem" }}>
                Purchase Amount
              </InputLabel>
              <Cleave
                id="purchase_amount"
                name="purchase_amount"
                onChange={handlePurchaseAmountChange}
                value={expense.purchase_amount}
                placeholder="Purchase Amount"
                options={{
                  numeral: true,
                  numeralThousandsGroupStyle: "thousand",
                  stripLeadingZeroes: true,
                  numeralPositiveOnly: true,
                  numeralDecimalScale: 0,
                  prefix: "$",
                }}
                style={{
                  textAlign: "right",
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Memo"
              placeholder="optional description"
              name="memo"
              id="memo"
              value={expense.memo}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>

        {/* ...other fields */}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleOnCancel}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
