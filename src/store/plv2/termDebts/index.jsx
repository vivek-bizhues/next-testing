import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import moment from "moment";
import toast from "react-hot-toast";

export const fetchTermDebtData = createAsyncThunk(
  "termDebtData/fetch",
  async ({ sort, search, column, page = 1, page_size }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/term-loan-ledger/?format=datatables&page=${page}`,
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
      console.error("Error fetching term debt data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const deleteTermDebtData = createAsyncThunk(
  "termDebtData/delete",
  async ({ id, sort, search, column, page, page_size }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/term-loan-ledger/${id}/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          toast.success("Successfully deleted");
          // console.log(response);
          dispatch(
            fetchTermDebtData({
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

export const createOrUpdateTermDebtData = createAsyncThunk(
  "termDebtData/update",
  async (
    {
      id,
      desciption,
      terms_in_months,
      principal_amount,
      start_date,
      term_debt_ledger_type,
      interest_rate,
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
            `/${active_im_version}/term-loan-ledger/`,
          {
            id: id,
            desciption: desciption,
            terms_in_months: terms_in_months,
            principal_amount: principal_amount,
            start_date: moment(start_date).format("YYYY-MM-01"),
            term_debt_ledger_type: term_debt_ledger_type,
            interest_rate: interest_rate,
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
            fetchTermDebtData({
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

export const termDebtSlice = createSlice({
  name: "termDebtData",
  initialState: {
    isLoading: false,
    recordsTotal: 0,
    recordsFiltered: 0,
    data: [],
    httpStatus: null,
  },
  reducers: {
    handletermDebtData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTermDebtData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recordsTotal = action.payload.recordsTotal;
      state.recordsFiltered = action.payload.recordsFiltered;
      state.data = action.payload.data;
    });

    builder.addCase(fetchTermDebtData.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(fetchTermDebtData.rejected, (state, action) => {
      state.isLoading = false;
      state.httpStatus = action.error;
    });
  },
});

export const { handletermDebtData } = termDebtSlice.actions;

export default termDebtSlice.reducer;
