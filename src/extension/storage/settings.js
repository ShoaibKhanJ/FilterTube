/**
 * FilterTube – Storage Module
 * Handles all Chrome Storage API interactions.
 * All settings are persisted in chrome.storage.sync so they
 * survive browser restarts and sync across devices.
 */

// ─── Default Settings ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  filterKeywords: [],       // Keywords to allow (whitelist mode)
  blockedKeywords: [],      // Keywords to always block
  whitelistedChannels: [],  // Channels that always show
  hideShorts: false,        // Toggle: hide YouTube Shorts
  focusMode: false,         // Toggle: hide sidebar & recommendations
  filterEnabled: true,      // Master on/off switch
};

// ─── Load Settings ─────────────────────────────────────────────────────────────
/**
 * Loads settings from Chrome storage.
 * Returns a promise that resolves with the current settings merged with defaults.
 */
export function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result);
    });
  });
}

// ─── Save Settings ─────────────────────────────────────────────────────────────
/**
 * Saves settings to Chrome storage.
 * @param {Object} settings – Partial or full settings object to persist.
 * @returns {Promise<void>}
 */
export function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => {
      resolve();
    });
  });
}

// ─── Reset Settings ────────────────────────────────────────────────────────────
/**
 * Resets all settings to their default values.
 * @returns {Promise<void>}
 */
export function resetSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
      resolve();
    });
  });
}

// ─── Keyword Helpers ───────────────────────────────────────────────────────────

/**
 * Adds a keyword to the filter keywords list.
 * @param {string} keyword
 */
export async function addFilterKeyword(keyword) {
  const settings = await loadSettings();
  const trimmed = keyword.trim().toLowerCase();
  if (trimmed && !settings.filterKeywords.includes(trimmed)) {
    settings.filterKeywords.push(trimmed);
    await saveSettings({ filterKeywords: settings.filterKeywords });
  }
}

/**
 * Removes a keyword from the filter keywords list.
 * @param {string} keyword
 */
export async function removeFilterKeyword(keyword) {
  const settings = await loadSettings();
  settings.filterKeywords = settings.filterKeywords.filter(
    (k) => k !== keyword.toLowerCase()
  );
  await saveSettings({ filterKeywords: settings.filterKeywords });
}

/**
 * Adds a keyword to the blocked keywords list.
 * @param {string} keyword
 */
export async function addBlockedKeyword(keyword) {
  const settings = await loadSettings();
  const trimmed = keyword.trim().toLowerCase();
  if (trimmed && !settings.blockedKeywords.includes(trimmed)) {
    settings.blockedKeywords.push(trimmed);
    await saveSettings({ blockedKeywords: settings.blockedKeywords });
  }
}

/**
 * Removes a keyword from the blocked keywords list.
 * @param {string} keyword
 */
export async function removeBlockedKeyword(keyword) {
  const settings = await loadSettings();
  settings.blockedKeywords = settings.blockedKeywords.filter(
    (k) => k !== keyword.toLowerCase()
  );
  await saveSettings({ blockedKeywords: settings.blockedKeywords });
}

/**
 * Adds a channel to the whitelist.
 * @param {string} channel
 */
export async function addWhitelistedChannel(channel) {
  const settings = await loadSettings();
  const trimmed = channel.trim().toLowerCase();
  if (trimmed && !settings.whitelistedChannels.includes(trimmed)) {
    settings.whitelistedChannels.push(trimmed);
    await saveSettings({ whitelistedChannels: settings.whitelistedChannels });
  }
}

/**
 * Removes a channel from the whitelist.
 * @param {string} channel
 */
export async function removeWhitelistedChannel(channel) {
  const settings = await loadSettings();
  settings.whitelistedChannels = settings.whitelistedChannels.filter(
    (c) => c !== channel.toLowerCase()
  );
  await saveSettings({ whitelistedChannels: settings.whitelistedChannels });
}

export { DEFAULT_SETTINGS };
