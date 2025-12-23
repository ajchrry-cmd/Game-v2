import React, { useEffect } from 'react';
import { useGame } from './contexts/GameContext';
import MasterMenu from './components/UI/MasterMenu';
import MapScreen from './components/Map/MapScreen';
import WheelScreen from './components/Wheel/WheelScreen';
import SceneViewer from './components/Scenes/SceneViewer';
import ShopScreen from './components/Shop/ShopScreen';
import './App.css';

function App() {
  const { currentScene, currentSession } = useGame();

  return (
    <div className="app">
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
