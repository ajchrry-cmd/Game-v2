import React from 'react';
import './PlayerView.css';

function PlayerCharacter({ player, sessionName, onChangeCharacter }) {
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

      {/* Character Info */}
      <div className="character-info">
        {player.imageUrl && (
          <div className="character-avatar-large">
            <img src={player.imageUrl} alt={player.name} />
          </div>
        )}

        <h1 className="character-name">{player.name}</h1>

        {/* Main Stats */}
        <div className="stats-grid">
          <div className="stat-card hp">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <span className="stat-label">Health</span>
              <span className="stat-value">{player.hp || 0}</span>
            </div>
          </div>

          <div className="stat-card mana">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <span className="stat-label">Mana</span>
              <span className="stat-value">{player.mana || 0}</span>
            </div>
          </div>

          <div className="stat-card xp">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <span className="stat-label">XP</span>
              <span className="stat-value">{player.xp || 0}</span>
            </div>
          </div>

          <div className="stat-card gold">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-label">Gold</span>
              <span className="stat-value">{player.gold || 0}</span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="inventory-section">
          <h3>🎒 Inventory</h3>
          {player.inventory && player.inventory.length > 0 ? (
            <div className="inventory-grid">
              {player.inventory.map((item, index) => (
                <div key={index} className="inventory-item">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} />
                  )}
                  <div className="item-name">{item.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No items yet</p>
          )}
        </div>

        {/* Party */}
        {player.party && player.party.length > 0 && (
          <div className="party-section">
            <h3>👥 Party</h3>
            <div className="party-grid">
              {player.party.map((member, index) => (
                <div key={index} className="party-member">
                  {member.imageUrl && (
                    <img src={member.imageUrl} alt={member.name} />
                  )}
                  <div className="member-name">{member.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerCharacter;
