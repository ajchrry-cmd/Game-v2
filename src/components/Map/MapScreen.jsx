import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { useGame } from '../../contexts/GameContext';
import PlayerContextMenu from './PlayerContextMenu';
import MapContextMenu from './MapContextMenu';
import BonusContextMenu from './BonusContextMenu';
import { loadUISettings, defaultUISettings } from '../../utils/uiSettings';
import './MapScreen.css';

function MapScreen() {
  const {
    maps,
    currentMapId,
    setCurrentMapId,
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
    removeBonus,
    sendPlayerMessage,
    flashPlayerScreen
  } = useGame();

  const [resizing, setResizing] = useState(null);
  const [selectedBonusId, setSelectedBonusId] = useState(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Load map settings from UI customization once on mount
  const [mapSettings] = useState(() => {
    const uiSettings = loadUISettings();
    return {
      defaultZoom: uiSettings.mapDefaultZoom || defaultUISettings.mapDefaultZoom,
      centerX: uiSettings.mapCenterX || defaultUISettings.mapCenterX,
      centerY: uiSettings.mapCenterY || defaultUISettings.mapCenterY,
      tokenSize: uiSettings.playerTokenSize || defaultUISettings.playerTokenSize
    };
  });

  const [mapTransform, setMapTransform] = useState(() => ({
    scale: mapSettings.defaultZoom,
    x: mapSettings.centerX,
    y: mapSettings.centerY
  }));
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [mapContextMenu, setMapContextMenu] = useState(null);
  const [bonusContextMenu, setBonusContextMenu] = useState(null);

  const currentMap = maps.find(m => m.id === currentMapId);

  const handleDrag = (playerId, e, data) => {
    updatePlayerPosition(playerId, { x: data.x, y: data.y });
  };

  const handleBonusDrag = (placedBonusId, e, data) => {
    updateBonusPosition(placedBonusId, { x: data.x, y: data.y });
  };

  const handlePlaceBonus = (bonusId) => {
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
    const delta = Math.max(deltaX, deltaY);
    const newSize = Math.max(30, resizing.startSize + delta);
    updateBonusSize(resizing.id, newSize);
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  const handlePlayerContextMenu = (e, player) => {
    e.preventDefault();
    e.stopPropagation();
    setMapContextMenu(null);
    setBonusContextMenu(null);
    setContextMenu({
      player,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleMapContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mapX = Math.round((clickX - mapTransform.x) / mapTransform.scale);
    const mapY = Math.round((clickY - mapTransform.y) / mapTransform.scale);

    setContextMenu(null);
    setBonusContextMenu(null);
    setMapContextMenu({
      position: { x: e.clientX, y: e.clientY },
      mapPosition: { x: mapX, y: mapY }
    });
  };

  const handleCloseMapContextMenu = () => {
    setMapContextMenu(null);
  };

  const handleTeleportPlayer = (playerId, position) => {
    updatePlayerPosition(playerId, position);
  };

  const handlePlaceItemOnMap = (itemId, position) => {
    placeBonus(itemId, position);
  };

  const handleBonusContextMenu = (e, placedBonus, bonus) => {
    e.preventDefault();
    e.stopPropagation();
    setMapContextMenu(null);
    setContextMenu(null);
    setBonusContextMenu({
      placedBonus,
      bonus,
      position: { x: e.clientX, y: e.clientY }
    });
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
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - mapTransform.x,
        y: e.touches[0].clientY - mapTransform.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const scaleDelta = distance / lastTouchDistance;
      const newScale = Math.max(0.5, Math.min(3, mapTransform.scale * scaleDelta));
      setMapTransform(prev => ({ ...prev, scale: newScale }));
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isPanning) {
      e.preventDefault();
      const newX = e.touches[0].clientX - panStart.x;
      const newY = e.touches[0].clientY - panStart.y;
      setMapTransform(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setLastTouchDistance(null);
  };

  const handleMouseDown = (e) => {
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
    setMapTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, mapTransform.scale * delta));
    setMapTransform(prev => ({ ...prev, scale: newScale }));
  };

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
    setMapTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }));
  };

  const handleZoomOut = () => {
    setMapTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale / 1.2) }));
  };

  const handleResetZoom = () => {
    setMapTransform({ scale: mapSettings.defaultZoom, x: mapSettings.centerX, y: mapSettings.centerY });
  };

  // Compute max power for bar scaling (per-player max or at least current)
  const getBarPercent = (current, max) => {
    if (!max || max <= 0) return 100;
    return Math.min(100, Math.max(0, (current / max) * 100));
  };

  return (
    <div className="map-screen">
      {/* ===== SCENE TITLE BAR ===== */}
      <div className="scene-bar">
        <span className="scene-name">{currentMap.name}</span>
        <div className="scene-bar-right">
          <span className="scene-player-count">{players.length} player{players.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ===== MAP + PANEL ROW ===== */}
      <div className="map-body">
      {/* ===== MAP AREA (full screen) ===== */}
      <div className="map-container">
        {/* Zoom controls */}
        <div className="zoom-controls">
          <button onClick={handleZoomIn} title="Zoom In">+</button>
          <button onClick={handleZoomOut} title="Zoom Out">-</button>
          <button onClick={handleResetZoom} title="Reset View">&#x27F2;</button>
        </div>

        {/* Panel toggle */}
        <button
          className={`panel-toggle ${panelCollapsed ? 'collapsed' : ''}`}
          onClick={() => setPanelCollapsed(!panelCollapsed)}
          title={panelCollapsed ? 'Show Players' : 'Hide Players'}
        >
          {panelCollapsed ? '\u25C0' : '\u25B6'}
        </button>

        <div
          className="map-canvas"
          onClick={() => setSelectedBonusId(null)}
          onContextMenu={handleMapContextMenu}
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
          {/* Render map squares and mobs - combined and sorted by layerIndex */}
          {(() => {
            const combinedItems = [
              ...(currentMap.squares || []).map(square => ({ ...square, itemType: 'square' })),
              ...(currentMap.placedMobs || []).map(mob => ({ ...mob, itemType: 'mob' }))
            ].sort((a, b) => (a.layerIndex || 0) - (b.layerIndex || 0));

            return combinedItems.map(item => {
              if (item.itemType === 'square') {
                const square = item;
                return (
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
                        : 'none',
                      zIndex: square.layerIndex || 0
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
                );
              } else {
                const mob = item;
                return (
                  <div
                    key={mob.id}
                    style={{
                      position: 'absolute',
                      left: mob.position.x,
                      top: mob.position.y,
                      width: `${mob.size}px`,
                      height: `${mob.size}px`,
                      pointerEvents: 'none',
                      zIndex: mob.layerIndex || 0
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      transform: `rotate(${mob.rotation || 0}deg)`,
                      transformOrigin: 'center'
                    }}>
                      {mob.imageUrl && (
                        <img
                          src={mob.imageUrl}
                          alt={mob.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </div>
                );
              }
            });
          })()}

          {/* Render drawing layer */}
          {currentMap.drawingData && (
            <img
              src={currentMap.drawingData}
              alt="Map drawing"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
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
                scale={mapTransform.scale}
              >
                <div
                  className="player-token"
                  onContextMenu={(e) => handlePlayerContextMenu(e, player)}
                >
                  {player.iconType === 'custom' && player.iconUrl ? (
                    <img
                      src={player.iconUrl}
                      alt={player.name}
                      className="token-img"
                      style={{
                        width: `${mapSettings.tokenSize}px`,
                        height: `${mapSettings.tokenSize}px`,
                      }}
                    />
                  ) : (
                    <div
                      className="token-circle"
                      style={{
                        backgroundColor: player.iconColor,
                        width: `${mapSettings.tokenSize}px`,
                        height: `${mapSettings.tokenSize}px`,
                      }}
                    />
                  )}

                  {/* Attached mobs */}
                  {(player.attachedMobs || []).map((attachedMob, index) => {
                    const mobId = typeof attachedMob === 'string' ? attachedMob : attachedMob.mobId;
                    const offsetRatio = typeof attachedMob === 'string'
                      ? { x: 1, y: -1 }
                      : (attachedMob.offset || { x: 1, y: -1 });
                    const offsetPixels = {
                      x: offsetRatio.x * mapSettings.tokenSize,
                      y: offsetRatio.y * mapSettings.tokenSize
                    };
                    const size = attachedMob.size || 0.6;
                    const layer = attachedMob.layer || 'above';
                    const mob = bonuses.find(b => b.id === mobId);
                    if (!mob) return null;

                    const mobSize = mapSettings.tokenSize * size;
                    const layerToZIndex = { 'back': 3, 'below': 7, 'same': 10, 'above': 13, 'front': 17 };
                    const zIndex = layerToZIndex[layer] || 13;

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
                          border: 'none', outline: 'none', boxShadow: 'none',
                          background: 'transparent', overflow: 'hidden',
                          padding: 0, margin: 0, pointerEvents: 'none'
                        }}
                      >
                        {mob.imageUrl && (
                          <img
                            src={mob.imageUrl}
                            alt={mob.name}
                            style={{
                              width: '100%', height: '100%', objectFit: 'contain',
                              border: 'none', borderRadius: '0', outline: 'none'
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
                scale={mapTransform.scale}
              >
                <div
                  className="bonus-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBonusId(placedBonus.id);
                  }}
                  onContextMenu={(e) => handleBonusContextMenu(e, placedBonus, bonus)}
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

      {/* ===== PLAYER PANEL ===== */}
      <div className={`player-panel ${panelCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-header">
          <h2>Players</h2>
        </div>
        <div className="panel-scroll">
          {players.length === 0 ? (
            <p className="empty-state">No players in game</p>
          ) : (
            players.map(player => {
              const inventorySlots = player.inventorySlots || 4;
              const customStats = player.customStats || [];
              const partySlots = player.partySlots || 0;
              const party = player.party || [];
              const statusEffects = player.statusEffects || [];
              const maxPower = player.maxPower || 100;

              return (
                <div key={player.id} className="player-card">
                  {/* Card header with icon + name + power bar */}
                  <div className="card-header">
                    <div className="card-avatar">
                      {player.iconType === 'custom' && player.iconUrl ? (
                        <img src={player.iconUrl} alt={player.name} />
                      ) : (
                        <div className="avatar-circle" style={{ backgroundColor: player.iconColor || '#d4af37' }} />
                      )}
                    </div>
                    <div className="card-identity">
                      <h3>{player.name}</h3>
                      <div className="power-bar-container">
                        <div
                          className="power-bar-fill"
                          style={{ width: `${getBarPercent(player.power || 0, maxPower)}%` }}
                        />
                        <span className="power-bar-text">{player.power || 0} / {maxPower}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="card-stats">
                    <div className="stat-block">
                      <span className="stat-label">Power</span>
                      <input
                        type="number"
                        className="stat-input"
                        value={player.power}
                        onChange={(e) => updatePlayer(player.id, { power: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="stat-block">
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
                    <div className="card-stats">
                      {customStats.map((stat, index) => (
                        <div key={index} className="stat-block">
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

                  {/* Status Effects */}
                  {statusEffects.length > 0 && (
                    <div className="card-effects">
                      {statusEffects.map((effect, index) => (
                        <span key={index} className="effect-badge">{effect}</span>
                      ))}
                    </div>
                  )}

                  {/* Inventory */}
                  <div className="card-section">
                    <span className="section-label">Inventory</span>
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
                              <span className="empty-slot"></span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Party */}
                  {partySlots > 0 && (
                    <div className="card-section">
                      <span className="section-label">Party</span>
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
                                <span className="empty-slot"></span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>

      {/* Context menus */}
      {contextMenu && (
        <PlayerContextMenu
          player={contextMenu.player}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          items={items}
          bonuses={bonuses}
          onUpdatePlayer={updatePlayer}
          onSendMessage={sendPlayerMessage}
          onFlashScreen={flashPlayerScreen}
        />
      )}

      {mapContextMenu && (
        <MapContextMenu
          position={mapContextMenu.position}
          mapPosition={mapContextMenu.mapPosition}
          onClose={handleCloseMapContextMenu}
          maps={maps}
          currentMapId={currentMapId}
          onSelectMap={setCurrentMapId}
          bonuses={bonuses}
          onPlaceBonus={placeBonus}
          items={items}
          onPlaceItem={handlePlaceItemOnMap}
          players={players}
          onTeleportPlayer={handleTeleportPlayer}
        />
      )}

      {bonusContextMenu && (
        <BonusContextMenu
          position={bonusContextMenu.position}
          placedBonus={bonusContextMenu.placedBonus}
          bonus={bonusContextMenu.bonus}
          onClose={() => setBonusContextMenu(null)}
          onRemove={(id) => {
            removeBonus(id);
            setSelectedBonusId(null);
          }}
          onDuplicate={(bonusId, pos) => placeBonus(bonusId, pos)}
          onResize={(id, size) => updateBonusSize(id, size)}
        />
      )}
    </div>
  );
}

export default MapScreen;
