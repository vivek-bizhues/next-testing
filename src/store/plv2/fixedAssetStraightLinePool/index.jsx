import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

import moment from "moment";
import toast from "react-hot-toast";

export const fetchFixedAssetStraightLinePoolData = createAsyncThunk(
  "FixedAssetStraightLinePoolData/fetch",
  async ({ sort, search, column, page = 1, page_size }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-straight-pool/?format=datatables&page=${page}`,
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
      console.error(
        "Error fetching fixed asset straight line pool data:",
        error
      );
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const deleteFixedAssetStraightLinePoolData = createAsyncThunk(
  "FixedAssetStraightLinePoolData/delete",
  async ({ id, sort, search, column, page, page_size }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-asset-straight-pool/${id}/`,
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
            fetchFixedAssetStraightLinePoolData({
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

export const createOrUpdateFixedAssetStraightLinePoolData = createAsyncThunk(
  "FixedAssetStraightLinePoolData/update",
  async (
    {
      id,
      name,
      start_date,
      ob_remaining_cost,
      months_pool,
      ob_remaining_periods,
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
            `/${active_im_version}/fixed-asset-straight-pool/`,
          {
            id: id,
            name: name,
            ob_remaining_cost: ob_remaining_cost,
            start_date: moment(start_date).format("YYYY-MM-01"),
            months_pool: months_pool,
            ob_remaining_periods: ob_remaining_periods,
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
            fetchFixedAssetStraightLinePoolData({
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

export const FixedAssetStraightLinePoolSlice = createSlice({
  name: "FixedAssetStraightLinePoolData",
  initialState: {
    isLoading: false,
    recordsTotal: 0,
    recordsFiltered: 0,
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleFixedAssetStraightLinePoolData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFixedAssetStraightLinePoolData.fulfilled,
      (state, action) => {
        state.isLoading = false;
        state.recordsTotal = action.payload.recordsTotal;
        state.recordsFiltered = action.payload.recordsFiltered;
        state.data = action.payload.data;
      }
    );
    builder.addCase(
      fetchFixedAssetStraightLinePoolData.pending,
      (state, action) => {
        state.isLoading = true;
      }
    );
    builder.addCase(
      fetchFixedAssetStraightLinePoolData.rejected,
      (state, action) => {
        state.isLoading = false;
        state.httpStatus = action.error;
      }
    );
  },
});

export const { handleFixedAssetStraightLinePoolData } =
  FixedAssetStraightLinePoolSlice.actions;

export default FixedAssetStraightLinePoolSlice.reducer;
