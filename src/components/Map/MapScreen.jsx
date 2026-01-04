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
    updatePlayer,
    mapBackground,
    bonuses,
    placedBonuses,
    placeBonus,
    updateBonusPosition,
    updateBonusSize,
    removeBonus
  } = useGame();

  const [resizing, setResizing] = useState(null);
  const [selectedBonusId, setSelectedBonusId] = useState(null);
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [tokenSize, setTokenSize] = useState(() => {
    const saved = localStorage.getItem('playerTokenSize');
    return saved ? parseInt(saved) : 50;
  });

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

  const handleRemoveItem = (playerId, itemIndex) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newInventory = player.inventory.filter((_, i) => i !== itemIndex);
    updatePlayer(playerId, { inventory: newInventory });
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

  // Pan and Zoom handlers for mobile
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      // Pan
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - mapTransform.x,
        y: e.touches[0].clientY - mapTransform.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const scaleDelta = distance / lastTouchDistance;
      const newScale = Math.max(0.5, Math.min(3, mapTransform.scale * scaleDelta));

      setMapTransform(prev => ({
        ...prev,
        scale: newScale
      }));
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isPanning) {
      // Pan
      e.preventDefault();
      const newX = e.touches[0].clientX - panStart.x;
      const newY = e.touches[0].clientY - panStart.y;

      setMapTransform(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setLastTouchDistance(null);
  };

  // Mouse-based pan handlers
  const handleMouseDown = (e) => {
    // Middle mouse button or space + left click for panning
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - mapTransform.x,
        y: e.clientY - mapTransform.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;

    setMapTransform(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, mapTransform.scale * delta));

    setMapTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  };

  // Add global mouse event listeners for panning
  React.useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart, mapTransform.x, mapTransform.y]);

  if (!currentMap) {
    return (
      <div className="map-screen">
        <div className="no-map">
          <p>No map loaded. Open the menu to select or create a map.</p>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => {
    setMapTransform(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2)
    }));
  };

  const handleZoomOut = () => {
    setMapTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, prev.scale / 1.2)
    }));
  };

  const handleTokenSizeIncrease = () => {
    const newSize = Math.min(100, tokenSize + 10);
    setTokenSize(newSize);
    localStorage.setItem('playerTokenSize', newSize);
  };

  const handleTokenSizeDecrease = () => {
    const newSize = Math.max(30, tokenSize - 10);
    setTokenSize(newSize);
    localStorage.setItem('playerTokenSize', newSize);
  };

  const handleResetZoom = () => {
    setMapTransform({ scale: 1, x: 0, y: 0 });
  };

  return (
    <div className="map-screen">
      <div className="map-container">
        {/* Zoom controls */}
        <div className="zoom-controls">
          <button onClick={handleZoomIn} title="Zoom In">+</button>
          <button onClick={handleZoomOut} title="Zoom Out">−</button>
          <button onClick={handleResetZoom} title="Reset">⟲</button>
        </div>

        <div className="token-size-controls">
          <label>Player Size:</label>
          <button onClick={handleTokenSizeDecrease} title="Decrease Token Size">−</button>
          <span>{tokenSize}px</span>
          <button onClick={handleTokenSizeIncrease} title="Increase Token Size">+</button>
        </div>

        {selectedBonusId && (() => {
          const selectedBonus = placedBonuses.find(pb => pb.id === selectedBonusId);
          const bonus = selectedBonus && bonuses.find(b => b.id === selectedBonus.bonusId);
          return selectedBonus && (
            <div className="mob-size-controls">
              <label>{bonus?.name} Size:</label>
              <input
                type="range"
                min="30"
                max="200"
                step="5"
                value={selectedBonus.size || 60}
                onChange={(e) => updateBonusSize(selectedBonusId, parseInt(e.target.value))}
                style={{ width: '150px', marginLeft: '8px', marginRight: '8px' }}
              />
              <span>{selectedBonus.size || 60}px</span>
            </div>
          );
        })()}

        <div
          className="map-canvas"
          onClick={() => setSelectedBonusId(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          style={{
            cursor: isPanning ? 'grabbing' : 'default',
            backgroundColor: currentMap.backgroundColor || '#1a1a1a'
          }}
        >
          <div
            className="map-content"
            style={{
              backgroundColor: currentMap.backgroundColor || '#1a1a1a',
              backgroundImage: mapBackground ? `url(${mapBackground})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
              transformOrigin: '0 0',
              transition: isPanning || lastTouchDistance ? 'none' : 'transform 0.1s ease-out',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
          {/* Render map squares */}
          {currentMap.squares?.map(square => (
            <div
              key={square.id}
              className={`map-square ${square.shape === 'line' ? 'map-line' : ''}`}
              style={{
                position: 'absolute',
                left: square.position.x,
                top: square.position.y,
                width: square.size.width,
                height: square.size.height,
                backgroundColor: square.color,
                borderRadius: square.shape === 'circle' ? '50%' : square.shape === 'hexagon' ? '10%' : '0',
                transform: `rotate(${square.rotation || 0}deg)`,
                transformOrigin: square.shape === 'line' ? '0 50%' : 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: square.shape === 'line' ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                clipPath: square.shape === 'hexagon'
                  ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  : square.shape === 'triangle'
                  ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  : 'none'
              }}
            >
              {square.text && square.shape !== 'line' && (
                <span style={{
                  fontSize: `${square.textSize || 16}px`,
                  color: square.textColor || '#ffffff',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}>
                  {square.text}
                </span>
              )}
            </div>
          ))}

          {/* Render permanent mobs from map */}
          {currentMap.placedMobs?.map(mob => (
            <div
              key={mob.id}
              style={{
                position: 'absolute',
                left: mob.position.x,
                top: mob.position.y,
                width: `${mob.size}px`,
                height: `${mob.size}px`,
                pointerEvents: 'none',
                zIndex: 3
              }}
            >
              {mob.imageUrl && (
                <img
                  src={mob.imageUrl}
                  alt={mob.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
          ))}

          {/* Render drawing layer */}
          {currentMap.drawingData && (
            <img
              src={currentMap.drawingData}
              alt="Map drawing"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                objectFit: 'fill'
              }}
            />
          )}

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
                  {/* Main player icon */}
                  {player.iconType === 'custom' && player.iconUrl ? (
                    <img
                      src={player.iconUrl}
                      alt={player.name}
                      style={{
                        width: `${tokenSize}px`,
                        height: `${tokenSize}px`,
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                        zIndex: 10
                      }}
                    />
                  ) : (
                    <div
                      className="token-circle"
                      style={{
                        backgroundColor: player.iconColor,
                        width: `${tokenSize}px`,
                        height: `${tokenSize}px`,
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                        zIndex: 10
                      }}
                    />
                  )}

                  {/* Attached mobs */}
                  {(player.attachedMobs || []).map((attachedMob, index) => {
                    // Handle both old format (string) and new format (object)
                    const mobId = typeof attachedMob === 'string' ? attachedMob : attachedMob.mobId;
                    const offsetRatio = typeof attachedMob === 'string'
                      ? { x: 1, y: -1 } // Default ratio
                      : (attachedMob.offset || { x: 1, y: -1 });

                    // Convert ratio to pixels for current token size
                    const offsetPixels = {
                      x: offsetRatio.x * tokenSize,
                      y: offsetRatio.y * tokenSize
                    };

                    const size = attachedMob.size || 0.6; // Default to 60% of token size
                    const layer = attachedMob.layer || 'above'; // Default to above player
                    const mob = bonuses.find(b => b.id === mobId);
                    if (!mob) return null;

                    const mobSize = tokenSize * size;
                    // Map layer to zIndex: back=3, below=7, same=10, above=13, front=17
                    const layerToZIndex = {
                      'back': 3,
                      'below': 7,
                      'same': 10,
                      'above': 13,
                      'front': 17
                    };
                    const zIndex = layerToZIndex[layer] || 13; // Default to 13 (above player)

                    return (
                      <div
                        key={`${player.id}-mob-${index}`}
                        style={{
                          position: 'absolute',
                          left: offsetPixels.x,
                          top: offsetPixels.y,
                          width: `${mobSize}px`,
                          height: `${mobSize}px`,
                          zIndex: zIndex,
                          border: 'none',
                          outline: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          overflow: 'hidden',
                          padding: 0,
                          margin: 0,
                          pointerEvents: 'none'
                        }}
                      >
                        {mob.imageUrl && (
                          <img
                            src={mob.imageUrl}
                            alt={mob.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              border: 'none',
                              borderRadius: '0',
                              outline: 'none'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

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
            const isSelected = selectedBonusId === placedBonus.id;

            return (
              <Draggable
                key={placedBonus.id}
                position={placedBonus.position}
                onDrag={(e, data) => handleBonusDrag(placedBonus.id, e, data)}
                disabled={resizing !== null}
              >
                <div
                  className="bonus-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBonusId(placedBonus.id);
                  }}
                >
                  {isSelected && (
                    <button
                      className="remove-bonus"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBonus(placedBonus.id);
                        setSelectedBonusId(null);
                      }}
                    >
                      ×
                    </button>
                  )}
                  {bonus.imageUrl && (
                    <img
                      src={bonus.imageUrl}
                      alt={bonus.name}
                      style={{ width: size, height: size }}
                    />
                  )}
                  {isSelected && <span className="bonus-name">{bonus.name}</span>}
                  {isSelected && (
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, placedBonus.id, size)}
                    />
                  )}
                </div>
              </Draggable>
            );
          })}
          </div>
        </div>
      </div>

      <div className="player-panel">
        <h2>Players</h2>
        {players.length === 0 ? (
          <p className="empty-state">No players in game</p>
        ) : (
          players.map(player => {
            const inventorySlots = player.inventorySlots || 4;
            const customStats = player.customStats || [];
            const partySlots = player.partySlots || 0;
            const party = player.party || [];
            const statusEffects = player.statusEffects || [];

            return (
              <div key={player.id} className="player-info">
                <h3>{player.name}</h3>

                {/* Base Stats */}
                <div className="player-stats">
                  <div className="stat">
                    <span className="stat-label">Power</span>
                    <input
                      type="number"
                      className="stat-input"
                      value={player.power}
                      onChange={(e) => updatePlayer(player.id, { power: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="stat">
                    <span className="stat-label">Money</span>
                    <input
                      type="number"
                      className="stat-input"
                      value={player.money}
                      onChange={(e) => updatePlayer(player.id, { money: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Custom Stats */}
                {customStats.length > 0 && (
                  <div className="player-stats" style={{ marginTop: '0.5rem' }}>
                    {customStats.map((stat, index) => (
                      <div key={index} className="stat">
                        <span className="stat-label">{stat.name}</span>
                        <input
                          type="number"
                          className="stat-input"
                          value={stat.value}
                          onChange={(e) => {
                            const newCustomStats = [...customStats];
                            newCustomStats[index] = { ...stat, value: parseInt(e.target.value) || 0 };
                            updatePlayer(player.id, { customStats: newCustomStats });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Dynamic Inventory */}
                <div className="player-inventory">
                  <span className="inventory-label">Inventory</span>
                  <div className="inventory-grid" style={{
                    gridTemplateColumns: `repeat(${Math.min(inventorySlots, 4)}, 1fr)`
                  }}>
                    {Array.from({ length: inventorySlots }).map((_, index) => {
                      const itemId = player.inventory[index];
                      const item = itemId ? items.find(i => i.id === itemId) : null;
                      return (
                        <div key={index} className="inventory-slot">
                          {item ? (
                            <>
                              {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                              <span className="item-tooltip">{item.name}</span>
                              <button
                                className="remove-item-btn"
                                onClick={() => handleRemoveItem(player.id, index)}
                                title="Remove item"
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <span className="empty-slot">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Party */}
                {partySlots > 0 && (
                  <div className="player-inventory">
                    <span className="inventory-label">Party</span>
                    <div className="inventory-grid" style={{
                      gridTemplateColumns: `repeat(${Math.min(partySlots, 4)}, 1fr)`
                    }}>
                      {Array.from({ length: partySlots }).map((_, index) => {
                        const mobId = party[index];
                        const mob = mobId ? bonuses.find(b => b.id === mobId) : null;
                        return (
                          <div key={index} className="party-slot">
                            {mob ? (
                              <>
                                {mob.imageUrl && <img src={mob.imageUrl} alt={mob.name} />}
                                <span className="item-tooltip">{mob.name}</span>
                              </>
                            ) : (
                              <span className="empty-slot">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status Effects */}
                {statusEffects.length > 0 && (
                  <div className="player-inventory">
                    <span className="inventory-label">Status Effects</span>
                    <div className="status-effects-list" style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.25rem',
                      marginTop: '0.5rem'
                    }}>
                      {statusEffects.map((effect, index) => (
                        <span
                          key={index}
                          className="status-effect-badge"
                          style={{
                            background: '#d4af37',
                            color: '#000',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MapScreen;
