import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import moment from "moment";
import toast from "react-hot-toast";
import { fetchTotalSummary } from "./totalSummary";
import { fetchFrontlogData } from "./frontlog";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

// type SortType = "asc" | "desc" | undefined | null;

export const fetchBacklogData = createAsyncThunk(
  "BacklogData/fetch",
  async ({ searchValue, filter }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");

        let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/${active_im_version}/contract-backlog/?filter_by=${filter}`;

        if (searchValue !== undefined) {
          url += `&search=${searchValue}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching backlog data:", error);
      const statusCode = error?.response ? error.response.status : "Unknown";
      throw statusCode;
    }
  }
);

export const updateContractTransactionData = createAsyncThunk(
  "BacklogData/update",
  async (
    { id, contract_id, attribute, attribute_value, filter },
    { dispatch }
  ) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");

      const payload = {};
      payload[attribute] = attribute_value;

      const response = await axios.patch(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/contract-transaction-backlog-frontlog/${contract_id}/${id}/`,
        payload,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchBacklogData({ filter: filter }));
      await dispatch(fetchFrontlogData({ filter: filter }));
      await dispatch(fetchTotalSummary({ flag: "all" }));

      return response.data;
    }
  }
);

export const updateContractData = createAsyncThunk(
  "BacklogData/update",
  async ({ id, attribute, attribute_value, filter }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");

      const payload = {};
      payload[attribute] = attribute_value;

      const response = await axios.patch(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${active_im_version}/contract-backlog-frontlog/${id}/`,
        payload,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchBacklogData({ filter: filter }));
      await dispatch(fetchFrontlogData({ filter: filter }));
      await dispatch(fetchTotalSummary({ flag: "all" }));
      return response.data;
    }
  }
);

export const deleteBacklogData = createAsyncThunk(
  "BacklogData/delete",
  async ({ id, filter }, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    if (activeEntity) {
      const active_im_version = activeEntity.active_im_version;
      const storedToken = window.localStorage.getItem("authToken");
      const response = await axios
        .delete(
          process.env.NEXT_PUBLIC_BACKEND_API +
            `/${active_im_version}/contract-backlog-frontlog/${id}/`,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          toast.success("Successfully deleted");
          dispatch(fetchBacklogData({ filter: filter }));
          dispatch(fetchFrontlogData({ filter: filter }));
          dispatch(fetchTotalSummary({ flag: "all" }));
        });
      return response;
    }
  }
);

export const createBacklog = createAsyncThunk(
  "BacklogData/update",
  async (
    {
      name,
      contract_val,
      material_c_per,
      directlabour_c_per,
      subcontract_c_per,
      flfactoring,
      start_date,
      end_date,
      filter,
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
            `/${active_im_version}/contract-backlog-frontlog/`,
          {
            name: name,
            contract_val: contract_val,
            is_bl: true,
            material_c_per: material_c_per,
            directlabour_c_per: directlabour_c_per,
            subcontract_c_per: subcontract_c_per,
            flfactoring: flfactoring,
            start_date: moment(start_date).format("YYYY-MM-01"),
            end_date: moment(end_date).format("YYYY-MM-01"),
          },
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          toast.success("Successfully created.");
          dispatch(fetchBacklogData({ filter: filter }));
        })
        .catch(function (error) {
          // console.log(error);
        });

      return response;
    }
  }
);

export const cloneBacklog = createAsyncThunk(
  "BacklogData/clone",
  async (
    {
      id,
      name,
      contract_val,
      material_c_per,
      directlabour_c_per,
      subcontract_c_per,
      flfactoring,
      start_date,
      end_date,
      filter,
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
            `/${active_im_version}/clone-contract/${id}`,
          {
            name: name,
            contract_val: contract_val,
            is_bl: true,
            material_c_per: material_c_per,
            directlabour_c_per: directlabour_c_per,
            subcontract_c_per: subcontract_c_per,
            flfactoring: flfactoring,
            start_date: moment(start_date).format("YYYY-MM-01"),
            end_date: moment(end_date).format("YYYY-MM-01"),
          },
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          toast.success("Successfully cloned.");
          dispatch(fetchBacklogData({ filter: filter }));
        })
        .catch(function (error) {
          // console.log(error);
        });

      return response;
    }
  }
);

export const BacklogSlice = createSlice({
  name: "BacklogData",
  initialState: {
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleBacklogData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBacklogData.fulfilled, (state, action) => {
      state.data = action.payload;
    });
    builder.addCase(fetchBacklogData.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleBacklogData } = BacklogSlice.actions;

export default BacklogSlice.reducer;
