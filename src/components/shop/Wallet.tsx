import React from 'react';
import { useShop } from '../../features/shop';

const Wallet = () => {
  // ts
  const { balance } = useShop();
  const box: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: '#fff',
  };

  // tsx
  return (
    <div style={box}>
      <h2>💸내 지갑</h2>
      <div style={{ fontSize: 20 }}>
        <strong>{balance.toLocaleString()}원</strong>
      </div>
      <p style={{ marginTop: 8, color: '#666' }}>장바구니에 담긴 제품을 구매하면 여기서 빠져요</p>
    </div>
  );
};

export default Wallet;
