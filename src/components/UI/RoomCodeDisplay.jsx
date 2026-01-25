import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import QRCode from 'qrcode';
import './Manager.css';
import './RoomCodeDisplay.css';

function RoomCodeDisplay({ onClose }) {
  const { currentSession } = useGame();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (currentSession) {
      // Use Vite's BASE_URL for reliable cross-platform URL construction
      const baseUrl = import.meta.env.BASE_URL;
      const origin = window.location.origin;
      const playerUrl = `${origin}${baseUrl}#/join`;

      // Generate QR code using qrcode library
      QRCode.toDataURL(playerUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => {
          setQrCodeUrl(url);
          console.log('QR Code generated successfully');
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
        });

      // Debug logging
      console.log('Player URL components:', {
        origin,
        baseUrl,
        finalUrl: playerUrl,
        userAgent: navigator.userAgent
      });
    }
  }, [currentSession]);

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
  // Construct the player URL using Vite's BASE_URL for consistency
  const baseUrl = import.meta.env.BASE_URL;
  const origin = window.location.origin;
  const playerUrl = `${origin}${baseUrl}#/join`;

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

          {/* QR Code */}
          <div className="qr-section">
            <h3>Scan to Join</h3>
            {qrCodeUrl && (
              <div className="qr-code-container">
                <img src={qrCodeUrl} alt="QR Code to join game" className="qr-code-image" />
              </div>
            )}
            <p className="help-text">Players can scan this QR code with their phone camera</p>
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
