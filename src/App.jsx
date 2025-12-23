import React, { useEffect } from 'react';
import { useGame } from './contexts/GameContext';
import { useFirebaseCheck } from './hooks/useFirebaseCheck';
import MasterMenu from './components/UI/MasterMenu';
import MapScreen from './components/Map/MapScreen';
import WheelScreen from './components/Wheel/WheelScreen';
import SceneViewer from './components/Scenes/SceneViewer';
import ShopScreen from './components/Shop/ShopScreen';
import FirebaseSetupGuide from './components/UI/FirebaseSetupGuide';
import './App.css';

function App() {
  const { currentScene, currentSession } = useGame();
  const firebaseStatus = useFirebaseCheck();

  // Show setup guide if Firebase isn't ready
  if (firebaseStatus.firestore === 'error' || firebaseStatus.storage === 'error') {
    return <FirebaseSetupGuide />;
  }

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
