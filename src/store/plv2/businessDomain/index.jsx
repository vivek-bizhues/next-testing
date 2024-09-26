import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchBusinessDomains = createAsyncThunk(
  "businessdomains/fetch",
  async () => {
    const storedToken = window.localStorage.getItem(
      "authToken"
    );
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_API + "/businessdomains/",
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    return response.data;
  }
);

export const businessDomainSlice = createSlice({
  name: "entity",
  initialState: {
    data: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBusinessDomains.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export default businessDomainSlice.reducer;
