import type { ShopStateType } from './types';

export const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '사과', price: 1000 },
    { id: 2, name: '딸기', price: 30000 },
    { id: 3, name: '바나나', price: 500 },
    { id: 4, name: '초코렛', price: 8000 },
  ],
};
