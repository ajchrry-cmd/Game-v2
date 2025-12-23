import React, { useEffect } from 'react';
import { useGame } from './contexts/GameContext';
import { useFirebaseCheck } from './hooks/useFirebaseCheck';
import MasterMenu from './components/UI/MasterMenu';
import MapScreen from './components/Map/MapScreen';
import WheelScreen from './components/Wheel/WheelScreen';
import SceneViewer from './components/Scenes/SceneViewer';
import ShopScreen from './components/Shop/ShopScreen';
import './App.css';

function App() {
  const { currentScene, currentSession } = useGame();
  const firebaseStatus = useFirebaseCheck();

  return (
    <div className="app">
      {firebaseStatus.errors.length > 0 && (
        <div className="firebase-warning">
          <strong>⚠️ Firebase Setup Required</strong>
          <p>Please complete Firebase setup to use this app:</p>
          <ul>
            {firebaseStatus.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          <p>See <strong>SETUP.md</strong> for instructions</p>
        </div>
      )}

      {!currentSession ? (
        <div className="no-session">
          <h1>DND Game Master</h1>
          <p>Open the menu to create or load a session</p>
        </div>
      ) : (
        <>
          {currentScene === 'map' && <MapScreen />}
          {currentScene === 'wheel' && <WheelScreen />}
          {currentScene === 'scene' && <SceneViewer />}
          {currentScene === 'shop' && <ShopScreen />}
        </>
      )}
      <MasterMenu />
    </div>
  );
}

export default App;
