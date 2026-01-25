import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import SessionManager from './SessionManager';
import PlayerManager from './PlayerManager';
import ItemManager from './ItemManager';
import MapManager from './MapManager';
import WheelManager from './WheelManager';
import SceneManager from './SceneManager';
import BonusManager from './BonusManager';
import MobPlacer from './MobPlacer';
import DiceRoller from './DiceRoller';
import UICustomization from './UICustomization';
import RoomCodeDisplay from './RoomCodeDisplay';
import CompanionSettings from './CompanionSettings';
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
    setCurrentSceneId
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

              <button onClick={() => openManager('mobPlacer')}>
                Add Mobs
              </button>

              <button onClick={() => openManager('diceRoller')}>
                🎲 Dice Roller
              </button>

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
              <button onClick={() => openManager('roomCode')}>📱 Player Access</button>
              <button onClick={() => openManager('companionSettings')}>🎮 Companion App Settings</button>
              <button onClick={() => openManager('items')}>Items</button>
              <button onClick={() => openManager('bonuses')}>Mobs</button>
              <button onClick={() => openManager('maps')}>Maps</button>
              <button onClick={() => openManager('wheels')}>Wheels</button>
              <button onClick={() => openManager('scenes')}>Scene Images</button>
              <button onClick={() => openManager('uiCustomization')}>⚙️ UI Customization</button>
            </div>
          </div>
        </div>
      )}

      {activeManager === 'session' && <SessionManager onClose={closeManager} />}
      {activeManager === 'players' && <PlayerManager onClose={closeManager} />}
      {activeManager === 'roomCode' && <RoomCodeDisplay onClose={closeManager} />}
      {activeManager === 'companionSettings' && <CompanionSettings onClose={closeManager} />}
      {activeManager === 'items' && <ItemManager onClose={closeManager} />}
      {activeManager === 'bonuses' && <BonusManager onClose={closeManager} />}
      {activeManager === 'maps' && <MapManager onClose={closeManager} />}
      {activeManager === 'wheels' && <WheelManager onClose={closeManager} />}
      {activeManager === 'scenes' && <SceneManager onClose={closeManager} />}
      {activeManager === 'mobPlacer' && <MobPlacer onClose={closeManager} />}
      {activeManager === 'diceRoller' && <DiceRoller onClose={closeManager} />}
      {activeManager === 'uiCustomization' && <UICustomization onClose={closeManager} />}
    </>
  );
}

export default MasterMenu;
