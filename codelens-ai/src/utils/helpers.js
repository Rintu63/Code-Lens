/* ============================================================
   utils/helpers.js — Shared DOM and string utilities
   ============================================================ */

/**
 * Shorthand for document.getElementById
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Escape HTML special characters to prevent XSS in innerHTML
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Capitalise the first letter of a string
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Map issue type to CSS class prefix
 * @param {string} type  — 'bug' | 'security' | 'performance' | 'smell'
 * @returns {string}
 */
function typeToCssClass(type) {
  return 't-' + type;
}

/**
 * Map issue type to badge CSS class
 * @param {string} type
 * @returns {string}
 */
function typeToBadgeClass(type) {
  return 'b-' + type;
}

/**
 * Map issue type to filter button CSS class
 * @param {string} type  — 'all' | 'bug' | 'security' | 'performance' | 'smell'
 * @returns {string}
 */
function typeToFilterClass(type) {
  const map = {
    all        : 'f-all',
    bug        : 'f-bug',
    security   : 'f-sec',
    performance: 'f-perf',
    smell      : 'f-smell',
  };
  return map[type] || 'f-all';
}

/**
 * Map issue severity to dot CSS class
 * @param {string} sev  — 'critical' | 'high' | 'medium' | 'low'
 * @returns {string}
 */
function sevToDotClass(sev) {
  return 'sev-' + sev;
}

/**
 * Compute issue counts by type from the global ISSUES array
 * @returns {{ bug: number, security: number, performance: number, smell: number }}
 */
function countByType() {
  return (window.ISSUES || []).reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, { bug: 0, security: 0, performance: 0, smell: 0 });
}

/**
 * Compute the overall health score (0-100) based on detected issues.
 * Weights: critical bug/security = -12, high = -8, medium = -4, low = -2
 * @returns {number}
 */
function computeHealthScore() {
  const weights = { critical: 12, high: 8, medium: 4, low: 2 };
  const deduction = (window.ISSUES || []).reduce((sum, i) => sum + (weights[i.sev] || 0), 0);
  return Math.max(0, Math.min(100, 100 - deduction));
}

/**
 * Map score to letter grade and colours
 * @param {number} score
 * @returns {{ grade: string, color: string, bg: string }}
 */
function scoreToGrade(score) {
  if (score >= 90) return { grade: 'A', color: 'var(--ok-text)',   bg: 'var(--ok-bg)'   };
  if (score >= 75) return { grade: 'B', color: 'var(--perf-text)', bg: 'var(--perf-bg)' };
  if (score >= 55) return { grade: 'C', color: 'var(--bug-text)',  bg: 'var(--bug-bg)'  };
  if (score >= 35) return { grade: 'D', color: 'var(--sec-text)',  bg: 'var(--sec-bg)'  };
  return               { grade: 'F', color: 'var(--bug-text)',  bg: 'var(--bug-bg)'  };
}
