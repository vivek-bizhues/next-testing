import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";

export const fetchCoa = createAsyncThunk("coa/fetch", async (searchQuery) => {
  try {
    const activeEntity = getCurrentEntity();
    const entityID = activeEntity.id;
    const storedToken = window.localStorage.getItem("authToken");

    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/${entityID}/coa/?format=datatables`;

    // Check if searchQuery is defined, if yes, append it to the URL
    if (searchQuery !== undefined) {
      url += `&search=${searchQuery}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + storedToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching COA data:", error);
    const statusCode = error?.response ? error?.response?.status : "Unknown";
    throw statusCode;
  }
});

export const fetchCoaCategoryList = createAsyncThunk(
  "coacategorylist/fetch",
  async () => {
    try {
      const activeEntity = getCurrentEntity();
      const entityID = activeEntity.id;
      const storedToken = window.localStorage.getItem("authToken");

      let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/${entityID}/coas-category-list/?format=datatables`;
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching COA data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const fetchCoaNew = createAsyncThunk(
  "coaNew/fetch",
  async ({ sort, search, column, page = 1, page_size }) => {
    try {
      const activeEntity = getCurrentEntity();
      const entityID = activeEntity.id;
      const storedToken = window.localStorage.getItem("authToken");

      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_API +
          `/${entityID}/coas-list/?format=datatables&page=${page}`,
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
    } catch (error) {
      console.error("Error fetching COA data:", error);
      const statusCode = error?.response ? error?.response?.status : "Unknown";
      throw statusCode;
    }
  }
);

export const fetchCoaList = createAsyncThunk("coa/fetch", async (flag) => {
  const activeEntity = getCurrentEntity();
  const entityID = activeEntity.id;
  const storedToken = window.localStorage.getItem("authToken");
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_API}/${entityID}/coa-list/${flag}/`,
    {
      headers: {
        Authorization: "Bearer " + storedToken,
      },
    }
  );
  return response.data;
});

export const createOrUpdateCoAData = createAsyncThunk(
  "coa/createOrUpdateCoAData",
  async (
    { id, name, category, position = 32637, search, page_size },
    { dispatch }
  ) => {
    const activeEntity = getCurrentEntity();
    const entityID = activeEntity.id;

    if (activeEntity) {
      const storedToken = window.localStorage.getItem("authToken");

      if (id === 0) {
        const response = await axios
          .post(
            `${process.env.NEXT_PUBLIC_BACKEND_API}/${entityID}/coa/`,
            {
              name: name,
              category: category,
              position: position,
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

            dispatch(
              fetchCoaNew({
                search: search,
                column: "id",
                sort: "desc",
                page_size,
              })
            );
          })
          .catch(function (error) {
            // console.log(error);
          });
        return response;
      } else {
        const response = await axios
          .patch(
            `${process.env.NEXT_PUBLIC_BACKEND_API}/${entityID}/coa/${id}/`,
            {
              name: name,
              category: category,
            },
            {
              headers: {
                Authorization: "Bearer " + storedToken,
              },
            }
          )
          .then((response) => {
            // console.log(response);
            toast.success("Successfully updated.");
            dispatch(
              fetchCoaNew({
                search: search,
                column: "id",
                sort: "desc",
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
  }
);

export const deleteCoa = createAsyncThunk(
  "coa/delete",
  async (id, { dispatch }) => {
    const activeEntity = getCurrentEntity();
    const entityID = activeEntity.id;
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios
      .delete(process.env.NEXT_PUBLIC_BACKEND_API + `/${entityID}/coa/${id}/`, {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      })
      .then((response) => {
        // console.log(response);
        toast.success("Deleted Sucessfully.");
        dispatch(fetchCoaNew({ page_size: 10, column: "id", sort: "desc" }));
      })
      .catch(function (error) {
        // console.log(error);
      });
    await dispatch(fetchCoaNew({ page_size: 10, column: "id", sort: "desc" }));
    return response;
  }
);

export const CoASlice = createSlice({
  name: "coa",
  initialState: {
    recordsTotal: 0,
    recordsFiltered: 0,
    isLoading: false,
    data: [],
    newData: [],
    categories: [],
    httpStatus: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCoa.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recordsTotal = action.payload.recordsTotal;
      state.recordsFiltered = action.payload.recordsFiltered;
      state.data = action.payload.data;
    });
    builder.addCase(fetchCoa.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCoa.rejected, (state, action) => {
      state.isLoading = false;
      state.httpStatus = action.error;
    });
    builder.addCase(fetchCoaCategoryList.fulfilled, (state, action) => {
      state.isLoading = false;
      state.categories = action.payload.data;
    });
    builder.addCase(fetchCoaNew.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recordsTotal = action.payload.recordsTotal;
      state.recordsFiltered = action.payload.recordsFiltered;
      state.newData = action.payload.data;
    });
  },
});

export default CoASlice.reducer;
