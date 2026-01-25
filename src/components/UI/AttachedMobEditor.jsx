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
      // Store offset as ratio of token size for consistency across different token sizes
      offset: {
        x: data.x / tokenSize,
        y: data.y / tokenSize
      }
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

  const handleLayerChange = (index, newLayer) => {
    const newAttachedMobs = [...attachedMobs];
    newAttachedMobs[index] = {
      ...newAttachedMobs[index],
      layer: newLayer
    };
    setAttachedMobs(newAttachedMobs);
  };

  const handleAddMob = (bonusId) => {
    const newMob = {
      mobId: bonusId,
      offset: { x: 1, y: -1 }, // Default position
      size: 0.6, // Default size (60% of token)
      layer: 'above' // Default layer
    };
    setAttachedMobs([...attachedMobs, newMob]);
    setSelectedMobIndex(attachedMobs.length); // Auto-select the new mob
  };

  const handleRemoveMob = (index) => {
    const newAttachedMobs = [...attachedMobs];
    newAttachedMobs.splice(index, 1);
    setAttachedMobs(newAttachedMobs);
    if (selectedMobIndex === index) {
      setSelectedMobIndex(null);
    } else if (selectedMobIndex > index) {
      setSelectedMobIndex(selectedMobIndex - 1);
    }
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
          Add mobs to attach to this player, then drag them to position around the token. These positions will be maintained when the player moves on the map.
        </div>

        {/* Add Mob Section */}
        <div style={{
          marginTop: '1.5rem',
          background: '#2a2a2a',
          borderRadius: '8px',
          padding: '1rem',
          border: '2px solid #555'
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1rem' }}>Add Mobs</h3>
          {bonuses.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#999',
              fontSize: '0.9rem'
            }}>
              No mobs available. Create mobs in the Mob Manager first.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.75rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {bonuses.map(mob => {
              const isAlreadyAttached = attachedMobs.some(am =>
                (typeof am === 'string' ? am : am.mobId) === mob.id
              );
              return (
                <button
                  key={mob.id}
                  onClick={() => handleAddMob(mob.id)}
                  disabled={isAlreadyAttached}
                  style={{
                    background: isAlreadyAttached ? '#1a1a1a' : '#3a3a3a',
                    border: '2px solid ' + (isAlreadyAttached ? '#333' : '#555'),
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: isAlreadyAttached ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isAlreadyAttached ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAlreadyAttached) {
                      e.currentTarget.style.borderColor = '#d4af37';
                      e.currentTarget.style.background = '#4a4a4a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAlreadyAttached) {
                      e.currentTarget.style.borderColor = '#555';
                      e.currentTarget.style.background = '#3a3a3a';
                    }
                  }}
                >
                  {mob.imageUrl && (
                    <img
                      src={mob.imageUrl}
                      alt={mob.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                  <span style={{
                    color: isAlreadyAttached ? '#666' : '#fff',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}>
                    {mob.name}
                  </span>
                  {isAlreadyAttached && (
                    <span style={{ color: '#d4af37', fontSize: '0.65rem' }}>✓ Added</span>
                  )}
                </button>
              );
            })}
            </div>
          )}
        </div>

        {/* Preview Area */}
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
          {/* Player token at center - matching main map structure */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Player icon */}
            {player.iconType === 'custom' && player.iconUrl ? (
              <img
                src={player.iconUrl}
                alt={player.name}
                style={{
                  width: `${tokenSize}px`,
                  height: `${tokenSize}px`,
                  borderRadius: '50%',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                }}
              />
            ) : (
              <div
                style={{
                  width: `${tokenSize}px`,
                  height: `${tokenSize}px`,
                  backgroundColor: player.iconColor || '#FF0000',
                  borderRadius: '50%',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                }}
              />
            )}

            {/* No mobs message */}
            {attachedMobs.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#999',
                fontSize: '0.9rem',
                maxWidth: '300px',
                marginTop: '40px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
                <div>No mobs attached yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Select mobs from above to attach to this player
                </div>
              </div>
            )}

            {/* Attached mobs */}
            {attachedMobs.map((attachedMob, index) => {
              const mobId = typeof attachedMob === 'string' ? attachedMob : attachedMob.mobId;
              // Handle both old format (pixels) and new format (ratios)
              const offsetRatio = typeof attachedMob === 'string'
                ? { x: 1, y: -1 } // Default ratio
                : (attachedMob.offset || { x: 1, y: -1 });

              // Convert ratio to pixels for this editor's token size
              const offsetPixels = {
                x: offsetRatio.x * tokenSize,
                y: offsetRatio.y * tokenSize
              };

              const size = attachedMob.size || 0.6; // Default to 60% of token size
              const mob = bonuses.find(b => b.id === mobId);
              if (!mob) return null;

              const mobSize = tokenSize * size;
              const isSelected = selectedMobIndex === index;

              return (
                <Draggable
                  key={`mob-${index}`}
                  position={offsetPixels}
                  onDrag={(e, data) => handleDragMob(index, e, data)}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMobIndex(index);
                    }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${mobSize}px`,
                      height: `${mobSize}px`,
                      cursor: 'move',
                      zIndex: 10,
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      background: 'transparent',
                      overflow: 'hidden',
                      padding: 0,
                      margin: 0
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

            {/* Player name - as flex item with margin-top to match MapScreen */}
            <span style={{
              marginTop: '4px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              position: 'relative',
              zIndex: 100
            }}>
              {player.name}
            </span>
          </div>
        </div>

        {/* Size and Layer controls */}
        {selectedMobIndex !== null && (
          <div style={{
            marginTop: '2rem',
            background: '#2a2a2a',
            padding: '1rem',
            borderRadius: '8px',
            border: '2px solid #d4af37'
          }}>
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>
              Adjust Settings - {bonuses.find(b => b.id === (typeof attachedMobs[selectedMobIndex] === 'string' ? attachedMobs[selectedMobIndex] : attachedMobs[selectedMobIndex].mobId))?.name}
            </h3>

            {/* Size Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ color: '#fff', minWidth: '60px' }}>Size:</label>
              <input
                type="range"
                min="0.2"
                max="6.0"
                step="0.1"
                value={attachedMobs[selectedMobIndex]?.size || 0.6}
                onChange={(e) => handleSizeChange(selectedMobIndex, parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ color: '#d4af37', minWidth: '50px' }}>
                {Math.round((attachedMobs[selectedMobIndex]?.size || 0.6) * 100)}%
              </span>
            </div>

            {/* Layer Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ color: '#fff', minWidth: '60px' }}>Layer:</label>
              <select
                value={attachedMobs[selectedMobIndex]?.layer || 'above'}
                onChange={(e) => handleLayerChange(selectedMobIndex, e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px' }}
              >
                <option value="back">Far Back (Layer 1)</option>
                <option value="below">Behind Player (Layer 2)</option>
                <option value="same">Same as Player (Layer 3)</option>
                <option value="above">In Front of Player (Layer 4)</option>
                <option value="front">Far Front (Layer 5)</option>
              </select>
              <span style={{ color: '#999', minWidth: '50px', fontSize: '0.85rem' }}>
                {attachedMobs[selectedMobIndex]?.layer === 'back' ? 'L1' :
                 attachedMobs[selectedMobIndex]?.layer === 'below' ? 'L2' :
                 attachedMobs[selectedMobIndex]?.layer === 'same' ? 'L3' :
                 attachedMobs[selectedMobIndex]?.layer === 'front' ? 'L5' : 'L4'}
              </span>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveMob(selectedMobIndex)}
              style={{
                width: '100%',
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#b71c1c'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#d32f2f'}
            >
              🗑️ Remove This Mob
            </button>
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
