import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/auth.slice";
import { baseApi } from "./api/base.api";

const loadState = () => {
  try {
    const state = localStorage.getItem("RTBstate");
    return state ? JSON.parse(state) : undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Error while parsing localstorage data");
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

store.subscribe(() => {
  const { auth } = store.getState();
  localStorage.setItem("RTBstate", JSON.stringify({ auth }));
});
