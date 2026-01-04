/**
 * UI Settings Utility
 * Loads and applies UI customization settings from localStorage
 */

export const defaultUISettings = {
  playerPanelWidth: 380,
  playerCardFontSize: 1,
  playerCardSpacing: 1.25,
  primaryColor: '#d4af37',
  secondaryColor: '#2a2a2a',
  inventorySlotSize: 70,
  playerInfoPadding: 1.25
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
  document.documentElement.style.setProperty('--player-panel-width', `${settings.playerPanelWidth}px`);
  document.documentElement.style.setProperty('--player-card-font-size', `${settings.playerCardFontSize}rem`);
  document.documentElement.style.setProperty('--player-card-spacing', `${settings.playerCardSpacing}rem`);
  document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
  document.documentElement.style.setProperty('--inventory-slot-size', `${settings.inventorySlotSize}px`);
  document.documentElement.style.setProperty('--player-info-padding', `${settings.playerInfoPadding}rem`);
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
