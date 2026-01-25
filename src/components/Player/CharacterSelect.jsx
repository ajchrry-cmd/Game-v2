import React, { useState } from 'react';
import './PlayerView.css';

function CharacterSelect({ players, sessionName, onSelectCharacter, sessionId, onSendMessage, onFlashScreen, onUpdatePlayerNotes }) {
  const [secretClicks, setSecretClicks] = useState(0);
  const [showSecretMenu, setShowSecretMenu] = useState(false);
  const [selectedPlayerForAction, setSelectedPlayerForAction] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [flashColor, setFlashColor] = useState('#ff0000');
  const [notesPlayerId, setNotesPlayerId] = useState('');
  const [notesText, setNotesText] = useState('');

  const handleSessionNameClick = () => {
    const newCount = secretClicks + 1;
    setSecretClicks(newCount);

    if (newCount >= 10) {
      setShowSecretMenu(true);
      setSecretClicks(0);
    }

    // Reset counter after 2 seconds of no clicks
    setTimeout(() => {
      setSecretClicks(0);
    }, 2000);
  };

  const handleSendSecretMessage = () => {
    if (selectedPlayerForAction && secretMessage.trim()) {
      onSendMessage(selectedPlayerForAction, secretMessage);
      setSecretMessage('');
      alert('Secret message sent!');
    }
  };

  const handleFlashPlayerScreen = () => {
    if (selectedPlayerForAction) {
      onFlashScreen(selectedPlayerForAction, flashColor);
      alert('Screen flash sent!');
    }
  };

  const handleSaveNotes = () => {
    if (notesPlayerId && notesText.trim()) {
      onUpdatePlayerNotes(notesPlayerId, notesText);
      alert('Notes saved!');
    }
  };

  const handleLoadNotes = (playerId) => {
    setNotesPlayerId(playerId);
    const player = players.find(p => p.id === playerId);
    setNotesText(player?.gmNotes || '');
  };
  if (players.length === 0) {
    return (
      <div className="character-select">
        <div className="select-container">
          <h1 onClick={handleSessionNameClick} style={{ cursor: 'pointer' }}>
            🎲 {sessionName || 'Game Session'}
          </h1>
          <div className="empty-state">
            <p>No characters available yet.</p>
            <p className="help-text">Ask your GM to add players to the session.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="character-select">
      <div className="select-container">
        <h1 onClick={handleSessionNameClick} style={{ cursor: 'pointer' }}>
          🎲 {sessionName || 'Game Session'}
        </h1>
        <p className="select-subtitle">Select your character</p>

        <div className="character-grid">
          {players.map((player) => (
            <div
              key={player.id}
              className="character-card"
              onClick={() => onSelectCharacter(player.id)}
            >
              {player.imageUrl && (
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="character-avatar"
                />
              )}
              <h3>{player.name}</h3>
              <div className="character-quick-stats">
                <span>❤️ {player.hp || 0}</span>
                <span>✨ {player.mana || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secret GM Menu */}
      {showSecretMenu && (
        <div className="modal-overlay" onClick={() => setShowSecretMenu(false)}>
          <div className="modal secret-gm-menu" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => setShowSecretMenu(false)}>×</button>
            <h2>🔐 Secret GM Controls</h2>

            <div style={{ marginTop: '1.5rem' }}>
              {/* Send Secret Message */}
              <div style={{
                background: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '2px solid #444'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>💬 Send Secret Message</h3>
                <select
                  value={selectedPlayerForAction}
                  onChange={(e) => setSelectedPlayerForAction(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555'
                  }}
                >
                  <option value="">Select player...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <textarea
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  placeholder="Type your secret message..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555',
                    minHeight: '80px',
                    marginBottom: '0.5rem'
                  }}
                />
                <button
                  onClick={handleSendSecretMessage}
                  disabled={!selectedPlayerForAction || !secretMessage.trim()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Send Message
                </button>
              </div>

              {/* Flash Screen */}
              <div style={{
                background: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '2px solid #444'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>⚡ Flash Player Screen</h3>
                <select
                  value={selectedPlayerForAction}
                  onChange={(e) => setSelectedPlayerForAction(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555'
                  }}
                >
                  <option value="">Select player...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <label style={{ color: '#fff' }}>Color:</label>
                  <input
                    type="color"
                    value={flashColor}
                    onChange={(e) => setFlashColor(e.target.value)}
                    style={{
                      width: '60px',
                      height: '40px',
                      border: '2px solid #555',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ color: '#999', fontFamily: 'monospace' }}>{flashColor}</span>
                </div>
                <button
                  onClick={handleFlashPlayerScreen}
                  disabled={!selectedPlayerForAction}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Flash Screen
                </button>
              </div>

              {/* Player Notes */}
              <div style={{
                background: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #444'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>📝 Player Secret Notes</h3>
                <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Add persistent notes visible only to specific players (win conditions, secret buffs, etc.)
                </p>
                <select
                  value={notesPlayerId}
                  onChange={(e) => handleLoadNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555'
                  }}
                >
                  <option value="">Select player...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Enter secret notes for this player..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555',
                    minHeight: '120px',
                    marginBottom: '0.5rem'
                  }}
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={!notesPlayerId || !notesText.trim()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSelect;
