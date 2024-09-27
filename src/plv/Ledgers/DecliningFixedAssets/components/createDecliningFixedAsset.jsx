import * as React from "react";
import { useEffect, useState, forwardRef } from "react";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createOrUpdateFixedAssetDecliningPoolData } from "../../../../store/plv2/fixedAssetDecliningPool";

import { useDispatch } from "react-redux";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "react-datepicker/dist/react-datepicker.css";
// ** CleaveJS Imports
import Cleave from "cleave.js/react";
import { DialogTitle, FormControl, Grid } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import DatePicker from "react-datepicker";
import NumberField from "../../../../views/components/customfields/number";
import { parseDate } from "../../../../utils/get-daterange";

const DatePickerCustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} autoComplete="off" />;
});
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function CRUDDecliningFixedAssets(props) {
  const dispatch = useDispatch();
  const [fixedAssetDecliningPool, setfixedAssetDecliningPoolDecliningPools] =
    useState(props.fixedAssetDecliningPoolData);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setfixedAssetDecliningPoolDecliningPools((prevState) => ({
      ...prevState,
      [name]:
        name === "ob_remaining_periods" || name === "months_pool"
          ? Number(value)
          : value,
    }));
  };
  const handleStartDateChange = (selectedDate) => {
    setfixedAssetDecliningPoolDecliningPools((prevState) => ({
      ...prevState,
      ["start_date"]: selectedDate,
    }));
  };

  const handleOBRemainingCostChange = (event) => {
    setfixedAssetDecliningPoolDecliningPools((prevState) => ({
      ...prevState,
      ["ob_remaining_cost"]: event.target.rawValue.replace("$", ""),
    }));
  };

  const handleOBNAVChange = (event) => {
    setfixedAssetDecliningPoolDecliningPools((prevState) => ({
      ...prevState,
      ["ob_nbv"]: event.target.rawValue.replace("$", ""),
    }));
  };

  const handleSave = (e) => {
    if (props.mode === "Clone") {
      setfixedAssetDecliningPoolDecliningPools((prevState) => ({
        ...prevState,
        ["id"]: 0,
      }));
    }

    dispatch(
      createOrUpdateFixedAssetDecliningPoolData({
        ...fixedAssetDecliningPool,
        search: props.search,
        page_size: props.pageSize,
        column: props.column,
        sort: props.sort,
      })
    );
    props.handleOnSave(e);
  };

  useEffect(() => {
    setfixedAssetDecliningPoolDecliningPools(props.fixedAssetDecliningPoolData);
  }, [props.fixedAssetDecliningPoolData]);

  return (
    <Dialog open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>{props.mode} Fixed Asset Declining Pool</DialogTitle>
      <DialogContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={12}></Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label="Description"
              placeholder=""
              name="name"
              id="name"
              value={fixedAssetDecliningPool.name}
              onChange={handleInputChange}
            />
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
              // selected={new Date(fixedAssetDecliningPool.start_date)}
              selected={
                new Date(
                  parseDate(
                    new Date(fixedAssetDecliningPool.start_date)
                      .toISOString()
                      .split("T")[0]
                  )
                )
              }
              // value={newRecord.start_date}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".85rem" }}>
                OB Remaining Cost
              </InputLabel>
              <Cleave
                id="ob_remaining_cost"
                name="ob_remaining_cost"
                onChange={handleOBRemainingCostChange}
                value={fixedAssetDecliningPool.ob_remaining_cost}
                placeholder="OB Remaining Cost"
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
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".85rem" }}>
                OB NBV
              </InputLabel>
              <Cleave
                id="ob_nbv"
                name="ob_nbv"
                onChange={handleOBNAVChange}
                value={fixedAssetDecliningPool.ob_nbv}
                placeholder="OB NBV"
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
                Declining Balance Rate
              </InputLabel>
              <NumberField
                value={fixedAssetDecliningPool.declining_balance_rate}
                onChange={handleInputChange}
                min={0} // Minimum value (optional)
                max={100} // Maximum value (optional)
                positiveOnly={true} // Boolean flag for positive numbers only (optional)
                suffix="%"
                name="declining_balance_rate"
                id="declining_balance_rate"
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
              value={fixedAssetDecliningPool.memo}
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
