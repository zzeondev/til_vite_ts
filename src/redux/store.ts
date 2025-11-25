import { configureStore } from '@reduxjs/toolkit';

// Redux 는 Store 를 조각조각 내서 사용함
// Store 를 조각내서 활용하는 것을 Slice 라고 함
import numReducer from './slices/numSlice';
// like Slice 추가
import likeReducer from './slices/likeSlice';

export const store = configureStore({
  reducer: { num: numReducer, liek: likeReducer },
});

// 값을 읽을 때 타입
export type RootState = ReturnType<typeof store.getState>;
// 값을 갱신할 때 타입
export type AppDispatch = typeof store.dispatch;
