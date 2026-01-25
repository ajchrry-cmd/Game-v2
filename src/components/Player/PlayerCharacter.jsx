import React, { useEffect, useState } from 'react';
import { loadUISettings } from '../../utils/uiSettings';
import './PlayerCharacter.css';

function PlayerCharacter({ player, items, bonuses, sessionName, sessionId, companionSettings, playerMessages, playerFlashEvents, onChangeCharacter }) {
  const [currentMessage, setCurrentMessage] = useState(null);
  const [flashActive, setFlashActive] = useState(false);
  const [flashColor, setFlashColor] = useState('#ff0000');
  const [dismissedMessages, setDismissedMessages] = useState([]);
  const [processedFlashes, setProcessedFlashes] = useState([]);
  // Load UI customization settings
  useEffect(() => {
    loadUISettings();
  }, []);

  // Handle new messages
  useEffect(() => {
    if (playerMessages && playerMessages[player.id]) {
      const messages = playerMessages[player.id];
      const unreadMessages = messages.filter(m => !dismissedMessages.includes(m.id));
      if (unreadMessages.length > 0 && (!currentMessage || currentMessage.id !== unreadMessages[0].id)) {
        setCurrentMessage(unreadMessages[0]);
      }
    }
  }, [playerMessages, player.id, dismissedMessages, currentMessage]);

  // Handle flash events
  useEffect(() => {
    if (playerFlashEvents && playerFlashEvents[player.id]) {
      const flashes = playerFlashEvents[player.id];
      if (flashes.length > 0) {
        const latestFlash = flashes[flashes.length - 1];

        // Only process if we haven't seen this flash before
        if (!processedFlashes.includes(latestFlash.id)) {
          setFlashColor(latestFlash.color);
          setFlashActive(true);
          setProcessedFlashes(prev => [...prev, latestFlash.id]);

          // Clear flash after animation
          setTimeout(() => {
            setFlashActive(false);
          }, 1000);
        }
      }
    }
  }, [playerFlashEvents, player.id, processedFlashes]);

  const handleDismissMessage = () => {
    if (currentMessage) {
      setDismissedMessages(prev => [...prev, currentMessage.id]);
      setCurrentMessage(null);
    }
  };

  const inventorySlots = player.inventorySlots || 4;
  const customStats = player.customStats || [];
  const partySlots = player.partySlots || 0;
  const party = player.party || [];
  const statusEffects = player.statusEffects || [];

  const settings = companionSettings || {
    showPower: true,
    showMoney: true,
    showCustomStats: true,
    showInventory: true,
    showParty: true,
    showStatusEffects: true,
    allowCharacterSwitch: true,
    blindMode: false
  };

  return (
    <div className="player-character-view">
      {/* Flash overlay */}
      {flashActive && (
        <div
          className="flash-overlay"
          style={{ backgroundColor: flashColor }}
        />
      )}

      {/* Message modal */}
      {currentMessage && (
        <div className="message-modal-overlay" onClick={handleDismissMessage}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📨 Message from GM</h3>
            <p className="message-text">{currentMessage.text}</p>
            <button onClick={handleDismissMessage} className="message-dismiss-btn">
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pc-header">
        <div className="pc-header-content">
          <h2 className="session-name">{sessionName || 'Game Session'}</h2>
          {settings.allowCharacterSwitch && (
            <button onClick={onChangeCharacter} className="change-btn">
              ↻ Change
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pc-content">
        {/* Character Name */}
        <div className="pc-name-section">
          <h1 className="pc-name">{player.name}</h1>
          {settings.blindMode && (
            <p className="blind-mode-notice">🙈 Information hidden by GM</p>
          )}
        </div>

        {/* Base Stats - Large Cards */}
        {!settings.blindMode && (settings.showPower || settings.showMoney) && (
          <div className="pc-stats-primary">
            {settings.showPower && (
              <div className="pc-stat-card power">
                <div className="pc-stat-icon">⚔️</div>
                <div className="pc-stat-content">
                  <div className="pc-stat-label">Power</div>
                  <div className="pc-stat-value">{player.power || 0}</div>
                </div>
              </div>
            )}

            {settings.showMoney && (
              <div className="pc-stat-card money">
                <div className="pc-stat-icon">💰</div>
                <div className="pc-stat-content">
                  <div className="pc-stat-label">Money</div>
                  <div className="pc-stat-value">{player.money || 0}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Stats */}
        {!settings.blindMode && settings.showCustomStats && customStats.length > 0 && (
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
        {!settings.blindMode && settings.showInventory && (
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
        )}

        {/* Party */}
        {!settings.blindMode && settings.showParty && partySlots > 0 && (
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
        {!settings.blindMode && settings.showStatusEffects && statusEffects.length > 0 && (
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
