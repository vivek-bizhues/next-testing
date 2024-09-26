import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const fetchDashboardCharts = createAsyncThunk(
  "dashboardChart/fetch",
  async () => {
    const entity_id = getCurrentEntity().id;
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_API +
        `/${entity_id}/dashboard-charts/?format=datatables`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    return response.data;
  }
);

export const updateDashboardCharts = createAsyncThunk(
  "dashboardChart/update",
  async (dashboardChart, { dispatch }) => {
    const entity_id = getCurrentEntity().id;

    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_BACKEND_API +
        `/${entity_id}/dashboard-charts/${dashboardChart.id}/`,
      dashboardChart,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchDashboardCharts());

    toast.success("Dashbooard Updated");

    return response.data;
  }
);

export const addDashboardCharts = createAsyncThunk(
  "dashboardChart/add",
  async (dashboardChart, { dispatch }) => {
    const entity_id = getCurrentEntity().id;
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_API + `/${entity_id}/dashboard-charts/`,
      dashboardChart,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    toast.success("Chart Created");

    await dispatch(fetchDashboardCharts());
    return response.data;
  }
);

export const addDashboardChartsLayout = createAsyncThunk(
  "dashboardChartLayout/add",
  async (data, { dispatch }) => {
    const entity_id = getCurrentEntity().id;
    const storedToken = window.localStorage.getItem("authToken");
    const layoutdata = { data: data };
    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_API +
        `/${entity_id}/dashboard-charts-layout/`,
      layoutdata,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    toast.success("Layout Updated");

    await dispatch(fetchDashboardCharts());
    return response.data;
  }
);

export const deleteDashboardCharts = createAsyncThunk(
  "dashboardChart/delete",
  async (id, { dispatch }) => {
    const entity_id = getCurrentEntity().id;
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_BACKEND_API +
        `/${entity_id}/dashboard-charts/${id}/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchDashboardCharts());
    toast.error("Chart Deleted");

    return response.data;
  }
);

export const dashboardChartsSlice = createSlice({
  name: "dashboard charts",
  initialState: {
    data: [],
  },
  reducers: {
    handleDashboardChartsData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardCharts.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export const { handleDashboardChartsData } = dashboardChartsSlice.actions;

export default dashboardChartsSlice.reducer;
