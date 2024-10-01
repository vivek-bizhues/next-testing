import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FrontlogItem from "./frontlogItem";
import { fetchFrontlogData } from "../../../store/plv2/backlogFrontlog/frontlog";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import Loader from "../../../components/Loader/Loader";
import { useRouter } from "next/router";

const FrontlogGrid = ({ searchValue }) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.frontlog);
  const [loading, setLoading] = useState(true);
  const [includeArchives, setIncludeArchives] = useState(false);
  const [onlyArchives, setOnlyArchives] = useState(false);
  const [filter, setFilter] = useState("active"); // Set default filter to 'active'
  const router = useRouter();

  useEffect(() => {
    const savedFilter = localStorage.getItem("frontlogFilter");
    if (savedFilter) {
      setFilter(savedFilter);
      setOnlyArchives(savedFilter === "archive");
      setIncludeArchives(savedFilter === "all");
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    // Determine filter based on checkbox states
    const currentFilter = onlyArchives
      ? "archive"
      : includeArchives
      ? "all"
      : "active";

    setFilter(currentFilter);
    localStorage.setItem("frontlogFilter", currentFilter);

    dispatch(fetchFrontlogData({ searchValue, filter: currentFilter }))
      .then((res) => {
        setLoading(false);
        if (res?.error?.message === 401) {
          // Handle logout if necessary
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [dispatch, searchValue, includeArchives, onlyArchives, router.query.slug]);

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
        store.data.every((item) => item.transactions.length === 0) ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100px"
          >
            <Typography>No frontlogs available</Typography>
          </Box>
        ) : (
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
                    <FrontlogItem project={item} filter={filter} />
                  </div>
                </Box>
              );
            }
            return null;
          })
        )
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100px"
        >
          <Typography>No frontlogs available</Typography>
        </Box>
      )}
    </>
  );
};

export default FrontlogGrid;
