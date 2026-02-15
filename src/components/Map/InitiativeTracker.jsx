import React, { useState } from 'react';
import './InitiativeTracker.css';

function InitiativeTracker({ tracker, setTracker, players }) {
  const { combatActive, round, currentTurnIndex, entries } = tracker;
  const [expanded, setExpanded] = useState(false);
  const [addName, setAddName] = useState('');
  const [addInit, setAddInit] = useState('');

  const update = (patch) => setTracker({ ...tracker, ...patch });

  // ---- Combat lifecycle ----
  const startCombat = () => {
    // Auto-populate from players if empty
    if (entries.length === 0) {
      const playerEntries = players.map(p => ({
        id: p.id,
        name: p.name,
        initiative: 0,
        type: 'player',
        playerId: p.id
      }));
      update({ combatActive: true, round: 1, currentTurnIndex: 0, entries: playerEntries });
    } else {
      update({ combatActive: true, round: 1, currentTurnIndex: 0 });
    }
    setExpanded(true);
  };

  const endCombat = () => {
    update({ combatActive: false, round: 1, currentTurnIndex: 0, entries: [] });
  };

  const nextTurn = () => {
    if (entries.length === 0) return;
    let nextIndex = currentTurnIndex + 1;
    let nextRound = round;
    if (nextIndex >= entries.length) {
      nextIndex = 0;
      nextRound = round + 1;
    }
    update({ currentTurnIndex: nextIndex, round: nextRound });
  };

  const prevTurn = () => {
    if (entries.length === 0) return;
    let prevIndex = currentTurnIndex - 1;
    let prevRound = round;
    if (prevIndex < 0) {
      prevIndex = entries.length - 1;
      prevRound = Math.max(1, round - 1);
    }
    update({ currentTurnIndex: prevIndex, round: prevRound });
  };

  // ---- Entry management ----
  const addEntry = () => {
    const name = addName.trim();
    if (!name) return;
    const init = parseInt(addInit) || 0;
    const newEntry = {
      id: `npc-${Date.now()}`,
      name,
      initiative: init,
      type: 'npc'
    };
    const newEntries = [...entries, newEntry].sort((a, b) => b.initiative - a.initiative);
    // Adjust currentTurnIndex if insertion changed position
    const currentEntry = entries[currentTurnIndex];
    const newIndex = currentEntry ? newEntries.findIndex(e => e.id === currentEntry.id) : 0;
    update({ entries: newEntries, currentTurnIndex: Math.max(0, newIndex) });
    setAddName('');
    setAddInit('');
  };

  const addPlayersToTracker = () => {
    const existingIds = new Set(entries.map(e => e.playerId || e.id));
    const newPlayerEntries = players
      .filter(p => !existingIds.has(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        initiative: 0,
        type: 'player',
        playerId: p.id
      }));
    if (newPlayerEntries.length > 0) {
      update({ entries: [...entries, ...newPlayerEntries] });
    }
  };

  const removeEntry = (entryId) => {
    const newEntries = entries.filter(e => e.id !== entryId);
    const newIndex = Math.min(currentTurnIndex, Math.max(0, newEntries.length - 1));
    update({ entries: newEntries, currentTurnIndex: newIndex });
  };

  const setInitiative = (entryId, value) => {
    const currentEntry = entries[currentTurnIndex];
    const newEntries = entries.map(e =>
      e.id === entryId ? { ...e, initiative: parseInt(value) || 0 } : e
    );
    update({ entries: newEntries });
  };

  const sortByInitiative = () => {
    const currentEntry = entries[currentTurnIndex];
    const sorted = [...entries].sort((a, b) => b.initiative - a.initiative);
    const newIndex = currentEntry ? sorted.findIndex(e => e.id === currentEntry.id) : 0;
    update({ entries: sorted, currentTurnIndex: Math.max(0, newIndex) });
  };

  const rollAllInitiative = () => {
    const currentEntry = entries[currentTurnIndex];
    const rolled = entries.map(e => ({
      ...e,
      initiative: Math.floor(Math.random() * 20) + 1
    }));
    const sorted = rolled.sort((a, b) => b.initiative - a.initiative);
    const newIndex = currentEntry ? sorted.findIndex(e => e.id === currentEntry.id) : 0;
    update({ entries: sorted, currentTurnIndex: Math.max(0, newIndex) });
  };

  const moveEntry = (index, direction) => {
    const newEntries = [...entries];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newEntries.length) return;
    [newEntries[index], newEntries[targetIndex]] = [newEntries[targetIndex], newEntries[index]];
    // Track current turn
    let newTurnIndex = currentTurnIndex;
    if (currentTurnIndex === index) newTurnIndex = targetIndex;
    else if (currentTurnIndex === targetIndex) newTurnIndex = index;
    update({ entries: newEntries, currentTurnIndex: newTurnIndex });
  };

  // ---- Current turn info for scene bar ----
  const currentEntry = entries[currentTurnIndex];

  // ---- Not in combat: show start button ----
  if (!combatActive) {
    return (
      <button className="init-start-btn" onClick={startCombat} title="Start Combat Encounter">
        Start Combat
      </button>
    );
  }

  // ---- In combat: scene bar widget + expandable panel ----
  return (
    <div className="init-tracker">
      {/* Compact bar (always visible) */}
      <div className="init-bar" onClick={() => setExpanded(!expanded)}>
        <span className="init-round">R{round}</span>
        <button className="init-nav" onClick={(e) => { e.stopPropagation(); prevTurn(); }} title="Previous Turn">&lsaquo;</button>
        <span className="init-current" title={currentEntry?.name || '—'}>
          {currentEntry?.name || '—'}
        </span>
        <button className="init-nav" onClick={(e) => { e.stopPropagation(); nextTurn(); }} title="Next Turn">&rsaquo;</button>
        <button className="init-end" onClick={(e) => { e.stopPropagation(); endCombat(); }} title="End Combat">&times;</button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="init-panel">
          <div className="init-panel-header">
            <span>Turn Order</span>
            <div className="init-panel-actions">
              <button onClick={rollAllInitiative} title="Roll d20 for all">Roll All</button>
              <button onClick={sortByInitiative} title="Sort by initiative">Sort</button>
              <button onClick={addPlayersToTracker} title="Add missing players">+ Players</button>
            </div>
          </div>

          <div className="init-entries">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`init-entry ${index === currentTurnIndex ? 'active' : ''} ${entry.type === 'npc' ? 'npc' : ''}`}
              >
                <div className="init-entry-order">
                  <button className="init-move" onClick={() => moveEntry(index, -1)} disabled={index === 0}>&uarr;</button>
                  <button className="init-move" onClick={() => moveEntry(index, 1)} disabled={index === entries.length - 1}>&darr;</button>
                </div>
                <input
                  type="number"
                  className="init-entry-val"
                  value={entry.initiative}
                  onChange={(e) => setInitiative(entry.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="init-entry-name">{entry.name}</span>
                <span className="init-entry-type">{entry.type === 'npc' ? 'NPC' : ''}</span>
                <button className="init-entry-remove" onClick={() => removeEntry(entry.id)}>&times;</button>
              </div>
            ))}
          </div>

          {/* Add NPC/Mob */}
          <div className="init-add-row">
            <input
              type="text"
              className="init-add-name"
              placeholder="Name..."
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            />
            <input
              type="number"
              className="init-add-init"
              placeholder="Init"
              value={addInit}
              onChange={(e) => setAddInit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            />
            <button className="init-add-btn" onClick={addEntry} disabled={!addName.trim()}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InitiativeTracker;
