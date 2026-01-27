import React, { useState, useEffect } from 'react';
import './Manager.css';

function QuickAccessSettings({ onClose }) {
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

  const handleSave = () => {
    localStorage.setItem('quickAccessButtons', JSON.stringify(buttons));
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
                    Note: Use the dropdown menu in the app to assign items to categories by right-clicking items.
                  </p>
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
