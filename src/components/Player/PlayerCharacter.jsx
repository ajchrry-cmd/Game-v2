import React, { useEffect } from 'react';
import { loadUISettings } from '../../utils/uiSettings';
import './PlayerCharacter.css';

function PlayerCharacter({ player, items, bonuses, sessionName, onChangeCharacter }) {
  // Load UI customization settings
  useEffect(() => {
    loadUISettings();
  }, []);

  const inventorySlots = player.inventorySlots || 4;
  const customStats = player.customStats || [];
  const partySlots = player.partySlots || 0;
  const party = player.party || [];
  const statusEffects = player.statusEffects || [];

  return (
    <div className="player-character-view">
      {/* Header */}
      <div className="pc-header">
        <div className="pc-header-content">
          <h2 className="session-name">{sessionName || 'Game Session'}</h2>
          <button onClick={onChangeCharacter} className="change-btn">
            ↻ Change
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pc-content">
        {/* Character Name */}
        <div className="pc-name-section">
          <h1 className="pc-name">{player.name}</h1>
        </div>

        {/* Base Stats - Large Cards */}
        <div className="pc-stats-primary">
          <div className="pc-stat-card power">
            <div className="pc-stat-icon">⚔️</div>
            <div className="pc-stat-content">
              <div className="pc-stat-label">Power</div>
              <div className="pc-stat-value">{player.power || 0}</div>
            </div>
          </div>

          <div className="pc-stat-card money">
            <div className="pc-stat-icon">💰</div>
            <div className="pc-stat-content">
              <div className="pc-stat-label">Money</div>
              <div className="pc-stat-value">{player.money || 0}</div>
            </div>
          </div>
        </div>

        {/* Custom Stats */}
        {customStats.length > 0 && (
          <div className="pc-section">
            <h3 className="pc-section-title">Stats</h3>
            <div className="pc-stats-grid">
              {customStats.map((stat, index) => (
                <div key={index} className="pc-stat-item">
                  <span className="pc-stat-item-label">{stat.name}</span>
                  <span className="pc-stat-item-value">{stat.value || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        <div className="pc-section">
          <h3 className="pc-section-title">🎒 Inventory</h3>
          <div className="pc-inventory-grid" style={{
            gridTemplateColumns: `repeat(${Math.min(inventorySlots, 4)}, 1fr)`
          }}>
            {Array.from({ length: inventorySlots }).map((_, index) => {
              const itemId = player.inventory[index];
              const item = itemId ? items.find(i => i.id === itemId) : null;
              return (
                <div key={index} className="pc-item-slot">
                  {item ? (
                    <>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="pc-item-image" />
                      )}
                      <div className="pc-item-name">{item.name}</div>
                    </>
                  ) : (
                    <div className="pc-empty-slot">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Party */}
        {partySlots > 0 && (
          <div className="pc-section">
            <h3 className="pc-section-title">👥 Party</h3>
            <div className="pc-inventory-grid" style={{
              gridTemplateColumns: `repeat(${Math.min(partySlots, 4)}, 1fr)`
            }}>
              {Array.from({ length: partySlots }).map((_, index) => {
                const mobId = party[index];
                const mob = mobId ? bonuses.find(b => b.id === mobId) : null;
                return (
                  <div key={index} className="pc-item-slot">
                    {mob ? (
                      <>
                        {mob.imageUrl && (
                          <img src={mob.imageUrl} alt={mob.name} className="pc-item-image" />
                        )}
                        <div className="pc-item-name">{mob.name}</div>
                      </>
                    ) : (
                      <div className="pc-empty-slot">—</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Effects */}
        {statusEffects.length > 0 && (
          <div className="pc-section">
            <h3 className="pc-section-title">✨ Status Effects</h3>
            <div className="pc-status-list">
              {statusEffects.map((effect, index) => (
                <span key={index} className="pc-status-badge">
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerCharacter;
