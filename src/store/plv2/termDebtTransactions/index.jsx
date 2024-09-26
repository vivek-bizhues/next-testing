import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import moment from "moment";
import { fetchtermDebtTransactionDataTotal } from "../termDebtTransactionsTotal";

export const fetchTermDebtTransactionData = createAsyncThunk(
  "termDebtTransactionData/fetch",
  async () => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/term-loan-ledger-transactions/`,
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

export const updateTermDebtTransactionData = createAsyncThunk(
  "termDebtTransactionData/update",
  async ({ tll, ledger_date, attribute, attribute_value }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");

      const payload = {
        tll: tll,
        ledger_date: moment(ledger_date).format("YYYY-MM-01"),
      };
      payload[attribute] = attribute_value;

      const response = await axios
        .post(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/update-term-loan-ledger-transaction/`,
          payload,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          // console.log(response)
          dispatch(fetchtermDebtTransactionDataTotal());
          dispatch(fetchTermDebtTransactionData());
        })
        .catch(function (error) {
          // console.log(error)
        });

      return response;
    }
  }
);

export const termDebtTransactionSlice = createSlice({
  name: "termDebtTransactionData",
  initialState: {
    data: [],
  },
  reducers: {
    handleTermDebtTransactionData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTermDebtTransactionData.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export const { handleTermDebtTransactionData } =
  termDebtTransactionSlice.actions;

export default termDebtTransactionSlice.reducer;
