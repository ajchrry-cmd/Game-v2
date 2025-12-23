import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function BonusManager({ onClose }) {
  const { bonuses, saveBonus, deleteBonus, uploadImage } = useGame();
  const [editingBonus, setEditingBonus] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBonus, setNewBonus] = useState({
    name: '',
    imageUrl: ''
  });

  const handleSaveBonus = async () => {
    if (!newBonus.name.trim()) return;
    if (!newBonus.imageUrl) {
      alert('Please upload an image for the bonus item');
      return;
    }
    await saveBonus(newBonus);
    setNewBonus({
      name: '',
      imageUrl: ''
    });
    setShowNewForm(false);
  };

  const handleUpdateBonus = async () => {
    if (!editingBonus.name.trim()) return;
    if (!editingBonus.imageUrl) {
      alert('Please upload an image for the bonus item');
      return;
    }
    await saveBonus(editingBonus);
    setEditingBonus(null);
  };

  const handleStartEdit = (bonus) => {
    setEditingBonus({ ...bonus });
    setShowNewForm(false);
  };

  const handleImageUpload = async (file) => {
    const url = await uploadImage(file, 'bonuses');
    if (url) {
      setNewBonus({ ...newBonus, imageUrl: url });
    }
  };

  const handleEditImageUpload = async (file) => {
    const url = await uploadImage(file, 'bonuses');
    if (url) {
      setEditingBonus({ ...editingBonus, imageUrl: url });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Bonus Items Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button className="primary" onClick={() => setShowNewForm(!showNewForm)}>
              + Create Bonus Item
            </button>
          </div>

          {showNewForm && (
            <div className="player-form">
              <h3>New Bonus Item</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newBonus.name}
                  onChange={(e) => setNewBonus({ ...newBonus, name: e.target.value })}
                  placeholder="e.g., Dragon, Castle, Tree"
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                {newBonus.imageUrl && (
                  <img src={newBonus.imageUrl} alt="Preview" style={{ width: 100, marginTop: 10 }} />
                )}
              </div>
              <div className="form-actions">
                <button className="primary" onClick={handleSaveBonus}>Save Bonus Item</button>
                <button onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {editingBonus && (
            <div className="player-form">
              <h3>Edit Bonus Item</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingBonus.name}
                  onChange={(e) => setEditingBonus({ ...editingBonus, name: e.target.value })}
                  placeholder="e.g., Dragon, Castle, Tree"
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditImageUpload(e.target.files[0])}
                />
                {editingBonus.imageUrl && (
                  <img src={editingBonus.imageUrl} alt="Preview" style={{ width: 100, marginTop: 10 }} />
                )}
              </div>
              <div className="form-actions">
                <button className="primary" onClick={handleUpdateBonus}>Update Bonus Item</button>
                <button onClick={() => setEditingBonus(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="grid-list">
            {bonuses.length === 0 ? (
              <p className="empty-state">No bonus items created yet</p>
            ) : (
              bonuses.map(bonus => (
                <div key={bonus.id} className="grid-item">
                  {bonus.imageUrl && <img src={bonus.imageUrl} alt={bonus.name} />}
                  <h4>{bonus.name}</h4>
                  <div className="grid-item-actions">
                    <button onClick={() => handleStartEdit(bonus)}>
                      Edit
                    </button>
                    <button className="danger" onClick={() => deleteBonus(bonus.id)}>
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

export default BonusManager;
