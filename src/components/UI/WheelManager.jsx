import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function WheelManager({ onClose }) {
  const { wheels, saveWheel, deleteWheel } = useGame();
  const [editingWheel, setEditingWheel] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWheel, setNewWheel] = useState({
    name: '',
    segments: [
      { text: 'Option 1', color: '#FF6B6B' },
      { text: 'Option 2', color: '#4ECDC4' },
      { text: 'Option 3', color: '#45B7D1' },
      { text: 'Option 4', color: '#FFA07A' }
    ]
  });

  const handleSaveWheel = async () => {
    if (!newWheel.name.trim()) return;
    if (newWheel.segments.length < 2) {
      alert('Wheel must have at least 2 segments');
      return;
    }
    await saveWheel({ ...newWheel, lastResult: null });
    setNewWheel({
      name: '',
      segments: [
        { text: 'Option 1', color: '#FF6B6B' },
        { text: 'Option 2', color: '#4ECDC4' },
        { text: 'Option 3', color: '#45B7D1' },
        { text: 'Option 4', color: '#FFA07A' }
      ]
    });
    setShowNewForm(false);
  };

  const handleUpdateSegment = (index, field, value) => {
    const newSegments = [...newWheel.segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setNewWheel({ ...newWheel, segments: newSegments });
  };

  const handleAddSegment = () => {
    setNewWheel({
      ...newWheel,
      segments: [
        ...newWheel.segments,
        { text: `Option ${newWheel.segments.length + 1}`, color: '#' + Math.floor(Math.random()*16777215).toString(16) }
      ]
    });
  };

  const handleRemoveSegment = (index) => {
    if (newWheel.segments.length <= 2) {
      alert('Wheel must have at least 2 segments');
      return;
    }
    setNewWheel({
      ...newWheel,
      segments: newWheel.segments.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Wheel Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button className="primary" onClick={() => setShowNewForm(!showNewForm)}>
              + Create Wheel
            </button>
          </div>

          {showNewForm && (
            <div className="player-form">
              <h3>New Wheel</h3>
              <div className="form-group">
                <label>Wheel Name</label>
                <input
                  type="text"
                  value={newWheel.name}
                  onChange={(e) => setNewWheel({ ...newWheel, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Segments</label>
                {newWheel.segments.map((segment, index) => (
                  <div key={index} className="segment-row">
                    <input
                      type="text"
                      placeholder="Text"
                      value={segment.text}
                      onChange={(e) => handleUpdateSegment(index, 'text', e.target.value)}
                    />
                    <input
                      type="color"
                      value={segment.color}
                      onChange={(e) => handleUpdateSegment(index, 'color', e.target.value)}
                    />
                    <button
                      className="danger"
                      onClick={() => handleRemoveSegment(index)}
                      disabled={newWheel.segments.length <= 2}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={handleAddSegment}>+ Add Segment</button>
              </div>

              <div className="form-actions">
                <button className="primary" onClick={handleSaveWheel}>Save Wheel</button>
                <button onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="item-list">
            {wheels.length === 0 ? (
              <p className="empty-state">No wheels created yet</p>
            ) : (
              wheels.map(wheel => (
                <div key={wheel.id} className="item-card">
                  <div className="item-info">
                    <h3>{wheel.name}</h3>
                    <p className="item-meta">{wheel.segments.length} segments</p>
                  </div>
                  <div className="item-actions">
                    <button className="danger" onClick={() => deleteWheel(wheel.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WheelManager;
