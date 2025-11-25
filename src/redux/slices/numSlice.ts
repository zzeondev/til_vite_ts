import { createSlice } from '@reduxjs/toolkit';

// Slice 의 초기값
const initialState = {
  num: 0,
};

// Slice 구성
const numSlice = createSlice({
  name: 'numSlice',
  initialState,
  reducers: {
    onIncrease: state => {
      state.num += 1;
    },
  },
});

// 액션 내보내기
export const { onIncrease } = numSlice.actions;

// 보통 Slice 는 default 로 내보냄
export default numSlice.reducer;
