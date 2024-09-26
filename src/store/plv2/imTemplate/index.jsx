import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchImTemplate = createAsyncThunk(
  "fetchImTemplate/fetch",
  async () => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/im-version-data/?end_date=${activeEntity.end_date}&start_date=${activeEntity.start_date}`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );
        return response;
      }
    } catch (error) {
      const statusCode = error?.response ? error.response.status : "Unknown";
      throw statusCode;
    }
  }
);

export const fetchImTemplateSlice = createSlice({
  name: "fetchImTemplate",
  initialState: {
    httpStatus: null,
    data: [],
  },
  reducers: {
    handleFetchImTemplate: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchImTemplate.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
    builder.addCase(fetchImTemplate.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleFetchImTemplate } = fetchImTemplateSlice.actions;

export default fetchImTemplateSlice.reducer;
