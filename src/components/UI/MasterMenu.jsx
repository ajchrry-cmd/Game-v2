import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import SessionManager from './SessionManager';
import PlayerManager from './PlayerManager';
import ItemManager from './ItemManager';
import MapManager from './MapManager';
import WheelManager from './WheelManager';
import SceneManager from './SceneManager';
import BonusManager from './BonusManager';
import './MasterMenu.css';

function MasterMenu() {
  const {
    menuOpen,
    setMenuOpen,
    currentScene,
    setCurrentScene,
    wheels,
    setCurrentWheelId,
    scenes,
    setCurrentSceneId,
    bonuses,
    placeBonus
  } = useGame();

  const [activeManager, setActiveManager] = useState(null);

  const openManager = (manager) => {
    setActiveManager(manager);
    setMenuOpen(false);
  };

  const closeManager = () => {
    setActiveManager(null);
  };

  const switchToWheel = (wheelId) => {
    setCurrentWheelId(wheelId);
    setCurrentScene('wheel');
    setMenuOpen(false);
  };

  const switchToScene = (sceneId) => {
    setCurrentSceneId(sceneId);
    setCurrentScene('scene');
    setMenuOpen(false);
  };

  const handlePlaceBonus = (bonusId) => {
    // Make sure we're on the map scene
    if (currentScene !== 'map') {
      setCurrentScene('map');
    }
    // Place bonus at center of map
    placeBonus(bonusId, { x: 400, y: 300 });
    setMenuOpen(false);
  };

  return (
    <>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <h2>Game Master Menu</h2>

            <div className="menu-section">
              <h3>Scenes</h3>
              <button
                className={currentScene === 'map' ? 'active' : ''}
                onClick={() => { setCurrentScene('map'); setMenuOpen(false); }}
              >
                Map
              </button>

              <div className="submenu">
                <label>Wheels:</label>
                {wheels.length === 0 ? (
                  <p className="empty-state">No wheels created</p>
                ) : (
                  wheels.map(wheel => (
                    <button
                      key={wheel.id}
                      onClick={() => switchToWheel(wheel.id)}
                    >
                      {wheel.name}
                    </button>
                  ))
                )}
              </div>

              <div className="submenu">
                <label>Scene Images:</label>
                {scenes.length === 0 ? (
                  <p className="empty-state">No scenes created</p>
                ) : (
                  scenes.map(scene => (
                    <button
                      key={scene.id}
                      onClick={() => switchToScene(scene.id)}
                    >
                      {scene.name}
                    </button>
                  ))
                )}
              </div>

              <div className="submenu">
                <label>Add Mobs:</label>
                {bonuses.length === 0 ? (
                  <p className="empty-state">No mobs created</p>
                ) : (
                  bonuses.map(bonus => (
                    <button
                      key={bonus.id}
                      onClick={() => handlePlaceBonus(bonus.id)}
                      title={`Click to place ${bonus.name}`}
                    >
                      {bonus.name}
                    </button>
                  ))
                )}
              </div>

              <button
                className={currentScene === 'shop' ? 'active' : ''}
                onClick={() => { setCurrentScene('shop'); setMenuOpen(false); }}
              >
                Shop
              </button>
            </div>

            <div className="menu-section">
              <h3>Manage</h3>
              <button onClick={() => openManager('session')}>Sessions</button>
              <button onClick={() => openManager('players')}>Players</button>
              <button onClick={() => openManager('items')}>Items</button>
              <button onClick={() => openManager('bonuses')}>Mobs</button>
              <button onClick={() => openManager('maps')}>Maps</button>
              <button onClick={() => openManager('wheels')}>Wheels</button>
              <button onClick={() => openManager('scenes')}>Scene Images</button>
            </div>
          </div>
        </div>
      )}

      {activeManager === 'session' && <SessionManager onClose={closeManager} />}
      {activeManager === 'players' && <PlayerManager onClose={closeManager} />}
      {activeManager === 'items' && <ItemManager onClose={closeManager} />}
      {activeManager === 'bonuses' && <BonusManager onClose={closeManager} />}
      {activeManager === 'maps' && <MapManager onClose={closeManager} />}
      {activeManager === 'wheels' && <WheelManager onClose={closeManager} />}
      {activeManager === 'scenes' && <SceneManager onClose={closeManager} />}
    </>
  );
}

export default MasterMenu;
