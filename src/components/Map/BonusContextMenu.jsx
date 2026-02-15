import React, { useRef, useEffect, useState } from 'react';
import './MapContextMenu.css';

function BonusContextMenu({
  position,
  placedBonus,
  bonus,
  onClose,
  onRemove,
  onDuplicate,
  onResize
}) {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = position.x;
    let y = position.y;
    if (rect.right > vw) x = vw - rect.width - 10;
    if (x < 10) x = 10;
    if (rect.bottom > vh) y = vh - rect.height - 10;
    if (y < 10) y = 10;
    if (x !== position.x || y !== position.y) {
      setAdjustedPosition({ x, y });
    }
  }, [position]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const currentSize = placedBonus.size || 60;

  return (
    <div
      ref={menuRef}
      className="map-context-menu"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      <div className="menu-header">{bonus.name || 'Mob'}</div>

      <button
        className="menu-item"
        onClick={() => {
          onDuplicate(placedBonus.bonusId, {
            x: placedBonus.position.x + 50,
            y: placedBonus.position.y + 50
          });
          onClose();
        }}
      >
        <span className="menu-icon">📋</span>
        Duplicate
      </button>

      <div className="menu-divider" />
      <div className="menu-section-label">Resize ({currentSize}px)</div>

      <button
        className="menu-item"
        onClick={() => {
          onResize(placedBonus.id, Math.min(300, currentSize + 20));
        }}
      >
        <span className="menu-icon">+</span>
        Bigger (+20)
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onResize(placedBonus.id, Math.max(20, currentSize - 20));
        }}
      >
        <span className="menu-icon">−</span>
        Smaller (-20)
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onResize(placedBonus.id, 60);
        }}
      >
        <span className="menu-icon">↩</span>
        Normal (60px)
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onResize(placedBonus.id, 120);
        }}
      >
        <span className="menu-icon">👑</span>
        Boss Size (120px)
      </button>

      <div className="menu-divider" />

      <button
        className="menu-item menu-item-danger"
        onClick={() => {
          onRemove(placedBonus.id);
          onClose();
        }}
      >
        <span className="menu-icon">🗑</span>
        Remove
      </button>
    </div>
  );
}

export default BonusContextMenu;
