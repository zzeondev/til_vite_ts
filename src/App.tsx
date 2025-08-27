import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './contexts/shop/ShopContext';

function App() {
  return (
    <div>
      <h1>나의 가게</h1>
      <ShopProvider>
        <div>
          <GoodList />
          <Cart />
          <Wallet />
        </div>
      </ShopProvider>
    </div>
  );
}

export default App;
