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
    setCurrentWheelId,
    wheels,
    scenes,
    bonuses,
    placeBonus
  } = useGame();
  const firebaseStatus = useFirebaseCheck();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [quickAccessButtons, setQuickAccessButtons] = useState(() => {
    const saved = localStorage.getItem('quickAccessButtons');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default buttons
    return [
      { id: 'home', emoji: '🏠', label: 'Home', color: '#2a2a2a', type: 'action', action: 'goHome', enabled: true },
      { id: 'wheels', emoji: '🎡', label: 'Wheels', color: '#2a2a2a', type: 'dropdown', categories: [], enabled: true },
      { id: 'scenes', emoji: '🎬', label: 'Scenes', color: '#2a2a2a', type: 'dropdown', categories: [], enabled: true },
      { id: 'mobs', emoji: '👾', label: 'Mobs', color: '#2a2a2a', type: 'dropdown', categories: [], enabled: true },
      { id: 'shop', emoji: '🛒', label: 'Shop', color: '#2a2a2a', type: 'action', action: 'openShop', enabled: true }
    ];
  });
  const [itemCustomizations, setItemCustomizations] = useState(() => {
    const saved = localStorage.getItem('quickAccessItemCustomizations');
    return saved ? JSON.parse(saved) : {};
  });

  // Load and apply UI customization settings on mount
  useEffect(() => {
    loadUISettings();
  }, []);

  // Listen for quick access button configuration changes
  useEffect(() => {
    const handleQuickAccessChange = () => {
      const savedButtons = localStorage.getItem('quickAccessButtons');
      if (savedButtons) {
        setQuickAccessButtons(JSON.parse(savedButtons));
      }
      const savedCustomizations = localStorage.getItem('quickAccessItemCustomizations');
      if (savedCustomizations) {
        setItemCustomizations(JSON.parse(savedCustomizations));
      }
    };

    window.addEventListener('quickAccessButtonsChanged', handleQuickAccessChange);
    return () => window.removeEventListener('quickAccessButtonsChanged', handleQuickAccessChange);
  }, []);

  // Quick access button handlers
  const handleGoHome = () => {
    setCurrentScene('map');
    setCurrentSceneId(null);
    setCurrentWheelId(null);
    setOpenDropdown(null);
  };

  const handleSelectWheel = (wheelId) => {
    setCurrentScene('wheel');
    setCurrentWheelId(wheelId);
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

  // Get items for a dropdown button based on button ID
  const getDropdownItems = (buttonId) => {
    switch (buttonId) {
      case 'wheels':
        return wheels;
      case 'scenes':
        return scenes;
      case 'mobs':
        return bonuses;
      default:
        return [];
    }
  };

  // Handle item selection based on button type
  const handleItemSelection = (buttonId, itemId) => {
    switch (buttonId) {
      case 'wheels':
        handleSelectWheel(itemId);
        break;
      case 'scenes':
        handleSelectScene(itemId);
        break;
      case 'mobs':
        handleSelectMob(itemId);
        break;
      default:
        break;
    }
  };

  // Get item customization
  const getItemCustomization = (buttonId, itemId) => {
    const key = `${buttonId}_${itemId}`;
    return itemCustomizations[key] || {
      emoji: '',
      color: '#2a2a2a',
      order: 999,
      categoryId: null
    };
  };

  // Render dropdown menu with category support
  const renderDropdownMenu = (button) => {
    const items = getDropdownItems(button.id);
    if (items.length === 0) return null;

    const categories = button.categories || [];

    // Sort items by custom order
    const sortedItems = [...items].sort((a, b) => {
      const aOrder = getItemCustomization(button.id, a.id).order;
      const bOrder = getItemCustomization(button.id, b.id).order;
      return aOrder - bOrder;
    });

    // Helper function to render an item with customizations
    const renderItem = (item) => {
      const customization = getItemCustomization(button.id, item.id);
      return (
        <div
          key={item.id}
          className="dropdown-item"
          onClick={() => handleItemSelection(button.id, item.id)}
          style={{
            borderLeft: `4px solid ${customization.color}`,
            paddingLeft: '11px'
          }}
        >
          {item.imageUrl && button.id === 'mobs' && (
            <img src={item.imageUrl} alt={item.name} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          )}
          {customization.emoji && <span style={{ marginRight: '6px' }}>{customization.emoji}</span>}
          {item.name}
        </div>
      );
    };

    if (categories.length > 0) {
      // Render with categories
      return (
        <div className="dropdown-menu">
          {categories.map(category => {
            const categoryItems = sortedItems.filter(item => {
              const customization = getItemCustomization(button.id, item.id);
              return customization.categoryId === category.id;
            });
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="dropdown-category-header">
                  {category.emoji} {category.name}
                </div>
                {categoryItems.map(item => renderItem(item))}
              </div>
            );
          })}

          {/* Uncategorized items */}
          {(() => {
            const uncategorized = sortedItems.filter(item => {
              const customization = getItemCustomization(button.id, item.id);
              return !customization.categoryId;
            });
            if (uncategorized.length === 0) return null;

            return (
              <div>
                <div className="dropdown-category-header">📋 Uncategorized</div>
                {uncategorized.map(item => renderItem(item))}
              </div>
            );
          })()}
        </div>
      );
    } else {
      // Render flat list (no categories)
      return (
        <div className="dropdown-menu">
          {sortedItems.map(item => renderItem(item))}
        </div>
      );
    }
  };

  // Handle action button clicks
  const handleActionButton = (action) => {
    switch (action) {
      case 'goHome':
        handleGoHome();
        break;
      case 'openShop':
        handleOpenShop();
        break;
      default:
        break;
    }
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
            {quickAccessButtons.filter(btn => btn.enabled).map(button => {
              if (button.type === 'action') {
                // Render action button
                return (
                  <button
                    key={button.id}
                    onClick={() => handleActionButton(button.action)}
                    title={button.label}
                    className="quick-access-btn"
                    style={{ background: button.color }}
                  >
                    {button.emoji}
                  </button>
                );
              } else if (button.type === 'dropdown') {
                // Render dropdown button
                return (
                  <div key={button.id} className="quick-access-dropdown">
                    <button
                      onClick={() => toggleDropdown(button.id)}
                      title={button.label}
                      className="quick-access-btn"
                      style={{
                        background: button.color,
                        opacity: button.id === 'mobs' && currentScene !== 'map' ? 0.5 : 1
                      }}
                    >
                      {button.emoji}
                    </button>
                    {openDropdown === button.id && renderDropdownMenu(button)}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </>
      )}
      <MasterMenu />
    </div>
  );
}

export default App;
