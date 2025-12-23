import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { useGame } from '../../contexts/GameContext';
import { v4 as uuidv4 } from 'uuid';
import './MapEditor.css';

function MapEditor({ map, onClose }) {
  const { saveMap, uploadImage } = useGame();
  const [mapData, setMapData] = useState(
    map || {
      name: 'New Map',
      squares: [],
      backgroundColor: '#1a1a1a',
      backgroundImage: null
    }
  );
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [newSquare, setNewSquare] = useState({
    shape: 'square',
    color: '#d4af37',
    text: '',
    width: 80,
    height: 80
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving map:', mapData);
      await saveMap(mapData);
      console.log('Map saved successfully');
      alert('Map saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving map:', error);
      alert(`Error saving map: ${error.message}\n\nPlease check:\n1. Firestore is enabled in Firebase Console\n2. Firestore rules are set\n3. Browser console for details`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSquare = () => {
    const square = {
      id: uuidv4(),
      shape: newSquare.shape,
      position: { x: 200, y: 200 },
      size: { width: newSquare.width, height: newSquare.height },
      color: newSquare.color,
      text: newSquare.text,
      rotation: 0
    };
    setMapData({
      ...mapData,
      squares: [...mapData.squares, square]
    });
  };

  const handleUpdateSquare = (squareId, updates) => {
    setMapData({
      ...mapData,
      squares: mapData.squares.map(s =>
        s.id === squareId ? { ...s, ...updates } : s
      )
    });
  };

  const handleDeleteSquare = (squareId) => {
    setMapData({
      ...mapData,
      squares: mapData.squares.filter(s => s.id !== squareId)
    });
    if (selectedSquare?.id === squareId) {
      setSelectedSquare(null);
    }
  };

  const handleDrag = (squareId, e, data) => {
    handleUpdateSquare(squareId, {
      position: { x: data.x, y: data.y }
    });
  };

  const handleBackgroundUpload = async (file) => {
    const url = await uploadImage(file, 'map-backgrounds');
    if (url) {
      setMapData({ ...mapData, backgroundImage: url });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="map-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <input
            type="text"
            value={mapData.name}
            onChange={(e) => setMapData({ ...mapData, name: e.target.value })}
            className="map-name-input"
          />
          <div className="header-actions">
            <button className="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Map'}
            </button>
            <button onClick={onClose} disabled={isSaving}>Cancel</button>
          </div>
        </div>

        <div className="editor-content">
          <div className="editor-sidebar">
            <h3>Map Settings</h3>
            <div className="form-group">
              <label>Background Color</label>
              <input
                type="color"
                value={mapData.backgroundColor}
                onChange={(e) => setMapData({ ...mapData, backgroundColor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Background Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBackgroundUpload(e.target.files[0])}
              />
              {mapData.backgroundImage && (
                <button onClick={() => setMapData({ ...mapData, backgroundImage: null })}>
                  Remove Image
                </button>
              )}
            </div>

            <h3>Add Square</h3>
            <div className="form-group">
              <label>Shape</label>
              <select
                value={newSquare.shape}
                onChange={(e) => setNewSquare({ ...newSquare, shape: e.target.value })}
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="hexagon">Hexagon</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                value={newSquare.color}
                onChange={(e) => setNewSquare({ ...newSquare, color: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Text</label>
              <input
                type="text"
                value={newSquare.text}
                onChange={(e) => setNewSquare({ ...newSquare, text: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input
                type="number"
                value={newSquare.width}
                onChange={(e) => setNewSquare({ ...newSquare, width: parseInt(e.target.value) || 80 })}
                placeholder="Width"
              />
            </div>
            <button className="primary" onClick={handleAddSquare}>Add to Map</button>

            {selectedSquare && (
              <>
                <h3>Edit Selected</h3>
                <div className="form-group">
                  <label>Shape</label>
                  <select
                    value={selectedSquare.shape}
                    onChange={(e) => {
                      const updated = { ...selectedSquare, shape: e.target.value };
                      handleUpdateSquare(selectedSquare.id, { shape: e.target.value });
                      setSelectedSquare(updated);
                    }}
                  >
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={selectedSquare.color}
                    onChange={(e) => {
                      const updated = { ...selectedSquare, color: e.target.value };
                      handleUpdateSquare(selectedSquare.id, { color: e.target.value });
                      setSelectedSquare(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Text</label>
                  <input
                    type="text"
                    value={selectedSquare.text}
                    onChange={(e) => {
                      const updated = { ...selectedSquare, text: e.target.value };
                      handleUpdateSquare(selectedSquare.id, { text: e.target.value });
                      setSelectedSquare(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Rotation</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedSquare.rotation || 0}
                    onChange={(e) => {
                      const updated = { ...selectedSquare, rotation: parseInt(e.target.value) };
                      handleUpdateSquare(selectedSquare.id, { rotation: parseInt(e.target.value) });
                      setSelectedSquare(updated);
                    }}
                  />
                  <span>{selectedSquare.rotation || 0}°</span>
                </div>
                <button className="danger" onClick={() => handleDeleteSquare(selectedSquare.id)}>
                  Delete Square
                </button>
              </>
            )}
          </div>

          <div className="editor-canvas-container">
            <div
              className="editor-canvas"
              style={{
                backgroundColor: mapData.backgroundColor,
                backgroundImage: mapData.backgroundImage ? `url(${mapData.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {mapData.squares.map(square => (
                <Draggable
                  key={square.id}
                  position={square.position}
                  onDrag={(e, data) => handleDrag(square.id, e, data)}
                >
                  <div
                    className={`editor-square ${selectedSquare?.id === square.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSquare(square)}
                    style={{
                      width: square.size.width,
                      height: square.size.height,
                      backgroundColor: square.color,
                      borderRadius: square.shape === 'circle' ? '50%' : square.shape === 'hexagon' ? '10%' : '0',
                      transform: `rotate(${square.rotation || 0}deg)`,
                      clipPath: square.shape === 'hexagon'
                        ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                        : square.shape === 'triangle'
                        ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                        : 'none'
                    }}
                  >
                    {square.text && <span>{square.text}</span>}
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapEditor;
