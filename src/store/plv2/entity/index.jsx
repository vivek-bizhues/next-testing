import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentEntity } from "../../../helpers/entitiyHelpers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const fetchEntities = createAsyncThunk("entities/fetch", async () => {
  const storedToken = window.localStorage.getItem("authToken");
  const response = await axios.get(
    process.env.NEXT_PUBLIC_BACKEND_API + "/entities/",
    {
      headers: {
        Authorization: "Bearer " + storedToken,
      },
    }
  );
  return response.data;
});

export const fetchEntitiesById = createAsyncThunk(
  "entities/fetchById",
  async () => {
    const id = getCurrentEntity().id;

    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_API + `/entities/${id}/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );

    fetchEntities();
    return response.data;
  }
);

export const updateEntity = createAsyncThunk(
  "entities/update",
  async (entity, { dispatch, rejectWithValue }) => {
    const id = getCurrentEntity().id;

    // Check if id is undefined
    if (id === undefined) {
      return rejectWithValue("Entity ID is undefined");
    }

    const storedToken = window.localStorage.getItem("authToken");

    try {
      const response = await axios.patch(
        process.env.NEXT_PUBLIC_BACKEND_API + `/entities/${id}/`,
        entity,
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );
      await dispatch(fetchEntities());

      // toast.success("Entity Updated");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addEntity = createAsyncThunk(
  "entities/add",
  async (entity, { dispatch }) => {
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_API + "/entities/",
      entity,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    toast.success("Entity Created");

    await dispatch(fetchEntities());
    return response.data.entity;
  }
);

export const deleteEntity = createAsyncThunk(
  "entities/delete",
  async (_, { dispatch }) => {
    const id = getCurrentEntity().id;
    const storedToken = window.localStorage.getItem("authToken");
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_BACKEND_API + `/entities/${id}/`,
      {
        headers: {
          Authorization: "Bearer " + storedToken,
        },
      }
    );
    await dispatch(fetchEntities());
    toast.error("Entity Deleted");

    return response.data.entity;
  }
);

export const entitySlice = createSlice({
  name: "entity",
  initialState: {
    data: [],
    activeEntity: null,
    fetchedEntity: null,
  },
  reducers: {
    setActiveEntity: (state, action) => {
      state.activeEntity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEntities.fulfilled, (state, action) => {
      state.data = action.payload.data;
      // ...
    });
    builder.addCase(fetchEntitiesById.fulfilled, (state, action) => {
      state.fetchedEntity = action.payload;
      // ...
    });
  },
});

export const { setActiveEntity } = entitySlice.actions;

export default entitySlice.reducer;
