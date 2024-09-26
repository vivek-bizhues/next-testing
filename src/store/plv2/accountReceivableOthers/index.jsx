import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import { populateTransactionData } from "../../../helpers/aroHelpers";

export const fetchAccountReceivedData = createAsyncThunk(
  "accountReceivedData/fetch",
  async () => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem(
          "authToken"
        );
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/account-receivable-other/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching account received data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const updateAccountReceivedData = createAsyncThunk(
  "accountReceivedData/update",
  async (changesArray, { dispatch }) => {
    const activeEntity = getCurrentEntity();

    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem(
        "authToken"
      );
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/account-receivable-other-batches/`,
        changesArray,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchAccountReceivedData());

      return response.data;
    }
  }
);

export const accountReceivedDataSlice = createSlice({
  name: "accountReceivedData",
  initialState: {
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleaccountReceivedData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccountReceivedData.fulfilled, (state, action) => {
      const arData = action.payload;
      // const activeEntity = getCurrentEntity();
      // const modelDateRange = getDateRangeInMonths(
      //   new Date(activeEntity.start_date),
      //   new Date(activeEntity.end_date),
      //   "yyyy-MM-01"
      // );

      arData.forEach((ar, idx) => {
        arData[idx].transaction = populateTransactionData(ar.transaction);
      });

      state.data = arData;
      // state.params = action.payload.params
      // state.allData = action.payload.allData
      // state.total = action.payload.total
    });
    builder.addCase(fetchAccountReceivedData.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleaccountReceivedData } = accountReceivedDataSlice.actions;

export default accountReceivedDataSlice.reducer;
