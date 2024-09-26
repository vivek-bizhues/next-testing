import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addDashboardChartsLayout,
  fetchDashboardCharts,
} from "../../store/plv2/dashboardChart";
import { fetchImTemplate } from "../../store/plv2/imTemplate";
import { Box, Button, Typography } from "@mui/material";
import AddDashboardChart from "./components/AddDashboardChart";
import dynamic from "next/dynamic";
const ApexBarChartTemplate = dynamic(
  () => import("./charts/ApexBarChartTemplate"),
  { ssr: false }
);
const ApexAreaChartTemplate = dynamic(
  () => import("./charts/ApexAreaChartTemplate"),
  { ssr: false }
);

const ResponsiveGridLayout = WidthProvider(Responsive);

function getNestedData(object, path, fillcolor = "#1976D2") {
  const keys = path.split(".");
  let d = keys.reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : null;
  }, object);

  const clone = { ...d };
  clone.fillcolor = fillcolor;
  d = clone;
  return d;
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false); // Set default to false
  const [layoutConfig, setLayoutConfig] = useState([]);
  const modelStructure = useSelector((state) => state.imTemplate.data);
  const dashboardCharts = useSelector(
    (state) => state.dashboardChartSlice.data
  );

  // const store = useSelector((state) => state);
  // const { logout } = useAuth();
  // const router = useRouter();

  const prepareModelStructure = () => {
    const formulaNames = [];

    Object.entries(modelStructure).forEach(([sectionName, section]) => {
      Object.entries(section).forEach(([groupName, group]) => {
        if ("id" in group) {
        } else {
          Object.entries(group).forEach(([formulaName, formula]) => {
            const fullName = `${sectionName}.${groupName}.${formulaName}`;
            if (!fullName.includes("_attrs")) {
              formulaNames.push({ value: fullName, name: formulaName });
            }
          });
        }
      });
    });
    return formulaNames;
  };

  const formulaNames = prepareModelStructure();

  useEffect(() => {
    setLoading(true);
    dispatch(fetchDashboardCharts())
      .then((res) => {
        if (res?.error?.message === 401) {
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchImTemplate())
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
  }, [dispatch]);

  useEffect(() => {
    const layoutConfigData = dashboardCharts?.map((chart) => ({
      i: chart.id.toString(),
      x: chart.layout?.x || 0,
      y: chart.layout?.y || 0,
      w: chart.layout?.w || 6,
      h: chart.layout?.h || 4,
    }));
    setLayoutConfig(layoutConfigData);
  }, [dashboardCharts]);

  // const { settings } = useSettings();

  const handleSaveDashboard = () => {
    setEditMode(false);
    dispatch(addDashboardChartsLayout(layoutConfig));
  };

  const onLayoutChange = (currentLayout) => {
    if (editMode) {
      setLayoutConfig(currentLayout);
    }
  };

  return (
    <React.Fragment>
      <div className="main main-app p-3 p-lg-4">
        {modelStructure && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div>
                <h4 className="main-title mb-0">Dashboard</h4>
              </div>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  ml: 4,
                }}
              >
                {editMode && <AddDashboardChart formulaNames={formulaNames} />}
                <Button
                  onClick={() => {
                    if (editMode) {
                      handleSaveDashboard();
                    } else {
                      setEditMode(true);
                    }
                  }}
                  sx={{ ml: 2, mb: 2, height: 30 }}
                >
                  {editMode ? "Save Dashboard" : "Customize"}
                </Button>
              </Box>
            </div>

            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: layoutConfig }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              width={1200}
              containerPadding={[10, 10]}
              margin={[10, 30]}
              isDraggable={editMode}
              isDroppable={editMode}
              isResizable={editMode}
              onLayoutChange={onLayoutChange}
            >
              {dashboardCharts?.length > 0 ? (
                dashboardCharts?.map((chart, index) => {
                  const dataseries = chart.data_series.map((series) => {
                    if (typeof series === "string") {
                      return getNestedData(modelStructure, series);
                    } else {
                      return getNestedData(
                        modelStructure,
                        series.formula,
                        series.color
                      );
                    }
                  });

                  return (
                    <div key={chart.id.toString()}>
                      {chart.chart_type === "COLUMN" ? (
                        <ApexBarChartTemplate
                          chartData={chart}
                          id={chart.id}
                          dataseries={dataseries}
                          title={chart.title}
                          loading={loading}
                          mode={editMode}
                        />
                      ) : chart.chart_type === "LINE" ? (
                        <ApexAreaChartTemplate
                          chartData={chart}
                          id={chart.id}
                          dataseries={dataseries}
                          title={chart.title}
                          loading={loading}
                          mode={editMode}
                        />
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <Typography variant="h6" align="center" sx={{ width: "100%" }}>
                  Create a chart
                </Typography>
              )}
            </ResponsiveGridLayout>
          </>
        )}
      </div>
    </React.Fragment>
  );
}
