import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function AttachedMobEditor({ player, onClose, onSave }) {
  const { bonuses } = useGame();
  const [attachedMobs, setAttachedMobs] = useState(player.attachedMobs || []);
  const [selectedMobIndex, setSelectedMobIndex] = useState(null);
  const tokenSize = 50; // Standard token size for preview

  const handleDragMob = (index, e, data) => {
    const newAttachedMobs = [...attachedMobs];
    newAttachedMobs[index] = {
      ...newAttachedMobs[index],
      offset: { x: data.x, y: data.y }
    };
    setAttachedMobs(newAttachedMobs);
  };

  const handleSizeChange = (index, newSize) => {
    const newAttachedMobs = [...attachedMobs];
    newAttachedMobs[index] = {
      ...newAttachedMobs[index],
      size: newSize
    };
    setAttachedMobs(newAttachedMobs);
  };

  const handleSave = () => {
    onSave(attachedMobs);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Position Attached Mobs - {player.name}</h2>

        <div style={{ marginTop: '1rem', color: '#999', fontSize: '0.9rem' }}>
          Drag the mobs to position them around the player token. These positions will be maintained when the player moves on the map.
        </div>

        <div style={{
          marginTop: '2rem',
          background: '#1a1a1a',
          borderRadius: '8px',
          padding: '2rem',
          minHeight: '500px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Player token at center */}
          <div style={{
            position: 'relative',
            width: `${tokenSize}px`,
            height: `${tokenSize}px`
          }}>
            {player.iconType === 'custom' && player.iconUrl ? (
              <img
                src={player.iconUrl}
                alt={player.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: player.iconColor || '#FF0000',
                  borderRadius: '50%',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                }}
              />
            )}

            {/* Attached mobs */}
            {attachedMobs.map((attachedMob, index) => {
              const mobId = typeof attachedMob === 'string' ? attachedMob : attachedMob.mobId;
              const offset = typeof attachedMob === 'string' ? { x: 50, y: -50 } : (attachedMob.offset || { x: 50, y: -50 });
              const size = attachedMob.size || 0.6; // Default to 60% of token size
              const mob = bonuses.find(b => b.id === mobId);
              if (!mob) return null;

              const mobSize = tokenSize * size;
              const isSelected = selectedMobIndex === index;

              return (
                <Draggable
                  key={`mob-${index}`}
                  position={offset}
                  onDrag={(e, data) => handleDragMob(index, e, data)}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMobIndex(index);
                    }}
                    style={{
                      position: 'absolute',
                      width: `${mobSize}px`,
                      height: `${mobSize}px`,
                      cursor: 'move',
                      zIndex: 10,
                      border: isSelected ? '2px solid #d4af37' : '2px solid transparent',
                      borderRadius: '4px',
                      boxSizing: 'content-box'
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
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                        }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.7rem',
                      color: isSelected ? '#d4af37' : '#999',
                      background: 'rgba(0, 0, 0, 0.8)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none'
                    }}>
                      {mob.name}
                    </div>
                  </div>
                </Draggable>
              );
            })}

            <span style={{
              position: 'absolute',
              bottom: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              {player.name}
            </span>
          </div>
        </div>

        {/* Size controls */}
        {selectedMobIndex !== null && (
          <div style={{
            marginTop: '2rem',
            background: '#2a2a2a',
            padding: '1rem',
            borderRadius: '8px',
            border: '2px solid #d4af37'
          }}>
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>
              Adjust Size - {bonuses.find(b => b.id === (typeof attachedMobs[selectedMobIndex] === 'string' ? attachedMobs[selectedMobIndex] : attachedMobs[selectedMobIndex].mobId))?.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ color: '#fff' }}>Size:</label>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                value={attachedMobs[selectedMobIndex]?.size || 0.6}
                onChange={(e) => handleSizeChange(selectedMobIndex, parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ color: '#d4af37', minWidth: '50px' }}>
                {Math.round((attachedMobs[selectedMobIndex]?.size || 0.6) * 100)}%
              </span>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>Save Positions</button>
        </div>
      </div>
    </div>
  );
}

export default AttachedMobEditor;
