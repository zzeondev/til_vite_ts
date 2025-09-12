import React from 'react';
import GoodList from '../components/shop/GoodList';
import Cart from '../components/shop/Cart';

function GoodsPage() {
  const box: React.CSSProperties = {
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fafafa',
    marginTop: 12,
    textAlign: 'center',
  };
  return (
    <div style={box}>
      <h2>😎 판매 제품 리스트</h2>
      <div>
        <GoodList />
        <Cart />
      </div>
    </div>
  );
}

export default GoodsPage;
