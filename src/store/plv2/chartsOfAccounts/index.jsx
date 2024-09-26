import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import entity from "../../../configs/entity";

export const fetchCOAData = createAsyncThunk(
  "chartsOfAccountsData/fetch",
  async () => {
    const entityId = window.localStorage.getItem(entity.entity_id);
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_API + `/${entityId}/coa/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );

    return response.data;
  }
);

export const addCoa = createAsyncThunk(
  "chartsOfAccountsData/add",
  async (coa, { dispatch }) => {
    const storedToken = window.localStorage.getItem("authToken");
    const entityId = window.localStorage.getItem(entity.entity_id);

    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_API + `/${entityId}/coa/`,
      coa,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchCOAData());
    return response.data;
  }
);

export const deleteCoa = createAsyncThunk(
  "chartsOfAccountsData/delete",
  async (id, { dispatch }) => {
    const storedToken = window.localStorage.getItem("authToken");
    // const entityId = window.localStorage.getItem(entity.entity_id);
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_BACKEND_API + `$/{entityId}/coa/${id}/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchCOAData());
    return response.data;
  }
);
export const updateCoa = createAsyncThunk(
  "chartsOfAccountsData/update",
  async ({ coa }, { dispatch }) => {
    const id = coa.id;
    const entityId = window.localStorage.getItem(entity.entity_id);
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_API + `/${entityId}/coa/${id}`,
      {
        coa,
      },
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchCOAData());

    return response.data;
  }
);

export const COASlice = createSlice({
  name: "chartsOfAccountsData",
  initialState: {
    data: [],
  },
  reducers: {
    handlecoa: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCOAData.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export const { handlecoa } = COASlice.actions;

export default COASlice.reducer;
