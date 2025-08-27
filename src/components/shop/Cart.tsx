import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const Cart = () => {
  const { balance, cart, removeCartOne, resetCart, clearCart, buyAll } = useShop();
  return (
    <div>
      <h2>장바구니</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            <span>제품명 : 생략</span>
            <span>구매수 : {item.qty}</span>
            <button onClick={() => removeCartOne(item.id)}>줄이기</button>
            <button onClick={() => clearCart(item.id)}>제품취소</button>
          </li>
        ))}
      </ul>
      <button onClick={buyAll}>전체 구매하기</button>
      <button onClick={resetCart}>전체 취소하기</button>
    </div>
  );
};

export default Cart;
