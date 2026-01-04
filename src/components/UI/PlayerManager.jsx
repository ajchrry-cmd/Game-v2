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
    iconUrl: null,
    inventorySlots: 4,
    customStats: [],
    partySlots: 0,
    party: [],
    statusEffects: []
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
      iconUrl: null,
      inventorySlots: 4,
      customStats: [],
      partySlots: 0,
      party: [],
      statusEffects: []
    });
    setShowNewForm(false);
  };

  const handleUpdatePlayer = (playerId, field, value) => {
    updatePlayer(playerId, { [field]: value });
  };

  const handleAddItem = (playerId, itemId) => {
    const player = players.find(p => p.id === playerId);
    const maxSlots = player.inventorySlots || 4;
    if (player.inventory.length >= maxSlots) {
      alert(`Inventory full (max ${maxSlots} items)`);
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

  const handleAddCustomStat = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if ((player.customStats || []).length >= 4) {
      alert('Maximum 4 custom stats allowed');
      return;
    }
    const customStats = [...(player.customStats || []), { name: 'New Stat', value: 0 }];
    updatePlayer(playerId, { customStats });
  };

  const handleUpdateCustomStat = (playerId, index, field, value) => {
    const player = players.find(p => p.id === playerId);
    const customStats = [...(player.customStats || [])];
    customStats[index] = { ...customStats[index], [field]: value };
    updatePlayer(playerId, { customStats });
  };

  const handleRemoveCustomStat = (playerId, index) => {
    const player = players.find(p => p.id === playerId);
    const customStats = (player.customStats || []).filter((_, i) => i !== index);
    updatePlayer(playerId, { customStats });
  };

  const handleAddPartyMember = (playerId, mobId) => {
    const player = players.find(p => p.id === playerId);
    const partySlots = player.partySlots || 0;
    if ((player.party || []).length >= partySlots) {
      alert(`Party full (max ${partySlots} members)`);
      return;
    }
    const party = [...(player.party || []), mobId];
    updatePlayer(playerId, { party });
  };

  const handleRemovePartyMember = (playerId, index) => {
    const player = players.find(p => p.id === playerId);
    const party = (player.party || []).filter((_, i) => i !== index);
    updatePlayer(playerId, { party });
  };

  const handleAddStatusEffect = (playerId) => {
    const player = players.find(p => p.id === playerId);
    const statusEffects = [...(player.statusEffects || []), 'New Effect'];
    updatePlayer(playerId, { statusEffects });
  };

  const handleUpdateStatusEffect = (playerId, index, value) => {
    const player = players.find(p => p.id === playerId);
    const statusEffects = [...(player.statusEffects || [])];
    statusEffects[index] = value;
    updatePlayer(playerId, { statusEffects });
  };

  const handleRemoveStatusEffect = (playerId, index) => {
    const player = players.find(p => p.id === playerId);
    const statusEffects = (player.statusEffects || []).filter((_, i) => i !== index);
    updatePlayer(playerId, { statusEffects });
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
                  {/* Header */}
                  <div className="player-header">
                    <h3>{player.name}</h3>
                    <button className="danger" onClick={() => removePlayer(player.id)}>
                      Remove
                    </button>
                  </div>

                  {/* Basic Stats */}
                  <div className="section-card" style={{ background: 'rgba(78, 205, 196, 0.1)', borderLeft: '3px solid #4ECDC4' }}>
                    <div className="section-header">⚡ Basic Stats</div>
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
                  </div>

                  {/* Icon Section */}
                  <div className="section-card" style={{ background: 'rgba(255, 107, 107, 0.1)', borderLeft: '3px solid #FF6B6B' }}>
                    <div className="section-header">🎨 Player Icon</div>
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

                  {/* Inventory */}
                  <div className="section-card" style={{ background: 'rgba(250, 177, 160, 0.1)', borderLeft: '3px solid #FAB1A0' }}>
                    <div className="section-header">🎒 Inventory ({player.inventory.length}/{player.inventorySlots || 4})</div>
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
                      {player.inventory.length < (player.inventorySlots || 4) && (
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

                  {/* Attached Mobs */}
                  <div className="section-card" style={{ background: 'rgba(116, 185, 255, 0.1)', borderLeft: '3px solid #74B9FF' }}>
                    <div className="section-header">🐉 Attached Mobs ({(player.attachedMobs || []).length}/3)</div>
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
                                offset: { x: 1, y: -1 },
                                size: 0.6
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
                        📍 Position Attached Mobs
                      </button>
                    )}
                  </div>

                  {/* Configuration Section */}
                  <div className="section-card" style={{ background: 'rgba(212, 175, 55, 0.1)', borderLeft: '3px solid #d4af37' }}>
                    <div className="section-header">⚙️ Player Configuration</div>

                    {/* Slot Configuration */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div className="config-box">
                        <label style={{ fontSize: '0.85rem', color: '#999' }}>Inventory Slots</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={player.inventorySlots || 4}
                          onChange={(e) => updatePlayer(player.id, { inventorySlots: parseInt(e.target.value) || 4 })}
                          style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}
                        />
                      </div>
                      <div className="config-box">
                        <label style={{ fontSize: '0.85rem', color: '#999' }}>Party Slots</label>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          value={player.partySlots || 0}
                          onChange={(e) => updatePlayer(player.id, { partySlots: parseInt(e.target.value) || 0 })}
                          style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}
                        />
                      </div>
                    </div>

                    {/* Custom Stats */}
                    <div className="subsection">
                      <div className="subsection-title">📊 Custom Stats ({(player.customStats || []).length}/4)</div>
                      {(player.customStats || []).map((stat, index) => (
                        <div key={index} className="custom-stat-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Stat Name"
                            value={stat.name}
                            onChange={(e) => handleUpdateCustomStat(player.id, index, 'name', e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <input
                            type="number"
                            value={stat.value}
                            onChange={(e) => handleUpdateCustomStat(player.id, index, 'value', parseInt(e.target.value) || 0)}
                            style={{ width: '80px', textAlign: 'center' }}
                          />
                          <button
                            className="danger"
                            onClick={() => handleRemoveCustomStat(player.id, index)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {(player.customStats || []).length < 4 && (
                        <button
                          onClick={() => handleAddCustomStat(player.id)}
                          style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                        >
                          + Add Custom Stat
                        </button>
                      )}
                    </div>

                    {/* Party Members */}
                    {(player.partySlots || 0) > 0 && (
                      <div className="subsection" style={{ marginTop: '0.75rem' }}>
                        <div className="subsection-title">👥 Party ({(player.party || []).length}/{player.partySlots || 0})</div>
                        <div className="inventory-items">
                          {(player.party || []).map((mobId, index) => {
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
                                  onClick={() => handleRemovePartyMember(player.id, index)}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                          {(player.party || []).length < (player.partySlots || 0) && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddPartyMember(player.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">+ Add Party Member</option>
                              {bonuses.map(mob => (
                                <option key={mob.id} value={mob.id}>
                                  {mob.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Effects */}
                    <div className="subsection" style={{ marginTop: '0.75rem' }}>
                      <div className="subsection-title">✨ Status Effects</div>
                      {(player.statusEffects || []).map((effect, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Effect name"
                            value={effect}
                            onChange={(e) => handleUpdateStatusEffect(player.id, index, e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <button
                            className="danger"
                            onClick={() => handleRemoveStatusEffect(player.id, index)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddStatusEffect(player.id)}
                        style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                      >
                        + Add Status Effect
                      </button>
                    </div>
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
