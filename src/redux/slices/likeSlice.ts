import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0,
};

const likeSlice = createSlice({
  name: 'likeSlice',
  initialState,
  reducers: {
    addLike: state => {
      state.count += 1;
    },
    removeLike: state => {
      state.count -= 1;
    },
  },
});

export const { addLike, removeLike } = likeSlice.actions;
export default likeSlice.reducer;
