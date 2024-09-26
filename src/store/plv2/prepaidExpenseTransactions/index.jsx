import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchPrepaidExpenseTransactionData = createAsyncThunk(
  "prepaidExpenseTransactionData/fetch",
  async () => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/prepaid-expense-ledger-transactions/`,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      return response;
    }
  }
);

export const prepaidExpenseTransactionSlice = createSlice({
  name: "prepaidExpenseTransactionData",
  initialState: {
    data: [],
  },
  reducers: {
    handleprepaidExpenseTransactionData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchPrepaidExpenseTransactionData.fulfilled,
      (state, action) => {
        state.data = action.payload.data;
      }
    );
  },
});

export const { handleprepaidExpenseTransactionData } =
  prepaidExpenseTransactionSlice.actions;

export default prepaidExpenseTransactionSlice.reducer;
