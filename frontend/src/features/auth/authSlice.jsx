import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/axiosConfig";

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  const response = await apiClient.get("/user/me");
  console.log("fetchUser response:", response.data); // Debug log
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      // Xóa accessToken khỏi localStorage
      localStorage.removeItem("user"); // Xóa toàn bộ user object chứa token
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
