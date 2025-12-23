import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { useGame } from '../../contexts/GameContext';
import './MapScreen.css';

function MapScreen() {
  const {
    maps,
    currentMapId,
    players,
    items,
    playerPositions,
    updatePlayerPosition,
    mapBackground,
    bonuses,
    placedBonuses,
    placeBonus,
    updateBonusPosition,
    updateBonusSize,
    removeBonus
  } = useGame();

  const [resizing, setResizing] = useState(null);

  const currentMap = maps.find(m => m.id === currentMapId);

  const handleDrag = (playerId, e, data) => {
    updatePlayerPosition(playerId, { x: data.x, y: data.y });
  };

  const handleBonusDrag = (placedBonusId, e, data) => {
    updateBonusPosition(placedBonusId, { x: data.x, y: data.y });
  };

  const handlePlaceBonus = (bonusId) => {
    // Place bonus at center of map
    placeBonus(bonusId, { x: 400, y: 300 });
  };

  const handleResizeStart = (e, placedBonusId, currentSize) => {
    e.stopPropagation();
    setResizing({
      id: placedBonusId,
      startX: e.clientX,
      startY: e.clientY,
      startSize: currentSize
    });
  };

  const handleResizeMove = (e) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizing.startX;
    const deltaY = e.clientY - resizing.startY;
    const delta = Math.max(deltaX, deltaY); // Use larger delta for proportional resize

    const newSize = Math.max(30, resizing.startSize + delta); // Min size 30px
    updateBonusSize(resizing.id, newSize);
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  React.useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  if (!currentMap) {
    return (
      <div className="map-screen">
        <div className="no-map">
          <p>No map loaded. Open the menu to select or create a map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-screen">
      <div className="map-container">
        <div
          className="map-canvas"
          style={{
            backgroundColor: currentMap.backgroundColor || '#1a1a1a',
            backgroundImage: mapBackground ? `url(${mapBackground})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Render map squares */}
          {currentMap.squares?.map(square => (
            <div
              key={square.id}
              className="map-square"
              style={{
                position: 'absolute',
                left: square.position.x,
                top: square.position.y,
                width: square.size.width,
                height: square.size.height,
                backgroundColor: square.color,
                borderRadius: square.shape === 'circle' ? '50%' : square.shape === 'hexagon' ? '10%' : '0',
                transform: `rotate(${square.rotation || 0}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                clipPath: square.shape === 'hexagon'
                  ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  : square.shape === 'triangle'
                  ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  : 'none'
              }}
            >
              {square.text && (
                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {square.text}
                </span>
              )}
            </div>
          ))}

          {/* Render player tokens */}
          {players.map(player => {
            const position = playerPositions[player.id] || player.position || { x: 100, y: 100 };
            return (
              <Draggable
                key={player.id}
                position={position}
                onDrag={(e, data) => handleDrag(player.id, e, data)}
              >
                <div className="player-token">
                  {player.iconType === 'custom' && player.iconUrl ? (
                    <img src={player.iconUrl} alt={player.name} />
                  ) : (
                    <div
                      className="token-circle"
                      style={{ backgroundColor: player.iconColor }}
                    />
                  )}
                  <span className="player-name">{player.name}</span>
                </div>
              </Draggable>
            );
          })}

          {/* Render placed bonuses */}
          {placedBonuses.map(placedBonus => {
            const bonus = bonuses.find(b => b.id === placedBonus.bonusId);
            if (!bonus) return null;

            const size = placedBonus.size || 60;

            return (
              <Draggable
                key={placedBonus.id}
                position={placedBonus.position}
                onStop={(e, data) => handleBonusDrag(placedBonus.id, e, data)}
                disabled={resizing !== null}
              >
                <div className="bonus-item">
                  <button
                    className="remove-bonus"
                    onClick={() => removeBonus(placedBonus.id)}
                  >
                    ×
                  </button>
                  {bonus.imageUrl && (
                    <img
                      src={bonus.imageUrl}
                      alt={bonus.name}
                      style={{ width: size, height: size }}
                    />
                  )}
                  <span className="bonus-name">{bonus.name}</span>
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, placedBonus.id, size)}
                  />
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>

      <div className="player-panel">
        <h2>Players</h2>
        {players.length === 0 ? (
          <p className="empty-state">No players in game</p>
        ) : (
          players.map(player => (
            <div key={player.id} className="player-info">
              <h3>{player.name}</h3>
              <div className="player-stats">
                <div className="stat">
                  <span className="stat-label">Power</span>
                  <span className="stat-value">{player.power}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Money</span>
                  <span className="stat-value">{player.money}</span>
                </div>
              </div>
              <div className="player-inventory">
                <span className="inventory-label">Inventory</span>
                <div className="inventory-grid">
                  {[0, 1, 2, 3].map(index => {
                    const itemId = player.inventory[index];
                    const item = itemId ? items.find(i => i.id === itemId) : null;
                    return (
                      <div key={index} className="inventory-slot">
                        {item ? (
                          <>
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                            <span className="item-tooltip">{item.name}</span>
                          </>
                        ) : (
                          <span className="empty-slot">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        <div className="bonus-section">
          <h2>Bonus Items</h2>
          {bonuses.length === 0 ? (
            <p className="empty-state">No bonus items created</p>
          ) : (
            <div className="bonus-grid">
              {bonuses.map(bonus => (
                <div
                  key={bonus.id}
                  className="bonus-card"
                  onClick={() => handlePlaceBonus(bonus.id)}
                  title={`Click to place ${bonus.name}`}
                >
                  {bonus.imageUrl && <img src={bonus.imageUrl} alt={bonus.name} />}
                  <span className="bonus-label">{bonus.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapScreen;
