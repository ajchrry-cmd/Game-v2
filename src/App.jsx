import React, { useEffect, useState } from 'react';
import { useGame } from './contexts/GameContext';
import { useFirebaseCheck } from './hooks/useFirebaseCheck';
import MasterMenu from './components/UI/MasterMenu';
import MapScreen from './components/Map/MapScreen';
import WheelScreen from './components/Wheel/WheelScreen';
import SceneViewer from './components/Scenes/SceneViewer';
import ShopScreen from './components/Shop/ShopScreen';
import FirebaseSetupGuide from './components/UI/FirebaseSetupGuide';
import { loadUISettings } from './utils/uiSettings';
import './App.css';
import './components/Map/MapScreen.css';

function App() {
  const {
    currentScene,
    currentSession,
    setCurrentScene,
    setCurrentSceneId,
    wheels,
    scenes,
    bonuses,
    placeBonus
  } = useGame();
  const firebaseStatus = useFirebaseCheck();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Load and apply UI customization settings on mount
  useEffect(() => {
    loadUISettings();
  }, []);

  // Quick access button handlers
  const handleGoHome = () => {
    setCurrentScene('map');
    setCurrentSceneId(null);
    setOpenDropdown(null);
  };

  const handleSelectWheel = (wheelId) => {
    setCurrentScene('wheel');
    setCurrentSceneId(wheelId);
    setOpenDropdown(null);
  };

  const handleSelectScene = (sceneId) => {
    setCurrentScene('scene');
    setCurrentSceneId(sceneId);
    setOpenDropdown(null);
  };

  const handleSelectMob = (bonusId) => {
    // Only place mob if we're on the map screen
    if (currentScene === 'map') {
      placeBonus(bonusId, { x: 400, y: 300 });
    }
    setOpenDropdown(null);
  };

  const handleOpenShop = () => {
    setCurrentScene('shop');
    setCurrentSceneId(null);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

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

          {/* Quick access buttons - always visible when session is loaded */}
          <div className="quick-access-controls">
            {/* Home button */}
            <button onClick={handleGoHome} title="Go to Map" className="quick-access-btn">
              🏠
            </button>

            {/* Wheels dropdown */}
            <div className="quick-access-dropdown">
              <button
                onClick={() => toggleDropdown('wheels')}
                title="Select Wheel"
                className="quick-access-btn"
              >
                🎡
              </button>
              {openDropdown === 'wheels' && wheels.length > 0 && (
                <div className="dropdown-menu">
                  {wheels.map(wheel => (
                    <div
                      key={wheel.id}
                      className="dropdown-item"
                      onClick={() => handleSelectWheel(wheel.id)}
                    >
                      {wheel.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scenes dropdown */}
            <div className="quick-access-dropdown">
              <button
                onClick={() => toggleDropdown('scenes')}
                title="Select Scene"
                className="quick-access-btn"
              >
                🎬
              </button>
              {openDropdown === 'scenes' && scenes.length > 0 && (
                <div className="dropdown-menu">
                  {scenes.map(scene => (
                    <div
                      key={scene.id}
                      className="dropdown-item"
                      onClick={() => handleSelectScene(scene.id)}
                    >
                      {scene.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Mobs dropdown - only functional on map */}
            <div className="quick-access-dropdown">
              <button
                onClick={() => toggleDropdown('mobs')}
                title="Add Mob to Map"
                className="quick-access-btn"
                style={{ opacity: currentScene !== 'map' ? 0.5 : 1 }}
              >
                👾
              </button>
              {openDropdown === 'mobs' && bonuses.length > 0 && (
                <div className="dropdown-menu">
                  {bonuses.map(bonus => (
                    <div
                      key={bonus.id}
                      className="dropdown-item"
                      onClick={() => handleSelectMob(bonus.id)}
                    >
                      {bonus.imageUrl && (
                        <img src={bonus.imageUrl} alt={bonus.name} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      )}
                      {bonus.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shop button */}
            <button onClick={handleOpenShop} title="Open Shop" className="quick-access-btn">
              🛒
            </button>
          </div>
        </>
      )}
      <MasterMenu />
    </div>
  );
}

export default App;
