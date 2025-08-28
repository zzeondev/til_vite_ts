import type { CartType, GoodType } from './types';

// 총액 계산 함수 (state 대신 cart, goods만 받도록)
export function calcTotal(cart: CartType[], goods: GoodType[]): number {
  return cart.reduce((sum, c) => {
    const good = goods.find(g => g.id === c.id);
    return good ? sum + good.price * c.qty : sum;
  }, 0);
}
