import { createSlice } from '@reduxjs/toolkit';

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    activeItem: '/home', // Set the default active item here
  },
  reducers: {
    setActiveItem: (state, action) => {
      state.activeItem = action.payload;
    },
  },
});

export const { setActiveItem } = navigationSlice.actions;

export const selectActiveItem = (state) => state.navigation.activeItem;

export default navigationSlice.reducer;
