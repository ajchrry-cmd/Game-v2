import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';
import './CompanionSettings.css';

function CompanionSettings({ onClose }) {
  const {
    currentSession,
    updateSession,
    companionSettings,
    updateCompanionSettings,
    sendPlayerMessage,
    flashPlayerScreen
  } = useGame();

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [flashColor, setFlashColor] = useState('#ff0000');
  const [announcement, setAnnouncement] = useState('');

  const players = currentSession?.players || [];
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

  const handleToggleSetting = (setting) => {
    updateCompanionSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSendMessage = () => {
    if (!selectedPlayer || !messageText.trim()) return;

    sendPlayerMessage(selectedPlayer, messageText);
    setMessageText('');
    alert(`Message sent to ${players.find(p => p.id === selectedPlayer)?.name}`);
  };

  const handleFlashPlayer = () => {
    if (!selectedPlayer) return;

    flashPlayerScreen(selectedPlayer, flashColor);
    alert(`Screen flash sent to ${players.find(p => p.id === selectedPlayer)?.name}`);
  };

  const handleFlashAll = () => {
    players.forEach(player => {
      flashPlayerScreen(player.id, flashColor);
    });
    alert('Screen flash sent to all players');
  };

  const handleSendAnnouncement = () => {
    if (!announcement.trim()) return;

    players.forEach(player => {
      sendPlayerMessage(player.id, announcement);
    });
    setAnnouncement('');
    alert('Announcement sent to all players');
  };

  const handleBlindMode = () => {
    const newBlindMode = !settings.blindMode;
    updateCompanionSettings({
      ...settings,
      blindMode: newBlindMode,
      showPower: !newBlindMode,
      showMoney: !newBlindMode,
      showCustomStats: !newBlindMode,
      showInventory: !newBlindMode,
      showParty: !newBlindMode,
      showStatusEffects: !newBlindMode
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal companion-settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>🎮 Companion App Settings</h2>

        {!currentSession && (
          <div className="empty-state">
            <p>No active session. Create or load a session first.</p>
          </div>
        )}

        {currentSession && (
          <div className="manager-content">
            {/* Visibility Settings */}
            <div className="settings-section">
              <h3>👁️ Information Visibility</h3>
              <p className="section-description">Control what players can see on their companion app</p>

              <div className="settings-grid">
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showPower}
                      onChange={() => handleToggleSetting('showPower')}
                      disabled={settings.blindMode}
                    />
                    <span>Show Power</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showMoney}
                      onChange={() => handleToggleSetting('showMoney')}
                      disabled={settings.blindMode}
                    />
                    <span>Show Money</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showCustomStats}
                      onChange={() => handleToggleSetting('showCustomStats')}
                      disabled={settings.blindMode}
                    />
                    <span>Show Custom Stats</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showInventory}
                      onChange={() => handleToggleSetting('showInventory')}
                      disabled={settings.blindMode}
                    />
                    <span>Show Inventory</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showParty}
                      onChange={() => handleToggleSetting('showParty')}
                      disabled={settings.blindMode}
                    />
                    <span>Show Party Members</span>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showStatusEffects}
                      onChange={() => handleToggleSetting('showStatusEffects')}
                      disabled={settings.blindMode}
                    />
                    <span>Show Status Effects</span>
                  </label>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  className={settings.blindMode ? 'primary' : 'danger'}
                  onClick={handleBlindMode}
                >
                  {settings.blindMode ? '👁️ Restore Visibility' : '🙈 Blind Mode (Hide All)'}
                </button>
              </div>
            </div>

            {/* Player Controls */}
            <div className="settings-section">
              <h3>🎭 Player Controls</h3>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.allowCharacterSwitch}
                    onChange={() => handleToggleSetting('allowCharacterSwitch')}
                  />
                  <span>Allow Players to Change Characters</span>
                </label>
                <p className="setting-hint">When disabled, players are locked to their current character</p>
              </div>
            </div>

            {/* Secret Messages */}
            <div className="settings-section">
              <h3>💬 Secret Messages</h3>
              <p className="section-description">Send private messages to individual players</p>

              <div className="form-group">
                <label>Select Player</label>
                {players.length === 0 ? (
                  <p style={{ color: '#999', fontSize: '0.9rem' }}>No players in session</p>
                ) : (
                  <select
                    value={selectedPlayer || ''}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                  >
                    <option value="">-- Select a player --</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Secret Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your secret message here..."
                  rows="3"
                  disabled={!selectedPlayer}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                className="primary"
                onClick={handleSendMessage}
                disabled={!selectedPlayer || !messageText.trim()}
              >
                📨 Send Secret Message
              </button>
            </div>

            {/* Screen Flash */}
            <div className="settings-section">
              <h3>⚡ Screen Flash</h3>
              <p className="section-description">Flash a player's screen to get their attention</p>

              <div className="form-group">
                <label>Flash Color</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={flashColor}
                    onChange={(e) => setFlashColor(e.target.value)}
                  />
                  <span style={{ color: '#999' }}>{flashColor}</span>
                </div>
              </div>

              <div className="flash-actions">
                <button
                  onClick={handleFlashPlayer}
                  disabled={!selectedPlayer}
                  style={{ flex: 1 }}
                >
                  ⚡ Flash Selected Player
                </button>
                <button
                  className="danger"
                  onClick={handleFlashAll}
                  disabled={players.length === 0}
                  style={{ flex: 1 }}
                >
                  ⚡⚡ Flash All Players
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="settings-section">
              <h3>📢 Announcements</h3>
              <p className="section-description">Send a message to all players at once</p>

              <div className="form-group">
                <label>Announcement Text</label>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type your announcement here..."
                  rows="3"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                className="primary"
                onClick={handleSendAnnouncement}
                disabled={!announcement.trim() || players.length === 0}
              >
                📢 Send to All Players
              </button>
            </div>

            {/* Info Section */}
            <div className="settings-section info-section">
              <h3>ℹ️ Session Info</h3>
              <p><strong>Active Players:</strong> {players.length}</p>
              <p><strong>Session:</strong> {currentSession.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanionSettings;
