import React, { useEffect } from 'react';
import { loadUISettings } from '../../utils/uiSettings';
import '../Map/MapScreen.css';
import './PlayerView.css';

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
    <div className="player-character">
      {/* Header */}
      <div className="player-header">
        <div className="header-content">
          <h2>{sessionName || 'Game Session'}</h2>
          <button onClick={onChangeCharacter} className="change-character-btn">
            Change Character
          </button>
        </div>
      </div>

      {/* Player Panel - matching GM view exactly */}
      <div className="player-panel" style={{ width: '100%', maxWidth: 'var(--player-panel-width, 380px)', margin: '0 auto', border: 'none' }}>
        <div className="player-info">
          <h3>{player.name}</h3>

          {/* Base Stats */}
          <div className="player-stats">
            <div className="stat">
              <span className="stat-label">Power</span>
              <span className="stat-value">{player.power || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Money</span>
              <span className="stat-value">{player.money || 0}</span>
            </div>
          </div>

          {/* Custom Stats */}
          {customStats.length > 0 && (
            <div className="player-stats" style={{ marginTop: '0.5rem' }}>
              {customStats.map((stat, index) => (
                <div key={index} className="stat">
                  <span className="stat-label">{stat.name}</span>
                  <span className="stat-value">{stat.value || 0}</span>
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
      </div>
    </div>
  );
}

export default PlayerCharacter;
