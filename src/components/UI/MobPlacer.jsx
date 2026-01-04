import React from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function MobPlacer({ onClose }) {
  const { bonuses, placeBonus, setCurrentScene, currentScene } = useGame();

  const handlePlaceMob = (mobId) => {
    // Make sure we're on the map scene
    if (currentScene !== 'map') {
      setCurrentScene('map');
    }
    // Place mob at center of map
    placeBonus(mobId, { x: 400, y: 300 });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Place Mobs on Map</h2>

        <div className="manager-content">
          {bonuses.length === 0 ? (
            <div className="empty-state">
              <p>No mobs created yet</p>
              <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
                Create mobs in the Manage → Mobs section first
              </p>
            </div>
          ) : (
            <div className="items-grid">
              {bonuses.map(mob => (
                <div key={mob.id} className="item-card">
                  {mob.imageUrl && (
                    <img
                      src={mob.imageUrl}
                      alt={mob.name}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'contain',
                        marginBottom: '0.5rem'
                      }}
                    />
                  )}
                  <h3>{mob.name}</h3>
                  <button
                    className="primary"
                    onClick={() => handlePlaceMob(mob.id)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Place on Map
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobPlacer;
