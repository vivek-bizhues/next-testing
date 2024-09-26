import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import moment from "moment";
import toast from "react-hot-toast";

export const fetchFixedAssetData = createAsyncThunk(
  "FixedAssetData/fetch",
  async ({ sort, search, column, page = 1, page_size }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-assets-ledger/?format=datatables&page=${page}`,
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
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const deleteFixedAssetData = createAsyncThunk(
  "FixedAssetData/delete",
  async ({ id, sort, search, column, page, page_size }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/fixed-assets-ledger/${id}/`,
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
            fetchFixedAssetData({
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

export const createOrUpdateFixedAssetData = createAsyncThunk(
  "FixedAssetData/update",
  async (
    {
      id,
      name,
      purchase_amount,
      purchase_date,
      economic_userful_life,
      declining_balance_rate,
      straight_line_amount,
      declining_amount,
      depreciation_type,
      disposal_amount,
      disposal_date,
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
            `/${active_im_version}/fixed-assets-ledger/`,
          {
            id: id,
            name: name,
            purchase_amount: purchase_amount,
            purchase_date: moment(purchase_date).format("YYYY-MM-01"),
            economic_userful_life: economic_userful_life,
            declining_balance_rate: declining_balance_rate,
            straight_line_amount: straight_line_amount,
            declining_amount: declining_amount,
            depreciation_type: depreciation_type,
            disposal_amount: disposal_amount,
            disposal_date: disposal_date
              ? moment(disposal_date).format("YYYY-MM-01")
              : null,
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
            fetchFixedAssetData({
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

export const FixedAssetSlice = createSlice({
  name: "FixedAssetData",
  initialState: {
    isLoading: false,
    recordsTotal: 0,
    recordsFiltered: 0,
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleFixedAssetData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFixedAssetData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recordsTotal = action.payload.recordsTotal;
      state.recordsFiltered = action.payload.recordsFiltered;
      state.data = action.payload.data;
    });

    builder.addCase(fetchFixedAssetData.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(fetchFixedAssetData.rejected, (state, action) => {
      state.isLoading = false;
      state.httpStatus = action.error;
    });
  },
});

export const { handleFixedAssetData } = FixedAssetSlice.actions;

export default FixedAssetSlice.reducer;
