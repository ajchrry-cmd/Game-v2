import React, { useState } from 'react';
import './Manager.css';

function DiceRoller({ onClose }) {
  const [numDice, setNumDice] = useState(1);
  const [dieType, setDieType] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState('normal'); // 'normal', 'advantage', 'disadvantage'
  const [rollHistory, setRollHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  const rollDice = (num, sides, mod, advMode = 'normal') => {
    const rolls = [];

    if (advMode === 'advantage' && sides === 20) {
      // Roll twice, take higher
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll1, roll2);
      const chosenRoll = Math.max(roll1, roll2);
      const total = chosenRoll + mod;
      return { rolls, chosenRoll, total, modifier: mod, advantage: true };
    } else if (advMode === 'disadvantage' && sides === 20) {
      // Roll twice, take lower
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll1, roll2);
      const chosenRoll = Math.min(roll1, roll2);
      const total = chosenRoll + mod;
      return { rolls, chosenRoll, total, modifier: mod, disadvantage: true };
    } else {
      // Normal roll
      for (let i = 0; i < num; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
      const sum = rolls.reduce((acc, val) => acc + val, 0);
      const total = sum + mod;
      return { rolls, total, modifier: mod };
    }
  };

  const handleRoll = () => {
    const result = rollDice(numDice, dieType, modifier, advantage);
    const rollEntry = {
      timestamp: new Date().toLocaleTimeString(),
      dice: `${numDice}d${dieType}`,
      modifier: modifier,
      advantage: advantage,
      result: result,
    };

    setCurrentResult(rollEntry);
    setRollHistory([rollEntry, ...rollHistory.slice(0, 19)]); // Keep last 20 rolls
  };

  const handleQuickRoll = (num, sides, mod = 0) => {
    setNumDice(num);
    setDieType(sides);
    setModifier(mod);
    const result = rollDice(num, sides, mod, 'normal');
    const rollEntry = {
      timestamp: new Date().toLocaleTimeString(),
      dice: `${num}d${sides}`,
      modifier: mod,
      advantage: 'normal',
      result: result,
    };

    setCurrentResult(rollEntry);
    setRollHistory([rollEntry, ...rollHistory.slice(0, 19)]);
  };

  const formatRollResult = (entry) => {
    const { result, dice, modifier, advantage } = entry;

    if (result.advantage || result.disadvantage) {
      return (
        <div>
          <div className="roll-details">
            Rolls: [{result.rolls.join(', ')}] → {result.chosenRoll}
            {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
          </div>
          <div className="roll-type">
            {result.advantage ? '(Advantage)' : '(Disadvantage)'}
          </div>
        </div>
      );
    }

    return (
      <div className="roll-details">
        {result.rolls.length > 1 ? `[${result.rolls.join(' + ')}]` : result.rolls[0]}
        {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal dice-roller-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>🎲 Dice Roller</h2>

        <div className="manager-content">
          {/* Current Result Display */}
          {currentResult && (
            <div className="current-roll-result">
              <h3>Latest Roll</h3>
              <div className="result-display-large">
                <div className="roll-formula">
                  {currentResult.dice}
                  {currentResult.modifier !== 0 && ` ${currentResult.modifier >= 0 ? '+' : ''}${currentResult.modifier}`}
                  {currentResult.advantage !== 'normal' && ` (${currentResult.advantage})`}
                </div>
                <div className="result-total">{currentResult.result.total}</div>
                {formatRollResult(currentResult)}
              </div>
            </div>
          )}

          {/* Roll Controls */}
          <div className="dice-controls">
            <div className="form-group">
              <label>Number of Dice</label>
              <input
                type="number"
                min="1"
                max="20"
                value={numDice}
                onChange={(e) => setNumDice(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="form-group">
              <label>Die Type</label>
              <select value={dieType} onChange={(e) => setDieType(parseInt(e.target.value))}>
                <option value="4">d4</option>
                <option value="6">d6</option>
                <option value="8">d8</option>
                <option value="10">d10</option>
                <option value="12">d12</option>
                <option value="20">d20</option>
                <option value="100">d100</option>
              </select>
            </div>

            <div className="form-group">
              <label>Modifier</label>
              <input
                type="number"
                min="-99"
                max="99"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              />
            </div>

            {dieType === 20 && (
              <div className="form-group">
                <label>Advantage/Disadvantage</label>
                <select value={advantage} onChange={(e) => setAdvantage(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="advantage">Advantage</option>
                  <option value="disadvantage">Disadvantage</option>
                </select>
              </div>
            )}
          </div>

          <button className="primary roll-button" onClick={handleRoll}>
            🎲 Roll {numDice}d{dieType}{modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
          </button>

          {/* Quick Roll Buttons */}
          <div className="quick-rolls">
            <h3>Quick Rolls</h3>
            <div className="quick-roll-grid">
              <button onClick={() => handleQuickRoll(1, 4)}>d4</button>
              <button onClick={() => handleQuickRoll(1, 6)}>d6</button>
              <button onClick={() => handleQuickRoll(1, 8)}>d8</button>
              <button onClick={() => handleQuickRoll(1, 10)}>d10</button>
              <button onClick={() => handleQuickRoll(1, 12)}>d12</button>
              <button onClick={() => handleQuickRoll(1, 20)}>d20</button>
              <button onClick={() => handleQuickRoll(2, 6)}>2d6</button>
              <button onClick={() => handleQuickRoll(3, 6)}>3d6</button>
              <button onClick={() => handleQuickRoll(4, 6)}>4d6</button>
              <button onClick={() => handleQuickRoll(1, 100)}>d100</button>
            </div>
          </div>

          {/* Roll History */}
          <div className="roll-history">
            <h3>Roll History</h3>
            {rollHistory.length === 0 ? (
              <p className="empty-state">No rolls yet</p>
            ) : (
              <div className="history-list">
                {rollHistory.map((entry, index) => (
                  <div key={index} className="history-item">
                    <div className="history-time">{entry.timestamp}</div>
                    <div className="history-roll">
                      <strong>{entry.dice}</strong>
                      {entry.modifier !== 0 && ` ${entry.modifier >= 0 ? '+' : ''}${entry.modifier}`}
                      {entry.advantage !== 'normal' && ` (${entry.advantage})`}
                    </div>
                    <div className="history-result">
                      = <strong>{entry.result.total}</strong>
                    </div>
                    {formatRollResult(entry)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiceRoller;
