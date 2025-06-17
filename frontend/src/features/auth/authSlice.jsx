import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/axiosConfig";

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  const response = await apiClient.get("/user/me");
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: (() => {
      // Load user từ localStorage khi khởi tạo
      try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("user");
        return null;
      }
    })(),
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
      try {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } catch (error) {
        console.error("Error saving user to localStorage:", error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user");
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
        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch (error) {
          console.error("Error saving user to localStorage:", error);
        }
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
