import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Log for debugging mobile issues
    console.log('LandingPage loaded:', {
      href: window.location.href,
      hash: window.location.hash,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent
    });
  }, []);

  const handlePlayerJoin = () => {
    navigate('/join');
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1 className="landing-title">🎲 DND Game Master</h1>
        <p className="landing-subtitle">Welcome to the D&D Game Master Companion</p>

        <div className="landing-options">
          <div className="landing-card">
            <div className="card-icon">👥</div>
            <h2>Join as Player</h2>
            <p>Enter your Game Master's room code to view your character sheet</p>
            <button className="landing-btn player-btn" onClick={handlePlayerJoin}>
              Join Game
            </button>
          </div>

          <div className="landing-card">
            <div className="card-icon">🎭</div>
            <h2>Game Master</h2>
            <p>Access the full Game Master interface to manage your campaign</p>
            <button className="landing-btn gm-btn" onClick={() => navigate('/')}>
              GM Interface
            </button>
          </div>
        </div>

        <div className="landing-help">
          <p className="help-text">
            <strong>Players:</strong> Click "Join Game" and enter the room code provided by your Game Master
          </p>
          <p className="help-text">
            <strong>Game Masters:</strong> Click "GM Interface" to create sessions and manage your game
          </p>
        </div>

        {/* Debug info - remove in production */}
        <div className="debug-info">
          <details>
            <summary>Debug Info (for troubleshooting)</summary>
            <pre>{JSON.stringify({
              url: window.location.href,
              pathname: window.location.pathname,
              hash: window.location.hash,
              userAgent: navigator.userAgent
            }, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
