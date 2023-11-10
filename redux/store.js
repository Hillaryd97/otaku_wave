import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import navReducer from "./features/navigationSlice";
import { useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    navigation: navReducer,
  },
});

export const useAppSelector = useSelector;
