import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import moment from "moment";
import toast from "react-hot-toast";

export const fetchPrepaidExpenseData = createAsyncThunk(
  "prepaidExpenseData/fetch",
  async ({ sort, search, column, page = 1, page_size }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/prepaid-expense-ledger/?format=datatables&page=${page}`,
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
      // console.error("Error fetching prepaid expense data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const deletePrepaidExpenseData = createAsyncThunk(
  "prepaidExpenseData/delete",
  async ({ id, sort, search, column, page, page_size }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/prepaid-expense-ledger/${id}/`,
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
            fetchPrepaidExpenseData({
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

export const createOrUpdatePrepaidExpenseData = createAsyncThunk(
  "prepaidExpenseData/update",
  async (
    {
      id,
      title,
      coa,
      purchase_amount,
      purchase_date,
      months_covered,
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
            `/${active_im_version}/prepaid-expense-ledger/`,
          {
            id: id,
            title: title,
            coa: coa,
            purchase_amount: purchase_amount,
            purchase_date: moment(purchase_date).format("YYYY-MM-01"),
            months_covered: months_covered,
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
            fetchPrepaidExpenseData({
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

export const prepaidExpenseSlice = createSlice({
  name: "prepaidExpenseData",
  initialState: {
    isLoading: false,
    recordsTotal: 0,
    recordsFiltered: 0,
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleprepaidExpenseData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPrepaidExpenseData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recordsTotal = action.payload.recordsTotal;
      state.recordsFiltered = action.payload.recordsFiltered;
      state.data = action.payload.data;
    });

    builder.addCase(fetchPrepaidExpenseData.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(fetchPrepaidExpenseData.rejected, (state, action) => {
      state.isLoading = false;
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleprepaidExpenseData } = prepaidExpenseSlice.actions;

export default prepaidExpenseSlice.reducer;
