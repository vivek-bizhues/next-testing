import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BacklogItem from "./backlogItem";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { fetchBacklogData } from "../../../store/plv2/backlogFrontlog/backlog";
import Loader from "../../../components/Loader/Loader";

const BacklogGrid = ({ searchValue }) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.backlog);
  const [loading, setLoading] = useState(true);
  const [includeArchives, setIncludeArchives] = useState(false);
  const [onlyArchives, setOnlyArchives] = useState(false);
  const [filter, setFilter] = useState(""); // Initialize as an empty string

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFilter = localStorage.getItem("backlogFilter") || "";
      setFilter(savedFilter);
      if (savedFilter === "archive") {
        setOnlyArchives(true);
      } else if (savedFilter === "all") {
        setIncludeArchives(true);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    let filterToSet = filter;
    if (onlyArchives) {
      filterToSet = "archive";
      setFilter("archive");
    } else if (includeArchives) {
      filterToSet = "all";
      setFilter("all");
    } else {
      filterToSet = "active";
      setFilter("active");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("backlogFilter", filterToSet);
    }

    dispatch(fetchBacklogData({ searchValue, filter: filterToSet }))
      .then((res) => {
        setLoading(false);
        if (res?.error?.message === 401) {
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [dispatch, searchValue, includeArchives, onlyArchives, filter]);

  const handleIncludeArchivesChange = (event) => {
    setIncludeArchives(event.target.checked);
    if (event.target.checked) {
      setOnlyArchives(false);
    }
  };

  const handleOnlyArchivesChange = (event) => {
    setOnlyArchives(event.target.checked);
    if (event.target.checked) {
      setIncludeArchives(false);
    }
  };

  if (loading) {
    return <Loader title={"Loading.."} />;
  }

  return (
    <>
      <FormGroup row style={{ marginBottom: "20px" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeArchives}
              onChange={handleIncludeArchivesChange}
              color="primary"
            />
          }
          label="Include Archives"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={onlyArchives}
              onChange={handleOnlyArchivesChange}
              color="primary"
            />
          }
          label="Only Archives"
        />
      </FormGroup>
      {store.data && store.data.length > 0 ? (
        store.data.map((item, index) => {
          if (item.transactions.length > 0) {
            return (
              <Box
                key={index}
                style={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "inline-block", minWidth: "1000px" }}>
                  <BacklogItem project={item} filter={filter} />
                </div>
              </Box>
            );
          } else if (index === store.data.length - 1) {
            const noTransactions = store.data.every(
              (project) => project.transactions.length === 0
            );
            if (noTransactions) {
              return (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100px"
                >
                  <Typography>No backlogs available</Typography>
                </Box>
              );
            }
          }
          return null;
        })
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100px"
        >
          <Typography>No backlogs available</Typography>
        </Box>
      )}
    </>
  );
};

export default BacklogGrid;
