import * as React from "react";
import { useEffect, useState, forwardRef } from "react";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createOrUpdateFixedAssetStraightLinePoolData } from "../../../../store/plv2/fixedAssetStraightLinePool";
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

export default function CRUDStraightLineFixedAssets(props) {
  const dispatch = useDispatch();
  const [
    fixedAssetStraightLinePool,
    setfixedAssetStraightLinePoolStraightLinePools,
  ] = useState(props.fixedAssetStraightLinePoolData);
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setfixedAssetStraightLinePoolStraightLinePools((prevState) => ({
      ...prevState,
      [name]:
        name === "ob_remaining_periods" || name === "months_pool"
          ? Number(value)
          : value,
    }));
  };

  const handleStartDateChange = (selectedDate) => {
    setfixedAssetStraightLinePoolStraightLinePools((prevState) => ({
      ...prevState,
      ["start_date"]: selectedDate,
    }));
  };

  const handleOBRemainingCostChange = (event) => {
    setfixedAssetStraightLinePoolStraightLinePools((prevState) => ({
      ...prevState,
      ["ob_remaining_cost"]: Number(event.target.rawValue.replace("$", "")),
    }));
  };

  const handleSave = (e) => {
    if (props.mode === "Clone") {
      setfixedAssetStraightLinePoolStraightLinePools((prevState) => ({
        ...prevState,
        ["id"]: 0,
      }));
    }
    dispatch(
      createOrUpdateFixedAssetStraightLinePoolData({
        ...fixedAssetStraightLinePool,
        search: props.search,
        page_size: props.pageSize,
        column: props.column,
        sort: props.sort,
      })
    );
    props.handleOnSave(e);
  };

  useEffect(() => {
    setfixedAssetStraightLinePoolStraightLinePools(
      props.fixedAssetStraightLinePoolData
    );
  }, [props.fixedAssetStraightLinePoolData]);

  return (
    <Dialog open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>{props.mode} Fixed Asset Straight Line Pool</DialogTitle>
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
              value={fixedAssetStraightLinePool.name}
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
              selected={
                fixedAssetStraightLinePool.start_date
                  ? new Date(
                      parseDate(
                        new Date(fixedAssetStraightLinePool.start_date)
                          .toISOString()
                          .split("T")[0]
                      )
                    )
                  : new Date()
              }
              value={
                fixedAssetStraightLinePool.start_date
                  ? new Date(
                      parseDate(
                        new Date(fixedAssetStraightLinePool.start_date)
                          .toISOString()
                          .split("T")[0]
                      )
                    )
                  : new Date()
              }
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
                value={fixedAssetStraightLinePool.ob_remaining_cost}
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
                Months Pool
              </InputLabel>
              <NumberField
                value={fixedAssetStraightLinePool.months_pool}
                onChange={handleInputChange}
                min={0} // Minimum value (optional)
                max={1200} // Maximum value (optional)
                positiveOnly={true} // Boolean flag for positive numbers only (optional)
                suffix="Months"
                name="months_pool"
                id="months_pool"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".85rem" }}>
                OB Remaining Periods
              </InputLabel>
              <NumberField
                value={fixedAssetStraightLinePool.ob_remaining_periods}
                onChange={handleInputChange}
                min={0} // Minimum value (optional)
                max={1200} // Maximum value (optional)
                positiveOnly={true} // Boolean flag for positive numbers only (optional)
                suffix="Months"
                name="ob_remaining_periods"
                id="ob_remaining_periods"
              />
            </FormControl>
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
