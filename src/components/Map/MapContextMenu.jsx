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
  const [commonMobs, setCommonMobs] = useState(() => {
    // Load common mobs from localStorage
    const saved = localStorage.getItem('commonMobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [commonItems, setCommonItems] = useState(() => {
    // Load common items from localStorage
    const saved = localStorage.getItem('commonItems');
    return saved ? JSON.parse(saved) : [];
  });

  // Adjust menu position to keep it within viewport bounds
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // Check right edge
    if (rect.right > viewportWidth) {
      newX = viewportWidth - rect.width - 10;
    }

    // Check left edge
    if (newX < 10) {
      newX = 10;
    }

    // Check bottom edge
    if (rect.bottom > viewportHeight) {
      newY = viewportHeight - rect.height - 10;
    }

    // Check top edge
    if (newY < 10) {
      newY = 10;
    }

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
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

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

  const handleToggleCommonMob = (mobId) => {
    const newCommonMobs = commonMobs.includes(mobId)
      ? commonMobs.filter(id => id !== mobId)
      : [...commonMobs, mobId];
    setCommonMobs(newCommonMobs);
    localStorage.setItem('commonMobs', JSON.stringify(newCommonMobs));
  };

  const handleToggleCommonItem = (itemId) => {
    const newCommonItems = commonItems.includes(itemId)
      ? commonItems.filter(id => id !== itemId)
      : [...commonItems, itemId];
    setCommonItems(newCommonItems);
    localStorage.setItem('commonItems', JSON.stringify(newCommonItems));
  };

  const handleBack = () => {
    setActiveSubmenu(null);
  };

  const handleCenterMapHere = () => {
    // This will set the map center to this position in UI settings
    const uiSettings = JSON.parse(localStorage.getItem('uiCustomization')) || {};
    uiSettings.mapCenterX = mapPosition.x;
    uiSettings.mapCenterY = mapPosition.y;
    localStorage.setItem('uiCustomization', JSON.stringify(uiSettings));
    alert(`Map center set to (${Math.round(mapPosition.x)}, ${Math.round(mapPosition.y)})`);
    onClose();
  };

  // Get only common mobs/items
  const commonMobsList = bonuses.filter(b => commonMobs.includes(b.id));
  const allMobsList = bonuses.filter(b => !commonMobs.includes(b.id));
  const commonItemsList = items.filter(i => commonItems.includes(i.id));
  const allItemsList = items.filter(i => !commonItems.includes(i.id));

  // Other maps (not current map)
  const otherMaps = maps.filter(m => m.id !== currentMapId);

  return (
    <div
      ref={menuRef}
      className="map-context-menu"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
    >
      {!activeSubmenu && (
        <>
          <div className="menu-header">Map Menu</div>

          {/* Quick Scene Selection */}
          {otherMaps.length > 0 && (
            <>
              <div className="menu-section-label">Quick Scenes</div>
              {otherMaps.slice(0, 5).map(map => (
                <button
                  key={map.id}
                  className="menu-item"
                  onClick={() => handleSelectMap(map.id)}
                >
                  <span className="menu-icon">🗺️</span>
                  {map.name}
                </button>
              ))}
              {otherMaps.length > 5 && (
                <button
                  className="menu-item submenu-trigger"
                  onClick={() => setActiveSubmenu('all-maps')}
                >
                  <span className="menu-icon">📋</span>
                  All Scenes ({otherMaps.length})
                  <span className="submenu-arrow">▶</span>
                </button>
              )}
              <div className="menu-divider" />
            </>
          )}

          {/* Common Mobs */}
          {commonMobsList.length > 0 && (
            <>
              <div className="menu-section-label">Quick Add Mobs</div>
              {commonMobsList.map(mob => (
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
              ))}
              <div className="menu-divider" />
            </>
          )}

          {/* Common Items */}
          {commonItemsList.length > 0 && (
            <>
              <div className="menu-section-label">Quick Add Items</div>
              {commonItemsList.map(item => (
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
              ))}
              <div className="menu-divider" />
            </>
          )}

          {/* All Mobs/Items */}
          <button
            className="menu-item submenu-trigger"
            onClick={() => setActiveSubmenu('all-mobs')}
          >
            <span className="menu-icon">👹</span>
            All Mobs
            <span className="submenu-arrow">▶</span>
          </button>

          <button
            className="menu-item submenu-trigger"
            onClick={() => setActiveSubmenu('all-items')}
          >
            <span className="menu-icon">🎒</span>
            All Items
            <span className="submenu-arrow">▶</span>
          </button>

          <div className="menu-divider" />

          {/* Teleport Player */}
          {players.length > 0 && (
            <button
              className="menu-item submenu-trigger"
              onClick={() => setActiveSubmenu('teleport')}
            >
              <span className="menu-icon">⚡</span>
              Teleport Player Here
              <span className="submenu-arrow">▶</span>
            </button>
          )}

          {/* Utility Options */}
          <button
            className="menu-item"
            onClick={handleCenterMapHere}
          >
            <span className="menu-icon">🎯</span>
            Set as Map Center
          </button>

          <div className="menu-divider" />

          {/* Manage Common Lists */}
          <button
            className="menu-item submenu-trigger"
            onClick={() => setActiveSubmenu('manage-common')}
          >
            <span className="menu-icon">⚙️</span>
            Manage Quick Lists
            <span className="submenu-arrow">▶</span>
          </button>
        </>
      )}

      {/* All Maps Submenu */}
      {activeSubmenu === 'all-maps' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">All Scenes</div>
          {otherMaps.map(map => (
            <button
              key={map.id}
              className="menu-item"
              onClick={() => handleSelectMap(map.id)}
            >
              <span className="menu-icon">🗺️</span>
              {map.name}
            </button>
          ))}
        </>
      )}

      {/* All Mobs Submenu */}
      {activeSubmenu === 'all-mobs' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Add Mob</div>
          <div className="submenu-scrollable">
            {bonuses.map(mob => (
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
            ))}
          </div>
        </>
      )}

      {/* All Items Submenu */}
      {activeSubmenu === 'all-items' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Add Item</div>
          <div className="submenu-scrollable">
            {items.map(item => (
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
            ))}
          </div>
        </>
      )}

      {/* Teleport Player Submenu */}
      {activeSubmenu === 'teleport' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Teleport Player</div>
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

      {/* Manage Common Lists Submenu */}
      {activeSubmenu === 'manage-common' && (
        <>
          <button className="menu-back" onClick={handleBack}>
            ← Back
          </button>
          <div className="menu-header">Manage Quick Lists</div>

          <div className="menu-section-label">Quick Mobs ({commonMobs.length})</div>
          <div className="submenu-scrollable">
            {bonuses.map(mob => (
              <button
                key={mob.id}
                className={`menu-item checkbox-item ${commonMobs.includes(mob.id) ? 'checked' : ''}`}
                onClick={() => handleToggleCommonMob(mob.id)}
              >
                <span className="checkbox">{commonMobs.includes(mob.id) ? '☑' : '☐'}</span>
                {mob.imageUrl && (
                  <img src={mob.imageUrl} alt={mob.name} className="menu-icon-img" />
                )}
                <span>{mob.name}</span>
              </button>
            ))}
          </div>

          <div className="menu-divider" />
          <div className="menu-section-label">Quick Items ({commonItems.length})</div>
          <div className="submenu-scrollable">
            {items.map(item => (
              <button
                key={item.id}
                className={`menu-item checkbox-item ${commonItems.includes(item.id) ? 'checked' : ''}`}
                onClick={() => handleToggleCommonItem(item.id)}
              >
                <span className="checkbox">{commonItems.includes(item.id) ? '☑' : '☐'}</span>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="menu-icon-img" />
                )}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MapContextMenu;
