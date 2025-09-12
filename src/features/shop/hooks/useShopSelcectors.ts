import { calcTotal } from '../utils';
import { useShop } from './useShop';

export function useShopSelectors() {
  const { goods, cart } = useShop();
  // 제품 한개 정보 찾기
  const getGood = (id: number) => goods.find(item => item.id === id);
  // 총 금액
  const total = calcTotal(cart, goods);
  // 리턴
  return { getGood, total };
}
