/**
 * FilterTube – Filter Utility
 * Core filtering logic that determines whether a video should be shown or hidden.
 * All comparisons are case-insensitive.
 */

/**
 * Normalizes a string for comparison – lowercase and trimmed.
 * @param {string} str
 * @returns {string}
 */
export function normalize(str) {
  return (str || '').toLowerCase().trim();
}

/**
 * Checks if a text contains any of the given keywords.
 * @param {string} text – The text to search (title, description, etc.)
 * @param {string[]} keywords – Array of keywords to look for.
 * @returns {boolean}
 */
export function containsAny(text, keywords) {
  if (!keywords || keywords.length === 0) return false;
  const normalizedText = normalize(text);
  return keywords.some((keyword) => normalizedText.includes(normalize(keyword)));
}

/**
 * Main filter decision function.
 * Determines if a video element should be visible based on current settings.
 *
 * Rules (in priority order):
 * 1. If channel is whitelisted → SHOW (always)
 * 2. If title/channel contains a blocked keyword → HIDE
 * 3. If filter keywords exist and title/channel does NOT contain any → HIDE
 * 4. Otherwise → SHOW
 *
 * @param {Object} videoData – { title: string, channel: string }
 * @param {Object} settings – Current FilterTube settings
 * @returns {{ visible: boolean, reason: string }}
 */
export function shouldShowVideo(videoData, settings) {
  const { title = '', channel = '' } = videoData;
  const {
    filterKeywords = [],
    blockedKeywords = [],
    whitelistedChannels = [],
    filterEnabled = true,
  } = settings;

  // If filtering is globally disabled, show everything
  if (!filterEnabled) {
    return { visible: true, reason: 'filter_disabled' };
  }

  const normalizedChannel = normalize(channel);

  // Rule 1: Whitelisted channels always show
  if (whitelistedChannels.length > 0) {
    const isWhitelisted = whitelistedChannels.some(
      (wc) => normalizedChannel.includes(normalize(wc)) || normalize(wc).includes(normalizedChannel)
    );
    if (isWhitelisted) {
      return { visible: true, reason: 'whitelisted_channel' };
    }
  }

  // Rule 2: Blocked keywords → hide
  const combinedText = `${title} ${channel}`;
  if (blockedKeywords.length > 0 && containsAny(combinedText, blockedKeywords)) {
    return { visible: false, reason: 'blocked_keyword' };
  }

  // Rule 3: Filter keywords (allowlist) → hide if no match
  if (filterKeywords.length > 0 && !containsAny(combinedText, filterKeywords)) {
    return { visible: false, reason: 'no_filter_match' };
  }

  // Default: show
  return { visible: true, reason: 'passed' };
}

/**
 * Checks if a string looks like a YouTube Shorts indicator.
 * @param {string} text
 * @returns {boolean}
 */
export function isShortsDuration(text) {
  // Shorts are typically < 60 seconds, formatted as "0:XX"
  return /^0:\d{2}$/.test((text || '').trim());
}

/**
 * Debounce utility to prevent excessive filter runs on rapid DOM changes.
 * @param {Function} fn
 * @param {number} delay – milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
