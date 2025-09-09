import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Errors } from "../../utils/error.jsx";
import {
  adminDeleteRequest,
  adminGetRequest,
  adminPostRequest,
  adminPutRequest,
} from "../../request";

export const listGroups = createAsyncThunk(
  "groups/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminGetRequest("/groups/list");
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const addGroup = createAsyncThunk(
  "groups/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminPostRequest("/groups/add", data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const editGroup = createAsyncThunk(
  "groups/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminPutRequest(`/groups/edit/${id}`, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);
export const deleteGroup = createAsyncThunk(
  "groups/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminDeleteRequest(`/groups/remove/${id}`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

const initialState = {
  groups: [],
  loading: false,
  error: null,
  status: "idle",
};

export const GroupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(listGroups.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(listGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.groups = action.payload;
      })
      .addCase(listGroups.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(addGroup.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(addGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(editGroup.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(editGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(editGroup.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default GroupsSlice.reducer;
