import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import JoinScreen from './components/Player/JoinScreen';
import PlayerView from './components/Player/PlayerView';
import { GameProvider } from './contexts/GameContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/Game-v2">
      <Routes>
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
    </BrowserRouter>
  </React.StrictMode>
);
