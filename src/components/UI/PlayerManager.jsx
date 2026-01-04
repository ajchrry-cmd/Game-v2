import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import AttachedMobEditor from './AttachedMobEditor';
import './Manager.css';

function PlayerManager({ onClose }) {
  const {
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    items,
    uploadImage,
    currentSession,
    bonuses
  } = useGame();

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingMobsForPlayer, setEditingMobsForPlayer] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    power: 0,
    money: 0,
    iconType: 'token',
    iconColor: '#FF0000',
    iconUrl: null
  });

  if (!currentSession) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h2>Player Manager</h2>
          <p className="empty-state">Please create or load a session first</p>
        </div>
      </div>
    );
  }

  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) return;
    if (players.length >= 6) {
      alert('Maximum 6 players allowed');
      return;
    }
    addPlayer(newPlayer);
    setNewPlayer({
      name: '',
      power: 0,
      money: 0,
      iconType: 'token',
      iconColor: '#FF0000',
      iconUrl: null
    });
    setShowNewForm(false);
  };

  const handleUpdatePlayer = (playerId, field, value) => {
    updatePlayer(playerId, { [field]: value });
  };

  const handleAddItem = (playerId, itemId) => {
    const player = players.find(p => p.id === playerId);
    if (player.inventory.length >= 4) {
      alert('Inventory full (max 4 items)');
      return;
    }
    updatePlayer(playerId, {
      inventory: [...player.inventory, itemId]
    });
  };

  const handleRemoveItem = (playerId, itemIndex) => {
    const player = players.find(p => p.id === playerId);
    const newInventory = player.inventory.filter((_, i) => i !== itemIndex);
    updatePlayer(playerId, { inventory: newInventory });
  };

  const handleIconUpload = async (playerId, file) => {
    const url = await uploadImage(file, 'player-icons');
    if (url) {
      updatePlayer(playerId, { iconType: 'custom', iconUrl: url });
    }
  };

  const handleNewPlayerIconUpload = async (file) => {
    const url = await uploadImage(file, 'player-icons');
    if (url) {
      setNewPlayer({ ...newPlayer, iconType: 'custom', iconUrl: url });
    }
  };

  const shopItems = items.filter(item => item.inShop);

  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Player Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button
              className="primary"
              onClick={() => setShowNewForm(!showNewForm)}
              disabled={players.length >= 6}
            >
              + Add Player {players.length >= 6 && '(Max Reached)'}
            </button>
          </div>

          {showNewForm && (
            <div className="player-form">
              <h3>New Player</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Power</label>
                <input
                  type="number"
                  value={newPlayer.power}
                  onChange={(e) => setNewPlayer({ ...newPlayer, power: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Money</label>
                <input
                  type="number"
                  value={newPlayer.money}
                  onChange={(e) => setNewPlayer({ ...newPlayer, money: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Icon Type</label>
                <select
                  value={newPlayer.iconType}
                  onChange={(e) => setNewPlayer({ ...newPlayer, iconType: e.target.value })}
                >
                  <option value="token">Color Token</option>
                  <option value="custom">Custom Image</option>
                </select>
              </div>
              {newPlayer.iconType === 'token' ? (
                <div className="form-group">
                  <label>Icon Color</label>
                  <input
                    type="color"
                    value={newPlayer.iconColor}
                    onChange={(e) => setNewPlayer({ ...newPlayer, iconColor: e.target.value })}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Icon Image URL</label>
                  <input
                    type="text"
                    value={newPlayer.iconUrl || ''}
                    onChange={(e) => setNewPlayer({ ...newPlayer, iconUrl: e.target.value })}
                    placeholder="https://example.com/icon.png"
                  />
                  <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>Or upload a file:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleNewPlayerIconUpload(e.target.files[0])}
                  />
                  {newPlayer.iconUrl && <img src={newPlayer.iconUrl} alt="Preview" style={{ width: 50, height: 50, marginTop: 10, borderRadius: 8 }} />}
                </div>
              )}
              <div className="form-actions">
                <button className="primary" onClick={handleAddPlayer}>Add Player</button>
                <button onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="item-list">
            {players.length === 0 ? (
              <p className="empty-state">No players added yet</p>
            ) : (
              players.map(player => (
                <div key={player.id} className="player-card">
                  <div className="player-header">
                    <h3>{player.name}</h3>
                    <button className="danger" onClick={() => removePlayer(player.id)}>
                      Remove
                    </button>
                  </div>

                  <div className="player-stats">
                    <div className="stat-group">
                      <label>Power</label>
                      <input
                        type="number"
                        value={player.power}
                        onChange={(e) => handleUpdatePlayer(player.id, 'power', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="stat-group">
                      <label>Money</label>
                      <input
                        type="number"
                        value={player.money}
                        onChange={(e) => handleUpdatePlayer(player.id, 'money', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="player-icon-section">
                    <label>Icon</label>
                    <div className="icon-controls">
                      <select
                        value={player.iconType}
                        onChange={(e) => handleUpdatePlayer(player.id, 'iconType', e.target.value)}
                      >
                        <option value="token">Color Token</option>
                        <option value="custom">Custom Image</option>
                      </select>
                      {player.iconType === 'token' ? (
                        <input
                          type="color"
                          value={player.iconColor}
                          onChange={(e) => handleUpdatePlayer(player.id, 'iconColor', e.target.value)}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                          <input
                            type="text"
                            value={player.iconUrl || ''}
                            onChange={(e) => handleUpdatePlayer(player.id, 'iconUrl', e.target.value)}
                            placeholder="Image URL"
                            style={{ width: '100%' }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleIconUpload(player.id, e.target.files[0])}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="player-inventory">
                    <label>Inventory ({player.inventory.length}/4)</label>
                    <div className="inventory-items">
                      {player.inventory.map((itemId, index) => {
                        const item = items.find(i => i.id === itemId);
                        return item ? (
                          <div key={index} className="inventory-item">
                            <span>{item.name}</span>
                            <button
                              className="remove-item"
                              onClick={() => handleRemoveItem(player.id, index)}
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                      {player.inventory.length < 4 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddItem(player.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">+ Add Item</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="player-inventory">
                    <label>Attached Mobs ({(player.attachedMobs || []).length})</label>
                    <div className="inventory-items">
                      {(player.attachedMobs || []).map((attachedMob, index) => {
                        const mobId = typeof attachedMob === 'string' ? attachedMob : attachedMob.mobId;
                        const mob = bonuses.find(b => b.id === mobId);
                        return mob ? (
                          <div key={index} className="inventory-item">
                            {mob.imageUrl && (
                              <img
                                src={mob.imageUrl}
                                alt={mob.name}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  objectFit: 'contain',
                                  marginRight: '8px'
                                }}
                              />
                            )}
                            <span>{mob.name}</span>
                            <button
                              className="remove-item"
                              onClick={() => {
                                const newAttachedMobs = (player.attachedMobs || []).filter((_, i) => i !== index);
                                updatePlayer(player.id, { attachedMobs: newAttachedMobs });
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                      {(player.attachedMobs || []).length < 3 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const newAttachedMob = {
                                mobId: e.target.value,
                                offset: { x: 50, y: -50 } // Default position: top-right
                              };
                              const newAttachedMobs = [...(player.attachedMobs || []), newAttachedMob];
                              updatePlayer(player.id, { attachedMobs: newAttachedMobs });
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">+ Add Mob</option>
                          {bonuses.map(mob => (
                            <option key={mob.id} value={mob.id}>
                              {mob.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {(player.attachedMobs || []).length > 0 && (
                      <button
                        className="primary"
                        onClick={() => setEditingMobsForPlayer(player)}
                        style={{ marginTop: '0.5rem', width: '100%' }}
                      >
                        Position Attached Mobs
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

    {editingMobsForPlayer && (
      <AttachedMobEditor
        player={editingMobsForPlayer}
        onClose={() => setEditingMobsForPlayer(null)}
        onSave={(attachedMobs) => {
          updatePlayer(editingMobsForPlayer.id, { attachedMobs });
        }}
      />
    )}
  </>
  );
}

export default PlayerManager;
