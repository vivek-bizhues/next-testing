import * as React from "react";
import { useEffect, useState, forwardRef } from "react";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createOrUpdateTermDebtData } from "../../../../store/plv2/termDebts";

import { useDispatch } from "react-redux";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Select from "@mui/material/Select";
import "react-datepicker/dist/react-datepicker.css";
// ** CleaveJS Imports
import Cleave from "cleave.js/react";
import { DialogTitle, FormControl, Grid, MenuItem } from "@mui/material";
// import Icon from "src/@core/components/icon";

import InputLabel from "@mui/material/InputLabel";

import DatePicker from "react-datepicker";
import NumberField from "../../../../views/components/customfields/number";
import { parseDate } from "../../../../utils/get-daterange";

const DatePickerCustomInput = forwardRef((props, ref) => {
  return (
    <TextField
      fullWidth
      {...props}
      inputRef={ref}
      label="Start Date"
      autoComplete="off"
    />
  );
});
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function CRUDTermDebt(props) {
  const dispatch = useDispatch();
  const [termDebt, setTermDebt] = useState(props.termDebtData);
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setTermDebt((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStartDateChange = (selectedDate) => {
    setTermDebt((prevState) => ({
      ...prevState,
      ["start_date"]: selectedDate,
    }));
  };

  const handlePrincipleAmountChange = (event) => {
    setTermDebt((prevState) => ({
      ...prevState,
      ["principal_amount"]: event.target.rawValue.replace("$", ""),
    }));
  };

  const handleSave = (e) => {
    if (props.mode === "Clone") {
      setTermDebt((prevState) => ({
        ...prevState,
        ["id"]: 0,
      }));
    }

    dispatch(
      createOrUpdateTermDebtData({
        ...termDebt,
        search: props.search,
        page_size: props.pageSize,
        column: props.column,
        sort: props.sort,
      })
    );
    props.handleOnSave(e);
  };

  useEffect(() => {
    setTermDebt(props.termDebtData);
  }, [props.termDebtData]);

  return (
    <Dialog open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>{props.mode} Term Debt</DialogTitle>
      <DialogContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={12}></Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              placeholder=""
              name="desciption"
              id="desciption"
              value={termDebt.desciption}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="form-layouts-separator-select-label">
                Dept Type
              </InputLabel>
              <Select
                label="Debt Type"
                name="term_debt_ledger_type"
                id="term_debt_ledger_type"
                defaultValue=""
                value={
                  termDebt.term_debt_ledger_type === 0
                    ? ""
                    : termDebt.term_debt_ledger_type.toString() || ""
                }
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {props.paymentType.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
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
              onChange={handleStartDateChange}
              customInput={<DatePickerCustomInput />}
              id="start_date"
              name="start_date"
              // selected={new Date(termDebt.start_date)}
              selected={
                new Date(
                  parseDate(
                    new Date(termDebt.start_date).toISOString().split("T")[0]
                  )
                )
              }
              // value={newRecord.start_date}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".75rem" }}>
                Term (In Months)
              </InputLabel>
              <NumberField
                value={termDebt.terms_in_months}
                onChange={handleInputChange}
                min={0} // Minimum value (optional)
                max={1200} // Maximum value (optional)
                positiveOnly={true} // Boolean flag for positive numbers only (optional)
                suffix="Months"
                name="terms_in_months"
                id="terms_in_months"
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".75rem" }}>
                Principal Amount
              </InputLabel>
              <Cleave
                id="principal_amount"
                name="principal_amount"
                onChange={handlePrincipleAmountChange}
                value={termDebt.principal_amount}
                placeholder="Principle Amount"
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

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".75rem" }}>
                Interest Rate
              </InputLabel>
              <NumberField
                value={termDebt.interest_rate}
                onChange={handleInputChange}
                min={0} // Minimum value (optional)
                max={100} // Maximum value (optional)
                positiveOnly={true} // Boolean flag for positive numbers only (optional)
                suffix="%"
                name="interest_rate"
                id="interest_rate"
                allowDecimals={true}
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
              value={termDebt.memo}
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
