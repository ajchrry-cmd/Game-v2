import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function SceneManager({ onClose }) {
  const { scenes, saveScene, deleteScene, uploadImage } = useGame();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newScene, setNewScene] = useState({
    name: '',
    imageUrl: ''
  });

  const handleSaveScene = async () => {
    if (!newScene.name.trim() || !newScene.imageUrl) {
      alert('Please provide a name and upload an image');
      return;
    }
    await saveScene(newScene);
    setNewScene({ name: '', imageUrl: '' });
    setShowNewForm(false);
  };

  const handleImageUpload = async (file) => {
    const url = await uploadImage(file, 'scenes');
    if (url) {
      setNewScene({ ...newScene, imageUrl: url });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Scene Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button className="primary" onClick={() => setShowNewForm(!showNewForm)}>
              + Upload Scene
            </button>
          </div>

          {showNewForm && (
            <div className="player-form">
              <h3>New Scene</h3>
              <div className="form-group">
                <label>Scene Name</label>
                <input
                  type="text"
                  value={newScene.name}
                  onChange={(e) => setNewScene({ ...newScene, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Scene Image URL</label>
                <input
                  type="text"
                  value={newScene.imageUrl}
                  onChange={(e) => setNewScene({ ...newScene, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>Or upload a file:</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                {newScene.imageUrl && (
                  <img
                    src={newScene.imageUrl}
                    alt="Preview"
                    style={{ width: '100%', marginTop: 10, borderRadius: 4 }}
                  />
                )}
              </div>
              <div className="form-actions">
                <button className="primary" onClick={handleSaveScene}>Save Scene</button>
                <button onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="grid-list">
            {scenes.length === 0 ? (
              <p className="empty-state">No scenes uploaded yet</p>
            ) : (
              scenes.map(scene => (
                <div key={scene.id} className="grid-item">
                  <img src={scene.imageUrl} alt={scene.name} />
                  <h4>{scene.name}</h4>
                  <div className="grid-item-actions">
                    <button className="danger" onClick={() => deleteScene(scene.id)}>
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

export default SceneManager;
