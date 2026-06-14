/**
 * FilterTube – Popup Script
 * Manages the popup UI: rendering chips, handling user interactions,
 * reading from and writing to Chrome Storage, and syncing with content scripts.
 */

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
  filterKeywords: [],
  blockedKeywords: [],
  whitelistedChannels: [],
  hideShorts: false,
  focusMode: false,
  filterEnabled: true,
};

// ─── DOM References ───────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const els = {
  // Toggles
  masterToggle: $('toggle-master'),
  shortsToggle: $('toggle-shorts'),
  focusToggle:  $('toggle-focus'),

  // Inputs
  filterInput:  $('input-filter-keyword'),
  blockedInput: $('input-blocked-keyword'),
  channelInput: $('input-channel'),

  // Add buttons
  btnAddFilter:   $('btn-add-filter'),
  btnAddBlocked:  $('btn-add-blocked'),
  btnAddChannel:  $('btn-add-channel'),

  // Chip containers
  chipsFilter:   $('chips-filter'),
  chipsBlocked:  $('chips-blocked'),
  chipsChannels: $('chips-channels'),

  // Empty states
  emptyFilter:   $('empty-filter'),
  emptyBlocked:  $('empty-blocked'),
  emptyChannels: $('empty-channels'),

  // Stats
  statFilterCount:  $('stat-filter-count'),
  statBlockCount:   $('stat-block-count'),
  statChannelCount: $('stat-channel-count'),

  // Status
  statusDot:  $('status-dot'),
  statusText: $('status-text'),

  // Actions
  btnSave:      $('btn-save'),
  btnReset:     $('btn-reset'),
  btnResetAll:  $('btn-reset-all'),
  saveFeedback: $('save-feedback'),

  // Tabs
  tabBtns:  document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
};

// ─── Initialization ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  renderAll();
  bindEvents();
  updateStatusBar();
});

// ─── Storage ──────────────────────────────────────────────────────────────────

async function loadSettings() {
  return new Promise((resolve) => {
    const defaults = {
      filterKeywords: [],
      blockedKeywords: [],
      whitelistedChannels: [],
      hideShorts: false,
      focusMode: false,
      filterEnabled: true,
    };

    chrome.storage.sync.get(defaults, (result) => {
      state = { ...defaults, ...result };
      resolve(state);
    });
  });
}

async function saveSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.set(state, () => {
      resolve();
      // Notify background to relay to content scripts
      chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' }).catch(() => {});
    });
  });
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderAll() {
  // Sync toggles
  els.masterToggle.checked = state.filterEnabled;
  els.shortsToggle.checked  = state.hideShorts;
  els.focusToggle.checked   = state.focusMode;

  // Render chips
  renderChips('filter');
  renderChips('blocked');
  renderChips('channels');

  // Update stats
  updateStats();
}

/**
 * Renders keyword/channel chips into their container.
 * @param {'filter'|'blocked'|'channels'} type
 */
function renderChips(type) {
  const config = {
    filter: {
      data: state.filterKeywords,
      container: els.chipsFilter,
      empty: els.emptyFilter,
      chipClass: 'filter-chip',
      removeFn: removeFilterKeyword,
    },
    blocked: {
      data: state.blockedKeywords,
      container: els.chipsBlocked,
      empty: els.emptyBlocked,
      chipClass: 'blocked-chip',
      removeFn: removeBlockedKeyword,
    },
    channels: {
      data: state.whitelistedChannels,
      container: els.chipsChannels,
      empty: els.emptyChannels,
      chipClass: 'channel-chip',
      removeFn: removeChannel,
    },
  };

  const { data, container, empty, chipClass, removeFn } = config[type];

  // Clear existing chips (not the empty state)
  container.innerHTML = '';

  if (data.length === 0) {
    empty.classList.add('visible');
  } else {
    empty.classList.remove('visible');
    data.forEach((item) => {
      const chip = createChip(item, chipClass, removeFn);
      container.appendChild(chip);
    });
  }
}

/**
 * Creates a single chip element.
 * @param {string} text
 * @param {string} chipClass
 * @param {Function} removeFn
 * @returns {HTMLElement}
 */
function createChip(text, chipClass, removeFn) {
  const chip = document.createElement('div');
  chip.className = `chip ${chipClass}`;

  const label = document.createElement('span');
  label.textContent = text;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'chip-remove';
  removeBtn.title = 'Remove';
  removeBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

  removeBtn.addEventListener('click', () => {
    chip.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    chip.style.opacity = '0';
    chip.style.transform = 'scale(0.85)';
    setTimeout(() => {
      removeFn(text);
    }, 150);
  });

  chip.appendChild(label);
  chip.appendChild(removeBtn);
  return chip;
}

function updateStats() {
  els.statFilterCount.textContent  = state.filterKeywords.length;
  els.statBlockCount.textContent   = state.blockedKeywords.length;
  els.statChannelCount.textContent = state.whitelistedChannels.length;
}

function updateStatusBar() {
  if (state.filterEnabled) {
    els.statusDot.classList.remove('inactive');
    els.statusText.textContent = 'Active — Filtering YouTube';
  } else {
    els.statusDot.classList.add('inactive');
    els.statusText.textContent = 'Disabled — Click toggle to enable';
  }
}

// ─── Keyword Operations ───────────────────────────────────────────────────────

function addFilterKeyword() {
  const val = els.filterInput.value.trim().toLowerCase();
  if (!val) return;
  if (state.filterKeywords.includes(val)) {
    shakeInput(els.filterInput);
    return;
  }
  state.filterKeywords.push(val);
  els.filterInput.value = '';
  renderChips('filter');
  updateStats();
}

function removeFilterKeyword(keyword) {
  state.filterKeywords = state.filterKeywords.filter((k) => k !== keyword);
  renderChips('filter');
  updateStats();
}

function addBlockedKeyword() {
  const val = els.blockedInput.value.trim().toLowerCase();
  if (!val) return;
  if (state.blockedKeywords.includes(val)) {
    shakeInput(els.blockedInput);
    return;
  }
  state.blockedKeywords.push(val);
  els.blockedInput.value = '';
  renderChips('blocked');
  updateStats();
}

function removeBlockedKeyword(keyword) {
  state.blockedKeywords = state.blockedKeywords.filter((k) => k !== keyword);
  renderChips('blocked');
  updateStats();
}

function addChannel() {
  const val = els.channelInput.value.trim();
  if (!val) return;
  const valLower = val.toLowerCase();
  if (state.whitelistedChannels.includes(valLower)) {
    shakeInput(els.channelInput);
    return;
  }
  state.whitelistedChannels.push(valLower);
  els.channelInput.value = '';
  renderChips('channels');
  updateStats();
}

function removeChannel(channel) {
  state.whitelistedChannels = state.whitelistedChannels.filter((c) => c !== channel);
  renderChips('channels');
  updateStats();
}

// ─── Input Shake Animation ────────────────────────────────────────────────────

function shakeInput(input) {
  input.style.animation = 'none';
  input.offsetHeight; // Force reflow
  input.style.borderColor = 'rgba(255, 0, 0, 0.6)';
  input.style.animation = 'shake 0.3s ease';
  setTimeout(() => {
    input.style.borderColor = '';
    input.style.animation = '';
  }, 400);
}

// Inject shake keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
`;
document.head.appendChild(style);

// ─── Save ─────────────────────────────────────────────────────────────────────

async function handleSave() {
  els.btnSave.disabled = true;
  els.btnSave.style.opacity = '0.7';

  await saveSettings();

  // Show feedback
  els.saveFeedback.classList.add('visible');
  setTimeout(() => {
    els.saveFeedback.classList.remove('visible');
    els.btnSave.disabled = false;
    els.btnSave.style.opacity = '';
  }, 2000);
}

// ─── Reset ────────────────────────────────────────────────────────────────────

async function handleResetAll() {
  const confirmed = confirm('Reset ALL FilterTube settings? This cannot be undone.');
  if (!confirmed) return;

  state = {
    filterKeywords: [],
    blockedKeywords: [],
    whitelistedChannels: [],
    hideShorts: false,
    focusMode: false,
    filterEnabled: true,
  };

  await saveSettings();
  renderAll();
  updateStatusBar();
}

// ─── Tab Switching ────────────────────────────────────────────────────────────

function switchTab(tabName) {
  els.tabBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  els.tabPanes.forEach((pane) => {
    pane.classList.toggle('active', pane.id === `tab-${tabName}`);
  });
}

// ─── Event Binding ────────────────────────────────────────────────────────────

function bindEvents() {
  // Tab switching
  els.tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Master toggle
  els.masterToggle.addEventListener('change', () => {
    state.filterEnabled = els.masterToggle.checked;
    updateStatusBar();
  });

  // Shorts toggle
  els.shortsToggle.addEventListener('change', () => {
    state.hideShorts = els.shortsToggle.checked;
  });

  // Focus mode toggle
  els.focusToggle.addEventListener('change', () => {
    state.focusMode = els.focusToggle.checked;
  });

  // Add filter keyword
  els.btnAddFilter.addEventListener('click', addFilterKeyword);
  els.filterInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addFilterKeyword();
  });

  // Add blocked keyword
  els.btnAddBlocked.addEventListener('click', addBlockedKeyword);
  els.blockedInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBlockedKeyword();
  });

  // Add channel
  els.btnAddChannel.addEventListener('click', addChannel);
  els.channelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addChannel();
  });

  // Save button
  els.btnSave.addEventListener('click', handleSave);

  // Reset buttons
  els.btnReset?.addEventListener('click', handleResetAll);
  els.btnResetAll?.addEventListener('click', handleResetAll);
}
