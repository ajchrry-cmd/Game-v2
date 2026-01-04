import React, { useState, useEffect } from 'react';
import { defaultUISettings, saveUISettings, resetUISettings, applyUISettings } from '../../utils/uiSettings';
import './Manager.css';

function UICustomization({ onClose }) {
  const [settings, setSettings] = useState(defaultUISettings);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('uiCustomization');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveUISettings(settings);
    alert('UI settings saved successfully!');
    onClose();
  };

  const handleReset = () => {
    const defaults = resetUISettings();
    setSettings(defaults);
  };

  const handleApplyNow = () => {
    // Apply without saving (temporary)
    applyUISettings(settings);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>UI Customization</h2>

        <div className="manager-content">
          <p style={{ color: '#999', marginBottom: '1rem' }}>
            Customize the appearance and layout of UI elements. Changes can be previewed before saving.
          </p>

          {/* Player Panel Settings */}
          <div className="config-section">
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Player Panel</h3>

            <div className="form-group">
              <label>Panel Width: {settings.playerPanelWidth}px</label>
              <input
                type="range"
                min="300"
                max="600"
                step="10"
                value={settings.playerPanelWidth}
                onChange={(e) => handleChange('playerPanelWidth', parseInt(e.target.value))}
              />
              <span style={{ fontSize: '0.85rem', color: '#999' }}>
                Recommended: 380-500px for extended player cards
              </span>
            </div>

            <div className="form-group">
              <label>Card Spacing: {settings.playerCardSpacing}rem</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={settings.playerCardSpacing}
                onChange={(e) => handleChange('playerCardSpacing', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Card Padding: {settings.playerInfoPadding}rem</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={settings.playerInfoPadding}
                onChange={(e) => handleChange('playerInfoPadding', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Font Size: {(settings.playerCardFontSize * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={settings.playerCardFontSize}
                onChange={(e) => handleChange('playerCardFontSize', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Inventory Slot Size: {settings.inventorySlotSize}px</label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={settings.inventorySlotSize}
                onChange={(e) => handleChange('inventorySlotSize', parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Party Slot Size: {settings.partySlotSize}px</label>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={settings.partySlotSize}
                onChange={(e) => handleChange('partySlotSize', parseInt(e.target.value))}
              />
              <span style={{ fontSize: '0.85rem', color: '#999' }}>
                Size of party member slots in player cards
              </span>
            </div>

            <div className="form-group">
              <label>Stat Size: {(settings.statSize * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={settings.statSize}
                onChange={(e) => handleChange('statSize', parseFloat(e.target.value))}
              />
              <span style={{ fontSize: '0.85rem', color: '#999' }}>
                Size of custom stats like Power, Money, etc.
              </span>
            </div>
          </div>

          {/* Color Settings */}
          <div className="config-section" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Colors</h3>

            <div className="form-group">
              <label>Primary Color (Gold)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  style={{ width: '100px' }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>
                Used for borders, labels, and highlights
              </span>
            </div>

            <div className="form-group">
              <label>Secondary Color (Dark)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  style={{ width: '100px' }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>
                Used for backgrounds and panels
              </span>
            </div>
          </div>

          {/* Presets */}
          <div className="config-section" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Presets</h3>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSettings(defaultUISettings)}
              >
                Default
              </button>
              <button
                onClick={() => setSettings({
                  playerPanelWidth: 420,
                  playerCardFontSize: 1,
                  playerCardSpacing: 1,
                  primaryColor: '#d4af37',
                  secondaryColor: '#2a2a2a',
                  inventorySlotSize: 70,
                  playerInfoPadding: 1.1,
                  partySlotSize: 60,
                  statSize: 1
                })}
              >
                Comfortable
              </button>
              <button
                onClick={() => setSettings({
                  playerPanelWidth: 480,
                  playerCardFontSize: 1.1,
                  playerCardSpacing: 1.25,
                  primaryColor: '#d4af37',
                  secondaryColor: '#2a2a2a',
                  inventorySlotSize: 75,
                  playerInfoPadding: 1.25,
                  partySlotSize: 65,
                  statSize: 1.1
                })}
              >
                Large
              </button>
              <button
                onClick={() => setSettings({
                  playerPanelWidth: 340,
                  playerCardFontSize: 0.8,
                  playerCardSpacing: 0.5,
                  primaryColor: '#d4af37',
                  secondaryColor: '#2a2a2a',
                  inventorySlotSize: 50,
                  playerInfoPadding: 0.65,
                  partySlotSize: 45,
                  statSize: 0.8
                })}
              >
                Compact
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button onClick={handleApplyNow} style={{ background: '#4ECDC4' }}>
              Preview Changes
            </button>
            <button className="primary" onClick={handleSave}>
              Save & Apply
            </button>
            <button onClick={handleReset} style={{ background: '#666' }}>
              Reset to Defaults
            </button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UICustomization;
