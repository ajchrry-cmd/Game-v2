import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Current session state
  const [currentSession, setCurrentSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentScene, setCurrentScene] = useState('map');
  const [currentSceneId, setCurrentSceneId] = useState(null);
  const [currentWheelId, setCurrentWheelId] = useState(null);
  const [currentMapId, setCurrentMapId] = useState(null);
  const [playerPositions, setPlayerPositions] = useState({});
  const [mapBackground, setMapBackground] = useState(null);

  // Persistent data
  const [maps, setMaps] = useState([]);
  const [items, setItems] = useState([]);
  const [wheels, setWheels] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [sessions, setSessions] = useState([]);

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);

  // Load all persistent data
  useEffect(() => {
    loadMaps();
    loadItems();
    loadWheels();
    loadScenes();
    loadSessions();
  }, []);

  // ===== SESSIONS =====
  const loadSessions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'sessions'));
      const loadedSessions = [];
      querySnapshot.forEach((doc) => {
        loadedSessions.push({ id: doc.id, ...doc.data() });
      });
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createSession = async (name) => {
    try {
      const newSession = {
        name,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        players: [],
        currentMap: null,
        currentMapState: {
          playerPositions: {},
          background: null
        },
        currentScene: 'map',
        currentSceneId: null,
        currentWheelId: null
      };
      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      const session = { id: docRef.id, ...newSession };
      setSessions([...sessions, session]);
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const session = { id: docSnap.id, ...docSnap.data() };
        setCurrentSession(session);
        setPlayers(session.players || []);
        setCurrentScene(session.currentScene || 'map');
        setCurrentSceneId(session.currentSceneId);
        setCurrentWheelId(session.currentWheelId);
        setCurrentMapId(session.currentMap);
        setPlayerPositions(session.currentMapState?.playerPositions || {});
        setMapBackground(session.currentMapState?.background);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const saveSession = async () => {
    if (!currentSession) return;
    try {
      const sessionData = {
        ...currentSession,
        lastModified: new Date().toISOString(),
        players,
        currentMap: currentMapId,
        currentMapState: {
          playerPositions,
          background: mapBackground
        },
        currentScene,
        currentSceneId,
        currentWheelId
      };
      await setDoc(doc(db, 'sessions', currentSession.id), sessionData);
      setCurrentSession(sessionData);
      // Update in sessions list
      setSessions(sessions.map(s => s.id === currentSession.id ? sessionData : s));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setPlayers([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Auto-save session when state changes
  useEffect(() => {
    if (currentSession) {
      const timer = setTimeout(() => {
        saveSession();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [players, currentScene, currentSceneId, currentWheelId, currentMapId, playerPositions, mapBackground]);

  // ===== MAPS =====
  const loadMaps = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'maps'));
      const loadedMaps = [];
      querySnapshot.forEach((doc) => {
        loadedMaps.push({ id: doc.id, ...doc.data() });
      });
      setMaps(loadedMaps);
    } catch (error) {
      console.error('Error loading maps:', error);
    }
  };

  const saveMap = async (map) => {
    try {
      if (map.id) {
        await setDoc(doc(db, 'maps', map.id), map);
        setMaps(maps.map(m => m.id === map.id ? map : m));
      } else {
        const newMap = { ...map, id: uuidv4() };
        await setDoc(doc(db, 'maps', newMap.id), newMap);
        setMaps([...maps, newMap]);
      }
    } catch (error) {
      console.error('Error saving map:', error);
    }
  };

  const deleteMap = async (mapId) => {
    try {
      await deleteDoc(doc(db, 'maps', mapId));
      setMaps(maps.filter(m => m.id !== mapId));
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  // ===== ITEMS =====
  const loadItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const loadedItems = [];
      querySnapshot.forEach((doc) => {
        loadedItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const saveItem = async (item) => {
    try {
      if (item.id) {
        await setDoc(doc(db, 'items', item.id), item);
        setItems(items.map(i => i.id === item.id ? item : i));
      } else {
        const newItem = { ...item, id: uuidv4() };
        await setDoc(doc(db, 'items', newItem.id), newItem);
        setItems([...items, newItem]);
      }
      return item.id || newItem.id;
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'items', itemId));
      setItems(items.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // ===== WHEELS =====
  const loadWheels = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'wheels'));
      const loadedWheels = [];
      querySnapshot.forEach((doc) => {
        loadedWheels.push({ id: doc.id, ...doc.data() });
      });
      setWheels(loadedWheels);
    } catch (error) {
      console.error('Error loading wheels:', error);
    }
  };

  const saveWheel = async (wheel) => {
    try {
      if (wheel.id) {
        await setDoc(doc(db, 'wheels', wheel.id), wheel);
        setWheels(wheels.map(w => w.id === wheel.id ? wheel : w));
      } else {
        const newWheel = { ...wheel, id: uuidv4() };
        await setDoc(doc(db, 'wheels', newWheel.id), newWheel);
        setWheels([...wheels, newWheel]);
      }
    } catch (error) {
      console.error('Error saving wheel:', error);
    }
  };

  const deleteWheel = async (wheelId) => {
    try {
      await deleteDoc(doc(db, 'wheels', wheelId));
      setWheels(wheels.filter(w => w.id !== wheelId));
    } catch (error) {
      console.error('Error deleting wheel:', error);
    }
  };

  // ===== SCENES =====
  const loadScenes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'scenes'));
      const loadedScenes = [];
      querySnapshot.forEach((doc) => {
        loadedScenes.push({ id: doc.id, ...doc.data() });
      });
      setScenes(loadedScenes);
    } catch (error) {
      console.error('Error loading scenes:', error);
    }
  };

  const saveScene = async (scene) => {
    try {
      if (scene.id) {
        await setDoc(doc(db, 'scenes', scene.id), scene);
        setScenes(scenes.map(s => s.id === scene.id ? scene : s));
      } else {
        const newScene = { ...scene, id: uuidv4() };
        await setDoc(doc(db, 'scenes', newScene.id), newScene);
        setScenes([...scenes, newScene]);
      }
    } catch (error) {
      console.error('Error saving scene:', error);
    }
  };

  const deleteScene = async (sceneId) => {
    try {
      await deleteDoc(doc(db, 'scenes', sceneId));
      setScenes(scenes.filter(s => s.id !== sceneId));
    } catch (error) {
      console.error('Error deleting scene:', error);
    }
  };

  // ===== IMAGE UPLOAD =====
  const uploadImage = async (file, folder = 'images') => {
    try {
      const fileName = `${folder}/${uuidv4()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // ===== PLAYERS =====
  const addPlayer = (player) => {
    const newPlayer = {
      id: uuidv4(),
      name: player.name || 'Player',
      power: player.power || 0,
      money: player.money || 0,
      inventory: [],
      position: { x: 100, y: 100 },
      iconType: player.iconType || 'token',
      iconColor: player.iconColor || '#FF0000',
      iconUrl: player.iconUrl || null
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (playerId, updates) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, ...updates } : p));
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const updatePlayerPosition = (playerId, position) => {
    setPlayerPositions({ ...playerPositions, [playerId]: position });
  };

  const value = {
    // Session
    currentSession,
    sessions,
    createSession,
    loadSession,
    saveSession,
    deleteSession,

    // Players
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    playerPositions,
    updatePlayerPosition,

    // Scene management
    currentScene,
    setCurrentScene,
    currentSceneId,
    setCurrentSceneId,
    currentWheelId,
    setCurrentWheelId,

    // Maps
    maps,
    currentMapId,
    setCurrentMapId,
    saveMap,
    deleteMap,
    mapBackground,
    setMapBackground,

    // Items
    items,
    saveItem,
    deleteItem,

    // Wheels
    wheels,
    saveWheel,
    deleteWheel,

    // Scenes
    scenes,
    saveScene,
    deleteScene,

    // Utilities
    uploadImage,
    menuOpen,
    setMenuOpen
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
