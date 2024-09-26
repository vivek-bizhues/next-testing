import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchOpeningBalance = createAsyncThunk(
  "openingBalance/fetch",
  async () => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/opening-balance/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching opening balance data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const updateOpeningBalance = createAsyncThunk(
  "openingBalance/update",
  async ({ coa, value }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/opening-balance/`,
        {
          coa: coa,
          value: value,
        },
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchOpeningBalance());

      return response.data;
    }
  }
);

export const openingBalanceSlice = createSlice({
  name: "openingBalance",
  initialState: {
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleOpeningBalanceUpdate: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOpeningBalance.fulfilled, (state, action) => {
      state.data = action.payload;
      // state.params = action.payload.params
      // state.allData = action.payload.allData
      // state.total = action.payload.total
    });
    builder.addCase(fetchOpeningBalance.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleOpeningBalanceUpdate } = openingBalanceSlice.actions;

export default openingBalanceSlice.reducer;
