import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import navReducer from "./features/navigationSlice";
import profileNavReducer from "./features/profileNavSlice";
import { useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    navigation: navReducer,
    profileNavigation: profileNavReducer,
  },
});

export const useAppSelector = useSelector;
