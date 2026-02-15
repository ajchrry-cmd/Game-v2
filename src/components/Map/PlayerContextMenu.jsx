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
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [searchFilter, setSearchFilter] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let newX = position.x;
    let newY = position.y;
    if (rect.right > vw) newX = vw - rect.width - 10;
    if (newX < 10) newX = 10;
    if (rect.bottom > vh) newY = vh - rect.height - 10;
    if (newY < 10) newY = 10;
    if (newX !== position.x || newY !== position.y) {
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position, activeSubmenu]);

  useEffect(() => {
    if (showMobEditor) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showMobEditor]);

  // Reset search when changing submenus
  useEffect(() => {
    setSearchFilter('');
  }, [activeSubmenu]);

  const handleAddItem = (itemId) => {
    const currentInventory = player.inventory || [];
    const inventorySlots = player.inventorySlots || 4;
    if (currentInventory.length >= inventorySlots) {
      alert('Inventory is full!');
      return;
    }
    onUpdatePlayer(player.id, { inventory: [...currentInventory, itemId] });
    setActiveSubmenu(null);
  };

  const handleRemoveItem = (index) => {
    const currentInventory = player.inventory || [];
    const newInventory = [...currentInventory];
    newInventory.splice(index, 1);
    onUpdatePlayer(player.id, { inventory: newInventory });
  };

  const handleAddStatusEffect = (effect) => {
    const currentEffects = player.statusEffects || [];
    if (!currentEffects.includes(effect)) {
      onUpdatePlayer(player.id, { statusEffects: [...currentEffects, effect] });
    }
    setCustomEffect('');
    setActiveSubmenu(null);
  };

  const handleRemoveStatusEffect = (effect) => {
    const currentEffects = player.statusEffects || [];
    onUpdatePlayer(player.id, { statusEffects: currentEffects.filter(e => e !== effect) });
  };

  const handleAddPartyMember = (bonusId) => {
    const currentParty = player.party || [];
    const partySlots = player.partySlots || 0;
    if (partySlots === 0) { alert('No party slots!'); return; }
    if (currentParty.length >= partySlots) { alert('Party is full!'); return; }
    onUpdatePlayer(player.id, { party: [...currentParty, bonusId] });
    setActiveSubmenu(null);
  };

  const handleRemovePartyMember = (index) => {
    const currentParty = player.party || [];
    const newParty = [...currentParty];
    newParty.splice(index, 1);
    onUpdatePlayer(player.id, { party: newParty });
  };

  const handleStatChange = (stat, value) => {
    onUpdatePlayer(player.id, { [stat]: Math.max(0, value) });
  };

  const handleCustomStatChange = (index, value) => {
    const customStats = [...(player.customStats || [])];
    customStats[index] = { ...customStats[index], value: Math.max(0, value) };
    onUpdatePlayer(player.id, { customStats });
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

  const handleSaveAttachedMobs = (attachedMobs) => {
    onUpdatePlayer(player.id, { attachedMobs });
    setShowMobEditor(false);
    onClose();
  };

  const playerInventory = player.inventory || [];
  const playerParty = player.party || [];
  const playerEffects = player.statusEffects || [];
  const customStats = player.customStats || [];
  const partySlots = player.partySlots || 0;

  const commonEffects = [
    'Poisoned', 'Stunned', 'Blessed', 'Cursed', 'Invisible',
    'Haste', 'Slow', 'Paralyzed', 'Charmed', 'Frightened',
    'Blinded', 'Deafened', 'Prone', 'Restrained', 'Unconscious'
  ];

  // Inline stat adjuster component
  const StatAdjuster = ({ label, value, onChange }) => (
    <div className="pcm-stat-row">
      <span className="pcm-stat-label">{label}</span>
      <div className="pcm-stat-controls">
        <button className="pcm-adj-btn" onClick={() => onChange(value - 10)}>-10</button>
        <button className="pcm-adj-btn" onClick={() => onChange(value - 1)}>-1</button>
        <input
          type="number"
          className="pcm-stat-input"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          onClick={(e) => e.stopPropagation()}
        />
        <button className="pcm-adj-btn pcm-adj-plus" onClick={() => onChange(value + 1)}>+1</button>
        <button className="pcm-adj-btn pcm-adj-plus" onClick={() => onChange(value + 10)}>+10</button>
      </div>
    </div>
  );

  // ---- MAIN MENU (no submenu active) ----
  const renderMainMenu = () => (
    <>
      {/* Player header with avatar */}
      <div className="pcm-header">
        <div className="pcm-avatar">
          {player.iconType === 'custom' && player.iconUrl ? (
            <img src={player.iconUrl} alt={player.name} />
          ) : (
            <div className="pcm-avatar-circle" style={{ backgroundColor: player.iconColor || '#d4af37' }} />
          )}
        </div>
        <div className="pcm-header-info">
          <strong className="pcm-player-name">{player.name}</strong>
          <span className="pcm-header-summary">
            Pwr {player.power || 0} &middot; Gold {player.money || 0}
          </span>
        </div>
      </div>

      <div className="pcm-body">
        {/* ---- STATS SECTION ---- */}
        <div className="pcm-section">
          <div className="pcm-section-title">Stats</div>
          <StatAdjuster
            label="Power"
            value={player.power || 0}
            onChange={(v) => handleStatChange('power', v)}
          />
          <StatAdjuster
            label="Money"
            value={player.money || 0}
            onChange={(v) => handleStatChange('money', v)}
          />
          {customStats.map((stat, index) => (
            <StatAdjuster
              key={index}
              label={stat.name}
              value={stat.value || 0}
              onChange={(v) => handleCustomStatChange(index, v)}
            />
          ))}
        </div>

        {/* ---- STATUS EFFECTS ---- */}
        <div className="pcm-section">
          <div className="pcm-section-title">
            Status Effects
            <button className="pcm-section-action" onClick={() => setActiveSubmenu('addEffect')}>+ Add</button>
          </div>
          {playerEffects.length > 0 ? (
            <div className="pcm-badges">
              {playerEffects.map((effect, i) => (
                <span key={i} className="pcm-badge">
                  {effect}
                  <button className="pcm-badge-remove" onClick={() => handleRemoveStatusEffect(effect)}>&times;</button>
                </span>
              ))}
            </div>
          ) : (
            <span className="pcm-empty">No active effects</span>
          )}
        </div>

        {/* ---- INVENTORY ---- */}
        <div className="pcm-section">
          <div className="pcm-section-title">
            Inventory ({playerInventory.length}/{player.inventorySlots || 4})
            <button className="pcm-section-action" onClick={() => setActiveSubmenu('addItem')}>+ Add</button>
          </div>
          {playerInventory.length > 0 ? (
            <div className="pcm-item-list">
              {playerInventory.map((itemId, index) => {
                const item = items.find(i => i.id === itemId);
                return (
                  <div key={index} className="pcm-item-row">
                    {item?.imageUrl && <img src={item.imageUrl} alt="" className="pcm-item-icon" />}
                    <span className="pcm-item-name">{item?.name || 'Unknown'}</span>
                    <button className="pcm-item-remove" onClick={() => handleRemoveItem(index)}>&times;</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="pcm-empty">Empty</span>
          )}
        </div>

        {/* ---- PARTY ---- */}
        {partySlots > 0 && (
          <div className="pcm-section">
            <div className="pcm-section-title">
              Party ({playerParty.length}/{partySlots})
              <button className="pcm-section-action" onClick={() => setActiveSubmenu('addParty')}>+ Add</button>
            </div>
            {playerParty.length > 0 ? (
              <div className="pcm-item-list">
                {playerParty.map((bonusId, index) => {
                  const bonus = bonuses.find(b => b.id === bonusId);
                  return (
                    <div key={index} className="pcm-item-row">
                      {bonus?.imageUrl && <img src={bonus.imageUrl} alt="" className="pcm-item-icon" />}
                      <span className="pcm-item-name">{bonus?.name || 'Unknown'}</span>
                      <button className="pcm-item-remove" onClick={() => handleRemovePartyMember(index)}>&times;</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="pcm-empty">No party members</span>
            )}
          </div>
        )}

        {/* ---- ACTIONS ---- */}
        <div className="pcm-section">
          <div className="pcm-section-title">Actions</div>
          <div className="pcm-actions">
            <button className="pcm-action-btn" onClick={() => setShowMobEditor(true)}>
              Attached Mobs
            </button>
            <button className="pcm-action-btn" onClick={() => setActiveSubmenu('message')}>
              Secret Message
            </button>
            <button className="pcm-action-btn" onClick={() => setActiveSubmenu('flash')}>
              Flash Screen
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ---- SUBMENU: Add Item ----
  const renderAddItem = () => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
    return (
      <div className="pcm-submenu">
        <button className="pcm-back" onClick={() => setActiveSubmenu(null)}>&larr; Back</button>
        <div className="pcm-sub-header">Add Item to {player.name}</div>
        <div className="pcm-search-wrap">
          <input
            type="text"
            className="pcm-search"
            placeholder="Search items..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            autoFocus
          />
        </div>
        <div className="pcm-list">
          {filtered.length === 0 ? (
            <span className="pcm-empty">No items found</span>
          ) : (
            filtered.map(item => (
              <button key={item.id} className="pcm-list-btn" onClick={() => handleAddItem(item.id)}>
                {item.imageUrl && <img src={item.imageUrl} alt="" className="pcm-item-icon" />}
                {item.name}
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  // ---- SUBMENU: Add Effect ----
  const renderAddEffect = () => {
    const filteredEffects = commonEffects.filter(e =>
      e.toLowerCase().includes(searchFilter.toLowerCase()) && !playerEffects.includes(e)
    );
    return (
      <div className="pcm-submenu">
        <button className="pcm-back" onClick={() => setActiveSubmenu(null)}>&larr; Back</button>
        <div className="pcm-sub-header">Add Status Effect</div>
        <div className="pcm-custom-add">
          <input
            type="text"
            placeholder="Custom effect..."
            value={customEffect}
            onChange={(e) => setCustomEffect(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && customEffect.trim() && handleAddStatusEffect(customEffect.trim())}
          />
          <button
            onClick={() => customEffect.trim() && handleAddStatusEffect(customEffect.trim())}
            disabled={!customEffect.trim()}
          >Add</button>
        </div>
        <div className="pcm-search-wrap">
          <input
            type="text"
            className="pcm-search"
            placeholder="Filter effects..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <div className="pcm-list">
          {filteredEffects.map(effect => (
            <button key={effect} className="pcm-list-btn" onClick={() => handleAddStatusEffect(effect)}>
              {effect}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ---- SUBMENU: Add Party Member ----
  const renderAddParty = () => {
    const filtered = bonuses.filter(b =>
      b.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
    return (
      <div className="pcm-submenu">
        <button className="pcm-back" onClick={() => setActiveSubmenu(null)}>&larr; Back</button>
        <div className="pcm-sub-header">Add Party Member</div>
        <div className="pcm-search-wrap">
          <input
            type="text"
            className="pcm-search"
            placeholder="Search mobs..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            autoFocus
          />
        </div>
        <div className="pcm-list">
          {filtered.length === 0 ? (
            <span className="pcm-empty">No mobs found</span>
          ) : (
            filtered.map(bonus => (
              <button key={bonus.id} className="pcm-list-btn" onClick={() => handleAddPartyMember(bonus.id)}>
                {bonus.imageUrl && <img src={bonus.imageUrl} alt="" className="pcm-item-icon" />}
                {bonus.name}
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  // ---- SUBMENU: Message ----
  const renderMessage = () => (
    <div className="pcm-submenu">
      <button className="pcm-back" onClick={() => setActiveSubmenu(null)}>&larr; Back</button>
      <div className="pcm-sub-header">Send Secret Message to {player.name}</div>
      <div className="pcm-msg-area">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your secret message..."
          rows="4"
          autoFocus
        />
        <button className="pcm-primary-btn" onClick={handleSendMessage} disabled={!messageText.trim()}>
          Send Message
        </button>
      </div>
    </div>
  );

  // ---- SUBMENU: Flash Screen ----
  const renderFlash = () => (
    <div className="pcm-submenu">
      <button className="pcm-back" onClick={() => setActiveSubmenu(null)}>&larr; Back</button>
      <div className="pcm-sub-header">Flash {player.name}'s Screen</div>
      <div className="pcm-flash-area">
        <div className="pcm-color-row">
          <span>Color</span>
          <input type="color" value={flashColor} onChange={(e) => setFlashColor(e.target.value)} />
          <span className="pcm-color-hex">{flashColor}</span>
        </div>
        <button className="pcm-primary-btn" onClick={handleFlashScreen}>
          Flash Screen
        </button>
      </div>
    </div>
  );

  const submenuRenderers = {
    addItem: renderAddItem,
    addEffect: renderAddEffect,
    addParty: renderAddParty,
    message: renderMessage,
    flash: renderFlash
  };

  return (
    <>
      <div
        ref={menuRef}
        className="player-context-menu"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          display: showMobEditor ? 'none' : 'block'
        }}
      >
        {activeSubmenu && submenuRenderers[activeSubmenu]
          ? submenuRenderers[activeSubmenu]()
          : renderMainMenu()
        }
      </div>

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
