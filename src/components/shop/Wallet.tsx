import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const Wallet = () => {
  const { balance } = useShop();
  return <div>Wallet:{balance}</div>;
};

export default Wallet;
