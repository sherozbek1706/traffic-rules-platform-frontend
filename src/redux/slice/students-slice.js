import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Errors } from "../../utils/error.jsx";
import {
  adminDeleteRequest,
  adminGetRequest,
  adminPostRequest,
  adminPutRequest,
  clientGetRequest,
  clientPostRequest,
  clientPutRequest,
} from "../../request";

export const listStudents = createAsyncThunk(
  "students/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminGetRequest("/students/list");
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const addStudent = createAsyncThunk(
  "students/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminPostRequest("/students/add", data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const editStudent = createAsyncThunk(
  "students/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminPutRequest(`/students/edit/${id}`, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminDeleteRequest(`/students/remove/${id}`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const registerStudent = createAsyncThunk(
  "students/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await clientPostRequest("/students/register", data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const loginStudent = createAsyncThunk(
  "students/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await clientPostRequest("/students/login", data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const profileStudents = createAsyncThunk(
  "students/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientGetRequest("/students/profile");
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

export const editSelfStudent = createAsyncThunk(
  "students/edit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await clientPutRequest(`/students/edit`, data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(Errors(error));
    }
  }
);

const initialState = {
  students: [],
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
