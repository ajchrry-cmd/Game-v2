import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot
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
  const [bonuses, setBonuses] = useState([]);

  // Map-specific state
  const [placedBonuses, setPlacedBonuses] = useState([]);

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);

  // Real-time listener unsubscribe functions
  const sessionUnsubscribe = useRef(null);

  // Flag to prevent auto-save loop when receiving updates from Firestore
  const isUpdatingFromFirestore = useRef(false);

  // Load all persistent data
  useEffect(() => {
    loadMaps();
    loadItems();
    loadWheels();
    loadScenes();
    loadSessions();
    loadBonuses();
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
          background: null,
          placedBonuses: []
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

  const loadSession = (sessionId) => {
    try {
      // Unsubscribe from previous session if exists
      if (sessionUnsubscribe.current) {
        sessionUnsubscribe.current();
        sessionUnsubscribe.current = null;
      }

      // Set up real-time listener for the session
      const docRef = doc(db, 'sessions', sessionId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          // Set flag to prevent auto-save loop
          isUpdatingFromFirestore.current = true;

          const session = { id: docSnap.id, ...docSnap.data() };
          setCurrentSession(session);
          setPlayers(session.players || []);
          setCurrentScene(session.currentScene || 'map');
          setCurrentSceneId(session.currentSceneId);
          setCurrentWheelId(session.currentWheelId);
          setCurrentMapId(session.currentMap);
          setPlayerPositions(session.currentMapState?.playerPositions || {});
          setMapBackground(session.currentMapState?.background);
          setPlacedBonuses(session.currentMapState?.placedBonuses || []);

          // Reset flag after state updates are queued
          setTimeout(() => {
            isUpdatingFromFirestore.current = false;
          }, 0);
        } else {
          console.warn('Session no longer exists');
          setCurrentSession(null);
          setPlayers([]);
        }
      }, (error) => {
        console.error('Error in session listener:', error);
      });

      // Store unsubscribe function
      sessionUnsubscribe.current = unsubscribe;
    } catch (error) {
      console.error('Error setting up session listener:', error);
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
          background: mapBackground,
          placedBonuses
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

  // Auto-save session when state changes (with short debounce for batching)
  useEffect(() => {
    if (currentSession && !isUpdatingFromFirestore.current) {
      const timer = setTimeout(() => {
        saveSession();
      }, 100); // Reduced from 1000ms to 100ms for near-instant sync
      return () => clearTimeout(timer);
    }
  }, [players, currentScene, currentSceneId, currentWheelId, currentMapId, playerPositions, mapBackground, placedBonuses]);

  // Cleanup session listener on unmount
  useEffect(() => {
    return () => {
      if (sessionUnsubscribe.current) {
        sessionUnsubscribe.current();
      }
    };
  }, []);

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
      // Recursively remove undefined values to prevent Firestore errors
      const cleanObject = (obj) => {
        if (obj === null || obj === undefined) return null;

        if (Array.isArray(obj)) {
          return obj.map(item => cleanObject(item));
        }

        if (typeof obj === 'object') {
          return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = cleanObject(value);
            }
            return acc;
          }, {});
        }

        return obj;
      };

      const cleanMap = cleanObject(map);

      if (map.id) {
        await setDoc(doc(db, 'maps', map.id), cleanMap);
        setMaps(maps.map(m => m.id === map.id ? map : m));
      } else {
        const newMap = { ...cleanMap, id: uuidv4() };
        await setDoc(doc(db, 'maps', newMap.id), newMap);
        setMaps([...maps, newMap]);
      }
    } catch (error) {
      console.error('Error saving map:', error);
      throw error; // Re-throw so caller can handle it
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

      // If no items exist, create some sample items
      if (loadedItems.length === 0) {
        const sampleItems = [
          {
            id: uuidv4(),
            name: 'Health Potion',
            description: 'Restores 50 HP',
            price: 50,
            imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=potion&backgroundColor=ff0000',
            inShop: true
          },
          {
            id: uuidv4(),
            name: 'Iron Sword',
            description: '+10 Attack damage',
            price: 150,
            imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=sword&backgroundColor=c0c0c0',
            inShop: true
          },
          {
            id: uuidv4(),
            name: 'Wooden Shield',
            description: '+5 Defense',
            price: 100,
            imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=shield&backgroundColor=8b4513',
            inShop: true
          },
          {
            id: uuidv4(),
            name: 'Gold Coins',
            description: 'Currency for trading',
            price: 10,
            imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=coins&backgroundColor=ffd700',
            inShop: true
          },
          {
            id: uuidv4(),
            name: 'Magic Scroll',
            description: 'Cast a random spell',
            price: 200,
            imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=scroll&backgroundColor=f5f5dc',
            inShop: true
          },
          {
            id: uuidv4(),
            name: 'Leather Armor',
            description: '+8 Defense',
            price: 175,
            imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=armor&backgroundColor=8b4513',
            inShop: true
          }
        ];

        // Save sample items to Firestore
        for (const item of sampleItems) {
          await setDoc(doc(db, 'items', item.id), item);
          loadedItems.push(item);
        }
      }

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

  // ===== BONUSES =====
  const loadBonuses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bonuses'));
      const loadedBonuses = [];
      querySnapshot.forEach((doc) => {
        loadedBonuses.push({ id: doc.id, ...doc.data() });
      });
      setBonuses(loadedBonuses);
    } catch (error) {
      console.error('Error loading bonuses:', error);
    }
  };

  const saveBonus = async (bonus) => {
    try {
      if (bonus.id) {
        await setDoc(doc(db, 'bonuses', bonus.id), bonus);
        setBonuses(bonuses.map(b => b.id === bonus.id ? bonus : b));
      } else {
        const newBonus = { ...bonus, id: uuidv4() };
        await setDoc(doc(db, 'bonuses', newBonus.id), newBonus);
        setBonuses([...bonuses, newBonus]);
      }
    } catch (error) {
      console.error('Error saving bonus:', error);
    }
  };

  const deleteBonus = async (bonusId) => {
    try {
      await deleteDoc(doc(db, 'bonuses', bonusId));
      setBonuses(bonuses.filter(b => b.id !== bonusId));
    } catch (error) {
      console.error('Error deleting bonus:', error);
    }
  };

  const placeBonus = (bonusId, position) => {
    const newPlacedBonus = {
      id: uuidv4(),
      bonusId,
      position,
      size: 60 // Default size in pixels
    };
    setPlacedBonuses([...placedBonuses, newPlacedBonus]);
  };

  const updateBonusPosition = (placedBonusId, position) => {
    setPlacedBonuses(placedBonuses.map(pb =>
      pb.id === placedBonusId ? { ...pb, position } : pb
    ));
  };

  const updateBonusSize = (placedBonusId, size) => {
    setPlacedBonuses(placedBonuses.map(pb =>
      pb.id === placedBonusId ? { ...pb, size } : pb
    ));
  };

  const removeBonus = (placedBonusId) => {
    setPlacedBonuses(placedBonuses.filter(pb => pb.id !== placedBonusId));
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

    // Bonuses
    bonuses,
    saveBonus,
    deleteBonus,
    placedBonuses,
    placeBonus,
    updateBonusPosition,
    updateBonusSize,
    removeBonus,

    // Utilities
    uploadImage,
    menuOpen,
    setMenuOpen
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
