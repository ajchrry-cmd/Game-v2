/**
 * UI Settings Utility
 * Loads and applies UI customization settings from localStorage
 */

export const defaultUISettings = {
  // Panel Settings
  playerPanelWidth: 380,

  // Card General Settings
  playerCardSpacing: 0.75,
  playerInfoPadding: 0.85,
  playerCardBorderWidth: 2,
  playerCardBorderRadius: 8,
  playerCardShadowBlur: 12,
  playerCardShadowOpacity: 0.2,

  // Typography
  playerCardFontSize: 0.9,
  playerNameFontSize: 1.3,
  playerNameFontWeight: 'bold',
  statLabelFontSize: 0.85,
  statLabelFontWeight: 'bold',
  statLabelLetterSpacing: 0.5,
  statValueFontSize: 1.3,
  statValueFontWeight: 'bold',
  inventoryLabelFontSize: 0.85,

  // Stats Layout
  statPadding: 0.5,
  statBorderRadius: 6,
  statGap: 0.5,

  // Inventory
  inventorySlotSize: 60,
  inventoryGridGap: 0.5,
  inventorySlotBorderWidth: 3,
  inventorySlotBorderRadius: 8,

  // Party Slots
  partySlotSize: 55,
  partySlotBorderWidth: 3,
  partySlotBorderRadius: 8,

  // Colors
  primaryColor: '#d4af37',
  secondaryColor: '#2a2a2a',
  cardBackgroundColor: '#1a1a1a',
  textPrimaryColor: '#ffffff',
  textSecondaryColor: '#999999',
  statBackgroundColor: '#2a2a2a',
  statBorderColor: '#444444',
  inventorySlotBorderColor: '#555555',

  // Hover Effects
  cardHoverShadowBlur: 16,
  cardHoverShadowOpacity: 0.3,
  cardHoverTranslateY: -2,
  inventorySlotHoverScale: 1.05,
  inventorySlotHoverShadowBlur: 12,
  inventorySlotHoverShadowOpacity: 0.3
};

/**
 * Load UI settings from localStorage and apply them to the document
 */
export const loadUISettings = () => {
  const saved = localStorage.getItem('uiCustomization');
  const settings = saved ? JSON.parse(saved) : defaultUISettings;

  applyUISettings(settings);
  return settings;
};

/**
 * Apply UI settings as CSS variables to the document root
 */
export const applyUISettings = (settings) => {
  // Panel Settings
  document.documentElement.style.setProperty('--player-panel-width', `${settings.playerPanelWidth}px`);

  // Card General Settings
  document.documentElement.style.setProperty('--player-card-spacing', `${settings.playerCardSpacing}rem`);
  document.documentElement.style.setProperty('--player-info-padding', `${settings.playerInfoPadding}rem`);
  document.documentElement.style.setProperty('--player-card-border-width', `${settings.playerCardBorderWidth}px`);
  document.documentElement.style.setProperty('--player-card-border-radius', `${settings.playerCardBorderRadius}px`);
  document.documentElement.style.setProperty('--player-card-shadow-blur', `${settings.playerCardShadowBlur}px`);
  document.documentElement.style.setProperty('--player-card-shadow-opacity', settings.playerCardShadowOpacity);

  // Typography
  document.documentElement.style.setProperty('--player-card-font-size', `${settings.playerCardFontSize}rem`);
  document.documentElement.style.setProperty('--player-name-font-size', `${settings.playerNameFontSize}rem`);
  document.documentElement.style.setProperty('--player-name-font-weight', settings.playerNameFontWeight);
  document.documentElement.style.setProperty('--stat-label-font-size', `${settings.statLabelFontSize}rem`);
  document.documentElement.style.setProperty('--stat-label-font-weight', settings.statLabelFontWeight);
  document.documentElement.style.setProperty('--stat-label-letter-spacing', `${settings.statLabelLetterSpacing}px`);
  document.documentElement.style.setProperty('--stat-value-font-size', `${settings.statValueFontSize}rem`);
  document.documentElement.style.setProperty('--stat-value-font-weight', settings.statValueFontWeight);
  document.documentElement.style.setProperty('--inventory-label-font-size', `${settings.inventoryLabelFontSize}rem`);

  // Stats Layout
  document.documentElement.style.setProperty('--stat-padding', `${settings.statPadding}rem`);
  document.documentElement.style.setProperty('--stat-border-radius', `${settings.statBorderRadius}px`);
  document.documentElement.style.setProperty('--stat-gap', `${settings.statGap}rem`);

  // Inventory
  document.documentElement.style.setProperty('--inventory-slot-size', `${settings.inventorySlotSize}px`);
  document.documentElement.style.setProperty('--inventory-grid-gap', `${settings.inventoryGridGap}rem`);
  document.documentElement.style.setProperty('--inventory-slot-border-width', `${settings.inventorySlotBorderWidth}px`);
  document.documentElement.style.setProperty('--inventory-slot-border-radius', `${settings.inventorySlotBorderRadius}px`);

  // Party Slots
  document.documentElement.style.setProperty('--party-slot-size', `${settings.partySlotSize}px`);
  document.documentElement.style.setProperty('--party-slot-border-width', `${settings.partySlotBorderWidth}px`);
  document.documentElement.style.setProperty('--party-slot-border-radius', `${settings.partySlotBorderRadius}px`);

  // Colors
  document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
  document.documentElement.style.setProperty('--card-background-color', settings.cardBackgroundColor);
  document.documentElement.style.setProperty('--text-primary-color', settings.textPrimaryColor);
  document.documentElement.style.setProperty('--text-secondary-color', settings.textSecondaryColor);
  document.documentElement.style.setProperty('--stat-background-color', settings.statBackgroundColor);
  document.documentElement.style.setProperty('--stat-border-color', settings.statBorderColor);
  document.documentElement.style.setProperty('--inventory-slot-border-color', settings.inventorySlotBorderColor);

  // Hover Effects
  document.documentElement.style.setProperty('--card-hover-shadow-blur', `${settings.cardHoverShadowBlur}px`);
  document.documentElement.style.setProperty('--card-hover-shadow-opacity', settings.cardHoverShadowOpacity);
  document.documentElement.style.setProperty('--card-hover-translate-y', `${settings.cardHoverTranslateY}px`);
  document.documentElement.style.setProperty('--inventory-slot-hover-scale', settings.inventorySlotHoverScale);
  document.documentElement.style.setProperty('--inventory-slot-hover-shadow-blur', `${settings.inventorySlotHoverShadowBlur}px`);
  document.documentElement.style.setProperty('--inventory-slot-hover-shadow-opacity', settings.inventorySlotHoverShadowOpacity);
};

/**
 * Save UI settings to localStorage
 */
export const saveUISettings = (settings) => {
  localStorage.setItem('uiCustomization', JSON.stringify(settings));
  applyUISettings(settings);
};

/**
 * Reset UI settings to defaults
 */
export const resetUISettings = () => {
  localStorage.removeItem('uiCustomization');
  applyUISettings(defaultUISettings);
  return defaultUISettings;
};

/**
 * Save a custom preset
 */
export const savePreset = (presetName, settings) => {
  const presets = loadPresets();
  presets[presetName] = settings;
  localStorage.setItem('uiPresets', JSON.stringify(presets));
};

/**
 * Load all custom presets
 */
export const loadPresets = () => {
  const saved = localStorage.getItem('uiPresets');
  return saved ? JSON.parse(saved) : {};
};

/**
 * Delete a custom preset
 */
export const deletePreset = (presetName) => {
  const presets = loadPresets();
  delete presets[presetName];
  localStorage.setItem('uiPresets', JSON.stringify(presets));
};

