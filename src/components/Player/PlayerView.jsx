import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import PlayerCharacter from './PlayerCharacter';
import CharacterSelect from './CharacterSelect';
import './PlayerView.css';

function PlayerView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/join');
      return;
    }

    // Real-time listener for session data
    const sessionRef = doc(db, 'sessions', sessionId);
    const unsubscribe = onSnapshot(
      sessionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const sessionData = { id: docSnap.id, ...docSnap.data() };
          setSession(sessionData);
          setPlayers(sessionData.players || []);
          setLoading(false);
        } else {
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

  return (
    <div className="player-view">
      {!selectedPlayerId || !selectedPlayer ? (
        <CharacterSelect
          players={players}
          sessionName={session?.name}
          onSelectCharacter={handleSelectCharacter}
        />
      ) : (
        <PlayerCharacter
          player={selectedPlayer}
          sessionName={session?.name}
          onChangeCharacter={handleChangeCharacter}
        />
      )}
    </div>
  );
}

export default PlayerView;
