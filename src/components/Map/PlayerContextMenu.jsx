import React, { useState, useEffect, useRef } from 'react';
import AttachedMobEditor from '../UI/AttachedMobEditor';
import './PlayerContextMenu.css';

function PlayerContextMenu({
  player,
  position,
  onClose,
  items,
  bonuses,
  onUpdatePlayer,
  onSendMessage,
  onFlashScreen
}) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [flashColor, setFlashColor] = useState('#ff0000');
  const [showMobEditor, setShowMobEditor] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAddItem = (itemId) => {
    const currentInventory = player.inventory || [];
    const inventorySlots = player.inventorySlots || 4;

    if (currentInventory.length >= inventorySlots) {
      alert('Inventory is full!');
      return;
    }

    onUpdatePlayer(player.id, {
      inventory: [...currentInventory, itemId]
    });
    onClose();
  };

  const handleRemoveItem = (index) => {
    const currentInventory = player.inventory || [];
    const newInventory = [...currentInventory];
    newInventory.splice(index, 1);

    onUpdatePlayer(player.id, {
      inventory: newInventory
    });
    onClose();
  };

  const handleAddStatusEffect = (effect) => {
    const currentEffects = player.statusEffects || [];
    if (!currentEffects.includes(effect)) {
      onUpdatePlayer(player.id, {
        statusEffects: [...currentEffects, effect]
      });
    }
    setCustomEffect('');
    onClose();
  };

  const handleRemoveStatusEffect = (effect) => {
    const currentEffects = player.statusEffects || [];
    onUpdatePlayer(player.id, {
      statusEffects: currentEffects.filter(e => e !== effect)
    });
    onClose();
  };

  const handleAddPartyMember = (bonusId) => {
    const currentParty = player.party || [];
    const partySlots = player.partySlots || 0;

    if (partySlots === 0) {
      alert('This player has no party slots!');
      return;
    }

    if (currentParty.length >= partySlots) {
      alert('Party is full!');
      return;
    }

    onUpdatePlayer(player.id, {
      party: [...currentParty, bonusId]
    });
    onClose();
  };

  const handleRemovePartyMember = (index) => {
    const currentParty = player.party || [];
    const newParty = [...currentParty];
    newParty.splice(index, 1);

    onUpdatePlayer(player.id, {
      party: newParty
    });
    onClose();
  };

  const handleAdjustStat = (stat, amount) => {
    const currentValue = player[stat] || 0;
    onUpdatePlayer(player.id, {
      [stat]: Math.max(0, currentValue + amount)
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onSendMessage(player.id, messageText);
    setMessageText('');
    onClose();
  };

  const handleFlashScreen = () => {
    onFlashScreen(player.id, flashColor);
    onClose();
  };

  const handleOpenMobEditor = () => {
    setShowMobEditor(true);
  };

  const handleSaveAttachedMobs = (attachedMobs) => {
    onUpdatePlayer(player.id, {
      attachedMobs
    });
    setShowMobEditor(false);
    onClose();
  };

  const playerInventory = player.inventory || [];
  const playerParty = player.party || [];
  const playerEffects = player.statusEffects || [];

  const commonEffects = [
    'Poisoned', 'Stunned', 'Blessed', 'Cursed', 'Invisible',
    'Haste', 'Slow', 'Paralyzed', 'Charmed', 'Frightened',
    'Blinded', 'Deafened', 'Prone', 'Restrained', 'Unconscious'
  ];

  return (
    <>
      <div
        ref={menuRef}
        className="player-context-menu"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
      <div className="context-menu-header">
        <strong>{player.name}</strong>
      </div>

      {/* Main menu */}
      {!activeSubmenu && (
        <div className="context-menu-items">
          <button onClick={() => setActiveSubmenu('addItem')}>
            🎒 Add Item
          </button>

          {playerInventory.length > 0 && (
            <button onClick={() => setActiveSubmenu('removeItem')}>
              ➖ Remove Item
            </button>
          )}

          <button onClick={() => setActiveSubmenu('addEffect')}>
            ✨ Add Status Effect
          </button>

          {playerEffects.length > 0 && (
            <button onClick={() => setActiveSubmenu('removeEffect')}>
              ➖ Remove Status Effect
            </button>
          )}

          {(player.partySlots || 0) > 0 && (
            <button onClick={() => setActiveSubmenu('addParty')}>
              👥 Add Party Member
            </button>
          )}

          {playerParty.length > 0 && (
            <button onClick={() => setActiveSubmenu('removeParty')}>
              ➖ Remove Party Member
            </button>
          )}

          <div className="menu-divider"></div>

          {(player.attachedMobs && player.attachedMobs.length > 0) && (
            <button onClick={handleOpenMobEditor}>
              🎯 Position Attached Mobs
            </button>
          )}

          <button onClick={() => setActiveSubmenu('adjustPower')}>
            ⚔️ Adjust Power
          </button>

          <button onClick={() => setActiveSubmenu('adjustMoney')}>
            💰 Adjust Money
          </button>

          <div className="menu-divider"></div>

          <button onClick={() => setActiveSubmenu('message')}>
            💬 Send Secret Message
          </button>

          <button onClick={() => setActiveSubmenu('flash')}>
            ⚡ Flash Screen
          </button>
        </div>
      )}

      {/* Add Item Submenu */}
      {activeSubmenu === 'addItem' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Select Item to Add</div>
          <div className="context-menu-items scrollable">
            {items.length === 0 ? (
              <p className="empty-state">No items available</p>
            ) : (
              items.map(item => (
                <button key={item.id} onClick={() => handleAddItem(item.id)}>
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="menu-icon" />}
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Remove Item Submenu */}
      {activeSubmenu === 'removeItem' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Select Item to Remove</div>
          <div className="context-menu-items scrollable">
            {playerInventory.map((itemId, index) => {
              const item = items.find(i => i.id === itemId);
              return (
                <button key={index} onClick={() => handleRemoveItem(index)}>
                  {item?.imageUrl && <img src={item.imageUrl} alt="" className="menu-icon" />}
                  {item?.name || 'Unknown Item'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Status Effect Submenu */}
      {activeSubmenu === 'addEffect' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Add Status Effect</div>
          <div className="context-menu-items scrollable">
            <div className="custom-input-group">
              <input
                type="text"
                placeholder="Custom effect..."
                value={customEffect}
                onChange={(e) => setCustomEffect(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customEffect.trim()) {
                    handleAddStatusEffect(customEffect.trim());
                  }
                }}
              />
              <button
                onClick={() => customEffect.trim() && handleAddStatusEffect(customEffect.trim())}
                disabled={!customEffect.trim()}
              >
                Add
              </button>
            </div>
            <div className="menu-divider"></div>
            {commonEffects.map(effect => (
              <button key={effect} onClick={() => handleAddStatusEffect(effect)}>
                {effect}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Remove Status Effect Submenu */}
      {activeSubmenu === 'removeEffect' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Remove Status Effect</div>
          <div className="context-menu-items scrollable">
            {playerEffects.map(effect => (
              <button key={effect} onClick={() => handleRemoveStatusEffect(effect)}>
                {effect}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Party Member Submenu */}
      {activeSubmenu === 'addParty' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Add Party Member</div>
          <div className="context-menu-items scrollable">
            {bonuses.length === 0 ? (
              <p className="empty-state">No mobs available</p>
            ) : (
              bonuses.map(bonus => (
                <button key={bonus.id} onClick={() => handleAddPartyMember(bonus.id)}>
                  {bonus.imageUrl && <img src={bonus.imageUrl} alt="" className="menu-icon" />}
                  {bonus.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Remove Party Member Submenu */}
      {activeSubmenu === 'removeParty' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Remove Party Member</div>
          <div className="context-menu-items scrollable">
            {playerParty.map((bonusId, index) => {
              const bonus = bonuses.find(b => b.id === bonusId);
              return (
                <button key={index} onClick={() => handleRemovePartyMember(index)}>
                  {bonus?.imageUrl && <img src={bonus.imageUrl} alt="" className="menu-icon" />}
                  {bonus?.name || 'Unknown Mob'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Adjust Power Submenu */}
      {activeSubmenu === 'adjustPower' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Adjust Power</div>
          <div className="current-value">Current: {player.power || 0}</div>
          <div className="context-menu-items">
            <button onClick={() => handleAdjustStat('power', 100)}>+100</button>
            <button onClick={() => handleAdjustStat('power', 50)}>+50</button>
            <button onClick={() => handleAdjustStat('power', 10)}>+10</button>
            <button onClick={() => handleAdjustStat('power', 1)}>+1</button>
            <div className="menu-divider"></div>
            <button onClick={() => handleAdjustStat('power', -1)}>-1</button>
            <button onClick={() => handleAdjustStat('power', -10)}>-10</button>
            <button onClick={() => handleAdjustStat('power', -50)}>-50</button>
            <button onClick={() => handleAdjustStat('power', -100)}>-100</button>
          </div>
        </div>
      )}

      {/* Adjust Money Submenu */}
      {activeSubmenu === 'adjustMoney' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Adjust Money</div>
          <div className="current-value">Current: {player.money || 0}</div>
          <div className="context-menu-items">
            <button onClick={() => handleAdjustStat('money', 1000)}>+1000</button>
            <button onClick={() => handleAdjustStat('money', 500)}>+500</button>
            <button onClick={() => handleAdjustStat('money', 100)}>+100</button>
            <button onClick={() => handleAdjustStat('money', 10)}>+10</button>
            <div className="menu-divider"></div>
            <button onClick={() => handleAdjustStat('money', -10)}>-10</button>
            <button onClick={() => handleAdjustStat('money', -100)}>-100</button>
            <button onClick={() => handleAdjustStat('money', -500)}>-500</button>
            <button onClick={() => handleAdjustStat('money', -1000)}>-1000</button>
          </div>
        </div>
      )}

      {/* Send Message Submenu */}
      {activeSubmenu === 'message' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Send Secret Message</div>
          <div className="message-input-area">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your secret message..."
              rows="4"
            />
            <button
              className="primary"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              📨 Send Message
            </button>
          </div>
        </div>
      )}

      {/* Flash Screen Submenu */}
      {activeSubmenu === 'flash' && (
        <div className="context-submenu">
          <button className="submenu-back" onClick={() => setActiveSubmenu(null)}>
            ← Back
          </button>
          <div className="submenu-title">Flash Screen</div>
          <div className="flash-input-area">
            <label>Flash Color</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={flashColor}
                onChange={(e) => setFlashColor(e.target.value)}
              />
              <span>{flashColor}</span>
            </div>
            <button
              className="primary"
              onClick={handleFlashScreen}
            >
              ⚡ Flash Screen
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Attached Mob Editor */}
      {showMobEditor && (
        <AttachedMobEditor
          player={player}
          onClose={() => setShowMobEditor(false)}
          onSave={handleSaveAttachedMobs}
        />
      )}
    </>
  );
}

export default PlayerContextMenu;
