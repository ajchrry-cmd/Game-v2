import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './JoinScreen.css';

function JoinScreen() {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Find session by room code (first 6 chars of session ID)
      const sessionsRef = collection(db, 'sessions');
      const querySnapshot = await getDocs(sessionsRef);

      let foundSession = null;
      querySnapshot.forEach((doc) => {
        const code = doc.id.slice(0, 6).toUpperCase();
        if (code === roomCode.toUpperCase()) {
          foundSession = { id: doc.id, ...doc.data() };
        }
      });

      if (!foundSession) {
        setError('Room not found. Please check the code and try again.');
        setLoading(false);
        return;
      }

      // Navigate to character selection for this session
      navigate(`/player/${foundSession.id}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-screen">
      <div className="join-container">
        <h1>🎲 DND Player View</h1>
        <p className="join-subtitle">Join your game master's session</p>

        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label htmlFor="roomCode">Room Code</label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="room-code-input"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="join-button"
            disabled={loading || roomCode.length !== 6}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>

        <div className="join-help">
          <p>Ask your Game Master for the room code</p>
        </div>
      </div>
    </div>
  );
}

export default JoinScreen;
