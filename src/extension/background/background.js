/**
 * FilterTube – Background Service Worker (Manifest V3)
 * Handles extension lifecycle events, inter-component messaging,
 * and tab management.
 *
 * In MV3, the background script runs as a service worker –
 * it's event-driven and does NOT stay alive persistently.
 */

// ─── Extension Installation / Update ─────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[FilterTube] Extension installed. Setting up defaults...');

    // Initialize default settings on first install
    const defaults = {
      filterKeywords: [],
      blockedKeywords: [],
      whitelistedChannels: [],
      hideShorts: false,
      focusMode: false,
      filterEnabled: true,
      installDate: new Date().toISOString(),
      version: '1.0.0',
    };

    await chrome.storage.sync.set(defaults);
    console.log('[FilterTube] Default settings saved.');

    // Open onboarding or welcome page (optional)
    // chrome.tabs.create({ url: 'https://www.youtube.com' });

  } else if (details.reason === 'update') {
    console.log(`[FilterTube] Extension updated to v${chrome.runtime.getManifest().version}`);

    // Migrate settings if needed
    await migrateSettings(details.previousVersion);
  }
});

// ─── Settings Migration ───────────────────────────────────────────────────────

/**
 * Handles settings migration between versions.
 * @param {string} previousVersion
 */
async function migrateSettings(previousVersion) {
  // Future: add migration logic when schema changes between versions
  console.log(`[FilterTube] Migrating from v${previousVersion}`);
}

// ─── Message Handling ─────────────────────────────────────────────────────────

/**
 * Listens for messages from popup or content scripts.
 * Acts as a message broker between extension components.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[FilterTube] Message received:', message.type);

  switch (message.type) {

    // Popup requests a settings reload in the active tab
    case 'SETTINGS_UPDATED': {
      notifyActiveTab({ type: 'RELOAD_SETTINGS' });
      sendResponse({ success: true });
      break;
    }

    // Content script requests current settings
    case 'GET_SETTINGS': {
      chrome.storage.sync.get(null, (settings) => {
        sendResponse({ settings });
      });
      return true; // Keep channel open for async response
    }

    // Popup requests tab info
    case 'GET_TAB_INFO': {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        sendResponse({
          url: tab?.url || '',
          isYouTube: tab?.url?.includes('youtube.com') || false,
          tabId: tab?.id,
        });
      });
      return true;
    }

    // Toggle filter on/off for current session
    case 'TOGGLE_FILTER': {
      chrome.storage.sync.get(['filterEnabled'], (result) => {
        const newState = !result.filterEnabled;
        chrome.storage.sync.set({ filterEnabled: newState }, () => {
          notifyActiveTab({ type: 'RELOAD_SETTINGS' });
          sendResponse({ filterEnabled: newState });
        });
      });
      return true;
    }

    default:
      console.warn('[FilterTube] Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

// ─── Tab Helpers ──────────────────────────────────────────────────────────────

/**
 * Sends a message to the currently active YouTube tab.
 * @param {Object} message
 */
async function notifyActiveTab(message) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes('youtube.com')) {
      await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (err) {
    // Tab may not have content script – ignore
    console.warn('[FilterTube] Could not notify tab:', err.message);
  }
}

// ─── Storage Change Relay ─────────────────────────────────────────────────────

/**
 * When settings change, notify all YouTube tabs to re-run filtering.
 */
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'sync') return;

  // Find all YouTube tabs and notify them
  const tabs = await chrome.tabs.query({ url: '*://www.youtube.com/*' });
  tabs.forEach(async (tab) => {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_SETTINGS' });
    } catch {
      // Tab may not have loaded the content script yet
    }
  });
});

console.log('[FilterTube] Background service worker ready.');
