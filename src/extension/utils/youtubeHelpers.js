/**
 * FilterTube – YouTube DOM Helpers
 * Selectors and helpers for extracting data from YouTube's DOM structure.
 * YouTube uses a mix of custom elements (ytd-*) and standard HTML.
 *
 * NOTE: YouTube frequently updates its DOM – these selectors target
 * stable attributes that rarely change. Update if YouTube redesigns.
 */

// ─── Video Card Selectors ──────────────────────────────────────────────────────

/**
 * All YouTube video renderer selectors that can appear on:
 * - Homepage
 * - Search results
 * - Subscriptions feed
 * - Sidebar recommendations
 */
export const VIDEO_SELECTORS = [
  'ytd-video-renderer',           // Standard video cards (search, home)
  'ytd-rich-item-renderer',       // Home feed grid items
  'ytd-compact-video-renderer',   // Sidebar compact videos
  'ytd-grid-video-renderer',      // Channel page grid
  'ytd-playlist-video-renderer',  // Playlist items
  'ytd-movie-renderer',           // Movie cards
].join(', ');

// ─── Shorts Selectors ──────────────────────────────────────────────────────────

/**
 * Selectors targeting Shorts-specific elements across YouTube pages.
 */
export const SHORTS_SELECTORS = [
  'ytd-reel-shelf-renderer',          // Shorts shelf on homepage
  'ytd-rich-shelf-renderer[is-shorts]', // Rich shelf marked as Shorts
  'ytd-shorts',                        // Dedicated Shorts player
  'ytd-reel-item-renderer',            // Individual Short item
  '[overlay-style="SHORTS"]',          // Shorts badge overlay
  'ytd-guide-entry-renderer a[href="/shorts"]', // Shorts in sidebar nav
  'ytm-shorts-lockup-view-model',      // Mobile/new Shorts card
  'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
].join(', ');

// ─── Focus Mode Selectors ──────────────────────────────────────────────────────

/**
 * Elements to hide when Focus Mode is active.
 */
export const FOCUS_MODE_SELECTORS = [
  '#secondary',                         // Right sidebar (watch page)
  'ytd-watch-next-secondary-results-renderer', // "Up next" sidebar
  '#related',                           // Related videos section
  'ytd-browse[page-subtype="home"] #contents ytd-rich-section-renderer', // Home sections
  'ytd-masthead #end',                  // Top-right header area
  'tp-yt-app-drawer',                   // Navigation drawer
].join(', ');

// ─── Title Extractors ─────────────────────────────────────────────────────────

/**
 * Extracts the video title from a video card element.
 * Tries multiple selector strategies for robustness.
 * @param {Element} el – The video renderer element
 * @returns {string} – Video title or empty string
 */
export function extractTitle(el) {
  // Strategy 1: aria-label on the anchor (most reliable)
  const anchor = el.querySelector('a#video-title, a#thumbnail');
  if (anchor && anchor.getAttribute('aria-label')) {
    return anchor.getAttribute('aria-label');
  }

  // Strategy 2: #video-title span or element
  const titleEl =
    el.querySelector('#video-title') ||
    el.querySelector('yt-formatted-string#video-title') ||
    el.querySelector('h3 a') ||
    el.querySelector('[title]');

  if (titleEl) {
    return titleEl.getAttribute('title') || titleEl.textContent || '';
  }

  return '';
}

/**
 * Extracts the channel name from a video card element.
 * @param {Element} el – The video renderer element
 * @returns {string} – Channel name or empty string
 */
export function extractChannel(el) {
  // Strategy 1: Channel name link
  const channelEl =
    el.querySelector('#channel-name a') ||
    el.querySelector('ytd-channel-name a') ||
    el.querySelector('.ytd-channel-name') ||
    el.querySelector('[id="channel-name"]') ||
    el.querySelector('yt-formatted-string.ytd-channel-name');

  if (channelEl) {
    return channelEl.textContent || channelEl.getAttribute('title') || '';
  }

  // Strategy 2: aria-label on channel element
  const channelName = el.querySelector('#channel-name');
  if (channelName) {
    return channelName.textContent || '';
  }

  return '';
}

/**
 * Checks if a video element is a YouTube Short based on:
 * 1. "SHORTS" badge overlay
 * 2. Short duration (under 60 seconds)
 * 3. URL contains "/shorts/"
 * @param {Element} el
 * @returns {boolean}
 */
export function isShortVideo(el) {
  // Check for Shorts badge
  if (el.querySelector('[overlay-style="SHORTS"]')) return true;
  if (el.querySelector('ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]')) return true;

  // Check for short duration badge (0:XX format)
  const durationEl = el.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
  if (durationEl) {
    const duration = durationEl.textContent.trim();
    if (/^0:\d{2}$/.test(duration)) return true;
  }

  // Check if anchor href contains /shorts/
  const anchor = el.querySelector('a#thumbnail, a[href*="/shorts/"]');
  if (anchor && anchor.href && anchor.href.includes('/shorts/')) return true;

  return false;
}

/**
 * Hides an element using CSS opacity + height animation for smooth removal.
 * @param {Element} el
 */
export function hideElement(el) {
  el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.97)';
  el.style.pointerEvents = 'none';
  setTimeout(() => {
    el.style.display = 'none';
  }, 260);
  el.dataset.filtertube = 'hidden';
}

/**
 * Shows a previously hidden element.
 * @param {Element} el
 */
export function showElement(el) {
  el.style.display = '';
  el.style.opacity = '';
  el.style.transform = '';
  el.style.pointerEvents = '';
  el.dataset.filtertube = 'visible';
}

/**
 * Returns all video elements currently in the DOM.
 * @returns {NodeList}
 */
export function getAllVideoElements() {
  return document.querySelectorAll(VIDEO_SELECTORS);
}

/**
 * Checks if we're on a YouTube watch page (video playing).
 * @returns {boolean}
 */
export function isWatchPage() {
  return window.location.pathname === '/watch';
}

/**
 * Checks if we're on the YouTube homepage.
 * @returns {boolean}
 */
export function isHomePage() {
  return window.location.pathname === '/';
}
