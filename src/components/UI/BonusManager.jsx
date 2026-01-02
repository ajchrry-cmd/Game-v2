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
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);

  const handleSaveBonus = async () => {
    if (!newBonus.name.trim()) {
      alert('Please enter a name for the mob');
      return;
    }
    if (!newBonus.imageUrl) {
      alert('Please upload an image for the mob');
      return;
    }
    if (uploading) {
      alert('Please wait for the image to finish uploading');
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
    if (!editingBonus.name.trim()) {
      alert('Please enter a name for the mob');
      return;
    }
    if (!editingBonus.imageUrl) {
      alert('Please upload an image for the mob');
      return;
    }
    if (editUploading) {
      alert('Please wait for the image to finish uploading');
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
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, 'bonuses');
      if (url) {
        setNewBonus({ ...newBonus, imageUrl: url });
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageUpload = async (file) => {
    if (!file) return;

    setEditUploading(true);
    try {
      const url = await uploadImage(file, 'bonuses');
      if (url) {
        setEditingBonus({ ...editingBonus, imageUrl: url });
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setEditUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Mobs Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button className="primary" onClick={() => setShowNewForm(!showNewForm)}>
              + Create Mob
            </button>
          </div>

          {showNewForm && (
            <div className="player-form">
              <h3>New Mob</h3>
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
                <label>Image URL</label>
                <input
                  type="text"
                  value={newBonus.imageUrl}
                  onChange={(e) => setNewBonus({ ...newBonus, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  disabled={uploading}
                />
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>Or upload a file:</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading && <p style={{ color: '#d4af37', marginTop: 10 }}>Uploading image...</p>}
                {newBonus.imageUrl && !uploading && (
                  <div style={{ marginTop: 10 }}>
                    <img src={newBonus.imageUrl} alt="Preview" style={{ width: 100, borderRadius: 8 }} />
                    <p style={{ color: '#4caf50', fontSize: '0.9rem', marginTop: 5 }}>✓ Image ready</p>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  className="primary"
                  onClick={handleSaveBonus}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Mob'}
                </button>
                <button onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {editingBonus && (
            <div className="player-form">
              <h3>Edit Mob</h3>
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
                <label>Image URL</label>
                <input
                  type="text"
                  value={editingBonus.imageUrl}
                  onChange={(e) => setEditingBonus({ ...editingBonus, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  disabled={editUploading}
                />
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>Or upload a file:</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditImageUpload(e.target.files[0])}
                  disabled={editUploading}
                />
                {editUploading && <p style={{ color: '#d4af37', marginTop: 10 }}>Uploading image...</p>}
                {editingBonus.imageUrl && !editUploading && (
                  <div style={{ marginTop: 10 }}>
                    <img src={editingBonus.imageUrl} alt="Preview" style={{ width: 100, borderRadius: 8 }} />
                    <p style={{ color: '#4caf50', fontSize: '0.9rem', marginTop: 5 }}>✓ Image ready</p>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  className="primary"
                  onClick={handleUpdateBonus}
                  disabled={editUploading}
                >
                  {editUploading ? 'Uploading...' : 'Update Mob'}
                </button>
                <button onClick={() => setEditingBonus(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="grid-list">
            {bonuses.length === 0 ? (
              <p className="empty-state">No mobs created yet</p>
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
