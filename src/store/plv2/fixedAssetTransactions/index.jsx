import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchFixedAssetTransactionData = createAsyncThunk(
  "fixedAssetTransactionData/fetch",
  async () => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem(
        "authToken"
      );
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/fixed-assets-ledger-transactions/`,
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

export const fixedAssetTransactionSlice = createSlice({
  name: "fixedAssetTransactionData",
  initialState: {
    data: [],
  },
  reducers: {
    handleFixedAssetTransactionData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFixedAssetTransactionData.fulfilled,
      (state, action) => {
        state.data = action.payload.data;
      }
    );
  },
});

export const { handleFixedAssetTransactionData } =
  fixedAssetTransactionSlice.actions;

export default fixedAssetTransactionSlice.reducer;
