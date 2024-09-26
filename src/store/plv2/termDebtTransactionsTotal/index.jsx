import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchtermDebtTransactionDataTotal = createAsyncThunk(
  "termDebtTransactionDataTotal/fetch",
  async () => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/term-loan-ledger-schedule/`,
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

export const termDebtTransactionSlice = createSlice({
  name: "termDebtTransactionDataTotal",
  initialState: {
    data: [],
  },
  reducers: {
    handletermDebtTransactionDataTotal: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchtermDebtTransactionDataTotal.fulfilled,
      (state, action) => {
        state.data = action.payload.data;
      }
    );
  },
});

export const { handletermDebtTransactionDataTotal } =
  termDebtTransactionSlice.actions;

export default termDebtTransactionSlice.reducer;
