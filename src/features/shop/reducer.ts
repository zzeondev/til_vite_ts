import { initialState } from './state';
import type { CartType, ShopAction, ShopStateType } from './types';
import { ShopActionType } from './types';
import { calcTotal } from './utils';

export function reducer(state: ShopStateType, action: ShopAction) {
  switch (action.type) {
    case ShopActionType.ADD_CART: {
      const { id } = action.payload; // 제품의 ID
      // id 제품이 배열에 있는가? qty 가 있는가?
      const existGood = state.cart.find(item => item.id === id);
      let arr: CartType[] = [];
      if (existGood) {
        // qty 증가
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      } else {
        // state.cart 에 새 제품 추가, qty 는 1개
        arr = [...state.cart, { id: id, qty: 1 }];
      }
      return { ...state, cart: arr };
    }
    case ShopActionType.REMOVE_CART_ONE: {
      const { id } = action.payload; // 1개 빼줄 제품의 ID
      // id 제품이 배열에 있는가? qty 가 있는가?
      const existGood = state.cart.find(item => item.id === id);

      if (!existGood) {
        // 제품이 없다면...
        return state;
      }

      let arr: CartType[] = [];
      if (existGood.qty > 1) {
        // 제품이 최소 2개 이상이면
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty - 1 } : item));
      } else {
        // 제품이 1개
        arr = state.cart.filter(item => item.id !== id);
      }

      return { ...state, cart: arr };
    }
    case ShopActionType.CLEAR_CART_ITEM: {
      // 담겨진 제품 중에 장바구니에서 제거하기
      const { id } = action.payload;
      const arr = state.cart.filter(item => item.id !== id);
      return { ...state, cart: arr };
    }
    case ShopActionType.BUY_ALL: {
      // 총 금액계산
      const total = calcTotal(state.cart, state.goods);
      if (total > state.balance) {
        alert('돈이 부족합니다. 장바구니를 줄이세요');
        return state;
      }
      return { ...state, balance: state.balance - total, cart: [] };
    }
    case ShopActionType.RESET:
      return initialState;
    default:
      return state;
  }
}
