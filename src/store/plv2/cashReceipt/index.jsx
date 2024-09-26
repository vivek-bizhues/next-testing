import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import { populateTransactionData } from "../../../helpers/cdcrHelpers";

export const fetchCashReceiptData = createAsyncThunk(
  "cashReceiptData/fetch",
  async () => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/cash-receipt/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching cash receipt data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const updateCashReceiptData = createAsyncThunk(
  "cashReceiptData/update",
  async (changesArray, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/cash-receipt-batches/`,
        changesArray,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchCashReceiptData());
      return response.data;
    }
  }
);

export const cashReceiptSlice = createSlice({
  name: "cashReceiptData",
  initialState: {
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleCashReceiptData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCashReceiptData.fulfilled, (state, action) => {
      const cashReceiptData = action.payload;
      // const activeEntity = getCurrentEntity();
      // const modelDateRange = getDateRangeInMonths(
      //   new Date(activeEntity.start_date),
      //   new Date(activeEntity.end_date),
      //   "yyyy-MM-01"
      // );

      cashReceiptData.forEach((cr, idx) => {
        cashReceiptData[idx].transaction = populateTransactionData(
          cr.transaction
        );
      });

      state.data = cashReceiptData;
      // state.params = action.payload.params
      // state.allData = action.payload.allData
      // state.total = action.payload.total
    });
    builder.addCase(fetchCashReceiptData.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleCashReceiptData } = cashReceiptSlice.actions;

export default cashReceiptSlice.reducer;
