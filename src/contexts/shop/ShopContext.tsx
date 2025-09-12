import React, { createContext, useContext, useReducer } from 'react';

// 1. 초기값
type CartType = { id: number; qty: number };
type GoodType = {
  id: number;
  name: string;
  price: number;
};
type ShopStateType = {
  balance: number;
  cart: CartType[];
  goods: GoodType[];
};
const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '사과', price: 1000 },
    { id: 2, name: '딸기', price: 30000 },
    { id: 3, name: '바나나', price: 500 },
    { id: 4, name: '초코렛', price: 8000 },
  ],
};
// 2. 리듀서
enum ShopActionType {
  ADD_CART = 'ADD_CART',
  REMOVE_CART_ONE = 'REMOVE_CART',
  CLEAR_CART_ITEM = 'CLEAR_CART',
  BUY_ALL = 'BUY_ALL',
  RESET = 'RESET',
}
type ShopActionAddCart = { type: ShopActionType.ADD_CART; payload: { id: number } };
type ShopActionRemoveCart = { type: ShopActionType.REMOVE_CART_ONE; payload: { id: number } };
type ShopActionClearCart = { type: ShopActionType.CLEAR_CART_ITEM; payload: { id: number } };
type ShopActionBuyAll = { type: ShopActionType.BUY_ALL };
type ShopActionReset = { type: ShopActionType.RESET };
type ShopAction =
  | ShopActionAddCart
  | ShopActionRemoveCart
  | ShopActionClearCart
  | ShopActionReset
  | ShopActionBuyAll;

// 장바구니 전체 금액계산하기
// 총액 계산 함수 (state 대신 cart, goods만 받도록)
function calcTotal(cart: CartType[], goods: GoodType[]): number {
  return cart.reduce((sum, c) => {
    const good = goods.find(g => g.id === c.id);
    return good ? sum + good.price * c.qty : sum;
  }, 0);
}

function reducer(state: ShopStateType, action: ShopAction) {
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
// 3. 컨텍스트 생성
type ShopValueType = {
  cart: CartType[];
  goods: GoodType[];
  balance: number;
  addCart: (id: number) => void;
  removeCartOne: (id: number) => void;
  clearCart: (id: number) => void;
  buyAll: () => void;
  resetCart: () => void;
};
const ShopContext = createContext<ShopValueType | null>(null);
// 4. 프로바이더
export const ShopProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 용 함수 표현식
  const addCart = (id: number): void => {
    dispatch({ type: ShopActionType.ADD_CART, payload: { id } });
  };
  const removeCartOne = (id: number): void => {
    dispatch({ type: ShopActionType.REMOVE_CART_ONE, payload: { id } });
  };
  const clearCart = (id: number): void => {
    dispatch({ type: ShopActionType.CLEAR_CART_ITEM, payload: { id } });
  };
  const buyAll = (): void => {
    dispatch({ type: ShopActionType.BUY_ALL });
  };
  const resetCart = (): void => {
    dispatch({ type: ShopActionType.RESET });
  };

  const value: ShopValueType = {
    cart: state.cart,
    goods: state.goods,
    balance: state.balance,
    addCart,
    removeCartOne,
    clearCart,
    buyAll,
    resetCart,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
// 5. 커스텀 훅
export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('Shop 컨텍스트가 생성되지 않았습니다.');
  }
  return ctx;
}
// 6. 추가 커스텀 훅 : 상품 찾기, 총액
export function useShopSelectors() {
  const { goods, cart } = useShop();
  // 제품 한개 정보 찾기
  const getGood = (id: number) => goods.find(item => item.id === id);
  // 총 금액
  const total = calcTotal(cart, goods);
  // 리턴
  return { getGood, total };
}
