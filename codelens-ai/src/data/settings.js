/* ============================================================
   data/settings.js
   Default configuration for the Settings panel.
   All values are read/written by SettingsPanel.js and
   persisted to localStorage under the key 'codelens_settings'.
   ============================================================ */

window.DEFAULT_SETTINGS = {

  /* ── Integration ── */
  provider        : 'github',      // 'github' | 'gitlab' | 'bitbucket'
  autoReview      : true,          // trigger on every PR open/update
  webhookSecret   : '',            // HMAC secret for webhook validation
  baseUrl         : '',            // self-hosted GitLab/Bitbucket base URL

  /* ── Analysis ── */
  agents: {
    bugHunter    : true,
    security     : true,
    performance  : true,
    smells       : true,
    bestPractices: true,
  },

  severity: {
    blockMerge   : ['critical'],   // severities that block merge
    postComment  : ['critical', 'high', 'medium', 'low'],
  },

  /* ── Notifications ── */
  notify: {
    slack        : false,
    slackWebhook : '',
    email        : false,
    emailAddress : '',
    onCritical   : true,
    onComplete   : true,
  },

  /* ── Thresholds ── */
  thresholds: {
    minScore     : 70,             // PR blocked below this score
    maxCritical  : 0,              // max critical issues allowed to merge
    maxHigh      : 2,
  },

  /* ── Display ── */
  theme           : 'system',      // 'system' | 'light' | 'dark'
  compactMode     : false,
  showLineNumbers : true,
};

/**
 * Load settings from localStorage, falling back to defaults.
 * @returns {Object}
 */
window.loadSettings = function () {
  try {
    const raw = localStorage.getItem('codelens_settings');
    if (!raw) return JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS));
    return Object.assign({}, window.DEFAULT_SETTINGS, JSON.parse(raw));
  } catch {
    return JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS));
  }
};

/**
 * Persist settings object to localStorage.
 * @param {Object} settings
 */
window.saveSettings = function (settings) {
  try {
    localStorage.setItem('codelens_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not persist settings:', e);
  }
};
