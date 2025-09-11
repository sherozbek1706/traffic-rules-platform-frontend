import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Errors } from "../../utils/error.jsx";
import {
  adminDeleteRequest,
  adminGetRequest,
  adminPostRequest,
  adminPutRequest,
} from "../../request/index.js";

export const loginAdmin = createAsyncThunk(
  "admin/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminPostRequest("/admin/login", data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const profileAdmin = createAsyncThunk(
  "admin/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminGetRequest("/admin/profile");
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const listAdmin = createAsyncThunk(
  "admin/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminGetRequest("/admin/list");
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const addAdmin = createAsyncThunk(
  "admin/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminPostRequest("/admin/add", data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const removeAdmin = createAsyncThunk(
  "admin/remove",
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminDeleteRequest(`/admin/remove/${id}`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const editAdmin = createAsyncThunk(
  "admin/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminPutRequest(`/admin/edit/${id}`, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

const initialState = {
  admins: [],
  profile: null,
  loading: false,
  error: null,
  status: "idle",
};

export const AdminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(profileAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(profileAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(profileAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(listAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(listAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.admins = action.payload;
      })
      .addCase(listAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(addAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(addAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(addAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(removeAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeAdmin.fulfilled, (state) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(removeAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(editAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(editAdmin.fulfilled, (state) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(editAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default AdminSlice.reducer;
