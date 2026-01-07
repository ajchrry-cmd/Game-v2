import React from 'react';
import './PlayerView.css';

function CharacterSelect({ players, sessionName, onSelectCharacter }) {
  if (players.length === 0) {
    return (
      <div className="character-select">
        <div className="select-container">
          <h1>🎲 {sessionName || 'Game Session'}</h1>
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
        <h1>🎲 {sessionName || 'Game Session'}</h1>
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
    </div>
  );
}

export default CharacterSelect;
