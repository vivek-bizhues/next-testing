import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

import moment from "moment";
import toast from "react-hot-toast";
import { fetchTotalSummary } from "./totalSummary";

// type SortType = "asc" | "desc" | undefined | null;

export const fetchFrontlogData = createAsyncThunk(
  "FrontlogData/fetch",
  async ({ searchValue, filter }) => {
    // console.log(filter, "filter");
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");

        let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/${active_im_version}/contract-frontlog/?filter_by=${filter}`;

        if (searchValue !== undefined) {
          url += `&search=${searchValue}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        });
        // console.log(response, "repsonse");
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching frontlog data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const updateContractTransactionData = createAsyncThunk(
  "FrontlogData/update",
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
      await dispatch(fetchFrontlogData({ filter: filter }));
      await dispatch(fetchTotalSummary({ flag: "all" }));

      return response.data;
    }
  }
);

export const updateContractData = createAsyncThunk(
  "FrontlogData/update",
  async ({ id, attribute, attribute_value, filter }, { dispatch }) => {
    try {
      const activeEntity = getCurrentEntity();
      if (activeEntity) {
        const active_im_version = activeEntity.active_im_version;
        const storedToken = window.localStorage.getItem("authToken");

        const payload = {
          [attribute]: attribute_value,
        };

        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/${active_im_version}/contract-backlog-frontlog/${id}/`,
          payload,
          {
            headers: {
              Authorization: "Bearer " + storedToken,
            },
          }
        );

        toast.success("Successfully updated");
        await dispatch(fetchFrontlogData({ filter: filter }));
        await dispatch(fetchTotalSummary({ flag: "all" }));

        return response.data;
      }
    } catch (error) {
      console.error("Error updating contract data:", error);
      throw error;
    }
  }
);

export const deleteFrontlogData = createAsyncThunk(
  "FrontlogData/delete",
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
          dispatch(fetchFrontlogData({ filter: filter }));
          dispatch(fetchTotalSummary({ flag: "all" }));
        });
      return response;
    }
  }
);

export const createFrontlog = createAsyncThunk(
  "FrontlogData/update",
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
            is_bl: false,
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
          dispatch(fetchFrontlogData({ filter: filter }));
        })
        .catch(function (error) {
          // console.log(error);
        });

      return response;
    }
  }
);

export const cloneFrontlog = createAsyncThunk(
  "FrontlogData/clone",
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
            is_bl: false,
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
          dispatch(fetchFrontlogData({ filter: filter }));
          dispatch(fetchTotalSummary({ flag: "all" }));
        })
        .catch(function (error) {
          // console.log(error);
        });

      return response;
    }
  }
);

export const FrontlogSlice = createSlice({
  name: "FrontlogData",
  initialState: {
    data: [],
    httpStatus: null,
  },
  reducers: {
    handleFrontlogData: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFrontlogData.fulfilled, (state, action) => {
      state.data = action.payload;
    });
    builder.addCase(fetchFrontlogData.rejected, (state, action) => {
      state.httpStatus = action.error; // Sending status code in the state
    });
  },
});

export const { handleFrontlogData } = FrontlogSlice.actions;

export default FrontlogSlice.reducer;
