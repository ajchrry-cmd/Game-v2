import React, { useRef, useEffect, useState } from 'react';
import './MapContextMenu.css';

function MapContextMenu({
  position,
  mapPosition,
  onClose,
  maps,
  currentMapId,
  onSelectMap,
  bonuses,
  onPlaceBonus,
  items,
  onPlaceItem,
  players,
  onTeleportPlayer
}) {
  const menuRef = useRef(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [searchText, setSearchText] = useState('');

  // Adjust menu position to keep it within viewport bounds
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    if (rect.right > viewportWidth) newX = viewportWidth - rect.width - 10;
    if (newX < 10) newX = 10;
    if (rect.bottom > viewportHeight) newY = viewportHeight - rect.height - 10;
    if (newY < 10) newY = 10;

    if (newX !== position.x || newY !== position.y) {
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position, activeSubmenu]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (activeSubmenu) {
          setActiveSubmenu(null);
          setSearchText('');
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, activeSubmenu]);

  const handleSelectMap = (mapId) => {
    onSelectMap(mapId);
    onClose();
  };

  const handlePlaceBonus = (bonusId) => {
    onPlaceBonus(bonusId, mapPosition);
    onClose();
  };

  const handlePlaceItem = (itemId) => {
    onPlaceItem(itemId, mapPosition);
    onClose();
  };

  const handleTeleportPlayer = (playerId) => {
    onTeleportPlayer(playerId, mapPosition);
    onClose();
  };

  const handleBack = () => {
    setActiveSubmenu(null);
    setSearchText('');
  };

  const handleCenterMapHere = () => {
    const uiSettings = JSON.parse(localStorage.getItem('uiCustomization')) || {};
    uiSettings.mapCenterX = mapPosition.x;
    uiSettings.mapCenterY = mapPosition.y;
    localStorage.setItem('uiCustomization', JSON.stringify(uiSettings));
    onClose();
  };

  const otherMaps = maps.filter(m => m.id !== currentMapId);

  // Filter mobs/items by search text
  const filterBySearch = (list) => {
    if (!searchText.trim()) return list;
    const q = searchText.toLowerCase();
    return list.filter(item => item.name.toLowerCase().includes(q));
  };

  return (
    <div
      ref={menuRef}
      className="map-context-menu"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
    >
      {/* ===== MAIN MENU ===== */}
      {!activeSubmenu && (
        <>
          <div className="menu-header">
            <span>Map Actions</span>
            <span className="menu-coords">({Math.round(mapPosition.x)}, {Math.round(mapPosition.y)})</span>
          </div>

          {/* Quick placement actions */}
          {bonuses.length > 0 && (
            <button
              className="menu-item submenu-trigger"
              onClick={() => setActiveSubmenu('place-mob')}
            >
              <span className="menu-icon">👹</span>
              Place Mob Here
              <span className="submenu-arrow">▶</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              className="menu-item submenu-trigger"
              onClick={() => setActiveSubmenu('place-item')}
            >
              <span className="menu-icon">🎒</span>
              Place Item Here
              <span className="submenu-arrow">▶</span>
            </button>
          )}

          {players.length > 0 && (
            <>
              <div className="menu-divider" />
              <button
                className="menu-item submenu-trigger"
                onClick={() => setActiveSubmenu('teleport')}
              >
                <span className="menu-icon">⚡</span>
                Move Player Here
                <span className="submenu-arrow">▶</span>
              </button>
            </>
          )}

          {otherMaps.length > 0 && (
            <>
              <div className="menu-divider" />
              <button
                className="menu-item submenu-trigger"
                onClick={() => setActiveSubmenu('switch-scene')}
              >
                <span className="menu-icon">🗺</span>
                Switch Scene
                <span className="submenu-arrow">▶</span>
              </button>
            </>
          )}

          <div className="menu-divider" />

          <button
            className="menu-item"
            onClick={handleCenterMapHere}
          >
            <span className="menu-icon">🎯</span>
            Set Default Center Here
          </button>
        </>
      )}

      {/* ===== PLACE MOB SUBMENU ===== */}
      {activeSubmenu === 'place-mob' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Place Mob</div>
          <div className="menu-search">
            <input
              type="text"
              placeholder="Search mobs..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
          </div>
          <div className="submenu-scrollable">
            {filterBySearch(bonuses).length === 0 ? (
              <div className="menu-empty">No mobs found</div>
            ) : (
              filterBySearch(bonuses).map(mob => (
                <button
                  key={mob.id}
                  className="menu-item"
                  onClick={() => handlePlaceBonus(mob.id)}
                >
                  {mob.imageUrl && (
                    <img src={mob.imageUrl} alt={mob.name} className="menu-icon-img" />
                  )}
                  <span>{mob.name}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* ===== PLACE ITEM SUBMENU ===== */}
      {activeSubmenu === 'place-item' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Place Item</div>
          <div className="menu-search">
            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
          </div>
          <div className="submenu-scrollable">
            {filterBySearch(items).length === 0 ? (
              <div className="menu-empty">No items found</div>
            ) : (
              filterBySearch(items).map(item => (
                <button
                  key={item.id}
                  className="menu-item"
                  onClick={() => handlePlaceItem(item.id)}
                >
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="menu-icon-img" />
                  )}
                  <span>{item.name}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* ===== TELEPORT PLAYER SUBMENU ===== */}
      {activeSubmenu === 'teleport' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Move Player Here</div>
          {players.map(player => (
            <button
              key={player.id}
              className="menu-item"
              onClick={() => handleTeleportPlayer(player.id)}
            >
              <div
                className="menu-icon-circle"
                style={{ backgroundColor: player.iconColor }}
              />
              {player.name}
            </button>
          ))}
        </>
      )}

      {/* ===== SWITCH SCENE SUBMENU ===== */}
      {activeSubmenu === 'switch-scene' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Switch Scene</div>
          <div className="submenu-scrollable">
            {otherMaps.map(map => (
              <button
                key={map.id}
                className="menu-item"
                onClick={() => handleSelectMap(map.id)}
              >
                <span className="menu-icon">🗺</span>
                {map.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MapContextMenu;
