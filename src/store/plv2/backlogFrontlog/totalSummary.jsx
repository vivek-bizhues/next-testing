import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchTotalSummary = createAsyncThunk(
  "BlFlTotalSummary/fetch",
  async ({ flag }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/frontlog-backlog-transactions?fl_bl_totals=${flag}`,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );

      return response.data;
    }
  }
);

export const updateDirectLabourPool = createAsyncThunk(
  "BlFlTotalSummary/fetch",
  async ({ date, direct_labour_pool }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/frontlog-backlog-direct-labour/`,
        {
          date: date,
          direct_labour_pool: direct_labour_pool,
        },
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      dispatch(fetchTotalSummary({ flag: "all" }));
      return response.data;
    }
  }
);

export const BlFlTotalSummarySlice = createSlice({
  name: "BlFlTotalSummaryData",
  initialState: {
    backlog_totals: [],
    fl_bl_totals: [],
    frontlog_totals: [],
  },
  reducers: {
    handleTotalSummary: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTotalSummary.fulfilled, (state, action) => {
      state.backlog_totals = action.payload.backlog_totals;
      state.frontlog_totals = action.payload.frontlog_totals;
      state.fl_bl_totals = action.payload.fl_bl_totals;
    });
  },
});

export const { handleTotalSummary } = BlFlTotalSummarySlice.actions;

export default BlFlTotalSummarySlice.reducer;
