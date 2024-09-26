import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const cloneIMV = createAsyncThunk(
  "cloneIMV/post",
  async ({ name }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${activeEntity.active_im_version}/clone-imversion/`,
        {
          name: name,
        },
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      window.localStorage.setItem("imvs", JSON.stringify(response.data));
      return response.data;
    }
  }
);

export const deleteCloneIMV = createAsyncThunk(
  "cloneIMV/delete",
  async (source) => {
    // console.log(source,"id")
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios.delete(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${source.deleteScenarioSource}/clone-imversion/${source.deleteScenarioId}/`,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      // console.log(response,"response")
      toast.success(`Scenario deleted`);
      window.localStorage.setItem("imvs", JSON.stringify(response.data));
      return response.data;
    }
  }
);

export const cloneIMVSlice = createSlice({
  name: "cloneIMV",
  initialState: {
    data: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(cloneIMV.fulfilled, (state, action) => {
      state.data = action.payload;
    });
    builder.addCase(deleteCloneIMV.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export default cloneIMVSlice.reducer;
