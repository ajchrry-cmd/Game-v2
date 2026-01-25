import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import JoinScreen from './components/Player/JoinScreen';
import PlayerView from './components/Player/PlayerView';
import LandingPage from './components/Player/LandingPage';
import { GameProvider } from './contexts/GameContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        {/* Landing/Welcome Page */}
        <Route path="/welcome" element={<LandingPage />} />

        {/* Player Routes */}
        <Route path="/join" element={<JoinScreen />} />
        <Route path="/player/:sessionId" element={<PlayerView />} />

        {/* GM Route (default) */}
        <Route path="/*" element={
          <GameProvider>
            <App />
          </GameProvider>
        } />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
