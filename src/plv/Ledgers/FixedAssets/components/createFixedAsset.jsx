import * as React from "react";
import { useEffect, useState, forwardRef } from "react";

import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createOrUpdateFixedAssetData } from "../../../../store/plv2/fixedAsset";

// import InputAdornment from "@mui/material/InputAdornment";

import { useDispatch } from "react-redux";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Select from "@mui/material/Select";
import "react-datepicker/dist/react-datepicker.css";
import Cleave from "cleave.js/react";
import { DialogTitle, FormControl, Grid, MenuItem } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import DatePicker from "react-datepicker";
import NumberField from "../../../../views/components/customfields/number";
import { parseDate } from "../../../../utils/get-daterange";

const DatePickerCustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} autoComplete="off" />;
});
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function CRUDFixedAssets(props) {
  const dispatch = useDispatch();
  const [fixedAssets, setFixedAssets] = useState(props.fixedAssetsData);
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFixedAssets((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePurchaseDateChange = (selectedDate) => {
    setFixedAssets((prevState) => ({
      ...prevState,
      ["purchase_date"]: selectedDate.toString(),
    }));
  };

  const handleDisposalDateChange = (selectedDate) => {
    setFixedAssets((prevState) => ({
      ...prevState,
      ["disposal_date"]: selectedDate.toString(),
    }));
  };

  const handlePurchaseAmountChange = (event) => {
    setFixedAssets((prevState) => ({
      ...prevState,
      ["purchase_amount"]: event.target.rawValue.replace("$", ""),
    }));
  };

  const handleDisposalAmountChange = (event) => {
    setFixedAssets((prevState) => ({
      ...prevState,
      ["disposal_amount"]: event.target.rawValue.replace("$", ""),
    }));
  };

  const handleSave = (e) => {
    if (props.mode === "Clone") {
      setFixedAssets((prevState) => ({
        ...prevState,
        ["id"]: 0,
      }));
    }

    dispatch(
      createOrUpdateFixedAssetData({
        ...fixedAssets,
        search: props.search,
        page_size: props.pageSize,
        column: props.column,
        sort: props.sort,
      })
    );
    props.handleOnSave(e);
  };

  useEffect(() => {
    setFixedAssets(props.fixedAssetsData);
  }, [props.fixedAssetsData]);

  return (
    <Dialog open={props.show} onClose={props.handleOnClose}>
      <DialogTitle>{props.mode} Fixed Asset</DialogTitle>
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
              value={fixedAssets.name}
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
              onChange={handlePurchaseDateChange}
              customInput={<DatePickerCustomInput label="Purchase Date" />}
              id="purchase_date"
              name="purchase_date"
              selected={
                fixedAssets.purchase_date &&
                new Date(
                  parseDate(
                    new Date(fixedAssets.purchase_date)
                      .toISOString()
                      .split("T")[0]
                  )
                )
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".85rem" }}>
                Purchase Amount
              </InputLabel>
              <Cleave
                id="purchase_amount"
                name="purchase_amount"
                onChange={handlePurchaseAmountChange}
                value={fixedAssets.purchase_amount}
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="numeral" sx={{ mb: 2, fontSize: ".85rem" }}>
                Economic userful life
              </InputLabel>
              <NumberField
                value={fixedAssets.economic_userful_life}
                onChange={handleInputChange}
                min={0} // Minimum value (optional)
                max={1200} // Maximum value (optional)
                positiveOnly={true} // Boolean flag for positive numbers only (optional)
                suffix="Months"
                name="economic_userful_life"
                id="economic_userful_life"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="form-layouts-separator-select-label">
                Depreciation Type
              </InputLabel>
              <Select
                label="Depreciation Type"
                name="depreciation_type"
                id="depreciation_type"
                defaultValue=""
                value={
                  fixedAssets.depreciation_type === 0
                    ? ""
                    : fixedAssets.depreciation_type.toString() || ""
                }
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {props.depreciationType.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <>
              {fixedAssets.depreciation_type === 2 && (
                <FormControl fullWidth>
                  <InputLabel
                    htmlFor="numeral"
                    sx={{ mb: 2, fontSize: ".85rem" }}
                  >
                    Declining Balance Rate
                  </InputLabel>
                  <NumberField
                    value={fixedAssets.declining_balance_rate}
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
              )}
            </>
          </Grid>
          <Grid item xs={12} sm={6}>
            <>
              {props.mode === "Edit" && (
                <DatePicker
                  popperPlacement="bottom-start"
                  showYearDropdown
                  showMonthDropdown
                  showMonthYearPicker
                  dropdownMode="select"
                  dateFormat="MMM, yyyy"
                  placeholderText="MMM, YYYY"
                  onChange={handleDisposalDateChange}
                  customInput={<DatePickerCustomInput label="Disposal Date" />}
                  id="disposal_date"
                  name="disposal_date"
                  selected={
                    fixedAssets.disposal_date &&
                    new Date(
                      parseDate(
                        new Date(fixedAssets.disposal_date)
                          .toISOString()
                          .split("T")[0]
                      )
                    )
                  }
                />
              )}
            </>
          </Grid>

          <Grid item xs={12} sm={6}>
            <>
              {props.mode === "Edit" && (
                <FormControl fullWidth>
                  <InputLabel
                    htmlFor="numeral"
                    sx={{ mb: 2, fontSize: ".85rem" }}
                  >
                    Disposal Amount
                  </InputLabel>
                  <Cleave
                    id="disposal_amount"
                    name="disposal_amount"
                    onChange={handleDisposalAmountChange}
                    value={fixedAssets.disposal_amount}
                    placeholder="Disposal Amount"
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
              )}
            </>
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
              value={fixedAssets.memo}
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
