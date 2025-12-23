import React from 'react';
import { useGame } from '../../contexts/GameContext';
import './ShopScreen.css';

function ShopScreen() {
  const { items } = useGame();

  const shopItems = items
    .filter(item => item.inShop)
    .sort((a, b) => a.price - b.price);

  return (
    <div className="shop-screen">
      <h1 className="shop-title">Shop</h1>
      <div className="shop-grid">
        {shopItems.length === 0 ? (
          <div className="no-items">
            <p>No items in shop. Add items in the Item Manager.</p>
          </div>
        ) : (
          shopItems.map(item => (
            <div key={item.id} className="shop-item">
              {item.imageUrl && (
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              )}
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-price">{item.price} Gold</p>
                <p className="item-description">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShopScreen;
