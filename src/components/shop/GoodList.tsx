import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const GoodList = () => {
  const { goods, addCart } = useShop();
  return (
    <div>
      <h2>GoodList</h2>
      <ul>
        {goods.map(item => (
          <li key={item.id}>
            <span>제품명 : {item.name}</span>
            <span>가격 : {item.price} 원</span>
            <button onClick={() => addCart(item.id)}>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
