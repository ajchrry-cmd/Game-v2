import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Draggable from 'react-draggable';
import { useGame } from '../../contexts/GameContext';
import { v4 as uuidv4 } from 'uuid';
import './MapEditor.css';

// ─── History helpers ────────────────────────────────────────────────
const MAX_HISTORY = 40;
function pushHistory(stack, entry) {
  const next = [...stack, JSON.parse(JSON.stringify(entry))];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

// ─── Shape rendering helper ─────────────────────────────────────────
function shapeStyle(shape, color, rotation) {
  const base = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
    transform: `rotate(${rotation || 0}deg)`,
    transformOrigin: shape === 'line' ? '0 50%' : 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  if (shape === 'circle') base.borderRadius = '50%';
  if (shape === 'hexagon') {
    base.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  }
  if (shape === 'triangle') {
    base.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
  }
  if (shape !== 'line') base.border = '2px solid rgba(255,255,255,0.3)';
  return base;
}

function shapePreviewStyle(shape, color, w, h) {
  const s = {
    width: w,
    height: h,
    backgroundColor: color,
    display: 'inline-block',
    flexShrink: 0,
  };
  if (shape === 'circle') s.borderRadius = '50%';
  if (shape === 'hexagon') s.clipPath = 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)';
  if (shape === 'triangle') s.clipPath = 'polygon(50% 0%,0% 100%,100% 100%)';
  return s;
}

// ─── Default template categories ────────────────────────────────────
function defaultCategories() {
  return {
    basicShapes: [
      { id: uuidv4(), icon: '⬜', name: 'Square', shape: 'square', color: '#d4af37', text: '', size: { width: 80, height: 80 }, textSize: 16 },
      { id: uuidv4(), icon: '⭕', name: 'Circle', shape: 'circle', color: '#d4af37', text: '', size: { width: 80, height: 80 }, textSize: 16 },
      { id: uuidv4(), icon: '⬡', name: 'Hexagon', shape: 'hexagon', color: '#d4af37', text: '', size: { width: 80, height: 80 }, textSize: 16 },
      { id: uuidv4(), icon: '▲', name: 'Triangle', shape: 'triangle', color: '#d4af37', text: '', size: { width: 80, height: 80 }, textSize: 16 },
      { id: uuidv4(), icon: '━', name: 'Line', shape: 'line', color: '#d4af37', text: '', size: { width: 100, height: 3 }, textSize: 16 },
    ],
    commonObjects: [
      { id: uuidv4(), icon: '🚪', name: 'Door', shape: 'square', color: '#8B4513', text: 'Door', size: { width: 60, height: 20 }, textSize: 14 },
      { id: uuidv4(), icon: '🧱', name: 'Wall', shape: 'line', color: '#654321', text: '', size: { width: 200, height: 5 }, textSize: 14 },
      { id: uuidv4(), icon: '⚫', name: 'Pillar', shape: 'circle', color: '#4169E1', text: 'Pillar', size: { width: 40, height: 40 }, textSize: 12 },
      { id: uuidv4(), icon: '▭', name: 'Table', shape: 'square', color: '#228B22', text: 'Table', size: { width: 100, height: 60 }, textSize: 14 },
      { id: uuidv4(), icon: '📦', name: 'Chest', shape: 'square', color: '#8B4513', text: 'Chest', size: { width: 50, height: 40 }, textSize: 12 },
      { id: uuidv4(), icon: '⚠️', name: 'Trap', shape: 'circle', color: '#FFD700', text: 'Trap', size: { width: 50, height: 50 }, textSize: 12 },
    ],
    markers: [
      { id: uuidv4(), icon: '🔴', name: 'Marker 1', shape: 'circle', color: '#FF0000', text: '1', size: { width: 40, height: 40 }, textSize: 18 },
      { id: uuidv4(), icon: '🟢', name: 'Marker 2', shape: 'circle', color: '#00FF00', text: '2', size: { width: 40, height: 40 }, textSize: 18 },
      { id: uuidv4(), icon: '🔵', name: 'Marker 3', shape: 'circle', color: '#0000FF', text: '3', size: { width: 40, height: 40 }, textSize: 18 },
      { id: uuidv4(), icon: '🚩', name: 'Start', shape: 'square', color: '#FFA500', text: 'Start', size: { width: 60, height: 60 }, textSize: 14 },
      { id: uuidv4(), icon: '🏁', name: 'Exit', shape: 'square', color: '#800080', text: 'Exit', size: { width: 60, height: 60 }, textSize: 14 },
    ],
    terrain: [
      { id: uuidv4(), icon: '💧', name: 'Water', shape: 'circle', color: '#4682B4', text: 'Water', size: { width: 120, height: 120 }, textSize: 16 },
      { id: uuidv4(), icon: '🌲', name: 'Forest', shape: 'square', color: '#228B22', text: 'Forest', size: { width: 100, height: 100 }, textSize: 14 },
      { id: uuidv4(), icon: '⛰️', name: 'Mountain', shape: 'triangle', color: '#A0522D', text: 'Mountain', size: { width: 80, height: 100 }, textSize: 12 },
      { id: uuidv4(), icon: '🔥', name: 'Lava', shape: 'circle', color: '#FF6347', text: 'Lava', size: { width: 100, height: 100 }, textSize: 14 },
    ],
    customShapes: [],
  };
}

const CATEGORY_LABELS = {
  basicShapes: 'Basic Shapes',
  commonObjects: 'Common Objects',
  markers: 'Markers',
  terrain: 'Terrain',
  customShapes: 'Custom Shapes',
};

// ─── Main Component ─────────────────────────────────────────────────
function MapEditor({ map, onClose }) {
  const { saveMap, uploadImage, bonuses } = useGame();

  // ── Core state ──
  const [mapData, setMapData] = useState(
    map || {
      name: 'New Map',
      squares: [],
      placedMobs: [],
      backgroundColor: '#1a1a1a',
      backgroundImage: null,
      drawingData: null,
    }
  );

  // ── Tool / mode ──
  const [activeTool, setActiveTool] = useState('select'); // select | draw | pan | line
  const [selectedIds, setSelectedIds] = useState([]); // multi-select
  const [selectedMobIds, setSelectedMobIds] = useState([]);

  // ── Panels ──
  const [showShapeLib, setShowShapeLib] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [showMobPanel, setShowMobPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ── Grid ──
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(40);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // ── History (undo / redo) ──
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // ── Drawing state ──
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  // ── Resize / rotate ──
  const [resizing, setResizing] = useState(null);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [rotating, setRotating] = useState(null);
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0 });
  const [resizingMob, setResizingMob] = useState(null);

  // ── Pan / zoom ──
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const editorCanvasRef = useRef(null);

  // ── Context menu ──
  const [contextMenu, setContextMenu] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // ── Shape library ──
  const [categoryShapes, setCategoryShapes] = useState(() => {
    const saved = localStorage.getItem('mapEditorCategoryShapes');
    if (saved) return JSON.parse(saved);
    return defaultCategories();
  });
  const [editingShape, setEditingShape] = useState(null);
  const [addingToCategory, setAddingToCategory] = useState(null);

  // ── Saving ──
  const [isSaving, setIsSaving] = useState(false);

  // ── Clipboard ──
  const [clipboard, setClipboard] = useState(null);

  // ── Box selection ──
  const [boxSelect, setBoxSelect] = useState(null);

  // ── Mob placement ──
  const [selectedMobToPlace, setSelectedMobToPlace] = useState(null);

  // ── Line tool ──
  const [lineDraw, setLineDraw] = useState(null); // { startX, startY, endX, endY }

  // ── Helper: single selected shape ──
  const selectedSquare = useMemo(() => {
    if (selectedIds.length === 1) return mapData.squares.find(s => s.id === selectedIds[0]) || null;
    return null;
  }, [selectedIds, mapData.squares]);

  const selectedPlacedMob = useMemo(() => {
    if (selectedMobIds.length === 1) return (mapData.placedMobs || []).find(m => m.id === selectedMobIds[0]) || null;
    return null;
  }, [selectedMobIds, mapData.placedMobs]);

  // ── Record history before mutation ──
  const recordHistory = useCallback(() => {
    setUndoStack(prev => pushHistory(prev, mapData));
    setRedoStack([]);
  }, [mapData]);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack(r => pushHistory(r, mapData));
      setMapData(last);
      return prev.slice(0, -1);
    });
  }, [mapData]);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setUndoStack(u => pushHistory(u, mapData));
      setMapData(last);
      return prev.slice(0, -1);
    });
  }, [mapData]);

  // ── Snap helper ──
  const snap = useCallback((val) => {
    if (!snapToGrid) return val;
    return Math.round(val / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // ── Layer helpers ──
  const getMaxLayerIndex = useCallback((data) => {
    const si = (data.squares || []).map(s => s.layerIndex || 0);
    const mi = (data.placedMobs || []).map(m => m.layerIndex || 0);
    const all = [...si, ...mi];
    return all.length > 0 ? Math.max(...all) : 0;
  }, []);

  // ── Canvas init ──
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setContext(ctx);
      canvas.width = 2000;
      canvas.height = 2000;
      if (mapData.drawingData) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = mapData.drawingData;
      }
    }
  }, [canvasRef.current]);

  // ══════════════════════════════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════════════════════════════

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let drawingData = null;
      if (canvasRef.current) drawingData = canvasRef.current.toDataURL();
      const mapToSave = { ...mapData, drawingData };
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out. Firestore may not be enabled.')), 10000)
      );
      await Promise.race([saveMap(mapToSave), timeout]);
      alert('Map saved successfully!');
      onClose();
    } catch (error) {
      const msg = error.message.includes('timed out')
        ? 'Save timed out.\n\nFirestore may not be enabled.\nSee SETUP.md for details.'
        : `Error: ${error.message}`;
      alert(msg);
      setIsSaving(false);
    }
  };

  // ── Add shape at position ──
  const addShapeAt = useCallback((template, position) => {
    recordHistory();
    const finalColor = template.shape === 'line' ? (template.color || '#000000') : (template.color || '#d4af37');
    let finalSize = template.size || (template.shape === 'line' ? { width: 100, height: 3 } : { width: 80, height: 80 });
    if (template.shape === 'line' && finalSize.height > 5) finalSize = { ...finalSize, height: 5 };
    const sq = {
      id: uuidv4(),
      shape: template.shape,
      position: { x: snap(position.x), y: snap(position.y) },
      size: { ...finalSize },
      color: finalColor,
      text: template.text || '',
      textSize: template.textSize || 16,
      textColor: template.textColor || '#ffffff',
      rotation: 0,
      layerIndex: getMaxLayerIndex(mapData) + 1,
    };
    setMapData(prev => ({ ...prev, squares: [...prev.squares, sq] }));
    setSelectedIds([sq.id]);
    setSelectedMobIds([]);
  }, [recordHistory, snap, getMaxLayerIndex, mapData]);

  // ── Update shape ──
  const updateSquare = useCallback((id, updates) => {
    setMapData(prev => ({
      ...prev,
      squares: prev.squares.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  // ── Delete selected ──
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0 && selectedMobIds.length === 0) return;
    recordHistory();
    setMapData(prev => ({
      ...prev,
      squares: prev.squares.filter(s => !selectedIds.includes(s.id)),
      placedMobs: (prev.placedMobs || []).filter(m => !selectedMobIds.includes(m.id)),
    }));
    setSelectedIds([]);
    setSelectedMobIds([]);
  }, [selectedIds, selectedMobIds, recordHistory]);

  // ── Duplicate selected ──
  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0 && selectedMobIds.length === 0) return;
    recordHistory();
    const newSquares = [];
    const newMobs = [];
    const newSelectedIds = [];
    const newSelectedMobIds = [];

    for (const id of selectedIds) {
      const sq = mapData.squares.find(s => s.id === id);
      if (sq) {
        const dup = { ...sq, id: uuidv4(), position: { x: sq.position.x + 20, y: sq.position.y + 20 }, layerIndex: getMaxLayerIndex(mapData) + 1 };
        newSquares.push(dup);
        newSelectedIds.push(dup.id);
      }
    }
    for (const id of selectedMobIds) {
      const mob = (mapData.placedMobs || []).find(m => m.id === id);
      if (mob) {
        const dup = { ...mob, id: uuidv4(), position: { x: mob.position.x + 20, y: mob.position.y + 20 }, layerIndex: getMaxLayerIndex(mapData) + 1 };
        newMobs.push(dup);
        newSelectedMobIds.push(dup.id);
      }
    }

    setMapData(prev => ({
      ...prev,
      squares: [...prev.squares, ...newSquares],
      placedMobs: [...(prev.placedMobs || []), ...newMobs],
    }));
    setSelectedIds(newSelectedIds);
    setSelectedMobIds(newSelectedMobIds);
  }, [selectedIds, selectedMobIds, mapData, recordHistory, getMaxLayerIndex]);

  // ── Copy / Paste ──
  const copySelected = useCallback(() => {
    const squares = selectedIds.map(id => mapData.squares.find(s => s.id === id)).filter(Boolean);
    const mobs = selectedMobIds.map(id => (mapData.placedMobs || []).find(m => m.id === id)).filter(Boolean);
    if (squares.length || mobs.length) setClipboard({ squares, mobs });
  }, [selectedIds, selectedMobIds, mapData]);

  const paste = useCallback(() => {
    if (!clipboard) return;
    recordHistory();
    const newIds = [];
    const newMobIds = [];
    const newSquares = clipboard.squares.map(sq => {
      const n = { ...sq, id: uuidv4(), position: { x: sq.position.x + 30, y: sq.position.y + 30 }, layerIndex: getMaxLayerIndex(mapData) + 1 };
      newIds.push(n.id);
      return n;
    });
    const newMobs = clipboard.mobs.map(m => {
      const n = { ...m, id: uuidv4(), position: { x: m.position.x + 30, y: m.position.y + 30 }, layerIndex: getMaxLayerIndex(mapData) + 1 };
      newMobIds.push(n.id);
      return n;
    });
    setMapData(prev => ({
      ...prev,
      squares: [...prev.squares, ...newSquares],
      placedMobs: [...(prev.placedMobs || []), ...newMobs],
    }));
    setSelectedIds(newIds);
    setSelectedMobIds(newMobIds);
  }, [clipboard, recordHistory, getMaxLayerIndex, mapData]);

  // ── Layer controls ──
  const bringToFront = useCallback((id) => {
    const max = getMaxLayerIndex(mapData);
    setMapData(prev => ({
      ...prev,
      squares: prev.squares.map(s => (s.id === id ? { ...s, layerIndex: max + 1 } : s)),
      placedMobs: (prev.placedMobs || []).map(m => (m.id === id ? { ...m, layerIndex: max + 1 } : m)),
    }));
  }, [getMaxLayerIndex, mapData]);

  const sendToBack = useCallback((id) => {
    setMapData(prev => ({
      ...prev,
      squares: prev.squares.map(s => (s.id === id ? { ...s, layerIndex: 0 } : s)),
      placedMobs: (prev.placedMobs || []).map(m => (m.id === id ? { ...m, layerIndex: 0 } : m)),
    }));
  }, []);

  const bringForward = useCallback((id) => {
    setMapData(prev => {
      const all = [
        ...prev.squares.map(s => ({ id: s.id, li: s.layerIndex || 0, t: 'sq' })),
        ...(prev.placedMobs || []).map(m => ({ id: m.id, li: m.layerIndex || 0, t: 'mob' })),
      ].sort((a, b) => a.li - b.li);
      const idx = all.findIndex(i => i.id === id);
      if (idx === -1 || idx === all.length - 1) return prev;
      const newLi = all[idx + 1].li + 0.5;
      return {
        ...prev,
        squares: prev.squares.map(s => (s.id === id ? { ...s, layerIndex: newLi } : s)),
        placedMobs: (prev.placedMobs || []).map(m => (m.id === id ? { ...m, layerIndex: newLi } : m)),
      };
    });
  }, []);

  const sendBackward = useCallback((id) => {
    setMapData(prev => {
      const all = [
        ...prev.squares.map(s => ({ id: s.id, li: s.layerIndex || 0, t: 'sq' })),
        ...(prev.placedMobs || []).map(m => ({ id: m.id, li: m.layerIndex || 0, t: 'mob' })),
      ].sort((a, b) => a.li - b.li);
      const idx = all.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const newLi = all[idx - 1].li - 0.5;
      return {
        ...prev,
        squares: prev.squares.map(s => (s.id === id ? { ...s, layerIndex: newLi } : s)),
        placedMobs: (prev.placedMobs || []).map(m => (m.id === id ? { ...m, layerIndex: newLi } : m)),
      };
    });
  }, []);

  // ── Select all ──
  const selectAll = useCallback(() => {
    setSelectedIds(mapData.squares.map(s => s.id));
    setSelectedMobIds((mapData.placedMobs || []).map(m => m.id));
  }, [mapData]);

  // ── Place mob ──
  const placeMob = useCallback((mobId, position) => {
    const mob = bonuses.find(b => b.id === mobId);
    if (!mob) return;
    recordHistory();
    const placed = {
      id: uuidv4(),
      mobId,
      name: mob.name,
      imageUrl: mob.imageUrl,
      position: { x: snap(position.x), y: snap(position.y) },
      size: 80,
      rotation: 0,
      layerIndex: getMaxLayerIndex(mapData) + 1,
    };
    setMapData(prev => ({ ...prev, placedMobs: [...(prev.placedMobs || []), placed] }));
    setSelectedMobIds([placed.id]);
    setSelectedIds([]);
  }, [bonuses, recordHistory, snap, getMaxLayerIndex, mapData]);

  // ── Background upload ──
  const handleBackgroundUpload = async (file) => {
    const url = await uploadImage(file, 'map-backgrounds');
    if (url) setMapData(prev => ({ ...prev, backgroundImage: url }));
  };

  // ═══════════════════════════════════════════════════════════════════
  // DRAWING
  // ═══════════════════════════════════════════════════════════════════
  const startDrawing = (e) => {
    if (activeTool !== 'draw' || !context) return;
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
    if (!isDrawing || activeTool !== 'draw' || !context) return;
    const rect = canvasRef.current.getBoundingClientRect();
    context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && context) context.closePath();
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    if (context && canvasRef.current) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // ═══════════════════════════════════════════════════════════════════
  // LINE TOOL (click-drag to place a line)
  // ═══════════════════════════════════════════════════════════════════
  const handleLineMouseDown = useCallback((e) => {
    if (activeTool !== 'line' || e.button !== 0) return;
    const rect = editorCanvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setLineDraw({ startX: snap(x), startY: snap(y), endX: snap(x), endY: snap(y) });
  }, [activeTool, zoom, snap]);

  const handleLineMouseMove = useCallback((e) => {
    if (!lineDraw) return;
    const rect = editorCanvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setLineDraw(prev => ({ ...prev, endX: snap(x), endY: snap(y) }));
  }, [lineDraw, zoom, snap]);

  const handleLineMouseUp = useCallback(() => {
    if (!lineDraw) return;
    const dx = lineDraw.endX - lineDraw.startX;
    const dy = lineDraw.endY - lineDraw.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 5) { setLineDraw(null); return; } // too short, discard
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    recordHistory();
    const sq = {
      id: uuidv4(),
      shape: 'line',
      position: { x: lineDraw.startX, y: lineDraw.startY - 2 },
      size: { width: Math.round(length), height: 5 },
      color: '#000000',
      text: '',
      textSize: 16,
      textColor: '#ffffff',
      rotation: Math.round(angle),
      layerIndex: getMaxLayerIndex(mapData) + 1,
    };
    setMapData(prev => ({ ...prev, squares: [...prev.squares, sq] }));
    setSelectedIds([sq.id]);
    setSelectedMobIds([]);
    setLineDraw(null);
  }, [lineDraw, recordHistory, getMaxLayerIndex, mapData]);

  useEffect(() => {
    if (lineDraw) {
      window.addEventListener('mousemove', handleLineMouseMove);
      window.addEventListener('mouseup', handleLineMouseUp);
      return () => { window.removeEventListener('mousemove', handleLineMouseMove); window.removeEventListener('mouseup', handleLineMouseUp); };
    }
  }, [lineDraw, handleLineMouseMove, handleLineMouseUp]);

  // ═══════════════════════════════════════════════════════════════════
  // RESIZE / ROTATE (shapes)
  // ═══════════════════════════════════════════════════════════════════
  const handleResizeStart = (e, sqId, w, h, shapeType) => {
    e.stopPropagation();
    recordHistory();
    setResizing(sqId);
    setResizeStart({ width: w, height: h, x: e.clientX, y: e.clientY, shape: shapeType });
  };

  const handleResizeMove = useCallback((e) => {
    if (!resizing) return;
    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;
    const isLine = resizeStart.shape === 'line';
    const nw = Math.max(30, resizeStart.width + dx);
    const nh = Math.max(isLine ? 1 : 30, resizeStart.height + dy);
    setMapData(prev => ({
      ...prev,
      squares: prev.squares.map(s => (s.id === resizing ? { ...s, size: { width: nw, height: nh } } : s)),
    }));
  }, [resizing, resizeStart]);

  const handleResizeEnd = useCallback(() => setResizing(null), []);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => { window.removeEventListener('mousemove', handleResizeMove); window.removeEventListener('mouseup', handleResizeEnd); };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // ── Rotation ──
  const handleRotateStart = (e, itemId, position, size, curRot) => {
    e.stopPropagation();
    recordHistory();
    setRotating(itemId);
    const rect = editorCanvasRef.current.getBoundingClientRect();
    const w = typeof size === 'number' ? size : size.width;
    const h = typeof size === 'number' ? size : size.height;
    setRotateStart({
      angle: curRot || 0,
      centerX: rect.left + (position.x + w / 2) * zoom,
      centerY: rect.top + (position.y + h / 2) * zoom,
    });
  };

  const handleRotateMove = useCallback((e) => {
    if (!rotating) return;
    const dx = e.clientX - rotateStart.centerX;
    const dy = e.clientY - rotateStart.centerY;
    let angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;
    angle = Math.round(angle);
    setMapData(prev => ({
      ...prev,
      squares: prev.squares.map(s => (s.id === rotating ? { ...s, rotation: angle } : s)),
      placedMobs: (prev.placedMobs || []).map(m => (m.id === rotating ? { ...m, rotation: angle } : m)),
    }));
  }, [rotating, rotateStart]);

  const handleRotateEnd = useCallback(() => setRotating(null), []);

  useEffect(() => {
    if (rotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateEnd);
      return () => { window.removeEventListener('mousemove', handleRotateMove); window.removeEventListener('mouseup', handleRotateEnd); };
    }
  }, [rotating, handleRotateMove, handleRotateEnd]);

  // ── Mob resize ──
  const handleMobResizeStart = (e, mobId, curSize) => {
    e.stopPropagation();
    recordHistory();
    setResizingMob({ id: mobId, startX: e.clientX, startY: e.clientY, startSize: curSize });
  };

  const handleMobResizeMove = useCallback((e) => {
    if (!resizingMob) return;
    const delta = Math.max(e.clientX - resizingMob.startX, e.clientY - resizingMob.startY);
    const ns = Math.max(30, resizingMob.startSize + delta);
    setMapData(prev => ({
      ...prev,
      placedMobs: (prev.placedMobs || []).map(m => (m.id === resizingMob.id ? { ...m, size: ns } : m)),
    }));
  }, [resizingMob]);

  const handleMobResizeEnd = useCallback(() => setResizingMob(null), []);

  useEffect(() => {
    if (resizingMob) {
      window.addEventListener('mousemove', handleMobResizeMove);
      window.addEventListener('mouseup', handleMobResizeEnd);
      return () => { window.removeEventListener('mousemove', handleMobResizeMove); window.removeEventListener('mouseup', handleMobResizeEnd); };
    }
  }, [resizingMob, handleMobResizeMove, handleMobResizeEnd]);

  // ═══════════════════════════════════════════════════════════════════
  // PAN / ZOOM
  // ═══════════════════════════════════════════════════════════════════
  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && (activeTool === 'pan' || e.shiftKey))) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }
    // Line tool: start drawing a line
    if (activeTool === 'line' && e.button === 0) {
      handleLineMouseDown(e);
      return;
    }
    // Box select with left click on empty canvas in select mode
    if (activeTool === 'select' && e.button === 0 && e.target === e.currentTarget) {
      const rect = editorCanvasRef.current.getBoundingClientRect();
      const sx = (e.clientX - rect.left) / zoom;
      const sy = (e.clientY - rect.top) / zoom;
      setBoxSelect({ startX: sx, startY: sy, endX: sx, endY: sy });
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (boxSelect) {
      const rect = editorCanvasRef.current.getBoundingClientRect();
      setBoxSelect(prev => ({
        ...prev,
        endX: (e.clientX - rect.left) / zoom,
        endY: (e.clientY - rect.top) / zoom,
      }));
    }
  }, [isPanning, panStart, boxSelect, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    if (boxSelect) {
      const minX = Math.min(boxSelect.startX, boxSelect.endX);
      const maxX = Math.max(boxSelect.startX, boxSelect.endX);
      const minY = Math.min(boxSelect.startY, boxSelect.endY);
      const maxY = Math.max(boxSelect.startY, boxSelect.endY);
      if (maxX - minX > 5 || maxY - minY > 5) {
        const ids = mapData.squares
          .filter(s => s.position.x >= minX && s.position.x + s.size.width <= maxX && s.position.y >= minY && s.position.y + s.size.height <= maxY)
          .map(s => s.id);
        const mobIds = (mapData.placedMobs || [])
          .filter(m => m.position.x >= minX && m.position.x + m.size <= maxX && m.position.y >= minY && m.position.y + m.size <= maxY)
          .map(m => m.id);
        setSelectedIds(ids);
        setSelectedMobIds(mobIds);
      }
      setBoxSelect(null);
    }
  }, [boxSelect, mapData]);

  useEffect(() => {
    if (isPanning || boxSelect) {
      window.addEventListener('mousemove', handleCanvasMouseMove);
      window.addEventListener('mouseup', handleCanvasMouseUp);
      return () => { window.removeEventListener('mousemove', handleCanvasMouseMove); window.removeEventListener('mouseup', handleCanvasMouseUp); };
    }
  }, [isPanning, boxSelect, handleCanvasMouseMove, handleCanvasMouseUp]);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(0.1, z + e.deltaY * -0.001), 3));
  };

  // ═══════════════════════════════════════════════════════════════════
  // CONTEXT MENU
  // ═══════════════════════════════════════════════════════════════════
  const handleContextMenu = (e) => {
    if (activeTool === 'draw' || activeTool === 'line') return;
    e.preventDefault();
    e.stopPropagation();
    const rect = editorCanvasRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;
    setContextMenu({ x: Math.min(e.clientX, window.innerWidth - 240), y: Math.min(e.clientY, window.innerHeight - 300), mapX: clickX, mapY: clickY });
  };

  useEffect(() => {
    if (contextMenu) {
      const h = (e) => {
        const menu = document.querySelector('.me2-context-menu');
        if (menu && !menu.contains(e.target)) setContextMenu(null);
      };
      document.addEventListener('mousedown', h, true);
      return () => document.removeEventListener('mousedown', h, true);
    }
  }, [contextMenu]);

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    const handler = (e) => {
      // Don't capture when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      else if (ctrl && e.key === 'z') { e.preventDefault(); undo(); }
      else if (ctrl && e.key === 'y') { e.preventDefault(); redo(); }
      else if (ctrl && e.key === 'c') { e.preventDefault(); copySelected(); }
      else if (ctrl && e.key === 'v') { e.preventDefault(); paste(); }
      else if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
      else if (ctrl && e.key === 'a') { e.preventDefault(); selectAll(); }
      else if (e.key === 'Escape') {
        setSelectedIds([]); setSelectedMobIds([]); setContextMenu(null);
        setEditingShape(null); setAddingToCategory(null);
      }
      else if (e.key === 'v' || e.key === '1') setActiveTool('select');
      else if (e.key === 'b' || e.key === '2') setActiveTool('draw');
      else if (e.key === 'h' || e.key === '3') setActiveTool('pan');
      else if (e.key === 'l' || e.key === '4') setActiveTool('line');
      else if (e.key === 'g') { e.preventDefault(); setShowGrid(g => !g); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, undo, redo, copySelected, paste, duplicateSelected, selectAll]);

  // ═══════════════════════════════════════════════════════════════════
  // SHAPE LIBRARY CRUD
  // ═══════════════════════════════════════════════════════════════════
  const saveCategoryShapes = useCallback((updated) => {
    setCategoryShapes(updated);
    localStorage.setItem('mapEditorCategoryShapes', JSON.stringify(updated));
  }, []);

  const deleteShapeFromLib = useCallback((cat, shapeId) => {
    saveCategoryShapes({ ...categoryShapes, [cat]: categoryShapes[cat].filter(s => s.id !== shapeId) });
  }, [categoryShapes, saveCategoryShapes]);

  const saveEditedShape = useCallback(() => {
    if (!editingShape) return;
    const { category, shape } = editingShape;
    saveCategoryShapes({
      ...categoryShapes,
      [category]: categoryShapes[category].map(s => (s.id === shape.id ? shape : s)),
    });
    setEditingShape(null);
  }, [editingShape, categoryShapes, saveCategoryShapes]);

  const saveNewShape = useCallback((cat, shape) => {
    saveCategoryShapes({ ...categoryShapes, [cat]: [...categoryShapes[cat], { ...shape, id: uuidv4() }] });
    setAddingToCategory(null);
  }, [categoryShapes, saveCategoryShapes]);

  const saveSelectedAsCustom = useCallback(() => {
    if (!selectedSquare) return;
    setEditingShape({
      category: 'customShapes',
      shape: {
        id: uuidv4(),
        name: selectedSquare.text || 'Custom Shape',
        icon: '⭐',
        shape: selectedSquare.shape,
        color: selectedSquare.color,
        text: selectedSquare.text || '',
        textSize: selectedSquare.textSize || 16,
        size: { ...selectedSquare.size },
      },
      isNew: true,
    });
  }, [selectedSquare]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  const combinedItems = useMemo(() => {
    return [
      ...mapData.squares.map(s => ({ ...s, itemType: 'square' })),
      ...(mapData.placedMobs || []).map(m => ({ ...m, itemType: 'mob' })),
    ].sort((a, b) => (a.layerIndex || 0) - (b.layerIndex || 0));
  }, [mapData.squares, mapData.placedMobs]);

  const cursorStyle = activeTool === 'pan' || isPanning ? 'grab' : (activeTool === 'draw' || activeTool === 'line') ? 'crosshair' : 'default';

  return (
    <div className="modal-overlay">
      <div className="me2-editor" onClick={(e) => e.stopPropagation()}>

        {/* ═══ TOP BAR ═══ */}
        <div className="me2-topbar">
          <input
            type="text"
            value={mapData.name}
            onChange={(e) => setMapData(prev => ({ ...prev, name: e.target.value }))}
            className="me2-map-name"
            placeholder="Map Name"
          />

          <div className="me2-toolbar">
            {/* Tool buttons */}
            <div className="me2-tool-group">
              <button className={`me2-tool-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setActiveTool('select')} title="Select (V)">
                <span className="me2-tool-icon">&#9095;</span>
                <span className="me2-tool-label">Select</span>
              </button>
              <button className={`me2-tool-btn ${activeTool === 'draw' ? 'active' : ''}`} onClick={() => setActiveTool('draw')} title="Draw (B)">
                <span className="me2-tool-icon">&#9998;</span>
                <span className="me2-tool-label">Draw</span>
              </button>
              <button className={`me2-tool-btn ${activeTool === 'pan' ? 'active' : ''}`} onClick={() => setActiveTool('pan')} title="Pan (H)">
                <span className="me2-tool-icon">&#9995;</span>
                <span className="me2-tool-label">Pan</span>
              </button>
              <button className={`me2-tool-btn ${activeTool === 'line' ? 'active' : ''}`} onClick={() => setActiveTool('line')} title="Line Tool (L) — Click and drag to place lines">
                <span className="me2-tool-icon">&#9585;</span>
                <span className="me2-tool-label">Line</span>
              </button>
            </div>

            <div className="me2-toolbar-sep" />

            {/* Toggle panels */}
            <div className="me2-tool-group">
              <button className={`me2-tool-btn ${showShapeLib ? 'active' : ''}`} onClick={() => { setShowShapeLib(!showShapeLib); setShowMobPanel(false); setShowSettings(false); }} title="Shape Library">
                <span className="me2-tool-icon">&#11042;</span>
                <span className="me2-tool-label">Shapes</span>
              </button>
              <button className={`me2-tool-btn ${showMobPanel ? 'active' : ''}`} onClick={() => { setShowMobPanel(!showMobPanel); setShowShapeLib(false); setShowSettings(false); }} title="Mobs">
                <span className="me2-tool-icon">&#128126;</span>
                <span className="me2-tool-label">Mobs</span>
              </button>
              <button className={`me2-tool-btn ${showSettings ? 'active' : ''}`} onClick={() => { setShowSettings(!showSettings); setShowShapeLib(false); setShowMobPanel(false); }} title="Map Settings">
                <span className="me2-tool-icon">&#9881;</span>
                <span className="me2-tool-label">Settings</span>
              </button>
            </div>

            <div className="me2-toolbar-sep" />

            {/* Grid & snap */}
            <div className="me2-tool-group">
              <button className={`me2-tool-btn ${showGrid ? 'active' : ''}`} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid (G)">
                <span className="me2-tool-icon">&#9638;</span>
                <span className="me2-tool-label">Grid</span>
              </button>
              <button className={`me2-tool-btn ${snapToGrid ? 'active' : ''}`} onClick={() => setSnapToGrid(!snapToGrid)} title="Snap to Grid">
                <span className="me2-tool-icon">&#8982;</span>
                <span className="me2-tool-label">Snap</span>
              </button>
            </div>

            <div className="me2-toolbar-sep" />

            {/* Undo / Redo */}
            <div className="me2-tool-group">
              <button className="me2-tool-btn" onClick={undo} disabled={undoStack.length === 0} title="Undo (Ctrl+Z)">
                <span className="me2-tool-icon">&#8630;</span>
                <span className="me2-tool-label">Undo</span>
              </button>
              <button className="me2-tool-btn" onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)">
                <span className="me2-tool-icon">&#8631;</span>
                <span className="me2-tool-label">Redo</span>
              </button>
            </div>

            <div className="me2-toolbar-sep" />

            {/* Edit actions */}
            <div className="me2-tool-group">
              <button className="me2-tool-btn" onClick={duplicateSelected} disabled={selectedIds.length === 0 && selectedMobIds.length === 0} title="Duplicate (Ctrl+D)">
                <span className="me2-tool-icon">&#10064;</span>
                <span className="me2-tool-label">Dupe</span>
              </button>
              <button className="me2-tool-btn me2-tool-danger" onClick={deleteSelected} disabled={selectedIds.length === 0 && selectedMobIds.length === 0} title="Delete (Del)">
                <span className="me2-tool-icon">&#128465;</span>
                <span className="me2-tool-label">Delete</span>
              </button>
            </div>
          </div>

          <div className="me2-topbar-right">
            <div className="me2-zoom-controls">
              <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} title="Zoom Out">-</button>
              <span className="me2-zoom-label">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} title="Zoom In">+</button>
              <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} title="Reset View">Fit</button>
            </div>
            <button className="me2-save-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button className="me2-close-btn" onClick={onClose} disabled={isSaving}>Cancel</button>
          </div>
        </div>

        {/* ═══ MAIN AREA ═══ */}
        <div className="me2-main">

          {/* ─── Left panel: Shape Library / Mobs / Settings ─── */}
          {(showShapeLib || showMobPanel || showSettings) && (
            <div className="me2-left-panel">
              {showShapeLib && (
                <div className="me2-panel-content">
                  <div className="me2-panel-header">
                    <h3>Shape Library</h3>
                    <button className="me2-panel-close" onClick={() => setShowShapeLib(false)}>&#10005;</button>
                  </div>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                    <div key={catKey} className="me2-shape-category">
                      <div
                        className="me2-category-header"
                        onClick={() => setExpandedSections(prev => ({ ...prev, [catKey]: !prev[catKey] }))}
                      >
                        <span>{expandedSections[catKey] ? '▾' : '▸'} {catLabel}</span>
                        <span className="me2-cat-count">{categoryShapes[catKey].length}</span>
                      </div>
                      {expandedSections[catKey] && (
                        <div className="me2-shape-grid">
                          {categoryShapes[catKey].map(tpl => (
                            <div
                              key={tpl.id}
                              className="me2-shape-card"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify(tpl));
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              title={`Drag to place or click to add.\nRight-click for options.`}
                              onClick={() => addShapeAt(tpl, { x: 400 - panOffset.x / zoom, y: 300 - panOffset.y / zoom })}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingShape({ category: catKey, shape: { ...tpl }, isNew: false });
                              }}
                            >
                              <div className="me2-shape-preview" style={shapePreviewStyle(tpl.shape, tpl.color, 32, 32)} />
                              <span className="me2-shape-name">{tpl.icon} {tpl.name}</span>
                              <button
                                className="me2-shape-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete "${tpl.name}"?`)) deleteShapeFromLib(catKey, tpl.id);
                                }}
                                title="Delete"
                              >&#10005;</button>
                            </div>
                          ))}
                          <div
                            className="me2-shape-card me2-shape-add"
                            onClick={() => setAddingToCategory(catKey)}
                          >
                            <span>+ Add</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showMobPanel && (
                <div className="me2-panel-content">
                  <div className="me2-panel-header">
                    <h3>Mob Placement</h3>
                    <button className="me2-panel-close" onClick={() => setShowMobPanel(false)}>&#10005;</button>
                  </div>
                  {bonuses.length === 0 ? (
                    <p className="me2-empty">No mobs created yet. Create mobs in the Bonus Manager.</p>
                  ) : (
                    <div className="me2-mob-list">
                      {bonuses.map(b => (
                        <div
                          key={b.id}
                          className={`me2-mob-card ${selectedMobToPlace === b.id ? 'active' : ''}`}
                          onClick={() => {
                            placeMob(b.id, { x: 400 - panOffset.x / zoom, y: 300 - panOffset.y / zoom });
                          }}
                        >
                          {b.imageUrl && <img src={b.imageUrl} alt={b.name} className="me2-mob-thumb" />}
                          <span>{b.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(mapData.placedMobs || []).length > 0 && (
                    <>
                      <div className="me2-panel-header" style={{ marginTop: '0.5rem' }}>
                        <h3>On Map ({mapData.placedMobs.length})</h3>
                      </div>
                      <div className="me2-mob-list">
                        {mapData.placedMobs.map(m => (
                          <div
                            key={m.id}
                            className={`me2-mob-card ${selectedMobIds.includes(m.id) ? 'active' : ''}`}
                            onClick={() => { setSelectedMobIds([m.id]); setSelectedIds([]); }}
                          >
                            {m.imageUrl && <img src={m.imageUrl} alt={m.name} className="me2-mob-thumb" />}
                            <span>{m.name}</span>
                            <button className="me2-mob-remove" onClick={(e) => {
                              e.stopPropagation();
                              recordHistory();
                              setMapData(prev => ({ ...prev, placedMobs: prev.placedMobs.filter(p => p.id !== m.id) }));
                              setSelectedMobIds(ids => ids.filter(i => i !== m.id));
                            }}>&#10005;</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {showSettings && (
                <div className="me2-panel-content">
                  <div className="me2-panel-header">
                    <h3>Map Settings</h3>
                    <button className="me2-panel-close" onClick={() => setShowSettings(false)}>&#10005;</button>
                  </div>
                  <div className="me2-settings-group">
                    <label>Background Color</label>
                    <input type="color" value={mapData.backgroundColor} onChange={(e) => setMapData(prev => ({ ...prev, backgroundColor: e.target.value }))} />
                  </div>
                  <div className="me2-settings-group">
                    <label>Background Image</label>
                    <input
                      type="text"
                      value={mapData.backgroundImage || ''}
                      onChange={(e) => setMapData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                      placeholder="URL..."
                      className="me2-input"
                    />
                    <input type="file" accept="image/*" onChange={(e) => handleBackgroundUpload(e.target.files[0])} className="me2-file-input" />
                    {mapData.backgroundImage && (
                      <button className="me2-btn-small me2-btn-danger" onClick={() => setMapData(prev => ({ ...prev, backgroundImage: null }))}>Remove Image</button>
                    )}
                  </div>
                  <div className="me2-settings-group">
                    <label>Grid Size: {gridSize}px</label>
                    <input type="range" min="10" max="100" step="5" value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Canvas Area ─── */}
          <div
            className="me2-canvas-wrap"
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const tpl = JSON.parse(e.dataTransfer.getData('application/json'));
                const rect = editorCanvasRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / zoom;
                const y = (e.clientY - rect.top) / zoom;
                addShapeAt(tpl, { x, y });
              } catch {}
            }}
            style={{ cursor: cursorStyle }}
          >
            {/* Draw mode toolbar inline */}
            {activeTool === 'draw' && (
              <div className="me2-draw-toolbar">
                <label>Color</label>
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
                <label>Size: {brushSize}</label>
                <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
                <button className="me2-btn-small me2-btn-danger" onClick={clearDrawing}>Clear Drawing</button>
              </div>
            )}

            <div
              className="me2-canvas"
              ref={editorCanvasRef}
              style={{
                backgroundColor: mapData.backgroundColor,
                backgroundImage: mapData.backgroundImage ? `url(${mapData.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '2000px',
                height: '2000px',
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                pointerEvents: (activeTool === 'draw' || activeTool === 'line') ? 'none' : 'auto',
              }}
              onClick={(e) => {
                if (e.target === editorCanvasRef.current && activeTool === 'select') {
                  setSelectedIds([]);
                  setSelectedMobIds([]);
                }
              }}
            >
              {/* Grid overlay */}
              {showGrid && (
                <svg className="me2-grid-overlay" width="2000" height="2000" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
                  <defs>
                    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="2000" height="2000" fill="url(#grid)" />
                </svg>
              )}

              {/* Drawing canvas */}
              <canvas
                ref={canvasRef}
                className="drawing-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  cursor: activeTool === 'draw' ? 'crosshair' : 'default',
                  pointerEvents: activeTool === 'draw' ? 'auto' : 'none',
                  zIndex: activeTool === 'draw' ? 10 : 1,
                }}
              />

              {/* Shapes + Mobs */}
              {combinedItems.map(item => {
                if (item.itemType === 'square') {
                  const sq = item;
                  const isSel = selectedIds.includes(sq.id);
                  return (
                    <Draggable
                      key={sq.id}
                      position={sq.position}
                      scale={zoom}
                      onStart={() => { if (!isSel) { setSelectedIds([sq.id]); setSelectedMobIds([]); } }}
                      onDrag={(e, data) => {
                        const x = snap(data.x);
                        const y = snap(data.y);
                        // Move all selected shapes by the same delta if multi-selected
                        if (selectedIds.length > 1 && selectedIds.includes(sq.id)) {
                          const dx = x - sq.position.x;
                          const dy = y - sq.position.y;
                          setMapData(prev => ({
                            ...prev,
                            squares: prev.squares.map(s =>
                              selectedIds.includes(s.id)
                                ? { ...s, position: { x: s.position.x + dx, y: s.position.y + dy } }
                                : s
                            ),
                          }));
                        } else {
                          updateSquare(sq.id, { position: { x, y } });
                        }
                      }}
                      onStop={() => recordHistory()}
                      disabled={activeTool === 'draw' || activeTool === 'line' || resizing !== null || rotating !== null}
                    >
                      <div
                        className={`me2-shape ${isSel ? 'selected' : ''} ${sq.shape === 'line' ? 'me2-line' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTool !== 'select') return;
                          if (e.ctrlKey || e.metaKey) {
                            setSelectedIds(prev => prev.includes(sq.id) ? prev.filter(i => i !== sq.id) : [...prev, sq.id]);
                          } else {
                            setSelectedIds([sq.id]);
                            setSelectedMobIds([]);
                          }
                        }}
                        style={{
                          width: sq.size.width,
                          height: sq.size.height,
                          pointerEvents: (activeTool === 'draw' || activeTool === 'line') ? 'none' : 'auto',
                          zIndex: sq.layerIndex || 0,
                        }}
                      >
                        <div style={shapeStyle(sq.shape, sq.color, sq.rotation)}>
                          {sq.text && sq.shape !== 'line' && (
                            <span style={{
                              fontSize: `${sq.textSize || 16}px`,
                              color: sq.textColor || '#ffffff',
                              fontWeight: 'bold',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                              pointerEvents: 'none',
                            }}>{sq.text}</span>
                          )}
                        </div>
                        {isSel && activeTool === 'select' && (
                          <>
                            <div
                              className="me2-handle me2-handle-resize"
                              onMouseDown={(e) => handleResizeStart(e, sq.id, sq.size.width, sq.size.height, sq.shape)}
                              style={sq.shape === 'line' ? { bottom: '50%', transform: 'translateY(50%)' } : {}}
                            />
                            <div
                              className="me2-handle me2-handle-rotate"
                              onMouseDown={(e) => handleRotateStart(e, sq.id, sq.position, sq.size, sq.rotation)}
                            />
                          </>
                        )}
                      </div>
                    </Draggable>
                  );
                } else {
                  const mob = item;
                  const isSel = selectedMobIds.includes(mob.id);
                  return (
                    <Draggable
                      key={mob.id}
                      position={mob.position}
                      scale={zoom}
                      onStart={() => { if (!isSel) { setSelectedMobIds([mob.id]); setSelectedIds([]); } }}
                      onDrag={(e, data) => {
                        setMapData(prev => ({
                          ...prev,
                          placedMobs: prev.placedMobs.map(m =>
                            m.id === mob.id ? { ...m, position: { x: snap(data.x), y: snap(data.y) } } : m
                          ),
                        }));
                      }}
                      onStop={() => recordHistory()}
                      disabled={activeTool === 'draw' || activeTool === 'line' || resizingMob !== null || rotating !== null}
                    >
                      <div
                        className={`me2-mob ${isSel ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (e.ctrlKey || e.metaKey) {
                            setSelectedMobIds(prev => prev.includes(mob.id) ? prev.filter(i => i !== mob.id) : [...prev, mob.id]);
                          } else {
                            setSelectedMobIds([mob.id]);
                            setSelectedIds([]);
                          }
                        }}
                        style={{
                          width: mob.size, height: mob.size,
                          position: 'absolute',
                          cursor: (activeTool === 'draw' || activeTool === 'line') ? 'default' : 'move',
                          pointerEvents: (activeTool === 'draw' || activeTool === 'line') ? 'none' : 'auto',
                          zIndex: mob.layerIndex || 0,
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', transform: `rotate(${mob.rotation || 0}deg)`, transformOrigin: 'center' }}>
                          {mob.imageUrl && (
                            <img src={mob.imageUrl} alt={mob.name} style={{
                              width: '100%', height: '100%', objectFit: 'contain',
                              border: isSel ? '3px solid #d4af37' : '2px solid rgba(212,175,55,0.5)',
                              borderRadius: '4px', background: 'rgba(0,0,0,0.3)',
                            }} />
                          )}
                        </div>
                        <div className="me2-mob-label">{mob.name}</div>
                        {isSel && (
                          <>
                            <div className="me2-handle me2-handle-resize" onMouseDown={(e) => handleMobResizeStart(e, mob.id, mob.size)} />
                            <div className="me2-handle me2-handle-rotate" onMouseDown={(e) => handleRotateStart(e, mob.id, mob.position, mob.size, mob.rotation)} />
                          </>
                        )}
                      </div>
                    </Draggable>
                  );
                }
              })}

              {/* Line tool preview */}
              {lineDraw && (
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '2000px', height: '2000px', pointerEvents: 'none', zIndex: 9999 }}>
                  <line
                    x1={lineDraw.startX} y1={lineDraw.startY}
                    x2={lineDraw.endX} y2={lineDraw.endY}
                    stroke="#000000" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="8 4" opacity="0.7"
                  />
                  <circle cx={lineDraw.startX} cy={lineDraw.startY} r="4" fill="#d4af37" />
                  <circle cx={lineDraw.endX} cy={lineDraw.endY} r="4" fill="#d4af37" />
                </svg>
              )}

              {/* Box select overlay */}
              {boxSelect && (
                <div style={{
                  position: 'absolute',
                  left: Math.min(boxSelect.startX, boxSelect.endX),
                  top: Math.min(boxSelect.startY, boxSelect.endY),
                  width: Math.abs(boxSelect.endX - boxSelect.startX),
                  height: Math.abs(boxSelect.endY - boxSelect.startY),
                  border: '2px dashed #d4af37',
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  pointerEvents: 'none',
                  zIndex: 9999,
                }} />
              )}
            </div>
          </div>

          {/* ─── Right panel: Properties ─── */}
          {showProperties && (selectedSquare || selectedPlacedMob || selectedIds.length > 1 || selectedMobIds.length > 1) && (
            <div className="me2-right-panel">
              <div className="me2-panel-header">
                <h3>Properties</h3>
                <button className="me2-panel-close" onClick={() => setShowProperties(false)}>&#10005;</button>
              </div>

              {/* Multi-select info */}
              {(selectedIds.length > 1 || selectedMobIds.length > 1) && !selectedSquare && !selectedPlacedMob && (
                <div className="me2-prop-section">
                  <p className="me2-multi-info">{selectedIds.length + selectedMobIds.length} items selected</p>
                  <div className="me2-prop-actions">
                    <button className="me2-btn-small" onClick={duplicateSelected}>Duplicate All</button>
                    <button className="me2-btn-small me2-btn-danger" onClick={deleteSelected}>Delete All</button>
                  </div>
                </div>
              )}

              {/* Single shape properties */}
              {selectedSquare && (
                <div className="me2-prop-section">
                  <div className="me2-prop-row">
                    <label>Shape</label>
                    <select value={selectedSquare.shape} onChange={(e) => { recordHistory(); updateSquare(selectedSquare.id, { shape: e.target.value }); }}>
                      <option value="square">Square</option>
                      <option value="circle">Circle</option>
                      <option value="hexagon">Hexagon</option>
                      <option value="triangle">Triangle</option>
                      <option value="line">Line</option>
                    </select>
                  </div>
                  <div className="me2-prop-row">
                    <label>Color</label>
                    <input type="color" value={selectedSquare.color} onChange={(e) => { updateSquare(selectedSquare.id, { color: e.target.value }); }} />
                  </div>
                  {selectedSquare.shape !== 'line' && (
                    <>
                      <div className="me2-prop-row">
                        <label>Text</label>
                        <input type="text" value={selectedSquare.text || ''} onChange={(e) => updateSquare(selectedSquare.id, { text: e.target.value })} className="me2-input" />
                      </div>
                      <div className="me2-prop-row">
                        <label>Text Size</label>
                        <input type="number" value={selectedSquare.textSize || 16} min="8" max="72" onChange={(e) => updateSquare(selectedSquare.id, { textSize: parseInt(e.target.value) || 16 })} className="me2-input me2-input-num" />
                      </div>
                      <div className="me2-prop-row">
                        <label>Text Color</label>
                        <input type="color" value={selectedSquare.textColor || '#ffffff'} onChange={(e) => updateSquare(selectedSquare.id, { textColor: e.target.value })} />
                      </div>
                    </>
                  )}
                  <div className="me2-prop-row">
                    <label>{selectedSquare.shape === 'line' ? 'Length' : 'Width'}</label>
                    <input type="number" value={selectedSquare.size.width} min="10" onChange={(e) => { recordHistory(); updateSquare(selectedSquare.id, { size: { ...selectedSquare.size, width: parseInt(e.target.value) || 30 } }); }} className="me2-input me2-input-num" />
                  </div>
                  <div className="me2-prop-row">
                    <label>{selectedSquare.shape === 'line' ? 'Thickness' : 'Height'}</label>
                    <input type="number" value={selectedSquare.size.height} min={selectedSquare.shape === 'line' ? 1 : 10} max={selectedSquare.shape === 'line' ? 20 : undefined} onChange={(e) => { recordHistory(); updateSquare(selectedSquare.id, { size: { ...selectedSquare.size, height: parseInt(e.target.value) || 30 } }); }} className="me2-input me2-input-num" />
                  </div>
                  <div className="me2-prop-row">
                    <label>Rotation</label>
                    <div className="me2-rotation-row">
                      <input type="range" min="0" max="360" value={selectedSquare.rotation || 0} onChange={(e) => updateSquare(selectedSquare.id, { rotation: parseInt(e.target.value) })} />
                      <span className="me2-rotation-val">{selectedSquare.rotation || 0}°</span>
                    </div>
                  </div>
                  <div className="me2-prop-row">
                    <label>Layers</label>
                    <div className="me2-layer-btns">
                      <button onClick={() => bringToFront(selectedSquare.id)} title="Front">&#8607;&#8607;</button>
                      <button onClick={() => bringForward(selectedSquare.id)} title="Forward">&#8607;</button>
                      <button onClick={() => sendBackward(selectedSquare.id)} title="Backward">&#8609;</button>
                      <button onClick={() => sendToBack(selectedSquare.id)} title="Back">&#8609;&#8609;</button>
                    </div>
                  </div>
                  <div className="me2-prop-actions">
                    <button className="me2-btn-small me2-btn-primary" onClick={saveSelectedAsCustom}>Save as Template</button>
                    <button className="me2-btn-small" onClick={duplicateSelected}>Duplicate</button>
                    <button className="me2-btn-small me2-btn-danger" onClick={deleteSelected}>Delete</button>
                  </div>
                </div>
              )}

              {/* Single mob properties */}
              {selectedPlacedMob && (
                <div className="me2-prop-section">
                  <p style={{ color: '#d4af37', fontWeight: 'bold', margin: '0 0 0.5rem' }}>{selectedPlacedMob.name}</p>
                  <div className="me2-prop-row">
                    <label>Rotation</label>
                    <div className="me2-rotation-row">
                      <input type="range" min="0" max="360" value={selectedPlacedMob.rotation || 0} onChange={(e) => {
                        setMapData(prev => ({
                          ...prev,
                          placedMobs: prev.placedMobs.map(m => m.id === selectedPlacedMob.id ? { ...m, rotation: parseInt(e.target.value) } : m),
                        }));
                      }} />
                      <span className="me2-rotation-val">{selectedPlacedMob.rotation || 0}°</span>
                    </div>
                  </div>
                  <div className="me2-prop-row">
                    <label>Size</label>
                    <input type="number" value={selectedPlacedMob.size} min="20" onChange={(e) => {
                      setMapData(prev => ({
                        ...prev,
                        placedMobs: prev.placedMobs.map(m => m.id === selectedPlacedMob.id ? { ...m, size: parseInt(e.target.value) || 80 } : m),
                      }));
                    }} className="me2-input me2-input-num" />
                  </div>
                  <div className="me2-prop-row">
                    <label>Layers</label>
                    <div className="me2-layer-btns">
                      <button onClick={() => bringToFront(selectedPlacedMob.id)} title="Front">&#8607;&#8607;</button>
                      <button onClick={() => bringForward(selectedPlacedMob.id)} title="Forward">&#8607;</button>
                      <button onClick={() => sendBackward(selectedPlacedMob.id)} title="Backward">&#8609;</button>
                      <button onClick={() => sendToBack(selectedPlacedMob.id)} title="Back">&#8609;&#8609;</button>
                    </div>
                  </div>
                  <div className="me2-prop-actions">
                    <button className="me2-btn-small" onClick={duplicateSelected}>Duplicate</button>
                    <button className="me2-btn-small me2-btn-danger" onClick={deleteSelected}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ STATUS BAR ═══ */}
        <div className="me2-statusbar">
          <span>{mapData.squares.length} shapes</span>
          <span>{(mapData.placedMobs || []).length} mobs</span>
          <span>{selectedIds.length + selectedMobIds.length} selected</span>
          <span className="me2-status-sep" />
          <span className="me2-shortcuts">V: Select &nbsp; B: Draw &nbsp; H: Pan &nbsp; L: Line &nbsp; G: Grid &nbsp; Del: Delete &nbsp; Ctrl+Z/Y: Undo/Redo &nbsp; Ctrl+D: Duplicate &nbsp; Ctrl+C/V: Copy/Paste &nbsp; Ctrl+A: Select All</span>
        </div>

        {/* ═══ CONTEXT MENU ═══ */}
        {contextMenu && (
          <div className="me2-context-menu" style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 10000 }}>
            {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
              <div key={catKey} className="me2-ctx-section">
                <div className="me2-ctx-header" onClick={() => setExpandedSections(prev => ({ ...prev, [catKey]: !prev[catKey] }))}>
                  {expandedSections[catKey] ? '▾' : '▸'} {catLabel}
                </div>
                {expandedSections[catKey] && categoryShapes[catKey].map(tpl => (
                  <button
                    key={tpl.id}
                    className="me2-ctx-item"
                    onClick={() => {
                      addShapeAt(tpl, { x: contextMenu.mapX, y: contextMenu.mapY });
                      setContextMenu(null);
                    }}
                  >
                    <div className="me2-ctx-preview" style={shapePreviewStyle(tpl.shape, tpl.color, 20, 20)} />
                    <span>{tpl.icon} {tpl.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ═══ SHAPE EDITOR MODAL ═══ */}
        {editingShape && (
          <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={() => setEditingShape(null)}>
            <div className="me2-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingShape.isNew ? 'Save as Template' : 'Edit Shape Template'}</h2>
              <div className="me2-modal-preview">
                <div style={shapePreviewStyle(editingShape.shape.shape, editingShape.shape.color, 60, 60)} />
              </div>
              <div className="me2-modal-form">
                <div className="me2-prop-row">
                  <label>Name</label>
                  <input type="text" value={editingShape.shape.name} onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, name: e.target.value } }))} className="me2-input" />
                </div>
                <div className="me2-prop-row">
                  <label>Icon</label>
                  <input type="text" value={editingShape.shape.icon} onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, icon: e.target.value } }))} className="me2-input" style={{ width: '60px' }} />
                </div>
                <div className="me2-prop-row">
                  <label>Type</label>
                  <select value={editingShape.shape.shape} onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, shape: e.target.value } }))}>
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="triangle">Triangle</option>
                    <option value="line">Line</option>
                  </select>
                </div>
                <div className="me2-prop-row">
                  <label>Color</label>
                  <input type="color" value={editingShape.shape.color} onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, color: e.target.value } }))} />
                </div>
                {editingShape.shape.shape !== 'line' && (
                  <div className="me2-prop-row">
                    <label>Label</label>
                    <input type="text" value={editingShape.shape.text || ''} onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, text: e.target.value } }))} className="me2-input" />
                  </div>
                )}
                <div className="me2-prop-row">
                  <label>Width</label>
                  <input type="number" value={editingShape.shape.size.width} min="10" onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, size: { ...prev.shape.size, width: parseInt(e.target.value) || 80 } } }))} className="me2-input me2-input-num" />
                </div>
                <div className="me2-prop-row">
                  <label>Height</label>
                  <input type="number" value={editingShape.shape.size.height} min={editingShape.shape.shape === 'line' ? 1 : 10} onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, size: { ...prev.shape.size, height: parseInt(e.target.value) || 80 } } }))} className="me2-input me2-input-num" />
                </div>
                <div className="me2-prop-row">
                  <label>Text Size</label>
                  <input type="number" value={editingShape.shape.textSize || 16} min="8" max="72" onChange={(e) => setEditingShape(prev => ({ ...prev, shape: { ...prev.shape, textSize: parseInt(e.target.value) || 16 } }))} className="me2-input me2-input-num" />
                </div>
                {editingShape.isNew && (
                  <div className="me2-prop-row">
                    <label>Category</label>
                    <select value={editingShape.category} onChange={(e) => setEditingShape(prev => ({ ...prev, category: e.target.value }))}>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="me2-modal-actions">
                <button className="me2-btn me2-btn-primary" onClick={() => {
                  if (editingShape.isNew) {
                    saveNewShape(editingShape.category, editingShape.shape);
                  } else {
                    saveEditedShape();
                  }
                }}>
                  {editingShape.isNew ? 'Save Template' : 'Save Changes'}
                </button>
                <button className="me2-btn" onClick={() => setEditingShape(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ADD SHAPE MODAL ═══ */}
        {addingToCategory && (
          <AddShapeModal
            category={addingToCategory}
            categoryLabel={CATEGORY_LABELS[addingToCategory]}
            onSave={(shape) => saveNewShape(addingToCategory, shape)}
            onClose={() => setAddingToCategory(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Add Shape Modal (standalone to keep state clean) ───────────────
function AddShapeModal({ category, categoryLabel, onSave, onClose }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [shape, setShape] = useState('square');
  const [color, setColor] = useState('#d4af37');
  const [text, setText] = useState('');
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(80);
  const [textSize, setTextSize] = useState(16);

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={onClose}>
      <div className="me2-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Shape to {categoryLabel}</h2>
        <div className="me2-modal-preview">
          <div style={shapePreviewStyle(shape, color, 60, 60)} />
        </div>
        <div className="me2-modal-form">
          <div className="me2-prop-row"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="me2-input" placeholder="Shape name..." /></div>
          <div className="me2-prop-row"><label>Icon</label><input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className="me2-input" style={{ width: '60px' }} /></div>
          <div className="me2-prop-row"><label>Type</label>
            <select value={shape} onChange={(e) => setShape(e.target.value)}>
              <option value="square">Square</option><option value="circle">Circle</option>
              <option value="hexagon">Hexagon</option><option value="triangle">Triangle</option>
              <option value="line">Line</option>
            </select>
          </div>
          <div className="me2-prop-row"><label>Color</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></div>
          {shape !== 'line' && <div className="me2-prop-row"><label>Label</label><input type="text" value={text} onChange={(e) => setText(e.target.value)} className="me2-input" /></div>}
          <div className="me2-prop-row"><label>Width</label><input type="number" value={width} min="10" onChange={(e) => setWidth(parseInt(e.target.value) || 80)} className="me2-input me2-input-num" /></div>
          <div className="me2-prop-row"><label>Height</label><input type="number" value={height} min={shape === 'line' ? 1 : 10} onChange={(e) => setHeight(parseInt(e.target.value) || 80)} className="me2-input me2-input-num" /></div>
          <div className="me2-prop-row"><label>Text Size</label><input type="number" value={textSize} min="8" max="72" onChange={(e) => setTextSize(parseInt(e.target.value) || 16)} className="me2-input me2-input-num" /></div>
        </div>
        <div className="me2-modal-actions">
          <button className="me2-btn me2-btn-primary" disabled={!name.trim()} onClick={() => onSave({ name, icon, shape, color, text: shape === 'line' ? '' : text, textSize, size: { width, height } })}>Add Shape</button>
          <button className="me2-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default MapEditor;
