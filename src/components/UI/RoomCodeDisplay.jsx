import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';
import './RoomCodeDisplay.css';

function RoomCodeDisplay({ onClose }) {
  const { currentSession } = useGame();
  const [copied, setCopied] = useState(false);

  if (!currentSession) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal room-code-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h2>Player Join Info</h2>
          <p className="error-message">No active session. Please create or load a session first.</p>
          <div className="form-actions">
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const roomCode = currentSession.id.slice(0, 6).toUpperCase();
  const playerUrl = `${window.location.origin}/Game-v2/#/join`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal room-code-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>📱 Player Access</h2>

        <div className="room-code-content">
          <p className="info-text">Share this information with your players</p>

          {/* Room Code */}
          <div className="code-section">
            <h3>Room Code</h3>
            <div className="code-display">
              <span className="code-value">{roomCode}</span>
              <button
                onClick={() => copyToClipboard(roomCode)}
                className="copy-btn"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="help-text">Players can enter this code at the join screen</p>
          </div>

          {/* Join URL */}
          <div className="url-section">
            <h3>Join Link</h3>
            <div className="url-display">
              <input
                type="text"
                value={playerUrl}
                readOnly
                className="url-input"
              />
              <button
                onClick={() => copyToClipboard(playerUrl)}
                className="copy-btn"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="help-text">Players visit this URL and enter the room code</p>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h3>How Players Join</h3>
            <ol className="instructions-list">
              <li>Player opens <strong>{playerUrl}</strong> on their device</li>
              <li>Player enters room code: <strong>{roomCode}</strong></li>
              <li>Player selects their character</li>
              <li>Player can now view their character stats in real-time!</li>
            </ol>
          </div>

          {/* Session Info */}
          <div className="session-info">
            <p><strong>Session:</strong> {currentSession.name}</p>
            <p><strong>Players:</strong> {currentSession.players?.length || 0}</p>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default RoomCodeDisplay;
