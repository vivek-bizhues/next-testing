import React from "react";
import { Box, TextField, IconButton, Button, ButtonGroup } from "@mui/material";
import Icon from "../../../../components/icon";
import PulseLoader from "react-spinners/PulseLoader";

const Toolbar = (props) => {
  const {
    value,
    clearSearch,
    onChange,
    onKeyDown,
    onCreateNew,
    onShowLedgerView,
    ledgerviewLoading,
  } = props;

  return (
    <Box
      sx={{
        gap: 2,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        p: (theme) => theme.spacing(2, 5, 4, 5),
      }}
    >
      {/* Search Field */}
      <TextField
        size="small"
        value={value}
        style={{ marginLeft: "-40px" }}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Search…"
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: "flex" }}>
              <Icon icon="mdi:magnify" fontSize={20} />
            </Box>
          ),
          endAdornment: (
            <IconButton
              size="small"
              title="Clear"
              aria-label="Clear"
              onClick={clearSearch}
            >
              <Icon icon="mdi:close" fontSize={20} />
            </IconButton>
          ),
        }}
        sx={{
          width: {
            xs: 1,
            sm: "auto",
          },
          "& .MuiInputBase-root > svg": {
            mr: 2,
          },
        }}
      />

      {/* Add Button and Ledger View Button */}
      <ButtonGroup size="medium">
        <Button onClick={onCreateNew}>+ Add</Button>
        <Button onClick={onShowLedgerView}>
          {ledgerviewLoading ? (
            <PulseLoader color="#1976D2" size={10} />
          ) : (
            "Ledger View"
          )}
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default Toolbar;
