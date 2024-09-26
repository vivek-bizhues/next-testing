import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

import moment from "moment";
import { format } from "date-fns";

export const fetchFixedAssetDecliningBalancePoolTransactionData =
  createAsyncThunk(
    "FixedAssetDecliningBalancePoolTransactionData/fetch",
    async ({ pool_id, start_date, end_date }) => {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const startDate = format(start_date, "yyyy-MM-dd");
        const endDate = format(end_date, "yyyy-MM-dd");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-pool-ledger/${pool_id}/?start_date=${startDate}&end_date=${endDate}`,
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

export const updateFixedAssetDecliningBalancePoolLedger = createAsyncThunk(
  "FixedAssetDecliningBalancePoolLedger/update",
  async (
    { pool_id, date, value, ledger_id, start_date, end_date },
    { dispatch }
  ) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const _date = format(moment(date, "MMMYYYY").toDate(), "yyyy-MM-01");

      if (ledger_id) {
        const response = await axios.delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-pool-ledger/${pool_id}/${ledger_id}/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        console.log(response);
      }
      if (value > 0) {
        const response = await axios
          .post(
            process.env.NEXT_PUBLIC_BACKEND_API +
              `/${active_im_version}/fixed-asset-pool-ledger/${pool_id}/`,
            { value: value, date: _date },
            {
              headers: {
                Authorization: "Bearer " + storedToken,
              },
            }
          )
          .then((r) => {
            // console.log(r);
            dispatch(
              fetchFixedAssetDecliningBalancePoolTransactionData({
                pool_id: pool_id,
                start_date: start_date,
                end_date: end_date,
              })
            );
          });
        return response;
      } else {
        dispatch(
          fetchFixedAssetDecliningBalancePoolTransactionData({
            pool_id: pool_id,
            start_date: start_date,
            end_date: end_date,
          })
        );
      }
    }
  }
);

export const updateFixedAssetDecliningBalancePoolTransactionData =
  createAsyncThunk(
    "FixedAssetDecliningBalancePoolTransactionData/update",
    async (
      { pool_id, id, type, value, start_date, end_date },
      { dispatch }
    ) => {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const payload = { [type]: value };

        const response = await axios.patch(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-pool-view-trs/${pool_id}/${id}/`,
          payload,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        await dispatch(
          fetchFixedAssetDecliningBalancePoolTransactionData({
            pool_id: pool_id,
            start_date: start_date,
            end_date: end_date,
          })
        );

        return response.data;
      }
    }
  );

export const FixedAssetDecliningBalancePoolTransactionSlice = createSlice({
  name: "FixedAssetDecliningBalancePoolTransactionData",
  initialState: {
    data: [],
  },
  reducers: {
    handleFixedAssetDecliningBalancePoolTransactionData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFixedAssetDecliningBalancePoolTransactionData.fulfilled,
      (state, action) => {
        state.data = action.payload.data;
      }
    );
  },
});

export const { handleFixedAssetDecliningBalancePoolTransactionData } =
  FixedAssetDecliningBalancePoolTransactionSlice.actions;

export default FixedAssetDecliningBalancePoolTransactionSlice.reducer;
