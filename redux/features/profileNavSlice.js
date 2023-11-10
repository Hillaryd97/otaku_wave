import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profileNavigation',
  initialState: {
    activeProfileItem: 'watchList', // Set the default active item here
  },
  reducers: {
    setActiveProfileItem: (state, action) => {
      state.activeProfileItem = action.payload;
    },
  },
});

export const { setActiveProfileItem } = profileSlice.actions;

export const selectActiveProfileItem = (state) => state.profileNavigation.activeProfileItem;

export default profileSlice.reducer;
