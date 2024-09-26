import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import moment from "moment";
import toast from "react-hot-toast";

export const fetchFixedAssetDecliningPoolData = createAsyncThunk(
  "FixedAssetDecliningPoolData/fetch",
  async ({ sort, search, column, page = 1, page_size }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-declining-pool/?format=datatables&page=${page}`,
          {
            params: {
              search,
              sort,
              column,
              page_size,
            },
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching fixed asset declining pool data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const deleteFixedAssetDecliningPoolData = createAsyncThunk(
  "FixedAssetDecliningPoolData/delete",
  async ({ id, sort, search, column, page, page_size }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-declining-pool/${id}/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          toast.success("Successfully deleted");
          dispatch(
            fetchFixedAssetDecliningPoolData({
              sort: sort,
              search: search,
              column: column,
              page: page,
              page_size,
            })
          );
        });
      return response;
    }
  }
);

export const createOrUpdateFixedAssetDecliningPoolData = createAsyncThunk(
  "FixedAssetDecliningPoolData/update",
  async (
    {
      id,
      name,
      ob_remaining_cost,
      ob_nbv,
      start_date,
      declining_balance_rate,
      memo,
      sort,
      search,
      column,
      page,
      page_size,
    },
    { dispatch }
  ) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .post(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-declining-pool/`,
          {
            id: id,
            name: name,
            ob_remaining_cost: ob_remaining_cost,
            ob_nbv: ob_nbv,
            start_date: moment(start_date).format("YYYY-MM-01"),
            declining_balance_rate: declining_balance_rate,
            memo: memo,
          },
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          if (id === 0) {
            toast.success("Successfully created.");
          } else {
            toast.success("Successfully updated.");
          }

          dispatch(
            fetchFixedAssetDecliningPoolData({
              sort: sort,
              search: search,
              column: column,
              page: page,
              page_size,
            })
          );
        })
        .catch(function (error) {
          // console.log(error);
        });

      return response;
    }
  }
);

export const FixedAssetDecliningPoolSlice = createSlice({
  name: "FixedAssetDecliningPoolData",
  initialState: {
    isLoading: false,
    recordsTotal: 0,
    recordsFiltered: 0,
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleFixedAssetDecliningPoolData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFixedAssetDecliningPoolData.fulfilled,
      (state, action) => {
        state.isLoading = false;
        state.recordsTotal = action.payload.recordsTotal;
        state.recordsFiltered = action.payload.recordsFiltered;
        state.data = action.payload.data;
      }
    );
    builder.addCase(
      fetchFixedAssetDecliningPoolData.pending,
      (state, action) => {
        state.isLoading = true;
      }
    );
    builder.addCase(
      fetchFixedAssetDecliningPoolData.rejected,
      (state, action) => {
        state.isLoading = false;
        state.httpStatus = action.error;
      }
    );
  },
});

export const { handleFixedAssetDecliningPoolData } =
  FixedAssetDecliningPoolSlice.actions;

export default FixedAssetDecliningPoolSlice.reducer;
