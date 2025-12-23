import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function SessionManager({ onClose }) {
  const {
    sessions,
    currentSession,
    createSession,
    loadSession,
    deleteSession
  } = useGame();

  const [newSessionName, setNewSessionName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const handleCreate = async () => {
    if (!newSessionName.trim()) return;
    await createSession(newSessionName);
    setNewSessionName('');
    setShowNewForm(false);
  };

  const handleLoad = async (sessionId) => {
    await loadSession(sessionId);
    onClose();
  };

  const handleDelete = async (sessionId) => {
    if (confirm('Delete this session? This cannot be undone.')) {
      await deleteSession(sessionId);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Session Manager</h2>

        <div className="manager-content">
          {currentSession && (
            <div className="current-session">
              <p>Current Session: <strong>{currentSession.name}</strong></p>
            </div>
          )}

          <div className="manager-actions">
            <button className="primary" onClick={() => setShowNewForm(!showNewForm)}>
              + New Session
            </button>
          </div>

          {showNewForm && (
            <div className="form-inline">
              <input
                type="text"
                placeholder="Session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button className="primary" onClick={handleCreate}>Create</button>
              <button onClick={() => setShowNewForm(false)}>Cancel</button>
            </div>
          )}

          <div className="item-list">
            {sessions.length === 0 ? (
              <p className="empty-state">No sessions created yet</p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className={`item-card ${currentSession?.id === session.id ? 'active' : ''}`}
                >
                  <div className="item-info">
                    <h3>{session.name}</h3>
                    <p className="item-meta">
                      Last modified: {new Date(session.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <div className="item-actions">
                    {currentSession?.id !== session.id && (
                      <button className="primary" onClick={() => handleLoad(session.id)}>
                        Load
                      </button>
                    )}
                    <button className="danger" onClick={() => handleDelete(session.id)}>
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

export default SessionManager;
