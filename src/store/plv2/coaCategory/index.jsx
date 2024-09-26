import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchCoaCategory = createAsyncThunk(
  "coaCategory/fetch",
  async () => {
    const activeEntity = getCurrentEntity();
    const entityID = activeEntity.id;
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/${entityID}/coa-categories/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    return response.data;
  }
);

export const COACategorySlice = createSlice({
  name: "coaCategory",
  initialState: {
    data: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCoaCategory.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export default COACategorySlice.reducer;
