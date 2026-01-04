import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function WheelManager({ onClose }) {
  const { wheels, saveWheel, deleteWheel } = useGame();
  const [editingWheel, setEditingWheel] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWheel, setNewWheel] = useState({
    name: '',
    type: 'regular',
    segments: [
      { text: 'Option 1', color: '#FF6B6B', weight: 1 },
      { text: 'Option 2', color: '#4ECDC4', weight: 1 },
      { text: 'Option 3', color: '#45B7D1', weight: 1 },
      { text: 'Option 4', color: '#FFA07A', weight: 1 }
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
      type: 'regular',
      segments: [
        { text: 'Option 1', color: '#FF6B6B', weight: 1 },
        { text: 'Option 2', color: '#4ECDC4', weight: 1 },
        { text: 'Option 3', color: '#45B7D1', weight: 1 },
        { text: 'Option 4', color: '#FFA07A', weight: 1 }
      ]
    });
    setShowNewForm(false);
  };

  const handleUpdateWheel = async () => {
    if (!editingWheel.name.trim()) return;
    if (editingWheel.segments.length < 2) {
      alert('Wheel must have at least 2 segments');
      return;
    }
    await saveWheel(editingWheel);
    setEditingWheel(null);
  };

  const handleStartEdit = (wheel) => {
    setEditingWheel({ ...wheel });
    setShowNewForm(false);
  };

  const handleUpdateSegment = (index, field, value, isEditing = false) => {
    if (isEditing) {
      const newSegments = [...editingWheel.segments];
      newSegments[index] = { ...newSegments[index], [field]: value };
      setEditingWheel({ ...editingWheel, segments: newSegments });
    } else {
      const newSegments = [...newWheel.segments];
      newSegments[index] = { ...newSegments[index], [field]: value };
      setNewWheel({ ...newWheel, segments: newSegments });
    }
  };

  const handleAddSegment = (isEditing = false) => {
    if (isEditing) {
      setEditingWheel({
        ...editingWheel,
        segments: [
          ...editingWheel.segments,
          { text: `Option ${editingWheel.segments.length + 1}`, color: '#' + Math.floor(Math.random()*16777215).toString(16), weight: 1 }
        ]
      });
    } else {
      setNewWheel({
        ...newWheel,
        segments: [
          ...newWheel.segments,
          { text: `Option ${newWheel.segments.length + 1}`, color: '#' + Math.floor(Math.random()*16777215).toString(16), weight: 1 }
        ]
      });
    }
  };

  const calculatePercentage = (segments, weight) => {
    const totalWeight = segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  const handleRemoveSegment = (index, isEditing = false) => {
    const segments = isEditing ? editingWheel.segments : newWheel.segments;
    if (segments.length <= 2) {
      alert('Wheel must have at least 2 segments');
      return;
    }
    if (isEditing) {
      setEditingWheel({
        ...editingWheel,
        segments: editingWheel.segments.filter((_, i) => i !== index)
      });
    } else {
      setNewWheel({
        ...newWheel,
        segments: newWheel.segments.filter((_, i) => i !== index)
      });
    }
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
                <label>Wheel Type</label>
                <select
                  value={newWheel.type}
                  onChange={(e) => setNewWheel({ ...newWheel, type: e.target.value })}
                >
                  <option value="regular">Regular Wheel</option>
                  <option value="battle">Battle Wheel (editable on screen)</option>
                  <option value="janky">Janky Wheel (bumpy/jagged)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Segments (with weight/percentage)</label>
                {newWheel.segments.map((segment, index) => (
                  <div key={index} className="segment-row-extended">
                    <input
                      type="text"
                      placeholder="Text"
                      value={segment.text}
                      onChange={(e) => handleUpdateSegment(index, 'text', e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <input
                      type="color"
                      value={segment.color}
                      onChange={(e) => handleUpdateSegment(index, 'color', e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Weight"
                      value={segment.weight || 1}
                      onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1)}
                      style={{ width: '70px' }}
                    />
                    <span className="percentage-display">{calculatePercentage(newWheel.segments, segment.weight || 1)}%</span>
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

          {editingWheel && (
            <div className="player-form">
              <h3>Edit Wheel</h3>
              <div className="form-group">
                <label>Wheel Name</label>
                <input
                  type="text"
                  value={editingWheel.name}
                  onChange={(e) => setEditingWheel({ ...editingWheel, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Wheel Type</label>
                <select
                  value={editingWheel.type || 'regular'}
                  onChange={(e) => setEditingWheel({ ...editingWheel, type: e.target.value })}
                >
                  <option value="regular">Regular Wheel</option>
                  <option value="battle">Battle Wheel (editable on screen)</option>
                  <option value="janky">Janky Wheel (bumpy/jagged)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Segments (with weight/percentage)</label>
                {editingWheel.segments.map((segment, index) => (
                  <div key={index} className="segment-row-extended">
                    <input
                      type="text"
                      placeholder="Text"
                      value={segment.text}
                      onChange={(e) => handleUpdateSegment(index, 'text', e.target.value, true)}
                      style={{ flex: 2 }}
                    />
                    <input
                      type="color"
                      value={segment.color}
                      onChange={(e) => handleUpdateSegment(index, 'color', e.target.value, true)}
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Weight"
                      value={segment.weight || 1}
                      onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1, true)}
                      style={{ width: '70px' }}
                    />
                    <span className="percentage-display">{calculatePercentage(editingWheel.segments, segment.weight || 1)}%</span>
                    <button
                      className="danger"
                      onClick={() => handleRemoveSegment(index, true)}
                      disabled={editingWheel.segments.length <= 2}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={() => handleAddSegment(true)}>+ Add Segment</button>
              </div>

              <div className="form-actions">
                <button className="primary" onClick={handleUpdateWheel}>Update Wheel</button>
                <button onClick={() => setEditingWheel(null)}>Cancel</button>
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
                    <button onClick={() => handleStartEdit(wheel)}>
                      Edit
                    </button>
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
