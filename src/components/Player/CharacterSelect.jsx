import React, { useState } from 'react';
import './PlayerView.css';

function CharacterSelect({ players, sessionName, onSelectCharacter, sessionId, onSendMessage, onFlashScreen, onUpdatePlayerNotes, onUpdatePlayerPin, gmPin, onUpdateGmPin }) {
  const [showSecretMenu, setShowSecretMenu] = useState(false);
  const [selectedPlayerForAction, setSelectedPlayerForAction] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [flashColor, setFlashColor] = useState('#ff0000');
  const [notesPlayerId, setNotesPlayerId] = useState('');
  const [notesText, setNotesText] = useState('');
  const [pinPlayerId, setPinPlayerId] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [selectedPlayerForPin, setSelectedPlayerForPin] = useState(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [showGmPinPrompt, setShowGmPinPrompt] = useState(false);
  const [enteredGmPin, setEnteredGmPin] = useState('');
  const [newGmPin, setNewGmPin] = useState('');
  const [confirmGmPin, setConfirmGmPin] = useState('');

  const handleGmButtonClick = () => {
    // If GM PIN is set, show PIN prompt
    if (gmPin) {
      setShowGmPinPrompt(true);
      setEnteredGmPin('');
    } else {
      // No PIN set, open menu directly
      setShowSecretMenu(true);
    }
  };

  const handleGmPinSubmit = () => {
    if (enteredGmPin === gmPin) {
      // PIN correct
      setShowGmPinPrompt(false);
      setShowSecretMenu(true);
      setEnteredGmPin('');
    } else {
      // PIN incorrect
      alert('Incorrect GM PIN!');
      setEnteredGmPin('');
    }
  };

  const handleGmPinCancel = () => {
    setShowGmPinPrompt(false);
    setEnteredGmPin('');
  };

  const handleSetGmPin = () => {
    if (newGmPin.length !== 4) {
      alert('GM PIN must be exactly 4 digits!');
      return;
    }
    if (newGmPin !== confirmGmPin) {
      alert('PINs do not match!');
      return;
    }
    onUpdateGmPin(newGmPin);
    setNewGmPin('');
    setConfirmGmPin('');
    alert('GM PIN saved!');
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

  const handleLoadPin = (playerId) => {
    setPinPlayerId(playerId);
    const player = players.find(p => p.id === playerId);
    setPinValue(player?.pin || '');
  };

  const handleSavePin = () => {
    if (pinPlayerId && pinValue.trim()) {
      // Validate PIN is 4 digits
      if (!/^\d{4}$/.test(pinValue)) {
        alert('PIN must be exactly 4 digits!');
        return;
      }
      onUpdatePlayerPin(pinPlayerId, pinValue);
      alert('PIN saved!');
    }
  };

  const handleCharacterClick = (player) => {
    // If player has a PIN set, show PIN prompt
    if (player.pin) {
      setSelectedPlayerForPin(player);
      setShowPinPrompt(true);
      setEnteredPin('');
    } else {
      // No PIN, select directly
      onSelectCharacter(player.id);
    }
  };

  const handlePinSubmit = () => {
    if (enteredPin === selectedPlayerForPin.pin) {
      // PIN correct
      setShowPinPrompt(false);
      onSelectCharacter(selectedPlayerForPin.id);
      setEnteredPin('');
      setSelectedPlayerForPin(null);
    } else {
      // PIN incorrect
      alert('Incorrect PIN!');
      setEnteredPin('');
    }
  };

  const handlePinCancel = () => {
    setShowPinPrompt(false);
    setEnteredPin('');
    setSelectedPlayerForPin(null);
  };
  if (players.length === 0) {
    return (
      <div className="character-select">
        <div className="select-container">
          <h1>🎲 {sessionName || 'Game Session'}</h1>
          <div className="empty-state">
            <p>No characters available yet.</p>
            <p className="help-text">Ask your GM to add players to the session.</p>
          </div>
          <button
            onClick={handleGmButtonClick}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              background: '#d4af37',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '2rem auto 0'
            }}
          >
            🔐 GM Controls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="character-select">
      <div className="select-container">
        <h1>🎲 {sessionName || 'Game Session'}</h1>
        <p className="select-subtitle">Select your character</p>

        <button
          onClick={handleGmButtonClick}
          style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 2rem',
            background: '#d4af37',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto 1.5rem'
          }}
        >
          🔐 GM Controls
        </button>

        <div className="character-grid">
          {players.map((player) => (
            <div
              key={player.id}
              className="character-card"
              onClick={() => handleCharacterClick(player)}
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

              {/* Player PIN Assignment */}
              <div style={{
                background: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #444',
                marginTop: '1rem'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>🔒 Player PIN Security</h3>
                <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Assign a 4-digit PIN to protect character selection
                </p>
                <select
                  value={pinPlayerId}
                  onChange={(e) => handleLoadPin(e.target.value)}
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
                    <option key={p.id} value={p.id}>{p.name} {p.pin ? '🔒' : ''}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit PIN"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555',
                    fontSize: '1.2rem',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}
                />
                <button
                  onClick={handleSavePin}
                  disabled={!pinPlayerId || pinValue.length !== 4}
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
                  Save PIN
                </button>
              </div>

              {/* GM PIN Management */}
              <div style={{
                background: '#2a2a2a',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #444',
                marginTop: '1rem'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>🔐 GM PIN Security</h3>
                <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {gmPin ? 'Change the GM PIN for accessing these controls' : 'Set a GM PIN to protect these controls'}
                </p>
                <input
                  type="text"
                  value={newGmPin}
                  onChange={(e) => setNewGmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit GM PIN"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555',
                    fontSize: '1.2rem',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}
                />
                <input
                  type="text"
                  value={confirmGmPin}
                  onChange={(e) => setConfirmGmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Confirm GM PIN"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #555',
                    fontSize: '1.2rem',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}
                />
                <button
                  onClick={handleSetGmPin}
                  disabled={newGmPin.length !== 4 || confirmGmPin.length !== 4}
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
                  {gmPin ? 'Update GM PIN' : 'Set GM PIN'}
                </button>
                {gmPin && (
                  <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    Current PIN is set (🔒 Protected)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Entry Prompt */}
      {showPinPrompt && selectedPlayerForPin && (
        <div className="modal-overlay" onClick={handlePinCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={handlePinCancel}>×</button>
            <h2>🔒 Enter PIN</h2>
            <p style={{ color: '#999', textAlign: 'center', marginBottom: '1.5rem' }}>
              Enter PIN for <strong style={{ color: '#d4af37' }}>{selectedPlayerForPin.name}</strong>
            </p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="****"
              maxLength="4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && enteredPin.length === 4) {
                  handlePinSubmit();
                }
              }}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                background: '#1a1a1a',
                color: '#fff',
                border: '2px solid #555',
                fontSize: '2rem',
                letterSpacing: '1rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handlePinCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                disabled={enteredPin.length !== 4}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: enteredPin.length === 4 ? '#d4af37' : '#555',
                  color: enteredPin.length === 4 ? '#000' : '#999',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: enteredPin.length === 4 ? 'pointer' : 'not-allowed'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GM PIN Entry Prompt */}
      {showGmPinPrompt && (
        <div className="modal-overlay" onClick={handleGmPinCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={handleGmPinCancel}>×</button>
            <h2>🔐 GM Access</h2>
            <p style={{ color: '#999', textAlign: 'center', marginBottom: '1.5rem' }}>
              Enter GM PIN to access controls
            </p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={enteredGmPin}
              onChange={(e) => setEnteredGmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="****"
              maxLength="4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && enteredGmPin.length === 4) {
                  handleGmPinSubmit();
                }
              }}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                background: '#1a1a1a',
                color: '#fff',
                border: '2px solid #555',
                fontSize: '2rem',
                letterSpacing: '1rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleGmPinCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGmPinSubmit}
                disabled={enteredGmPin.length !== 4}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: enteredGmPin.length === 4 ? '#d4af37' : '#555',
                  color: enteredGmPin.length === 4 ? '#000' : '#999',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: enteredGmPin.length === 4 ? 'pointer' : 'not-allowed'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSelect;
