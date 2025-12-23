import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import MapEditor from '../Map/MapEditor';
import './Manager.css';

function MapManager({ onClose }) {
  const { maps, deleteMap, setCurrentMapId, currentMapId } = useGame();
  const [editingMap, setEditingMap] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const handleLoadMap = (mapId) => {
    setCurrentMapId(mapId);
    onClose();
  };

  const handleEditMap = (map) => {
    setEditingMap(map);
  };

  const handleCreateNew = () => {
    setCreatingNew(true);
  };

  const closeEditor = () => {
    setEditingMap(null);
    setCreatingNew(false);
  };

  if (editingMap || creatingNew) {
    return <MapEditor map={editingMap} onClose={closeEditor} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Map Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button className="primary" onClick={handleCreateNew}>
              + Create Map
            </button>
          </div>

          <div className="item-list">
            {maps.length === 0 ? (
              <p className="empty-state">No maps created yet</p>
            ) : (
              maps.map(map => (
                <div
                  key={map.id}
                  className={`item-card ${currentMapId === map.id ? 'active' : ''}`}
                >
                  <div className="item-info">
                    <h3>{map.name}</h3>
                    <p className="item-meta">{map.squares?.length || 0} squares</p>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEditMap(map)}>Edit</button>
                    <button className="primary" onClick={() => handleLoadMap(map.id)}>
                      Load
                    </button>
                    <button className="danger" onClick={() => deleteMap(map.id)}>
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

export default MapManager;
