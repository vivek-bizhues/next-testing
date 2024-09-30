import React, { useState } from "react";
import Header from "../../layouts/Header";
import { Button, Grid, Icon, IconButton, TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { createBacklog } from "../../store/plv2/backlogFrontlog/backlog";
import moment from "moment";
import BlFlTotalSummary from "./components/totalSummary";
import BacklogGrid from "./components/backlogGrid";

export default function Backlog() {
  const [searchvalue, setSearchvalue] = useState("");
  const [newsearchvalue, setNewSearchvalue] = useState("");

  const dispatch = useDispatch();
  const createNewBacklog = () => {
    dispatch(
      createBacklog({
        name: "Untitled Backlog",
        contract_val: 0,
        material_c_per: 0,
        directlabour_c_per: 0,
        subcontract_c_per: 0,
        flfactoring: 100,
        start_date: moment().toDate(),
        end_date: moment().add(6, "month").toDate(),
      })
    );
  };

  const handleSearch = () => {
    setNewSearchvalue(searchvalue);
  };

  return (
    <React.Fragment>
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <h4 className="main-title mb-0">Backlog</h4>
          <Button
            onClick={createNewBacklog}
            variant="contained"
            color="primary"
          >
            + Add
          </Button>
        </div>

        {/* Search Bar */}
        <div className="d-flex align-items-center mb-4">
          <TextField
            size="small"
            value={searchvalue}
            onChange={(e) => setSearchvalue(e.target.value)}
            placeholder="Search…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            style={{ marginRight: "8px" }}
          />
          <IconButton
            size="small"
            title="Clear"
            aria-label="Clear"
            onClick={() => {
              setSearchvalue("");
              setNewSearchvalue("");
            }}
          >
            <Icon icon="mdi:close" />
          </IconButton>
        </div>

        <Grid item xs={12} style={{ overflowX: "auto" }}>
          {/* Horizontal scroll for total summary */}
          <div style={{ display: "inline-block", minWidth: "1000px" }}>
            <BlFlTotalSummary />
          </div>
        </Grid>

        {/* Backlog Grid */}
        <BacklogGrid searchValue={newsearchvalue} />
      </div>
    </React.Fragment>
  );
}
