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
import QuickAccessSettings from './QuickAccessSettings';
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
  const [expandedSections, setExpandedSections] = useState({
    quickAccess: true,
    content: false,
    settings: false
  });

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
            <h2>🎲 GM Control Panel</h2>

            {/* Quick Access Section */}
            <div className="menu-section">
              <h3 onClick={() => toggleSection('quickAccess')} style={{ cursor: 'pointer' }}>
                <span className="section-arrow">{expandedSections.quickAccess ? '▼' : '▶'}</span>
                ⚡ Quick Actions
              </h3>
              {expandedSections.quickAccess && (
                <>
                  <div className="button-grid">
                    <button
                      className={currentScene === 'map' ? 'active' : ''}
                      onClick={() => { setCurrentScene('map'); setMenuOpen(false); }}
                    >
                      🗺️ Map
                    </button>
                    <button
                      className={currentScene === 'shop' ? 'active' : ''}
                      onClick={() => { setCurrentScene('shop'); setMenuOpen(false); }}
                    >
                      🛒 Shop
                    </button>
                    <button onClick={() => openManager('mobPlacer')}>
                      👾 Add Mobs
                    </button>
                    <button onClick={() => openManager('diceRoller')}>
                      🎲 Dice
                    </button>
                    <button onClick={() => openManager('session')}>
                      💾 Session
                    </button>
                    <button onClick={() => openManager('roomCode')}>
                      📱 Players
                    </button>
                  </div>
                  {(wheels.length > 0 || scenes.length > 0) && (
                    <div className="quick-switcher">
                    {wheels.length > 0 && (
                      <div className="switcher-group">
                        <span className="switcher-label">🎡 Wheels:</span>
                        <div className="switcher-buttons">
                          {wheels.slice(0, 3).map(wheel => (
                            <button
                              key={wheel.id}
                              className="compact-btn"
                              onClick={() => switchToWheel(wheel.id)}
                            >
                              {wheel.name}
                            </button>
                          ))}
                          {wheels.length > 3 && (
                            <button className="compact-btn more" onClick={() => openManager('wheels')}>
                              +{wheels.length - 3}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {scenes.length > 0 && (
                      <div className="switcher-group">
                        <span className="switcher-label">🎬 Scenes:</span>
                        <div className="switcher-buttons">
                          {scenes.slice(0, 3).map(scene => (
                            <button
                              key={scene.id}
                              className="compact-btn"
                              onClick={() => switchToScene(scene.id)}
                            >
                              {scene.name}
                            </button>
                          ))}
                          {scenes.length > 3 && (
                            <button className="compact-btn more" onClick={() => openManager('scenes')}>
                              +{scenes.length - 3}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </>
              )}
            </div>

            {/* Content Management Section */}
            <div className="menu-section">
              <h3 onClick={() => toggleSection('content')} style={{ cursor: 'pointer' }}>
                <span className="section-arrow">{expandedSections.content ? '▼' : '▶'}</span>
                📦 Content
              </h3>
              {expandedSections.content && (
                <div className="button-grid">
                  <button onClick={() => openManager('players')}>👥 Players</button>
                  <button onClick={() => openManager('items')}>🎒 Items</button>
                  <button onClick={() => openManager('bonuses')}>👹 Mobs</button>
                  <button onClick={() => openManager('maps')}>🗺️ Maps</button>
                  <button onClick={() => openManager('wheels')}>🎡 Wheels</button>
                  <button onClick={() => openManager('scenes')}>🎬 Scenes</button>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="menu-section">
              <h3 onClick={() => toggleSection('settings')} style={{ cursor: 'pointer' }}>
                <span className="section-arrow">{expandedSections.settings ? '▼' : '▶'}</span>
                ⚙️ Settings
              </h3>
              {expandedSections.settings && (
                <>
                  <button onClick={() => openManager('uiCustomization')}>
                    🎨 UI Customization
                  </button>
                  <button onClick={() => openManager('quickAccessSettings')}>
                    🎯 Quick Access Buttons
                  </button>
                  <button onClick={() => openManager('companionSettings')}>
                    🎮 Companion App
                  </button>
                </>
              )}
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
      {activeManager === 'quickAccessSettings' && <QuickAccessSettings onClose={closeManager} />}
    </>
  );
}

export default MasterMenu;
