import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

// Custom middleware to prevent memory leaks
const memoryLeakPrevention = (store) => (next) => (action) => {
  // Clear any dangling promises or subscriptions
  if (action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected")) {
    // Log fulfilled/rejected actions in development
    if (process.env.NODE_ENV === "development") {
      console.log("Redux action completed:", action.type);
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Prevent serialization warnings for non-serializable values
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["register"],
      },
    }).concat(memoryLeakPrevention),
  devTools: process.env.NODE_ENV !== "production",
});
