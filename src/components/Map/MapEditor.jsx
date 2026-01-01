import React, { useState, useRef, useEffect } from 'react';
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
      backgroundImage: null,
      drawingData: null
    }
  );
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [newSquare, setNewSquare] = useState({
    shape: 'square',
    color: '#d4af37',
    text: '',
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
      lineThickness: newSquare.shape === 'line' ? newSquare.lineThickness : undefined
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

  const handleResizeMove = (e) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(30, resizeStart.width + deltaX);
    const newHeight = Math.max(30, resizeStart.height + deltaY);

    handleUpdateSquare(resizing, {
      size: { width: newWidth, height: newHeight }
    });
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

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
  }, [resizing, resizeStart]);

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
                      <label>Size</label>
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
                    <button className="danger" onClick={() => handleDeleteSquare(selectedSquare.id)}>
                      Delete Square
                    </button>
                  </>
                )}
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

              {/* Shapes layer */}
              {mapData.squares.map(square => {
                const isSelected = selectedSquare?.id === square.id;
                return (
                  <Draggable
                    key={square.id}
                    position={square.position}
                    onDrag={(e, data) => handleDrag(square.id, e, data)}
                    disabled={mode === 'draw' || resizing !== null}
                  >
                    <div
                      className={`editor-square ${isSelected ? 'selected' : ''} ${square.shape === 'line' ? 'editor-line' : ''}`}
                      onClick={() => mode === 'shapes' && setSelectedSquare(square)}
                      style={{
                        width: square.size.width,
                        height: square.size.height,
                        backgroundColor: square.color,
                        borderRadius: square.shape === 'circle' ? '50%' : square.shape === 'hexagon' ? '10%' : '0',
                        transform: `rotate(${square.rotation || 0}deg)`,
                        transformOrigin: square.shape === 'line' ? '0 50%' : 'center',
                        clipPath: square.shape === 'hexagon'
                          ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                          : square.shape === 'triangle'
                          ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                          : 'none',
                        pointerEvents: mode === 'draw' ? 'none' : 'auto',
                        zIndex: 5,
                        border: square.shape === 'line' ? 'none' : '2px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {square.text && square.shape !== 'line' && <span>{square.text}</span>}
                      {isSelected && mode === 'shapes' && (
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
                      )}
                    </div>
                  </Draggable>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapEditor;
