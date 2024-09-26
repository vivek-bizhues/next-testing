import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { populateTransactionData } from "../../../helpers/apoHelpers";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchAccountPayableOtherData = createAsyncThunk(
  "accountPayableData/fetch",
  async () => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/account-payable-other/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching account payable other data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const updateAccountPayableOtherData = createAsyncThunk(
  "accountPayableData/update",
  async (changesArray, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/account-payable-other-batches/`,
        changesArray,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchAccountPayableOtherData());
      return response.data;
    }
  }
);

export const accountPayableSlice = createSlice({
  name: "accountPayableData",
  initialState: {
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleAccountPayableData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccountPayableOtherData.fulfilled, (state, action) => {
      const accountPayableData = action.payload;
      // const activeEntity = getCurrentEntity();
      // const modelDateRange = getDateRangeInMonths(
      //   new Date(activeEntity.start_date),
      //   new Date(activeEntity.end_date),
      //   "yyyy-MM-01"
      // );

      accountPayableData.forEach((ap, idx) => {
        accountPayableData[idx].transaction = populateTransactionData(
          ap.transaction
        );
      });

      state.data = accountPayableData;
      // state.params = action.payload.params
      // state.allData = action.payload.allData
      // state.total = action.payload.total
    });
    builder.addCase(fetchAccountPayableOtherData.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleAccountPayableData } = accountPayableSlice.actions;

export default accountPayableSlice.reducer;
