import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './ShopScreen.css';

function ShopScreen() {
  const { items, players, updatePlayer } = useGame();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const shopItems = items
    .filter(item => item.inShop)
    .sort((a, b) => a.price - b.price);

  const handleItemClick = (itemId) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setSelectedPlayerId('');
    } else {
      setSelectedItemId(itemId);
      setSelectedPlayerId('');
    }
  };

  const handleGiveItem = (item) => {
    if (!selectedPlayerId) {
      alert('Please select a player');
      return;
    }

    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) {
      alert('Player not found');
      return;
    }

    // Add item to player's inventory
    const updatedInventory = [...(player.inventory || []), item.id];
    updatePlayer(selectedPlayerId, { inventory: updatedInventory });

    // Reset selection
    setSelectedItemId(null);
    setSelectedPlayerId('');

    alert(`${item.name} given to ${player.name}!`);
  };

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
            <div
              key={item.id}
              className={`shop-item ${selectedItemId === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              {item.imageUrl && (
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              )}
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-price">{item.price} Gold</p>
                <p className="item-description">{item.description}</p>

                {selectedItemId === item.id && (
                  <div className="give-item-section" onClick={(e) => e.stopPropagation()}>
                    <label>Give to player:</label>
                    <select
                      value={selectedPlayerId}
                      onChange={(e) => setSelectedPlayerId(e.target.value)}
                    >
                      <option value="">Select a player...</option>
                      {players.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="give-button primary"
                      onClick={() => handleGiveItem(item)}
                      disabled={!selectedPlayerId}
                    >
                      Give Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShopScreen;
