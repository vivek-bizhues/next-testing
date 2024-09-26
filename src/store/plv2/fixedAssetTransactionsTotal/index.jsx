import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchFixedAssetTransactionDataTotal = createAsyncThunk(
  "fixedAssetTransactionDataTotal/fetch",
  async () => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/fixed-assets-ledger-schedule/`,
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
  name: "fixedAssetTransactionDataTotal",
  initialState: {
    data: [],
  },
  reducers: {
    handlefixedAssetTransactionDataTotal: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFixedAssetTransactionDataTotal.fulfilled,
      (state, action) => {
        state.data = action.payload.data;
      }
    );
  },
});

export const { handlefixedAssetTransactionDataTotal } =
  fixedAssetTransactionSlice.actions;

export default fixedAssetTransactionSlice.reducer;
