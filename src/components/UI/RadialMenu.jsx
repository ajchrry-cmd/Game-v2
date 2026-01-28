import React, { useRef, useEffect } from 'react';
import './RadialMenu.css';

/**
 * Radial Menu Component
 * Displays actions in a circular pattern around a center point
 */
function RadialMenu({ position, actions, onClose, centerLabel }) {
  const menuRef = useRef(null);

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

  // Calculate positions for radial items
  const getItemPosition = (index, total) => {
    // Start at top (-90 degrees) and go clockwise
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 80; // Distance from center

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="radial-menu"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {/* Center circle */}
      <div className="radial-center">
        {centerLabel && <span className="radial-center-label">{centerLabel}</span>}
      </div>

      {/* Radial action items */}
      {actions.map((action, index) => {
        const pos = getItemPosition(index, actions.length);
        return (
          <button
            key={index}
            className={`radial-item ${action.variant || ''}`}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`
            }}
            onClick={() => handleAction(action)}
            title={action.label}
            disabled={action.disabled}
          >
            <div className="radial-item-icon">{action.icon}</div>
            <div className="radial-item-label">{action.label}</div>
          </button>
        );
      })}

      {/* Connecting lines from center to items */}
      {actions.map((action, index) => {
        const pos = getItemPosition(index, actions.length);
        const angle = Math.atan2(pos.y, pos.x) * (180 / Math.PI);
        return (
          <div
            key={`line-${index}`}
            className="radial-line"
            style={{
              width: '80px',
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0'
            }}
          />
        );
      })}
    </div>
  );
}

export default RadialMenu;
