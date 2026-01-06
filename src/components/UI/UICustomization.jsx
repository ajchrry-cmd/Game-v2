import React, { useState, useEffect } from 'react';
import { defaultUISettings, saveUISettings, resetUISettings, applyUISettings, savePreset, loadPresets, deletePreset } from '../../utils/uiSettings';
import './Manager.css';

function UICustomization({ onClose }) {
  const [settings, setSettings] = useState(defaultUISettings);
  const [expandedSections, setExpandedSections] = useState({
    panel: true,
    cardGeneral: false,
    typography: false,
    stats: false,
    inventory: false,
    party: false,
    colors: false,
    hover: false
  });
  const [customPresets, setCustomPresets] = useState({});
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('uiCustomization');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    // Load custom presets
    setCustomPresets(loadPresets());
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveUISettings(settings);
    alert('UI settings saved successfully!');
  };

  const handleReset = () => {
    const defaults = resetUISettings();
    setSettings(defaults);
  };

  const handleApplyNow = () => {
    // Apply without saving (temporary)
    applyUISettings(settings);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }
    savePreset(presetName, settings);
    setCustomPresets(loadPresets());
    setPresetName('');
    setShowPresetInput(false);
    alert(`Preset "${presetName}" saved successfully!`);
  };

  const handleLoadPreset = (preset) => {
    setSettings(preset);
    applyUISettings(preset);
  };

  const handleDeletePreset = (name) => {
    if (confirm(`Delete preset "${name}"?`)) {
      deletePreset(name);
      setCustomPresets(loadPresets());
    }
  };

  const renderSlider = (label, key, min, max, step, unit = '', description = '') => (
    <div className="form-group">
      <label>{label}: {settings[key]}{unit}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={settings[key]}
        onChange={(e) => handleChange(key, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
      />
      {description && <span style={{ fontSize: '0.85rem', color: '#999' }}>{description}</span>}
    </div>
  );

  const renderColorPicker = (label, key, description = '') => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="color"
          value={settings[key]}
          onChange={(e) => handleChange(key, e.target.value)}
        />
        <input
          type="text"
          value={settings[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          style={{ width: '100px' }}
        />
      </div>
      {description && <span style={{ fontSize: '0.85rem', color: '#999' }}>{description}</span>}
    </div>
  );

  const renderSelect = (label, key, options, description = '') => (
    <div className="form-group">
      <label>{label}</label>
      <select value={settings[key]} onChange={(e) => handleChange(key, e.target.value)}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {description && <span style={{ fontSize: '0.85rem', color: '#999' }}>{description}</span>}
    </div>
  );

  const SectionHeader = ({ title, sectionKey }) => (
    <h3
      style={{
        color: '#d4af37',
        marginBottom: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
      onClick={() => toggleSection(sectionKey)}
    >
      <span>{expandedSections[sectionKey] ? '▼' : '▶'}</span>
      {title}
    </h3>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>UI Customization</h2>

        <div className="manager-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ color: '#999', marginBottom: '1rem' }}>
            Customize every aspect of player card appearance. Click section headers to expand/collapse.
          </p>

          {/* Panel Settings */}
          <div className="config-section">
            <SectionHeader title="Panel Settings" sectionKey="panel" />
            {expandedSections.panel && (
              <>
                {renderSlider('Panel Width', 'playerPanelWidth', 300, 600, 10, 'px', 'Width of the player info panel')}
              </>
            )}
          </div>

          {/* Card General Settings */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Card General" sectionKey="cardGeneral" />
            {expandedSections.cardGeneral && (
              <>
                {renderSlider('Card Spacing', 'playerCardSpacing', 0.25, 2, 0.25, 'rem', 'Space between player cards')}
                {renderSlider('Card Padding', 'playerInfoPadding', 0.25, 2, 0.25, 'rem', 'Padding inside cards')}
                {renderSlider('Border Width', 'playerCardBorderWidth', 0, 8, 1, 'px')}
                {renderSlider('Border Radius', 'playerCardBorderRadius', 0, 24, 2, 'px', 'Roundness of card corners')}
                {renderSlider('Shadow Blur', 'playerCardShadowBlur', 0, 32, 2, 'px')}
                {renderSlider('Shadow Opacity', 'playerCardShadowOpacity', 0, 1, 0.05, '', 'Shadow darkness (0-1)')}
              </>
            )}
          </div>

          {/* Typography */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Typography" sectionKey="typography" />
            {expandedSections.typography && (
              <>
                {renderSlider('Base Font Size', 'playerCardFontSize', 0.75, 1.5, 0.05, 'rem')}
                {renderSlider('Player Name Size', 'playerNameFontSize', 1, 2, 0.1, 'rem')}
                {renderSelect('Player Name Weight', 'playerNameFontWeight', [
                  { value: 'normal', label: 'Normal' },
                  { value: 'bold', label: 'Bold' },
                  { value: '300', label: 'Light' },
                  { value: '900', label: 'Heavy' }
                ])}
                {renderSlider('Stat Label Size', 'statLabelFontSize', 0.6, 1.2, 0.05, 'rem')}
                {renderSelect('Stat Label Weight', 'statLabelFontWeight', [
                  { value: 'normal', label: 'Normal' },
                  { value: 'bold', label: 'Bold' }
                ])}
                {renderSlider('Stat Label Spacing', 'statLabelLetterSpacing', 0, 2, 0.1, 'px', 'Letter spacing')}
                {renderSlider('Stat Value Size', 'statValueFontSize', 1, 2, 0.1, 'rem')}
                {renderSelect('Stat Value Weight', 'statValueFontWeight', [
                  { value: 'normal', label: 'Normal' },
                  { value: 'bold', label: 'Bold' }
                ])}
                {renderSlider('Inventory Label Size', 'inventoryLabelFontSize', 0.6, 1.2, 0.05, 'rem')}
              </>
            )}
          </div>

          {/* Stats Layout */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Stats Layout" sectionKey="stats" />
            {expandedSections.stats && (
              <>
                {renderSlider('Stat Size Multiplier', 'statSize', 0.5, 1.5, 0.05, 'x')}
                {renderSlider('Stat Padding', 'statPadding', 0.25, 1.5, 0.25, 'rem')}
                {renderSlider('Stat Border Radius', 'statBorderRadius', 0, 16, 1, 'px')}
                {renderSlider('Stat Gap', 'statGap', 0.25, 1.5, 0.25, 'rem', 'Space between stats')}
              </>
            )}
          </div>

          {/* Inventory */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Inventory" sectionKey="inventory" />
            {expandedSections.inventory && (
              <>
                {renderSlider('Slot Size', 'inventorySlotSize', 40, 120, 5, 'px')}
                {renderSlider('Grid Gap', 'inventoryGridGap', 0.25, 1.5, 0.25, 'rem', 'Space between slots')}
                {renderSlider('Slot Border Width', 'inventorySlotBorderWidth', 0, 6, 1, 'px')}
                {renderSlider('Slot Border Radius', 'inventorySlotBorderRadius', 0, 24, 2, 'px')}
              </>
            )}
          </div>

          {/* Party Slots */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Party Slots" sectionKey="party" />
            {expandedSections.party && (
              <>
                {renderSlider('Party Slot Size', 'partySlotSize', 30, 120, 5, 'px')}
                {renderSlider('Border Width', 'partySlotBorderWidth', 0, 6, 1, 'px')}
                {renderSlider('Border Radius', 'partySlotBorderRadius', 0, 24, 2, 'px')}
              </>
            )}
          </div>

          {/* Colors */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Colors" sectionKey="colors" />
            {expandedSections.colors && (
              <>
                {renderColorPicker('Primary Color', 'primaryColor', 'Borders, labels, and highlights')}
                {renderColorPicker('Secondary Color', 'secondaryColor', 'Panel backgrounds')}
                {renderColorPicker('Card Background', 'cardBackgroundColor', 'Player card background')}
                {renderColorPicker('Primary Text', 'textPrimaryColor', 'Main text color')}
                {renderColorPicker('Secondary Text', 'textSecondaryColor', 'Labels and secondary text')}
                {renderColorPicker('Stat Background', 'statBackgroundColor')}
                {renderColorPicker('Stat Border', 'statBorderColor')}
                {renderColorPicker('Inventory Slot Border', 'inventorySlotBorderColor')}
              </>
            )}
          </div>

          {/* Hover Effects */}
          <div className="config-section" style={{ marginTop: '1rem' }}>
            <SectionHeader title="Hover Effects" sectionKey="hover" />
            {expandedSections.hover && (
              <>
                <h4 style={{ color: '#d4af37', fontSize: '1rem', marginTop: '1rem' }}>Card Hover</h4>
                {renderSlider('Hover Shadow Blur', 'cardHoverShadowBlur', 0, 32, 2, 'px')}
                {renderSlider('Hover Shadow Opacity', 'cardHoverShadowOpacity', 0, 1, 0.05, '')}
                {renderSlider('Hover Lift Amount', 'cardHoverTranslateY', -10, 0, 1, 'px', 'Negative = upward')}

                <h4 style={{ color: '#d4af37', fontSize: '1rem', marginTop: '1rem' }}>Inventory Slot Hover</h4>
                {renderSlider('Hover Scale', 'inventorySlotHoverScale', 1, 1.2, 0.05, 'x')}
                {renderSlider('Hover Shadow Blur', 'inventorySlotHoverShadowBlur', 0, 24, 2, 'px')}
                {renderSlider('Hover Shadow Opacity', 'inventorySlotHoverShadowOpacity', 0, 1, 0.05, '')}
              </>
            )}
          </div>

          {/* Presets */}
          <div className="config-section" style={{ marginTop: '1.5rem', borderTop: '2px solid #444', paddingTop: '1.5rem' }}>
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Built-in Presets</h3>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button onClick={() => handleLoadPreset(defaultUISettings)}>Default</button>
              <button onClick={() => handleLoadPreset({
                ...defaultUISettings,
                playerPanelWidth: 420,
                playerCardSpacing: 1,
                playerInfoPadding: 1.1,
                playerCardFontSize: 1,
                statSize: 1,
                inventorySlotSize: 70,
                partySlotSize: 60
              })}>Comfortable</button>
              <button onClick={() => handleLoadPreset({
                ...defaultUISettings,
                playerPanelWidth: 480,
                playerCardSpacing: 1.25,
                playerInfoPadding: 1.25,
                playerCardFontSize: 1.1,
                playerNameFontSize: 1.5,
                statSize: 1.1,
                inventorySlotSize: 75,
                partySlotSize: 65
              })}>Large</button>
              <button onClick={() => handleLoadPreset({
                ...defaultUISettings,
                playerPanelWidth: 340,
                playerCardSpacing: 0.5,
                playerInfoPadding: 0.65,
                playerCardFontSize: 0.8,
                playerNameFontSize: 1.1,
                statSize: 0.8,
                inventorySlotSize: 50,
                partySlotSize: 45
              })}>Compact</button>
            </div>

            <h3 style={{ color: '#d4af37', marginBottom: '1rem', marginTop: '1.5rem' }}>Custom Presets</h3>

            {!showPresetInput ? (
              <button onClick={() => setShowPresetInput(true)}>+ Save Current as Preset</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="primary" onClick={handleSavePreset}>Save</button>
                <button onClick={() => { setShowPresetInput(false); setPresetName(''); }}>Cancel</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {Object.entries(customPresets).length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No custom presets saved yet</p>
              ) : (
                Object.entries(customPresets).map(([name, preset]) => (
                  <div key={name} style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: '#1a1a1a',
                    padding: '0.5rem',
                    borderRadius: '4px'
                  }}>
                    <span style={{ flex: 1, color: '#fff' }}>{name}</span>
                    <button onClick={() => handleLoadPreset(preset)}>Load</button>
                    <button className="danger" onClick={() => handleDeletePreset(name)}>Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions" style={{ marginTop: '2rem', position: 'sticky', bottom: 0, background: '#2a2a2a', padding: '1rem 0' }}>
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
