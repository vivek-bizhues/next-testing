import React from "react";
import TextField from "@mui/material/TextField";

const PercentageField = ({ value, onChange, ...props }) => {
  // Input validation function to ensure the value is within the valid range
  const validatePercentage = (inputValue) => {
    // Allow empty input (so that the field can be cleared if needed)
    if (inputValue === "") return true;

    const parsedValue = parseFloat(inputValue);
    return !isNaN(parsedValue) && parsedValue >= 0.0 && parsedValue <= 100.0;
  };

  // Input change handler
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    if (validatePercentage(newValue)) {
      onChange(newValue);
      props.onChange();
    }
  };

  return (
    <TextField
      label="Percentage"
      value={value}
      onChange={handleInputChange}
      error={!validatePercentage(value)}
      helperText={
        !validatePercentage(value)
          ? "Enter a valid percentage (0.0 to 100.0)"
          : ""
      }
      {...props} // Pass any other props to the TextField component
    />
  );
};

export default PercentageField;
