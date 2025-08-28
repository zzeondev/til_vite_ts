import { useContext } from 'react';
import { ShopContext } from '../ShopContext';

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('Shop 컨텍스트가 생성되지 않았습니다.');
  }
  return ctx;
}
