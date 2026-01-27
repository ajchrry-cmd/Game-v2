import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function QuickAccessSettings({ onClose }) {
  const { wheels, scenes, bonuses, items } = useGame();

  const [buttons, setButtons] = useState(() => {
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

  const [editingButton, setEditingButton] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [itemCustomizations, setItemCustomizations] = useState(() => {
    const saved = localStorage.getItem('quickAccessItemCustomizations');
    return saved ? JSON.parse(saved) : {};
  });

  const handleSave = () => {
    localStorage.setItem('quickAccessButtons', JSON.stringify(buttons));
    localStorage.setItem('quickAccessItemCustomizations', JSON.stringify(itemCustomizations));
    // Dispatch event to notify App.jsx of changes
    window.dispatchEvent(new Event('quickAccessButtonsChanged'));
    alert('Quick access settings saved!');
  };

  const handleReset = () => {
    if (confirm('Reset to default button configuration?')) {
      const defaults = [
        { id: 'home', emoji: '🏠', label: 'Home', color: '#2a2a2a', type: 'action', action: 'goHome', enabled: true },
        { id: 'wheels', emoji: '🎡', label: 'Wheels', color: '#2a2a2a', type: 'dropdown', categories: [], enabled: true },
        { id: 'scenes', emoji: '🎬', label: 'Scenes', color: '#2a2a2a', type: 'dropdown', categories: [], enabled: true },
        { id: 'mobs', emoji: '👾', label: 'Mobs', color: '#2a2a2a', type: 'dropdown', categories: [], enabled: true },
        { id: 'shop', emoji: '🛒', label: 'Shop', color: '#2a2a2a', type: 'action', action: 'openShop', enabled: true }
      ];
      setButtons(defaults);
      localStorage.setItem('quickAccessButtons', JSON.stringify(defaults));
      window.dispatchEvent(new Event('quickAccessButtonsChanged'));
    }
  };

  const handleUpdateButton = (buttonId, updates) => {
    setButtons(prev => prev.map(btn =>
      btn.id === buttonId ? { ...btn, ...updates } : btn
    ));
  };

  const handleMoveButton = (buttonId, direction) => {
    setButtons(prev => {
      const index = prev.findIndex(btn => btn.id === buttonId);
      if (index === -1) return prev;

      const newButtons = [...prev];
      if (direction === 'up' && index > 0) {
        [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
      } else if (direction === 'down' && index < newButtons.length - 1) {
        [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
      }
      return newButtons;
    });
  };

  const handleAddCategory = (buttonId) => {
    const name = prompt('Enter category name:');
    const emoji = prompt('Enter category emoji:', '📁');
    if (name && emoji) {
      handleUpdateButton(buttonId, {
        categories: [...(buttons.find(b => b.id === buttonId)?.categories || []), {
          id: Date.now().toString(),
          name,
          emoji,
          items: []
        }]
      });
    }
  };

  const handleUpdateCategory = (buttonId, categoryId, updates) => {
    const button = buttons.find(b => b.id === buttonId);
    if (!button) return;

    handleUpdateButton(buttonId, {
      categories: button.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    });
  };

  const handleDeleteCategory = (buttonId, categoryId) => {
    if (confirm('Delete this category?')) {
      const button = buttons.find(b => b.id === buttonId);
      if (!button) return;

      handleUpdateButton(buttonId, {
        categories: button.categories.filter(cat => cat.id !== categoryId)
      });
    }
  };

  const handleAddNewButton = () => {
    const label = prompt('Enter button label:');
    const emoji = prompt('Enter button emoji:', '⭐');
    if (label && emoji) {
      const newButton = {
        id: Date.now().toString(),
        emoji,
        label,
        color: '#2a2a2a',
        type: 'dropdown',
        categories: [],
        enabled: true
      };
      setButtons(prev => [...prev, newButton]);
    }
  };

  const handleDeleteButton = (buttonId) => {
    if (confirm('Delete this button?')) {
      setButtons(prev => prev.filter(btn => btn.id !== buttonId));
    }
  };

  // Get items for a dropdown button
  const getDropdownItems = (buttonId) => {
    switch (buttonId) {
      case 'wheels':
        return wheels;
      case 'scenes':
        return scenes;
      case 'mobs':
        return bonuses;
      case 'items':
        return items;
      default:
        return [];
    }
  };

  // Get or create item customization
  const getItemCustomization = (buttonId, itemId) => {
    const key = `${buttonId}_${itemId}`;
    return itemCustomizations[key] || {
      emoji: '',
      color: '#2a2a2a',
      order: 999
    };
  };

  // Update item customization
  const handleUpdateItemCustomization = (buttonId, itemId, updates) => {
    const key = `${buttonId}_${itemId}`;
    setItemCustomizations(prev => ({
      ...prev,
      [key]: {
        ...getItemCustomization(buttonId, itemId),
        ...updates
      }
    }));
  };

  // Move item up/down in list
  const handleMoveItem = (buttonId, itemId, direction) => {
    const items = getDropdownItems(buttonId);
    const currentItem = items.find(i => i.id === itemId);
    if (!currentItem) return;

    const currentOrder = getItemCustomization(buttonId, itemId).order;

    // Get all items with their orders
    const itemsWithOrders = items.map(item => ({
      ...item,
      customOrder: getItemCustomization(buttonId, item.id).order
    })).sort((a, b) => a.customOrder - b.customOrder);

    const currentIndex = itemsWithOrders.findIndex(i => i.id === itemId);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      const swapItem = itemsWithOrders[currentIndex - 1];
      handleUpdateItemCustomization(buttonId, itemId, { order: swapItem.customOrder });
      handleUpdateItemCustomization(buttonId, swapItem.id, { order: currentOrder });
    } else if (direction === 'down' && currentIndex < itemsWithOrders.length - 1) {
      const swapItem = itemsWithOrders[currentIndex + 1];
      handleUpdateItemCustomization(buttonId, itemId, { order: swapItem.customOrder });
      handleUpdateItemCustomization(buttonId, swapItem.id, { order: currentOrder });
    }
  };

  // Assign item to category
  const handleAssignCategory = (buttonId, itemId, categoryId) => {
    const key = `${buttonId}_${itemId}`;
    setItemCustomizations(prev => ({
      ...prev,
      [key]: {
        ...getItemCustomization(buttonId, itemId),
        categoryId: categoryId || null
      }
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Quick Access Settings</h2>

        <div className="manager-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ color: '#999', marginBottom: '1rem' }}>
            Customize the quick access buttons at the bottom of the screen. Drag to reorder, customize colors, and organize items into categories.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handleAddNewButton} className="primary">+ Add Custom Button</button>
          </div>

          {/* Button List */}
          {buttons.map((button, index) => (
            <div key={button.id} style={{
              background: '#1a1a1a',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                {/* Move buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    onClick={() => handleMoveButton(button.id, 'up')}
                    disabled={index === 0}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveButton(button.id, 'down')}
                    disabled={index === buttons.length - 1}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    ▼
                  </button>
                </div>

                {/* Button preview */}
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: button.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  border: '2px solid #666'
                }}>
                  {button.emoji}
                </div>

                {/* Button settings */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={button.emoji}
                      onChange={(e) => handleUpdateButton(button.id, { emoji: e.target.value })}
                      placeholder="Emoji"
                      style={{ width: '60px', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                    <input
                      type="text"
                      value={button.label}
                      onChange={(e) => handleUpdateButton(button.id, { label: e.target.value })}
                      placeholder="Label"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="color"
                      value={button.color}
                      onChange={(e) => handleUpdateButton(button.id, { color: e.target.value })}
                      style={{ width: '60px' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    Type: {button.type === 'action' ? 'Action' : 'Dropdown'} | ID: {button.id}
                  </div>
                </div>

                {/* Toggle enabled */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={button.enabled}
                    onChange={(e) => handleUpdateButton(button.id, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>

                {/* Delete button */}
                {!['home', 'shop'].includes(button.id) && (
                  <button
                    onClick={() => handleDeleteButton(button.id)}
                    className="danger"
                    style={{ padding: '0.5rem' }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Categories for dropdown buttons */}
              {button.type === 'dropdown' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#d4af37', margin: 0 }}>Categories</h4>
                    <button onClick={() => handleAddCategory(button.id)} style={{ fontSize: '0.85rem' }}>
                      + Add Category
                    </button>
                  </div>

                  {button.categories && button.categories.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {button.categories.map(category => (
                        <div key={category.id} style={{
                          background: '#252525',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <input
                            type="text"
                            value={category.emoji}
                            onChange={(e) => handleUpdateCategory(button.id, category.id, { emoji: e.target.value })}
                            placeholder="Emoji"
                            style={{ width: '50px', textAlign: 'center', fontSize: '1rem' }}
                          />
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleUpdateCategory(button.id, category.id, { name: e.target.value })}
                            placeholder="Category name"
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#999' }}>
                            {category.items?.length || 0} items
                          </span>
                          <button
                            onClick={() => handleDeleteCategory(button.id, category.id)}
                            className="danger"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      No categories. Items will be shown in a flat list.
                    </p>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                    Assign items to categories in the section below.
                  </p>
                </div>
              )}

              {/* Items customization for dropdown buttons */}
              {button.type === 'dropdown' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                  <h4 style={{ color: '#d4af37', marginBottom: '0.5rem' }}>Customize Items</h4>
                  <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.75rem' }}>
                    Customize appearance and order of items in this dropdown
                  </p>

                  {(() => {
                    const items = getDropdownItems(button.id);
                    if (items.length === 0) {
                      return (
                        <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          No items available. Create some {button.label.toLowerCase()} first.
                        </p>
                      );
                    }

                    // Sort items by custom order
                    const sortedItems = [...items].sort((a, b) => {
                      const aOrder = getItemCustomization(button.id, a.id).order;
                      const bOrder = getItemCustomization(button.id, b.id).order;
                      return aOrder - bOrder;
                    });

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {sortedItems.map((item, index) => {
                          const customization = getItemCustomization(button.id, item.id);
                          return (
                            <div key={item.id} style={{
                              background: '#252525',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              border: `2px solid ${customization.color}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {/* Move buttons */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <button
                                  onClick={() => handleMoveItem(button.id, item.id, 'up')}
                                  disabled={index === 0}
                                  style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => handleMoveItem(button.id, item.id, 'down')}
                                  disabled={index === sortedItems.length - 1}
                                  style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}
                                >
                                  ▼
                                </button>
                              </div>

                              {/* Item preview */}
                              {item.imageUrl && button.id === 'mobs' && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '4px' }}
                                />
                              )}

                              {/* Custom emoji */}
                              <input
                                type="text"
                                value={customization.emoji}
                                onChange={(e) => handleUpdateItemCustomization(button.id, item.id, { emoji: e.target.value })}
                                placeholder="📌"
                                style={{ width: '45px', textAlign: 'center', fontSize: '1rem', padding: '0.25rem' }}
                                title="Custom emoji prefix"
                              />

                              {/* Item name */}
                              <span style={{ flex: 1, color: '#fff' }}>{item.name}</span>

                              {/* Color picker */}
                              <input
                                type="color"
                                value={customization.color}
                                onChange={(e) => handleUpdateItemCustomization(button.id, item.id, { color: e.target.value })}
                                style={{ width: '40px', height: '30px' }}
                                title="Border color"
                              />

                              {/* Category assignment */}
                              {button.categories && button.categories.length > 0 && (
                                <select
                                  value={customization.categoryId || ''}
                                  onChange={(e) => handleAssignCategory(button.id, item.id, e.target.value)}
                                  style={{ fontSize: '0.85rem', padding: '0.25rem' }}
                                >
                                  <option value="">Uncategorized</option>
                                  {button.categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.emoji} {cat.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="form-actions" style={{ marginTop: '2rem', position: 'sticky', bottom: 0, background: '#2a2a2a', padding: '1rem 0' }}>
            <button className="primary" onClick={handleSave}>
              Save Settings
            </button>
            <button onClick={handleReset} style={{ background: '#666' }}>
              Reset to Defaults
            </button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickAccessSettings;
