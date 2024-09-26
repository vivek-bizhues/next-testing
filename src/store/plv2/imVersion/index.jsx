import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import "react-toastify/dist/ReactToastify.css";
import { fetchImTemplate } from "../imTemplate";

export const fetchIMVersions = createAsyncThunk("imversion/fetch", async () => {
  const activeEntity = getCurrentEntity();
  if (activeEntity) {
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_API +
        `/${activeEntity.id}/entity-im-versions/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    window.localStorage.setItem("imvs", JSON.stringify(response.data));
    return response.data;
  }
});

export const updateIMVersion = createAsyncThunk(
  "imversion/update",
  async (imv, { dispatch }) => {
    const activeEntity = getCurrentEntity().id;
    const activeIMVId = getCurrentEntity().active_im_version;

    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_BACKEND_API +
        `/${activeEntity}/integrated-model-version/${activeIMVId}/`,
      {
        income_tax_rate: imv.income_tax_rate,
        interest_rate_on_deposits: imv.interest_rate_on_deposits,
        interest_rate_on_operating_line: imv.interest_rate_on_operating_line,
        accounts_receivable_days: imv.accounts_receivable_days,
        accounts_receivable_days_others: imv.accounts_receivable_days_others,
        inventory_days: imv.inventory_days,
        accounts_payable_days_others: imv.accounts_payable_days_others,
        accounts_payable_days_costs_of_sales:
          imv.accounts_payable_days_costs_of_sales,
      },
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchIMVersions());
    await dispatch(fetchImTemplate());

    // toast.success("Entity Updated");

    return response.data;
  }
);
export const imversionSlice = createSlice({
  name: "imversion",
  initialState: {
    data: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchIMVersions.fulfilled, (state, action) => {
      state.data = action.payload;
      // ...
    });
  },
});

// export const { setActiveEntity } = entitySlice.actions;

export default imversionSlice.reducer;
