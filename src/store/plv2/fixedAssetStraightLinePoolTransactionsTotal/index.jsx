import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import { format } from "date-fns";

export const fetchFixedAssetStraightLineBalancePoolsTotalLedgerView =
  createAsyncThunk(
    "fetchFixedAssetStraightLineBalancePoolsTotalLedgerView/fetch",
    async ({ start_date, end_date }) => {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const startDate = format(start_date, "yyyy-MM-dd");
        const endDate = format(end_date, "yyyy-MM-dd");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-straight-all-pool-view-total-trs/?start_date=${startDate}&end_date=${endDate}`,
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

export const FixedAssetStraightLineBalancePoolsTotalSlice = createSlice({
  name: "FixedAssetStraightLineBalancePoolsTotalLedgerView",
  initialState: {
    data: [],
  },
  reducers: {
    handleFixedAssetStraightLineBalancePoolsTotalLedgerView: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFixedAssetStraightLineBalancePoolsTotalLedgerView.fulfilled,
      (state, action) => {
        state.data = action.payload.data;
      }
    );
  },
});

export const { handleFixedAssetStraightLineBalancePoolsTotalLedgerView } =
  FixedAssetStraightLineBalancePoolsTotalSlice.actions;

export default FixedAssetStraightLineBalancePoolsTotalSlice.reducer;
