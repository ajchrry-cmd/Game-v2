import React, { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useGame } from '../../contexts/GameContext';
import { v4 as uuidv4 } from 'uuid';
import './MapEditor.css';

function MapEditor({ map, onClose }) {
  const { saveMap, uploadImage, bonuses } = useGame();
  const [mapData, setMapData] = useState(
    map || {
      name: 'New Map',
      squares: [],
      placedMobs: [],
      backgroundColor: '#1a1a1a',
      backgroundImage: null,
      drawingData: null
    }
  );
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [newSquare, setNewSquare] = useState({
    shape: 'square',
    color: '#d4af37',
    text: '',
    textSize: 16,
    textColor: '#ffffff',
    width: 80,
    height: 80,
    lineLength: 100,
    lineThickness: 3
  });
  const [isSaving, setIsSaving] = useState(false);

  // Drawing state
  const [mode, setMode] = useState('shapes'); // 'shapes' or 'draw'
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  // Resize state
  const [resizing, setResizing] = useState(null);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  // Rotation state
  const [rotating, setRotating] = useState(null);
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0 });

  // Mob placement state
  const [selectedMobId, setSelectedMobId] = useState(null);
  const [selectedPlacedMob, setSelectedPlacedMob] = useState(null);
  const [resizingMob, setResizingMob] = useState(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setContext(ctx);

      // Set canvas size to match container
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Load existing drawing if available
      if (mapData.drawingData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = mapData.drawingData;
      }
    }
  }, [canvasRef.current]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save canvas drawing as data URL
      let drawingData = null;
      if (canvasRef.current) {
        drawingData = canvasRef.current.toDataURL();
      }

      const mapToSave = {
        ...mapData,
        drawingData
      };

      console.log('Saving map:', mapToSave);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out. Firestore may not be enabled.')), 10000)
      );

      await Promise.race([saveMap(mapToSave), timeoutPromise]);

      console.log('Map saved successfully');
      alert('Map saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving map:', error);
      const errorMessage = error.message.includes('timed out')
        ? 'Save operation timed out.\n\nFirestore is likely not enabled in your Firebase project.\n\nPlease:\n1. Go to Firebase Console\n2. Enable Firestore Database\n3. Set the security rules\n4. See SETUP.md for details'
        : `Error: ${error.message}\n\nPlease check:\n1. Firestore is enabled\n2. Firestore rules are set\n3. Internet connection\n4. Browser console for details`;
      alert(errorMessage);
      setIsSaving(false);
    }
  };

  // Helper function to get max layer index
  const getMaxLayerIndex = (mapData) => {
    const squareIndices = (mapData.squares || []).map(s => s.layerIndex || 0);
    const mobIndices = (mapData.placedMobs || []).map(m => m.layerIndex || 0);
    const allIndices = [...squareIndices, ...mobIndices];
    return allIndices.length > 0 ? Math.max(...allIndices) : 0;
  };

  const handleAddSquare = () => {
    const square = {
      id: uuidv4(),
      shape: newSquare.shape,
      position: { x: 200, y: 200 },
      size: newSquare.shape === 'line'
        ? { width: newSquare.lineLength, height: newSquare.lineThickness }
        : { width: newSquare.width, height: newSquare.height },
      color: newSquare.color,
      text: newSquare.shape === 'line' ? '' : newSquare.text,
      rotation: 0,
      lineThickness: newSquare.shape === 'line' ? newSquare.lineThickness : undefined,
      layerIndex: getMaxLayerIndex(mapData) + 1
    };
    setMapData(prevMapData => ({
      ...prevMapData,
      squares: [...prevMapData.squares, square]
    }));
  };

  const handleUpdateSquare = (squareId, updates) => {
    setMapData(prevMapData => ({
      ...prevMapData,
      squares: prevMapData.squares.map(s =>
        s.id === squareId ? { ...s, ...updates } : s
      )
    }));
  };

  const handleDeleteSquare = (squareId) => {
    setMapData(prevMapData => ({
      ...prevMapData,
      squares: prevMapData.squares.filter(s => s.id !== squareId)
    }));
    if (selectedSquare?.id === squareId) {
      setSelectedSquare(null);
    }
  };

  // Unified layer control functions
  const bringToFront = (itemId) => {
    setMapData(prevMapData => {
      const maxIndex = getMaxLayerIndex(prevMapData);

      // Check if it's a square
      const squareIndex = prevMapData.squares.findIndex(s => s.id === itemId);
      if (squareIndex !== -1) {
        const newSquares = prevMapData.squares.map(s =>
          s.id === itemId ? { ...s, layerIndex: maxIndex + 1 } : s
        );
        return { ...prevMapData, squares: newSquares };
      }

      // Check if it's a mob
      const mobIndex = (prevMapData.placedMobs || []).findIndex(m => m.id === itemId);
      if (mobIndex !== -1) {
        const newMobs = prevMapData.placedMobs.map(m =>
          m.id === itemId ? { ...m, layerIndex: maxIndex + 1 } : m
        );
        return { ...prevMapData, placedMobs: newMobs };
      }

      return prevMapData;
    });
  };

  const sendToBack = (itemId) => {
    setMapData(prevMapData => {
      // Check if it's a square
      const squareIndex = prevMapData.squares.findIndex(s => s.id === itemId);
      if (squareIndex !== -1) {
        const newSquares = prevMapData.squares.map(s =>
          s.id === itemId ? { ...s, layerIndex: 0 } : s
        );
        return { ...prevMapData, squares: newSquares };
      }

      // Check if it's a mob
      const mobIndex = (prevMapData.placedMobs || []).findIndex(m => m.id === itemId);
      if (mobIndex !== -1) {
        const newMobs = prevMapData.placedMobs.map(m =>
          m.id === itemId ? { ...m, layerIndex: 0 } : m
        );
        return { ...prevMapData, placedMobs: newMobs };
      }

      return prevMapData;
    });
  };

  const handlePlaceMob = () => {
    if (!selectedMobId) return;

    const mob = bonuses.find(b => b.id === selectedMobId);
    if (!mob) return;

    const placedMob = {
      id: uuidv4(),
      mobId: selectedMobId,
      name: mob.name,
      imageUrl: mob.imageUrl,
      position: { x: 400, y: 300 },
      size: 80,
      rotation: 0,
      layerIndex: getMaxLayerIndex(mapData) + 1
    };

    setMapData(prevMapData => ({
      ...prevMapData,
      placedMobs: [...(prevMapData.placedMobs || []), placedMob]
    }));
  };

  const handleRemoveMob = (mobPlacementId) => {
    setMapData(prevMapData => ({
      ...prevMapData,
      placedMobs: (prevMapData.placedMobs || []).filter(m => m.id !== mobPlacementId)
    }));
  };

  const handleDragMob = (mobPlacementId, e, data) => {
    setMapData(prevMapData => ({
      ...prevMapData,
      placedMobs: (prevMapData.placedMobs || []).map(m =>
        m.id === mobPlacementId
          ? { ...m, position: { x: data.x, y: data.y } }
          : m
      )
    }));
  };

  const handleMobResizeStart = (e, mobId, currentSize) => {
    e.stopPropagation();
    setResizingMob({
      id: mobId,
      startX: e.clientX,
      startY: e.clientY,
      startSize: currentSize
    });
  };

  const handleMobResizeMove = (e) => {
    if (!resizingMob) return;

    const deltaX = e.clientX - resizingMob.startX;
    const deltaY = e.clientY - resizingMob.startY;
    const delta = Math.max(deltaX, deltaY);

    const newSize = Math.max(30, resizingMob.startSize + delta);

    setMapData(prevMapData => ({
      ...prevMapData,
      placedMobs: (prevMapData.placedMobs || []).map(m =>
        m.id === resizingMob.id
          ? { ...m, size: newSize }
          : m
      )
    }));
  };

  const handleMobResizeEnd = () => {
    setResizingMob(null);
  };

  const bringForward = (itemId) => {
    setMapData(prevMapData => {
      // Get all items with their layer indices
      const allItems = [
        ...prevMapData.squares.map(s => ({ id: s.id, layerIndex: s.layerIndex || 0, type: 'square' })),
        ...(prevMapData.placedMobs || []).map(m => ({ id: m.id, layerIndex: m.layerIndex || 0, type: 'mob' }))
      ].sort((a, b) => a.layerIndex - b.layerIndex);

      const currentIndex = allItems.findIndex(item => item.id === itemId);
      if (currentIndex === -1 || currentIndex === allItems.length - 1) return prevMapData;

      const currentItem = allItems[currentIndex];
      const nextItem = allItems[currentIndex + 1];
      const newLayerIndex = nextItem.layerIndex + 0.5;

      // Update the appropriate array
      if (currentItem.type === 'square') {
        const newSquares = prevMapData.squares.map(s =>
          s.id === itemId ? { ...s, layerIndex: newLayerIndex } : s
        );
        return { ...prevMapData, squares: newSquares };
      } else {
        const newMobs = prevMapData.placedMobs.map(m =>
          m.id === itemId ? { ...m, layerIndex: newLayerIndex } : m
        );
        return { ...prevMapData, placedMobs: newMobs };
      }
    });
  };

  const sendBackward = (itemId) => {
    setMapData(prevMapData => {
      // Get all items with their layer indices
      const allItems = [
        ...prevMapData.squares.map(s => ({ id: s.id, layerIndex: s.layerIndex || 0, type: 'square' })),
        ...(prevMapData.placedMobs || []).map(m => ({ id: m.id, layerIndex: m.layerIndex || 0, type: 'mob' }))
      ].sort((a, b) => a.layerIndex - b.layerIndex);

      const currentIndex = allItems.findIndex(item => item.id === itemId);
      if (currentIndex === -1 || currentIndex === 0) return prevMapData;

      const currentItem = allItems[currentIndex];
      const prevItem = allItems[currentIndex - 1];
      const newLayerIndex = prevItem.layerIndex - 0.5;

      // Update the appropriate array
      if (currentItem.type === 'square') {
        const newSquares = prevMapData.squares.map(s =>
          s.id === itemId ? { ...s, layerIndex: newLayerIndex } : s
        );
        return { ...prevMapData, squares: newSquares };
      } else {
        const newMobs = prevMapData.placedMobs.map(m =>
          m.id === itemId ? { ...m, layerIndex: newLayerIndex } : m
        );
        return { ...prevMapData, placedMobs: newMobs };
      }
    });
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

  // Drawing functions
  const startDrawing = (e) => {
    if (mode !== 'draw' || !context) return;

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing || mode !== 'draw' || !context) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (context) {
        context.closePath();
      }
    }
  };

  const clearDrawing = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Resize functions
  const handleResizeStart = (e, squareId, currentWidth, currentHeight) => {
    e.stopPropagation();
    setResizing(squareId);
    setResizeStart({
      width: currentWidth,
      height: currentHeight,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleResizeMove = useCallback((e) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(30, resizeStart.width + deltaX);
    const newHeight = Math.max(30, resizeStart.height + deltaY);

    setMapData(prevMapData => ({
      ...prevMapData,
      squares: prevMapData.squares.map(s =>
        s.id === resizing ? { ...s, size: { width: newWidth, height: newHeight } } : s
      )
    }));

    // Update selectedSquare if it's the one being resized
    setSelectedSquare(prevSelected => {
      if (prevSelected?.id === resizing) {
        return { ...prevSelected, size: { width: newWidth, height: newHeight } };
      }
      return prevSelected;
    });
  }, [resizing, resizeStart]);

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // Rotation functions - work for both squares and mobs
  const handleRotateStart = (e, itemId, position, size, currentRotation) => {
    e.stopPropagation();
    setRotating(itemId);

    // Get canvas container position
    const canvas = document.querySelector('.editor-canvas');
    const rect = canvas.getBoundingClientRect();

    // Calculate center of the item relative to viewport
    // For mobs, size is a number; for squares, it's {width, height}
    const width = typeof size === 'number' ? size : size.width;
    const height = typeof size === 'number' ? size : size.height;
    const centerX = rect.left + position.x + width / 2;
    const centerY = rect.top + position.y + height / 2;

    setRotateStart({
      angle: currentRotation || 0,
      centerX,
      centerY
    });
  };

  const handleRotateMove = useCallback((e) => {
    if (!rotating) return;

    // Calculate angle from center to mouse position
    const dx = e.clientX - rotateStart.centerX;
    const dy = e.clientY - rotateStart.centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Normalize angle to 0-360
    angle = (angle + 90 + 360) % 360;

    setMapData(prevMapData => {
      // Check if it's a square
      const isSquare = prevMapData.squares.some(s => s.id === rotating);
      if (isSquare) {
        return {
          ...prevMapData,
          squares: prevMapData.squares.map(s =>
            s.id === rotating ? { ...s, rotation: Math.round(angle) } : s
          )
        };
      }

      // Otherwise, it's a mob
      return {
        ...prevMapData,
        placedMobs: (prevMapData.placedMobs || []).map(m =>
          m.id === rotating ? { ...m, rotation: Math.round(angle) } : m
        )
      };
    });

    // Update selectedSquare if it's the one being rotated
    setSelectedSquare(prevSelected => {
      if (prevSelected?.id === rotating) {
        return { ...prevSelected, rotation: Math.round(angle) };
      }
      return prevSelected;
    });
  }, [rotating, rotateStart]);

  const handleRotateEnd = useCallback(() => {
    setRotating(null);
  }, []);

  // Add global mouse event listeners for rotation
  useEffect(() => {
    if (rotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateEnd);
      return () => {
        window.removeEventListener('mousemove', handleRotateMove);
        window.removeEventListener('mouseup', handleRotateEnd);
      };
    }
  }, [rotating, handleRotateMove, handleRotateEnd]);

  // Add global mouse event listeners for mob resize
  useEffect(() => {
    if (resizingMob) {
      window.addEventListener('mousemove', handleMobResizeMove);
      window.addEventListener('mouseup', handleMobResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleMobResizeMove);
        window.removeEventListener('mouseup', handleMobResizeEnd);
      };
    }
  }, [resizingMob]);

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
            <h3>Mode</h3>
            <div className="mode-selector">
              <button
                className={mode === 'shapes' ? 'primary' : ''}
                onClick={() => setMode('shapes')}
              >
                Shapes
              </button>
              <button
                className={mode === 'draw' ? 'primary' : ''}
                onClick={() => setMode('draw')}
              >
                Draw
              </button>
            </div>

            {mode === 'draw' && (
              <>
                <h3>Drawing Tools</h3>
                <div className="form-group">
                  <label>Brush Color</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Brush Size: {brushSize}px</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  />
                </div>
                <button className="danger" onClick={clearDrawing}>
                  Clear Drawing
                </button>
              </>
            )}

            {mode === 'shapes' && (
              <>
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
                  <label>Background Image URL</label>
                  <input
                    type="text"
                    value={mapData.backgroundImage || ''}
                    onChange={(e) => setMapData({ ...mapData, backgroundImage: e.target.value })}
                    placeholder="https://example.com/background.png"
                  />
                  <p style={{ color: '#999', fontSize: '0.85rem', margin: '5px 0' }}>Or upload a file:</p>
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

                <h3>Add Shape</h3>
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
                    <option value="line">Line</option>
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
                {newSquare.shape === 'line' ? (
                  <>
                    <div className="form-group">
                      <label>Length</label>
                      <input
                        type="number"
                        value={newSquare.lineLength}
                        onChange={(e) => setNewSquare({ ...newSquare, lineLength: parseInt(e.target.value) || 100 })}
                        min="10"
                      />
                    </div>
                    <div className="form-group">
                      <label>Thickness</label>
                      <input
                        type="number"
                        value={newSquare.lineThickness}
                        onChange={(e) => setNewSquare({ ...newSquare, lineThickness: parseInt(e.target.value) || 3 })}
                        min="1"
                        max="20"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Text</label>
                      <input
                        type="text"
                        value={newSquare.text}
                        onChange={(e) => setNewSquare({ ...newSquare, text: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Text Size</label>
                      <input
                        type="number"
                        value={newSquare.textSize}
                        onChange={(e) => setNewSquare({ ...newSquare, textSize: parseInt(e.target.value) || 16 })}
                        min="8"
                        max="72"
                      />
                    </div>
                    <div className="form-group">
                      <label>Text Color</label>
                      <input
                        type="color"
                        value={newSquare.textColor}
                        onChange={(e) => setNewSquare({ ...newSquare, textColor: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Shape Size</label>
                      <input
                        type="number"
                        value={newSquare.width}
                        onChange={(e) => setNewSquare({ ...newSquare, width: parseInt(e.target.value) || 80 })}
                        placeholder="Width"
                      />
                    </div>
                  </>
                )}
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
                        <option value="line">Line</option>
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
                    {selectedSquare.shape === 'line' ? (
                      <>
                        <div className="form-group">
                          <label>Length</label>
                          <input
                            type="number"
                            value={selectedSquare.size.width}
                            onChange={(e) => {
                              const newLength = parseInt(e.target.value) || 10;
                              const updated = { ...selectedSquare, size: { ...selectedSquare.size, width: newLength } };
                              handleUpdateSquare(selectedSquare.id, { size: { ...selectedSquare.size, width: newLength } });
                              setSelectedSquare(updated);
                            }}
                            min="10"
                          />
                        </div>
                        <div className="form-group">
                          <label>Thickness</label>
                          <input
                            type="number"
                            value={selectedSquare.size.height}
                            onChange={(e) => {
                              const newThickness = parseInt(e.target.value) || 1;
                              const updated = { ...selectedSquare, size: { ...selectedSquare.size, height: newThickness } };
                              handleUpdateSquare(selectedSquare.id, { size: { ...selectedSquare.size, height: newThickness } });
                              setSelectedSquare(updated);
                            }}
                            min="1"
                            max="20"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Text</label>
                          <input
                            type="text"
                            value={selectedSquare.text || ''}
                            onChange={(e) => {
                              const updated = { ...selectedSquare, text: e.target.value };
                              handleUpdateSquare(selectedSquare.id, { text: e.target.value });
                              setSelectedSquare(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Text Size</label>
                          <input
                            type="number"
                            value={selectedSquare.textSize || 16}
                            onChange={(e) => {
                              const newSize = parseInt(e.target.value) || 16;
                              const updated = { ...selectedSquare, textSize: newSize };
                              handleUpdateSquare(selectedSquare.id, { textSize: newSize });
                              setSelectedSquare(updated);
                            }}
                            min="8"
                            max="72"
                          />
                        </div>
                        <div className="form-group">
                          <label>Text Color</label>
                          <input
                            type="color"
                            value={selectedSquare.textColor || '#ffffff'}
                            onChange={(e) => {
                              const updated = { ...selectedSquare, textColor: e.target.value };
                              handleUpdateSquare(selectedSquare.id, { textColor: e.target.value });
                              setSelectedSquare(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Width</label>
                          <input
                            type="number"
                            value={selectedSquare.size.width}
                            onChange={(e) => {
                              const newWidth = parseInt(e.target.value) || 30;
                              const updated = { ...selectedSquare, size: { ...selectedSquare.size, width: newWidth } };
                              handleUpdateSquare(selectedSquare.id, { size: { ...selectedSquare.size, width: newWidth } });
                              setSelectedSquare(updated);
                            }}
                            min="30"
                          />
                        </div>
                        <div className="form-group">
                          <label>Height</label>
                          <input
                            type="number"
                            value={selectedSquare.size.height}
                            onChange={(e) => {
                              const newHeight = parseInt(e.target.value) || 30;
                              const updated = { ...selectedSquare, size: { ...selectedSquare.size, height: newHeight } };
                              handleUpdateSquare(selectedSquare.id, { size: { ...selectedSquare.size, height: newHeight } });
                              setSelectedSquare(updated);
                            }}
                            min="30"
                          />
                        </div>
                      </>
                    )}
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
                    <div className="form-group">
                      <label>Layer Order</label>
                      <div className="layer-controls">
                        <button onClick={() => bringToFront(selectedSquare.id)} title="Bring to Front">
                          ⬆⬆
                        </button>
                        <button onClick={() => bringForward(selectedSquare.id)} title="Bring Forward">
                          ⬆
                        </button>
                        <button onClick={() => sendBackward(selectedSquare.id)} title="Send Backward">
                          ⬇
                        </button>
                        <button onClick={() => sendToBack(selectedSquare.id)} title="Send to Back">
                          ⬇⬇
                        </button>
                      </div>
                    </div>
                    <button className="danger" onClick={() => handleDeleteSquare(selectedSquare.id)}>
                      Delete Square
                    </button>
                  </>
                )}

                <h3>Place Mobs</h3>
                <div className="form-group">
                  <label>Select Mob</label>
                  {bonuses.length === 0 ? (
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>No mobs created yet</p>
                  ) : (
                    <select
                      value={selectedMobId || ''}
                      onChange={(e) => setSelectedMobId(e.target.value)}
                    >
                      <option value="">-- Select a mob --</option>
                      {bonuses.map(bonus => (
                        <option key={bonus.id} value={bonus.id}>{bonus.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  className="primary"
                  onClick={handlePlaceMob}
                  disabled={!selectedMobId}
                >
                  Place Mob on Map
                </button>

                {mapData.placedMobs && mapData.placedMobs.length > 0 && (
                  <>
                    <h3>Placed Mobs ({mapData.placedMobs.length})</h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {mapData.placedMobs.map(mob => (
                        <div key={mob.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          background: selectedPlacedMob === mob.id ? '#3a3a3a' : '#2a2a2a',
                          marginBottom: '0.5rem',
                          borderRadius: '4px',
                          border: selectedPlacedMob === mob.id ? '2px solid #d4af37' : '2px solid transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedPlacedMob(mob.id);
                          setSelectedSquare(null);
                        }}>
                          <span>{mob.name}</span>
                          <button
                            className="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMob(mob.id);
                              if (selectedPlacedMob === mob.id) {
                                setSelectedPlacedMob(null);
                              }
                            }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedPlacedMob && (() => {
                  const selectedMob = mapData.placedMobs?.find(m => m.id === selectedPlacedMob);
                  if (!selectedMob) return null;

                  return (
                    <>
                      <h3>Edit Selected Mob</h3>
                      <div className="form-group">
                        <label>Rotation</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedMob.rotation || 0}
                          onChange={(e) => {
                            setMapData(prevMapData => ({
                              ...prevMapData,
                              placedMobs: (prevMapData.placedMobs || []).map(m =>
                                m.id === selectedPlacedMob
                                  ? { ...m, rotation: parseInt(e.target.value) }
                                  : m
                              )
                            }));
                          }}
                        />
                        <span>{selectedMob.rotation || 0}°</span>
                      </div>
                      <div className="form-group">
                        <label>Layer Order</label>
                        <div className="layer-controls">
                          <button onClick={() => bringToFront(selectedPlacedMob)} title="Bring to Front">
                            ⬆⬆
                          </button>
                          <button onClick={() => bringForward(selectedPlacedMob)} title="Bring Forward">
                            ⬆
                          </button>
                          <button onClick={() => sendBackward(selectedPlacedMob)} title="Send Backward">
                            ⬇
                          </button>
                          <button onClick={() => sendToBack(selectedPlacedMob)} title="Send to Back">
                            ⬇⬇
                          </button>
                        </div>
                      </div>
                      <button
                        className="danger"
                        onClick={() => {
                          handleRemoveMob(selectedPlacedMob);
                          setSelectedPlacedMob(null);
                        }}
                      >
                        Delete Mob
                      </button>
                    </>
                  );
                })()}
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
                backgroundPosition: 'center',
                pointerEvents: mode === 'draw' ? 'none' : 'auto'
              }}
            >
              {/* Drawing canvas */}
              <canvas
                ref={canvasRef}
                className="drawing-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  cursor: mode === 'draw' ? 'crosshair' : 'default',
                  pointerEvents: mode === 'draw' ? 'auto' : 'none',
                  zIndex: mode === 'draw' ? 10 : 1
                }}
              />

              {/* Combined Shapes and Mobs layer - sorted by layerIndex */}
              {(() => {
                // Combine squares and mobs with type markers
                const combinedItems = [
                  ...mapData.squares.map(square => ({ ...square, itemType: 'square' })),
                  ...(mapData.placedMobs || []).map(mob => ({ ...mob, itemType: 'mob' }))
                ].sort((a, b) => (a.layerIndex || 0) - (b.layerIndex || 0));

                return combinedItems.map(item => {
                  if (item.itemType === 'square') {
                    const square = item;
                    const isSelected = selectedSquare?.id === square.id;
                    return (
                      <Draggable
                        key={square.id}
                        position={square.position}
                        onDrag={(e, data) => handleDrag(square.id, e, data)}
                        disabled={mode === 'draw' || resizing !== null || rotating !== null}
                      >
                        <div
                          className={`editor-square ${isSelected ? 'selected' : ''} ${square.shape === 'line' ? 'editor-line' : ''}`}
                          onClick={() => mode === 'shapes' && setSelectedSquare(square)}
                          style={{
                            width: square.size.width,
                            height: square.size.height,
                            pointerEvents: mode === 'draw' ? 'none' : 'auto',
                            zIndex: square.layerIndex || 0
                          }}
                        >
                          {/* Inner wrapper for rotation */}
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: square.color,
                              borderRadius: square.shape === 'circle' ? '50%' : square.shape === 'hexagon' ? '10%' : '0',
                              transform: `rotate(${square.rotation || 0}deg)`,
                              transformOrigin: square.shape === 'line' ? '0 50%' : 'center',
                              clipPath: square.shape === 'hexagon'
                                ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                : square.shape === 'triangle'
                                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                : 'none',
                              border: square.shape === 'line' ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {square.text && square.shape !== 'line' && (
                              <span style={{
                                fontSize: `${square.textSize || 16}px`,
                                color: square.textColor || '#ffffff',
                                fontWeight: 'bold',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                              }}>
                                {square.text}
                              </span>
                            )}
                          </div>
                          {isSelected && mode === 'shapes' && (
                            <>
                              {/* Resize handle */}
                              <div
                                className="shape-resize-handle"
                                onMouseDown={(e) => handleResizeStart(e, square.id, square.size.width, square.size.height)}
                                style={{
                                  position: 'absolute',
                                  bottom: square.shape === 'line' ? '50%' : '-8px',
                                  right: '-8px',
                                  width: '20px',
                                  height: '20px',
                                  background: '#d4af37',
                                  border: '2px solid #fff',
                                  borderRadius: '50%',
                                  cursor: 'nwse-resize',
                                  zIndex: 10,
                                  transform: square.shape === 'line' ? 'translateY(50%)' : 'none'
                                }}
                              />
                              {/* Rotation handle */}
                              <div
                                className="shape-rotate-handle"
                                onMouseDown={(e) => handleRotateStart(e, square.id, square.position, square.size, square.rotation)}
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  left: '50%',
                                  width: '20px',
                                  height: '20px',
                                  background: '#47d4af',
                                  border: '2px solid #fff',
                                  borderRadius: '50%',
                                  cursor: 'grab',
                                  zIndex: 10,
                                  transform: 'translateX(-50%)'
                                }}
                              />
                            </>
                          )}
                        </div>
                      </Draggable>
                    );
                  } else {
                    // Render mob
                    const mob = item;
                    const isSelected = selectedPlacedMob === mob.id;
                    return (
                      <Draggable
                        key={mob.id}
                        position={mob.position}
                        onDrag={(e, data) => handleDragMob(mob.id, e, data)}
                        disabled={mode === 'draw' || resizingMob !== null || rotating !== null}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlacedMob(mob.id);
                            setSelectedSquare(null);
                          }}
                          style={{
                            width: `${mob.size}px`,
                            height: `${mob.size}px`,
                            position: 'absolute',
                            cursor: mode === 'draw' ? 'default' : 'move',
                            pointerEvents: mode === 'draw' ? 'none' : 'auto',
                            zIndex: mob.layerIndex || 0
                          }}
                        >
                          {/* Inner wrapper for rotation */}
                          <div style={{
                            width: '100%',
                            height: '100%',
                            transform: `rotate(${mob.rotation || 0}deg)`,
                            transformOrigin: 'center'
                          }}>
                            {mob.imageUrl && (
                              <img
                                src={mob.imageUrl}
                                alt={mob.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  border: isSelected ? '3px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.5)',
                                  borderRadius: '4px',
                                  background: 'rgba(0, 0, 0, 0.3)'
                                }}
                              />
                            )}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.7rem',
                            color: '#d4af37',
                            background: 'rgba(0, 0, 0, 0.8)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            {mob.name}
                          </div>
                          {/* Handles - only show when selected */}
                          {isSelected && (
                            <>
                              {/* Resize handle */}
                              <div
                                onMouseDown={(e) => handleMobResizeStart(e, mob.id, mob.size)}
                                style={{
                                  position: 'absolute',
                                  bottom: '-8px',
                                  right: '-8px',
                                  width: '20px',
                                  height: '20px',
                                  background: '#d4af37',
                                  border: '2px solid #fff',
                                  borderRadius: '50%',
                                  cursor: 'nwse-resize',
                                  zIndex: 10
                                }}
                              />
                              {/* Rotation handle */}
                              <div
                                onMouseDown={(e) => handleRotateStart(e, mob.id, mob.position, mob.size, mob.rotation)}
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  left: '50%',
                                  width: '20px',
                                  height: '20px',
                                  background: '#47d4af',
                                  border: '2px solid #fff',
                                  borderRadius: '50%',
                                  cursor: 'grab',
                                  zIndex: 10,
                                  transform: 'translateX(-50%)'
                                }}
                              />
                            </>
                          )}
                        </div>
                      </Draggable>
                    );
                  }
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapEditor;
