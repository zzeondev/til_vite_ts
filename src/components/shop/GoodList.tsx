import React from 'react';
import { useShop } from '../../features/shop';

const GoodList = () => {
  // ts 자리
  const { goods, addCart } = useShop();

  const box: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    background: '#fff',
  };
  const boxrow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  };
  // tsx 자리
  return (
    <div style={box}>
      <h2>🎉 GoodList</h2>
      <ul style={{ padding: 0, margin: 0 }}>
        {goods.map(item => (
          <li key={item.id} style={boxrow}>
            <span>
              <strong>{item.name}</strong> {item.price.toLocaleString()} 원
            </span>
            <button onClick={() => addCart(item.id)}>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
