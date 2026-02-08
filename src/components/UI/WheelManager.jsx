import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function WheelManager({ onClose }) {
  const { wheels, saveWheel, deleteWheel } = useGame();
  const [editingWheel, setEditingWheel] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [newWheel, setNewWheel] = useState({
    name: '',
    type: 'regular',
    suspense: 5,
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
      suspense: 5,
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

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex, isEditing = false) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const sourceSegments = isEditing ? editingWheel.segments : newWheel.segments;
    const newSegments = [...sourceSegments];
    const draggedSegment = newSegments[draggedIndex];

    // Remove from old position
    newSegments.splice(draggedIndex, 1);
    // Insert at new position
    newSegments.splice(dropIndex, 0, draggedSegment);

    if (isEditing) {
      setEditingWheel({ ...editingWheel, segments: newSegments });
    } else {
      setNewWheel({ ...newWheel, segments: newSegments });
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
                <label>Suspense Level: {newWheel.suspense || 5}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newWheel.suspense || 5}
                  onChange={(e) => setNewWheel({ ...newWheel, suspense: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>
                  {(newWheel.suspense || 5) <= 3 ? 'Quick spin (low drama)' :
                   (newWheel.suspense || 5) <= 7 ? 'Normal spin (medium drama)' :
                   'Long spin (high drama)'}
                </p>
              </div>

              <div className="form-group">
                <label>Segments (drag to reorder)</label>
                <div className="wheel-segments-list">
                  {newWheel.segments.map((segment, index) => (
                    <div
                      key={index}
                      className={`wheel-segment-row ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index, false)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="wheel-drag-handle" title="Drag to reorder">⋮⋮</div>
                      <span className="wheel-segment-num">#{index + 1}</span>
                      <div
                        className="wheel-color-swatch"
                        style={{ backgroundColor: segment.color }}
                        onClick={() => document.getElementById(`new-color-${index}`).click()}
                        title="Click to change color"
                      />
                      <input
                        id={`new-color-${index}`}
                        type="color"
                        value={segment.color}
                        onChange={(e) => handleUpdateSegment(index, 'color', e.target.value)}
                        className="wheel-color-input"
                      />
                      <input
                        type="text"
                        placeholder="Segment name"
                        value={segment.text}
                        onChange={(e) => handleUpdateSegment(index, 'text', e.target.value)}
                        className="wheel-name-input"
                      />
                      <div className="wheel-weight-section">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={segment.weight || 1}
                          onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1)}
                          className="wheel-weight-slider"
                          title={`Weight: ${segment.weight || 1}`}
                        />
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={segment.weight || 1}
                          onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1)}
                          className="wheel-weight-input"
                        />
                        <span className="wheel-percentage">{calculatePercentage(newWheel.segments, segment.weight || 1)}%</span>
                      </div>
                      <button
                        className="danger wheel-remove-btn"
                        onClick={() => handleRemoveSegment(index)}
                        disabled={newWheel.segments.length <= 2}
                        title={newWheel.segments.length <= 2 ? "Wheel must have at least 2 segments" : "Remove segment"}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button className="wheel-add-segment" onClick={handleAddSegment}>
                  <span className="add-icon">+</span> Add New Segment
                </button>
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
                <label>Suspense Level: {editingWheel.suspense || 5}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={editingWheel.suspense || 5}
                  onChange={(e) => setEditingWheel({ ...editingWheel, suspense: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>
                  {(editingWheel.suspense || 5) <= 3 ? 'Quick spin (low drama)' :
                   (editingWheel.suspense || 5) <= 7 ? 'Normal spin (medium drama)' :
                   'Long spin (high drama)'}
                </p>
              </div>

              <div className="form-group">
                <label>Segments (drag to reorder)</label>
                <div className="wheel-segments-list">
                  {editingWheel.segments.map((segment, index) => (
                    <div
                      key={index}
                      className={`wheel-segment-row ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index, true)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="wheel-drag-handle" title="Drag to reorder">⋮⋮</div>
                      <span className="wheel-segment-num">#{index + 1}</span>
                      <div
                        className="wheel-color-swatch"
                        style={{ backgroundColor: segment.color }}
                        onClick={() => document.getElementById(`edit-color-${index}`).click()}
                        title="Click to change color"
                      />
                      <input
                        id={`edit-color-${index}`}
                        type="color"
                        value={segment.color}
                        onChange={(e) => handleUpdateSegment(index, 'color', e.target.value, true)}
                        className="wheel-color-input"
                      />
                      <input
                        type="text"
                        placeholder="Segment name"
                        value={segment.text}
                        onChange={(e) => handleUpdateSegment(index, 'text', e.target.value, true)}
                        className="wheel-name-input"
                      />
                      <div className="wheel-weight-section">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={segment.weight || 1}
                          onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1, true)}
                          className="wheel-weight-slider"
                          title={`Weight: ${segment.weight || 1}`}
                        />
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={segment.weight || 1}
                          onChange={(e) => handleUpdateSegment(index, 'weight', parseInt(e.target.value) || 1, true)}
                          className="wheel-weight-input"
                        />
                        <span className="wheel-percentage">{calculatePercentage(editingWheel.segments, segment.weight || 1)}%</span>
                      </div>
                      <button
                        className="danger wheel-remove-btn"
                        onClick={() => handleRemoveSegment(index, true)}
                        disabled={editingWheel.segments.length <= 2}
                        title={editingWheel.segments.length <= 2 ? "Wheel must have at least 2 segments" : "Remove segment"}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button className="wheel-add-segment" onClick={() => handleAddSegment(true)}>
                  <span className="add-icon">+</span> Add New Segment
                </button>
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
