import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
    const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/me`, {
        withCredentials : true
    });
    return response.data;
});

const authSlice = createSlice({
    name : 'auth',
    initialState : {
        user : null,
        loading : false,
        error : null
    },
    reducers : {
        logout : (state) => {
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true,
                state.error = null
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;