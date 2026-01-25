import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, collection, onSnapshot, getDocs, updateDoc } from 'firebase/firestore';
import PlayerCharacter from './PlayerCharacter';
import CharacterSelect from './CharacterSelect';
import './PlayerView.css';

function PlayerView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [items, setItems] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/join');
      return;
    }

    // Load items and bonuses
    const loadItemsAndBonuses = async () => {
      try {
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const loadedItems = [];
        itemsSnapshot.forEach((doc) => {
          loadedItems.push({ id: doc.id, ...doc.data() });
        });
        setItems(loadedItems);

        const bonusesSnapshot = await getDocs(collection(db, 'bonuses'));
        const loadedBonuses = [];
        bonusesSnapshot.forEach((doc) => {
          loadedBonuses.push({ id: doc.id, ...doc.data() });
        });
        setBonuses(loadedBonuses);
      } catch (err) {
        console.error('Error loading items/bonuses:', err);
      }
    };

    loadItemsAndBonuses();

    // Real-time listener for session data
    const sessionRef = doc(db, 'sessions', sessionId);
    const unsubscribe = onSnapshot(
      sessionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const sessionData = { id: docSnap.id, ...docSnap.data() };
          console.log('PlayerView: Session loaded:', {
            sessionId: sessionData.id,
            name: sessionData.name,
            playerCount: sessionData.players?.length || 0,
            hasCompanionSettings: !!sessionData.companionSettings,
            companionSettings: sessionData.companionSettings
          });
          setSession(sessionData);
          setPlayers(sessionData.players || []);
          setLoading(false);
        } else {
          console.error('PlayerView: Session not found');
          setError('Session not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error loading session:', err);
        setError('Failed to load session');
        setLoading(false);
      }
    );

    // Load selected character from localStorage
    const savedSelection = localStorage.getItem(`player_${sessionId}`);
    if (savedSelection) {
      setSelectedPlayerId(savedSelection);
    }

    return () => unsubscribe();
  }, [sessionId, navigate]);

  const handleSelectCharacter = (playerId) => {
    setSelectedPlayerId(playerId);
    localStorage.setItem(`player_${sessionId}`, playerId);
  };

  const handleChangeCharacter = () => {
    setSelectedPlayerId(null);
    localStorage.removeItem(`player_${sessionId}`);
  };

  const handleClearMessage = async (playerId, messageId) => {
    if (!session) return;

    const sessionRef = doc(db, 'sessions', sessionId);
    const currentMessages = session.playerMessages || {};
    const playerMessagesList = currentMessages[playerId] || [];

    // Filter out the dismissed message
    const updatedMessages = {
      ...currentMessages,
      [playerId]: playerMessagesList.filter(msg => msg.id !== messageId)
    };

    try {
      await updateDoc(sessionRef, {
        playerMessages: updatedMessages
      });
    } catch (err) {
      console.error('Error clearing message:', err);
    }
  };

  const handleClearFlash = async (playerId, flashId) => {
    if (!session) return;

    const sessionRef = doc(db, 'sessions', sessionId);
    const currentFlashes = session.playerFlashEvents || {};
    const playerFlashList = currentFlashes[playerId] || [];

    // Filter out the processed flash
    const updatedFlashes = {
      ...currentFlashes,
      [playerId]: playerFlashList.filter(flash => flash.id !== flashId)
    };

    try {
      await updateDoc(sessionRef, {
        playerFlashEvents: updatedFlashes
      });
    } catch (err) {
      console.error('Error clearing flash:', err);
    }
  };

  const handleSendMessage = async (playerId, message) => {
    if (!session) return;

    const sessionRef = doc(db, 'sessions', sessionId);
    const currentMessages = session.playerMessages || {};
    const playerMessagesList = currentMessages[playerId] || [];

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
      text: message,
      timestamp: Date.now(),
      read: false
    };

    const updatedMessages = {
      ...currentMessages,
      [playerId]: [...playerMessagesList, messageData]
    };

    try {
      await updateDoc(sessionRef, {
        playerMessages: updatedMessages
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFlashScreen = async (playerId, color) => {
    if (!session) return;

    const sessionRef = doc(db, 'sessions', sessionId);
    const currentFlashes = session.playerFlashEvents || {};
    const playerFlashList = currentFlashes[playerId] || [];

    const flashId = `flash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const flashData = {
      id: flashId,
      color: color,
      timestamp: Date.now()
    };

    const updatedFlashes = {
      ...currentFlashes,
      [playerId]: [...playerFlashList, flashData]
    };

    try {
      await updateDoc(sessionRef, {
        playerFlashEvents: updatedFlashes
      });
    } catch (err) {
      console.error('Error flashing screen:', err);
    }
  };

  const handleUpdatePlayerNotes = async (playerId, notes) => {
    if (!session) return;

    const sessionRef = doc(db, 'sessions', sessionId);
    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, gmNotes: notes } : p
    );

    try {
      await updateDoc(sessionRef, {
        players: updatedPlayers
      });
    } catch (err) {
      console.error('Error updating player notes:', err);
    }
  };

  if (loading) {
    return (
      <div className="player-view-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-view-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/join')}>Back to Join</button>
      </div>
    );
  }

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  // Debug logging
  if (selectedPlayer) {
    console.log('PlayerView: Selected player:', {
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      hasInventory: !!selectedPlayer.inventory,
      inventoryCount: selectedPlayer.inventory?.length || 0
    });
  }

  // Extract companion settings and messages from session
  const companionSettings = session?.companionSettings || {
    showPower: true,
    showMoney: true,
    showCustomStats: true,
    showInventory: true,
    showParty: true,
    showStatusEffects: true,
    allowCharacterSwitch: true,
    blindMode: false
  };

  const playerMessages = session?.playerMessages || {};
  const playerFlashEvents = session?.playerFlashEvents || {};

  console.log('PlayerView: Rendering with:', {
    hasSession: !!session,
    selectedPlayerId,
    hasSelectedPlayer: !!selectedPlayer,
    itemsCount: items.length,
    bonusesCount: bonuses.length,
    playersCount: players.length
  });

  return (
    <div className="player-view">
      {!selectedPlayerId || !selectedPlayer ? (
        <CharacterSelect
          players={players}
          sessionName={session?.name}
          sessionId={sessionId}
          onSelectCharacter={handleSelectCharacter}
          onSendMessage={handleSendMessage}
          onFlashScreen={handleFlashScreen}
          onUpdatePlayerNotes={handleUpdatePlayerNotes}
        />
      ) : (
        <PlayerCharacter
          player={selectedPlayer}
          items={items}
          bonuses={bonuses}
          sessionName={session?.name}
          sessionId={sessionId}
          companionSettings={companionSettings}
          playerMessages={playerMessages}
          playerFlashEvents={playerFlashEvents}
          onChangeCharacter={handleChangeCharacter}
          onClearMessage={handleClearMessage}
          onClearFlash={handleClearFlash}
        />
      )}
    </div>
  );
}

export default PlayerView;
