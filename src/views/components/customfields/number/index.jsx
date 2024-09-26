import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

const NumberField = (props) => {
  const {
    value,
    onChange,
    min,
    max,
    positiveOnly,
    allowDecimals, // New prop to configure whether decimals are allowed or not
    suffix,
    id,
    name,
  } = props;

  const handleChange = (event) => {
    const inputValue = event.target.value;
    if (positiveOnly && inputValue !== "" && Number(inputValue) <= 0) {
      return;
    }
    if (max !== undefined && inputValue !== "" && Number(inputValue) > max) {
      return;
    }
    if (min !== undefined && inputValue !== "" && Number(inputValue) < min) {
      return;
    }

    // Additional check for decimal values if allowDecimals is false
    if (!allowDecimals && inputValue.includes(".")) {
      return;
    }

    onChange(event);
  };

  return (
    <TextField
      type="number"
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      fullWidth
      InputProps={{
        endAdornment: suffix ? (
          <InputAdornment position="end">{suffix}</InputAdornment>
        ) : null,
        inputProps: {
          min: min,
          max: max,
          step: allowDecimals ? "any" : "1", // Set step to "any" if decimals are allowed
          style: { textAlign: "right" }, // Align text to the right
        },
      }}
    />
  );
};

export default NumberField;
