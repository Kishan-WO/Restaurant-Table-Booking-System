import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api";

const authSlice = createSlice({
  name: "auth",
  initialState: { currentUser: null },
  reducers: {
    logout(state) {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.currentUser = action.payload.data;
      })
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          state.currentUser = action.payload.data;
        },
      )
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.currentUser = null;
      });
  },
});

// Actions
export const { logout } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.currentUser;

// Reducer
export default authSlice.reducer;
