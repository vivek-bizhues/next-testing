import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  DialogTitle,
} from "@mui/material";
import Icon from "../../../components/icon";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import { deleteDashboardCharts } from "../../../store/plv2/dashboardChart";
import EditDashboardChart from "../components/EditDashboardChart";
import ReactLoaderRound from "../../../components/ReactLoader/ReactLoader";

const ApexAreaChartTemplate = ({
  chartData,
  dataseries,
  title,
  loading,
  id,
  mode,
}) => {
  const dispatch = useDispatch();

  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteChartId, setDeleteChartId] = useState(null);

  const handleDelete = (id) => {
    setDeleteChartId(id);
    setDeleteShow(true);
  };

  const handleConfirmDelete = () => {
    if (deleteChartId) {
      dispatch(deleteDashboardCharts(deleteChartId))
        .then((res) => {})
        .catch((error) => {
          console.error("Error deleting chart:", error);
        });
      setDeleteShow(false);
    }
  };

  const processDataForBarChart = (dataseries) => {
    if (!Array.isArray(dataseries)) {
      console.error("Invalid dataseries:", dataseries);
      return [];
    }

    const aggregatedData = {};
    dataseries.forEach((series) => {
      if (series && series.data) {
        Object.entries(series.data).forEach(([date, value]) => {
          if (date !== "FORMULA") {
            const formattedDate = moment(date, "YYYY-MM-DD").format("MMM YY");
            if (!aggregatedData[formattedDate]) {
              aggregatedData[formattedDate] = { x: formattedDate };
            }
            aggregatedData[formattedDate][series.name] = Math.round(value);
          }
        });
      }
    });

    const formattedData = Object.values(aggregatedData);

    const series = dataseries.map((series) => ({
      name: series.name,
      data: formattedData.map((item) => item[series.name] || 0),
      color: series.fillcolor,
    }));

    return {
      series,
      categories: formattedData.map((item) => item.x),
    };
  };

  const { series: transformedSeries } = processDataForBarChart(dataseries);

  const chartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: true },
    },
    xaxis: {
      type: "category",
      labels: {
        formatter: function (value) {
          return moment(value, "MMM YY").format("MMM YYYY");
        },
        style: {
          colors: "#6e7985",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      min: undefined,
      max: undefined,
      tickAmount: 5,
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        gradientToColors: transformedSeries.map((series) => series.color),
        opacityFrom: 1.4,
        opacityTo: 0.1,
      },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    colors: transformedSeries.map((series) => series.color),
  };

  return (
    <>
      <Card>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "-20px",
            }}
          >
            <CardHeader
              title={title}
              subheaderTypographyProps={{
                sx: {
                  color: (theme) => `${theme.palette.text.disabled} !important`,
                },
              }}
              sx={{
                flexDirection: ["column", "row"],
                alignItems: ["flex-start", "center"],
                "& .MuiCardHeader-action": { mb: 0 },
                "& .MuiCardHeader-content": { mb: [2, 0] },
              }}
            />
            <ReactLoaderRound />
          </div>
        ) : (
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "-20px",
            }}
          >
            <CardHeader
              title={title}
              subheaderTypographyProps={{
                sx: {
                  color: (theme) => `${theme.palette.text.disabled} !important`,
                },
              }}
              sx={{
                flexDirection: ["column", "row"],
                alignItems: ["flex-start", "center"],
                "& .MuiCardHeader-action": { mb: 0 },
                "& .MuiCardHeader-content": { mb: [2, 0] },
              }}
            />
            {!mode && (
              <div style={{ display: "flex", gap: "10px" }}>
                <EditDashboardChart chartData={chartData} />
                <IconButton onClick={() => handleDelete(id)}>
                  <Icon icon="mdi:delete" />
                </IconButton>
              </div>
            )}
          </div>
        )}
        <CardContent>
          <Box sx={{ height: 400 }}>
            <ReactApexChart
              options={chartOptions}
              series={transformedSeries}
              type="area"
              height={350}
              className="apex-chart-two"
            />
          </Box>
        </CardContent>

        <Dialog open={deleteShow} onClose={() => setDeleteShow(false)}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this chart?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteShow(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
};

export default ApexAreaChartTemplate;
