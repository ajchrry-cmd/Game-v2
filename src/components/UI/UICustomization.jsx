import React, { useState, useEffect } from 'react';
import { defaultUISettings, saveUISettings, resetUISettings, applyUISettings, savePreset, loadPresets, deletePreset } from '../../utils/uiSettings';
import './UICustomization.css';

const TABS = [
  { key: 'theme', label: 'Theme' },
  { key: 'layout', label: 'Layout' },
  { key: 'typography', label: 'Typography' },
  { key: 'effects', label: 'Effects' },
  { key: 'map', label: 'Map' },
  { key: 'presets', label: 'Presets' }
];

const BUILT_IN_PRESETS = [
  { name: 'Default', settings: { ...defaultUISettings } },
  {
    name: 'Comfortable',
    settings: {
      ...defaultUISettings,
      playerPanelWidth: 420,
      playerCardSpacing: 1,
      playerInfoPadding: 1.1,
      playerCardFontSize: 1,
      statPadding: 0.6,
      inventorySlotSize: 70,
      partySlotSize: 60
    }
  },
  {
    name: 'Large',
    settings: {
      ...defaultUISettings,
      playerPanelWidth: 480,
      playerCardSpacing: 1.25,
      playerInfoPadding: 1.25,
      playerCardFontSize: 1.1,
      playerNameFontSize: 1.5,
      statPadding: 0.7,
      inventorySlotSize: 75,
      partySlotSize: 65
    }
  },
  {
    name: 'Compact',
    settings: {
      ...defaultUISettings,
      playerPanelWidth: 340,
      playerCardSpacing: 0.5,
      playerInfoPadding: 0.65,
      playerCardFontSize: 0.8,
      playerNameFontSize: 1.1,
      statPadding: 0.4,
      inventorySlotSize: 50,
      partySlotSize: 45
    }
  },
  {
    name: 'Ultra Compact',
    settings: {
      ...defaultUISettings,
      playerPanelWidth: 250,
      playerCardSpacing: 0.1,
      playerInfoPadding: 0.2,
      playerCardBorderWidth: 1,
      playerCardBorderRadius: 4,
      playerCardShadowBlur: 0,
      playerCardShadowOpacity: 0,
      playerCardFontSize: 0.5,
      playerNameFontSize: 0.7,
      statLabelFontSize: 0.5,
      statValueFontSize: 0.7,
      inventoryLabelFontSize: 0.5,
      statPadding: 0.1,
      statBorderRadius: 2,
      statGap: 0.1,
      inventorySlotSize: 30,
      inventoryGridGap: 0.1,
      inventorySlotBorderWidth: 1,
      partySlotSize: 25,
      partySlotBorderWidth: 1,
      cardHoverShadowBlur: 0,
      cardHoverShadowOpacity: 0,
      cardHoverTranslateY: 0,
      inventorySlotHoverScale: 1
    }
  }
];

function UICustomization({ onClose }) {
  const [settings, setSettings] = useState(defaultUISettings);
  const [activeTab, setActiveTab] = useState('theme');
  const [customPresets, setCustomPresets] = useState({});
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('uiCustomization');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    setCustomPresets(loadPresets());
  }, []);

  // Auto-apply changes in real-time for live preview
  const handleChange = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    applyUISettings(next);
  };

  const handleSave = () => {
    saveUISettings(settings);
    onClose();
  };

  const handleReset = () => {
    const defaults = resetUISettings();
    setSettings(defaults);
  };

  const handleLoadPreset = (preset) => {
    setSettings(preset);
    applyUISettings(preset);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    savePreset(presetName, settings);
    setCustomPresets(loadPresets());
    setPresetName('');
    setShowPresetInput(false);
  };

  const handleDeletePreset = (name) => {
    if (confirm(`Delete preset "${name}"?`)) {
      deletePreset(name);
      setCustomPresets(loadPresets());
    }
  };

  // ---- Render helpers ----

  const Slider = ({ label, settingKey, min, max, step, unit = '' }) => (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <div className="setting-control">
        <input
          type="range"
          className="setting-slider"
          min={min}
          max={max}
          step={step}
          value={settings[settingKey]}
          onChange={(e) => handleChange(settingKey, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        />
        <span className="setting-value">{settings[settingKey]}{unit}</span>
      </div>
    </div>
  );

  const ColorPicker = ({ label, settingKey }) => (
    <div className="color-row">
      <span className="color-label">{label}</span>
      <div className="color-control">
        <div className="color-swatch-wrapper">
          <div className="color-swatch" style={{ backgroundColor: settings[settingKey] }} />
          <input
            type="color"
            className="color-input-hidden"
            value={settings[settingKey]}
            onChange={(e) => handleChange(settingKey, e.target.value)}
          />
        </div>
        <input
          type="text"
          className="color-hex"
          value={settings[settingKey]}
          onChange={(e) => handleChange(settingKey, e.target.value)}
        />
      </div>
    </div>
  );

  const Select = ({ label, settingKey, options }) => (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <div className="setting-control">
        <select
          className="setting-select"
          value={settings[settingKey]}
          onChange={(e) => handleChange(settingKey, e.target.value)}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // ---- Tab content renderers ----

  const renderTheme = () => (
    <>
      <div className="setting-group-title">Accent Colors</div>
      <ColorPicker label="Primary / Gold" settingKey="primaryColor" />
      <ColorPicker label="Secondary" settingKey="secondaryColor" />

      <div className="setting-group-title">Backgrounds</div>
      <ColorPicker label="Card Background" settingKey="cardBackgroundColor" />
      <ColorPicker label="Stat Background" settingKey="statBackgroundColor" />

      <div className="setting-group-title">Text</div>
      <ColorPicker label="Primary Text" settingKey="textPrimaryColor" />
      <ColorPicker label="Secondary Text" settingKey="textSecondaryColor" />

      <div className="setting-group-title">Borders</div>
      <ColorPicker label="Stat Border" settingKey="statBorderColor" />
      <ColorPicker label="Inventory Slot Border" settingKey="inventorySlotBorderColor" />
    </>
  );

  const renderLayout = () => (
    <>
      <div className="setting-group-title">Panel</div>
      <Slider label="Panel Width" settingKey="playerPanelWidth" min={250} max={600} step={10} unit="px" />

      <div className="setting-group-title">Card</div>
      <Slider label="Card Spacing" settingKey="playerCardSpacing" min={0.1} max={2} step={0.1} unit="rem" />
      <Slider label="Card Padding" settingKey="playerInfoPadding" min={0.2} max={2} step={0.1} unit="rem" />
      <Slider label="Border Width" settingKey="playerCardBorderWidth" min={0} max={8} step={1} unit="px" />
      <Slider label="Border Radius" settingKey="playerCardBorderRadius" min={0} max={24} step={2} unit="px" />
      <Slider label="Shadow Blur" settingKey="playerCardShadowBlur" min={0} max={32} step={2} unit="px" />
      <Slider label="Shadow Opacity" settingKey="playerCardShadowOpacity" min={0} max={1} step={0.05} />

      <div className="setting-group-title">Stats</div>
      <Slider label="Stat Padding" settingKey="statPadding" min={0.1} max={1.5} step={0.05} unit="rem" />
      <Slider label="Stat Radius" settingKey="statBorderRadius" min={0} max={16} step={1} unit="px" />
      <Slider label="Stat Gap" settingKey="statGap" min={0.1} max={1.5} step={0.05} unit="rem" />

      <div className="setting-group-title">Inventory</div>
      <Slider label="Slot Size" settingKey="inventorySlotSize" min={30} max={120} step={5} unit="px" />
      <Slider label="Grid Gap" settingKey="inventoryGridGap" min={0.1} max={1.5} step={0.05} unit="rem" />
      <Slider label="Slot Border" settingKey="inventorySlotBorderWidth" min={0} max={6} step={1} unit="px" />
      <Slider label="Slot Radius" settingKey="inventorySlotBorderRadius" min={0} max={24} step={2} unit="px" />

      <div className="setting-group-title">Party Slots</div>
      <Slider label="Slot Size" settingKey="partySlotSize" min={25} max={120} step={5} unit="px" />
      <Slider label="Border Width" settingKey="partySlotBorderWidth" min={0} max={6} step={1} unit="px" />
      <Slider label="Border Radius" settingKey="partySlotBorderRadius" min={0} max={24} step={2} unit="px" />
    </>
  );

  const renderTypography = () => (
    <>
      <div className="setting-group-title">Card Text</div>
      <Slider label="Base Font Size" settingKey="playerCardFontSize" min={0.5} max={1.5} step={0.05} unit="rem" />
      <Slider label="Player Name" settingKey="playerNameFontSize" min={0.7} max={2} step={0.1} unit="rem" />
      <Select
        label="Name Weight"
        settingKey="playerNameFontWeight"
        options={[
          { value: '300', label: 'Light' },
          { value: 'normal', label: 'Normal' },
          { value: 'bold', label: 'Bold' },
          { value: '900', label: 'Heavy' }
        ]}
      />

      <div className="setting-group-title">Stats</div>
      <Slider label="Label Size" settingKey="statLabelFontSize" min={0.5} max={1.2} step={0.05} unit="rem" />
      <Select
        label="Label Weight"
        settingKey="statLabelFontWeight"
        options={[
          { value: 'normal', label: 'Normal' },
          { value: 'bold', label: 'Bold' }
        ]}
      />
      <Slider label="Label Spacing" settingKey="statLabelLetterSpacing" min={0} max={2} step={0.1} unit="px" />
      <Slider label="Value Size" settingKey="statValueFontSize" min={0.7} max={2} step={0.1} unit="rem" />
      <Select
        label="Value Weight"
        settingKey="statValueFontWeight"
        options={[
          { value: 'normal', label: 'Normal' },
          { value: 'bold', label: 'Bold' }
        ]}
      />

      <div className="setting-group-title">Labels</div>
      <Slider label="Inventory Label" settingKey="inventoryLabelFontSize" min={0.5} max={1.2} step={0.05} unit="rem" />
    </>
  );

  const renderEffects = () => (
    <>
      <div className="setting-group-title">Card Hover</div>
      <Slider label="Shadow Blur" settingKey="cardHoverShadowBlur" min={0} max={32} step={2} unit="px" />
      <Slider label="Shadow Opacity" settingKey="cardHoverShadowOpacity" min={0} max={1} step={0.05} />
      <Slider label="Lift Amount" settingKey="cardHoverTranslateY" min={-10} max={0} step={1} unit="px" />

      <div className="setting-group-title">Inventory Slot Hover</div>
      <Slider label="Scale" settingKey="inventorySlotHoverScale" min={1} max={1.3} step={0.01} unit="x" />
      <Slider label="Shadow Blur" settingKey="inventorySlotHoverShadowBlur" min={0} max={24} step={2} unit="px" />
      <Slider label="Shadow Opacity" settingKey="inventorySlotHoverShadowOpacity" min={0} max={1} step={0.05} />
    </>
  );

  const renderMap = () => (
    <>
      <div className="setting-group-title">Map View</div>
      <Slider label="Default Zoom" settingKey="mapDefaultZoom" min={0.5} max={3} step={0.1} unit="x" />
      <Slider label="Center X" settingKey="mapCenterX" min={-2000} max={2000} step={50} unit="px" />
      <Slider label="Center Y" settingKey="mapCenterY" min={-2000} max={2000} step={50} unit="px" />

      <div className="setting-group-title">Tokens</div>
      <Slider label="Token Size" settingKey="playerTokenSize" min={30} max={100} step={5} unit="px" />
    </>
  );

  const renderPresets = () => (
    <>
      <div className="setting-group-title">Built-in Presets</div>
      <div className="preset-grid">
        {BUILT_IN_PRESETS.map(preset => (
          <div
            key={preset.name}
            className="preset-card"
            onClick={() => handleLoadPreset(preset.settings)}
          >
            <div className="preset-name">{preset.name}</div>
            <div className="preset-dots">
              <div className="preset-dot" style={{ backgroundColor: preset.settings.primaryColor }} />
              <div className="preset-dot" style={{ backgroundColor: preset.settings.cardBackgroundColor }} />
              <div className="preset-dot" style={{ backgroundColor: preset.settings.textPrimaryColor }} />
              <div className="preset-dot" style={{ backgroundColor: preset.settings.statBackgroundColor }} />
            </div>
          </div>
        ))}
      </div>

      <div className="setting-group-title">Custom Presets</div>
      {!showPresetInput ? (
        <button onClick={() => setShowPresetInput(true)} style={{ marginBottom: '0.75rem' }}>
          + Save Current as Preset
        </button>
      ) : (
        <div className="save-preset-row">
          <input
            type="text"
            className="save-preset-input"
            placeholder="Preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            autoFocus
          />
          <button className="primary" onClick={handleSavePreset}>Save</button>
          <button onClick={() => { setShowPresetInput(false); setPresetName(''); }}>Cancel</button>
        </div>
      )}

      {Object.entries(customPresets).length === 0 ? (
        <p className="no-presets">No custom presets saved yet</p>
      ) : (
        Object.entries(customPresets).map(([name, preset]) => (
          <div key={name} className="custom-preset-row">
            <div className="preset-dots" style={{ marginRight: '0.5rem' }}>
              <div className="preset-dot" style={{ backgroundColor: preset.primaryColor || '#d4af37' }} />
              <div className="preset-dot" style={{ backgroundColor: preset.cardBackgroundColor || '#1a1a1a' }} />
            </div>
            <span className="custom-preset-name">{name}</span>
            <button onClick={() => handleLoadPreset(preset)}>Load</button>
            <button className="danger" onClick={() => handleDeletePreset(name)}>Delete</button>
          </div>
        ))
      )}
    </>
  );

  const tabContent = {
    theme: renderTheme,
    layout: renderLayout,
    typography: renderTypography,
    effects: renderEffects,
    map: renderMap,
    presets: renderPresets
  };

  // ---- Live Preview Card ----

  const renderPreview = () => {
    const s = settings;
    const cardStyle = {
      backgroundColor: s.cardBackgroundColor,
      borderRadius: `${s.playerCardBorderRadius}px`,
      borderWidth: `${s.playerCardBorderWidth}px`,
      borderStyle: 'solid',
      borderColor: s.primaryColor,
      boxShadow: `0 0 ${s.playerCardShadowBlur}px rgba(0,0,0,${s.playerCardShadowOpacity})`,
      fontSize: `${s.playerCardFontSize}rem`,
      marginBottom: `${s.playerCardSpacing}rem`,
      overflow: 'hidden'
    };

    const headerStyle = {
      padding: `${s.playerInfoPadding}rem`,
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
      background: `linear-gradient(135deg, ${s.secondaryColor} 0%, ${s.cardBackgroundColor} 100%)`
    };

    const nameStyle = {
      color: s.textPrimaryColor,
      fontSize: `${s.playerNameFontSize}rem`,
      fontWeight: s.playerNameFontWeight
    };

    const statBg = {
      backgroundColor: s.statBackgroundColor,
      border: `1px solid ${s.statBorderColor}`,
      borderRadius: `${s.statBorderRadius}px`,
      padding: `${s.statPadding}rem`,
      textAlign: 'center'
    };

    const labelStyle = {
      fontSize: `${s.statLabelFontSize}rem`,
      fontWeight: s.statLabelFontWeight,
      letterSpacing: `${s.statLabelLetterSpacing}px`,
      color: s.textSecondaryColor,
      textTransform: 'uppercase'
    };

    const valueStyle = {
      fontSize: `${s.statValueFontSize}rem`,
      fontWeight: s.statValueFontWeight,
      color: s.textPrimaryColor
    };

    const invSlotStyle = {
      width: `${Math.min(s.inventorySlotSize, 48)}px`,
      height: `${Math.min(s.inventorySlotSize, 48)}px`,
      border: `${s.inventorySlotBorderWidth}px solid ${s.inventorySlotBorderColor}`,
      borderRadius: `${s.inventorySlotBorderRadius}px`,
      backgroundColor: s.statBackgroundColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      color: '#555'
    };

    const sectionLabelStyle = {
      fontSize: `${s.inventoryLabelFontSize}rem`,
      color: s.textSecondaryColor,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      fontWeight: 700,
      marginBottom: '0.3rem',
      display: 'block'
    };

    return (
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ ...headerStyle, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: s.primaryColor, flexShrink: 0,
            border: `2px solid ${s.primaryColor}`
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...nameStyle, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Hero Name
            </div>
            <div style={{
              position: 'relative', height: 14, borderRadius: 7,
              overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: '#111'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%', width: '65%',
                background: 'linear-gradient(90deg, #c0392b 0%, #e74c3c 40%, #2ecc71 100%)',
                borderRadius: 7
              }} />
              <span style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700,
                color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}>65 / 100</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: `${s.statGap}rem`,
          padding: `0.4rem ${s.playerInfoPadding}rem`
        }}>
          <div style={statBg}>
            <span style={labelStyle}>Power</span>
            <span style={valueStyle}>65</span>
          </div>
          <div style={statBg}>
            <span style={labelStyle}>Money</span>
            <span style={valueStyle}>120</span>
          </div>
        </div>

        {/* Effects */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', padding: `0.25rem ${s.playerInfoPadding}rem` }}>
          <span style={{
            background: `linear-gradient(135deg, ${s.primaryColor}, ${s.primaryColor}cc)`,
            color: '#000', padding: '0.1rem 0.45rem', borderRadius: 10,
            fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase'
          }}>Haste</span>
          <span style={{
            background: `linear-gradient(135deg, ${s.primaryColor}, ${s.primaryColor}cc)`,
            color: '#000', padding: '0.1rem 0.45rem', borderRadius: 10,
            fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase'
          }}>Shield</span>
        </div>

        {/* Inventory */}
        <div style={{ padding: `0.35rem ${s.playerInfoPadding}rem 0.45rem`, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
          <span style={sectionLabelStyle}>Inventory</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: `${s.inventoryGridGap}rem` }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={invSlotStyle}>
                {i < 2 ? '\u2694' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ui-custom-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ui-custom-header">
          <h2>UI Customization</h2>
          <button className="ui-custom-close" onClick={onClose}>&times;</button>
        </div>

        {/* Tabs */}
        <div className="ui-custom-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`ui-custom-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body: controls + preview */}
        <div className="ui-custom-body">
          <div className="ui-custom-controls">
            {tabContent[activeTab]()}
          </div>

          <div className="ui-custom-preview">
            <div className="preview-label">Live Preview</div>
            <div className="preview-area">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ui-custom-footer">
          <button className="btn-save" onClick={handleSave}>Save &amp; Apply</button>
          <button className="btn-reset" onClick={handleReset}>Reset</button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default UICustomization;
