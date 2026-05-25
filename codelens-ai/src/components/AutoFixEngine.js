/* ============================================================
   components/AutoFixEngine.js
   Auto-Fix Engine panel.
   Shows every available patch with before/after diff preview,
   risk badge, score-gain badge, and Apply / Copy actions.
   ============================================================ */

/** Track applied fix ids in memory */
const _appliedFixes = new Set();

/**
 * Render the Auto-Fix Engine into #autofix-root.
 */
function renderAutoFixEngine() {
  const root = document.getElementById('autofix-root');
  if (!root) return;

  const fixes  = Object.values(window.AUTO_FIXES || {});
  const totalGain = fixes.reduce((s, f) => s + f.scoreGain, 0);
  const currentScore = computeHealthScore();

  root.innerHTML = `
    <!-- Apply-all banner -->
    <div class="apply-all-bar">
      <div class="apply-all-info">
        <strong>${fixes.length} patches available.</strong>
        Applying all safe + low-risk fixes would raise your score from
        <strong>${currentScore}</strong> → <strong>${Math.min(100, currentScore + totalGain)}</strong>
        (+${totalGain} pts).
      </div>
      <button class="btn-apply-all" onclick="applyAllFixes()">
        <i class="ti ti-wand" aria-hidden="true"></i> Apply all safe fixes
      </button>
    </div>

    <div class="fix-engine-subtitle">
      Click a fix to expand the before/after diff. Each patch can be applied (marks as done)
      or copied to clipboard for manual review.
    </div>

    <!-- Fix cards -->
    <div id="fix-cards-list" role="list">
      ${fixes.map(fix => buildFixCard(fix)).join('')}
    </div>
  `;
}

/**
 * Build HTML for one fix card (collapsed by default).
 * @param {Object} fix — entry from window.AUTO_FIXES
 * @returns {string}
 */
function buildFixCard(fix) {
  const riskClass = `risk-${fix.risk}`;
  const riskLabel = fix.risk.charAt(0).toUpperCase() + fix.risk.slice(1);

  const beforeLines = fix.before.map(l =>
    `<div class="diff-mini-line rem"><span style="color:var(--bug);width:12px;flex-shrink:0">−</span><span style="font-family:var(--font-mono);font-size:12px;white-space:pre">${escapeHtml(l)}</span></div>`
  ).join('');

  const afterLines = fix.after.map(l =>
    `<div class="diff-mini-line add"><span style="color:var(--ok);width:12px;flex-shrink:0">+</span><span style="font-family:var(--font-mono);font-size:12px;white-space:pre">${escapeHtml(l)}</span></div>`
  ).join('');

  return `
    <div class="fix-card" id="fix-card-${fix.issueId}" role="listitem">
      <!-- Header (always visible, click to toggle) -->
      <div class="fix-card-header" onclick="toggleFixCard('${fix.issueId}')" aria-expanded="false" aria-controls="fix-body-${fix.issueId}">
        <i class="ti ti-file-diff" aria-hidden="true" style="color:var(--text-muted);font-size:16px"></i>
        <div class="fix-card-title">${escapeHtml(fix.title)}</div>
        <span class="risk-badge ${riskClass}">${riskLabel}</span>
        <span class="score-gain-badge">+${fix.scoreGain} pts</span>
        <i class="ti ti-chevron-down" aria-hidden="true" id="fix-chevron-${fix.issueId}" style="color:var(--text-hint);font-size:14px;transition:transform .2s"></i>
      </div>

      <!-- Body (collapsible) -->
      <div class="fix-card-body" id="fix-body-${fix.issueId}">
        <p class="fix-explanation">${escapeHtml(fix.explanation)}</p>

        <!-- Diff mini -->
        <div class="diff-mini">
          ${beforeLines}
          ${afterLines}
        </div>

        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-hint);margin-bottom:.65rem">
          <i class="ti ti-file-code" aria-hidden="true"></i> ${escapeHtml(fix.file)}
        </div>

        <!-- Actions -->
        <div class="fix-actions">
          <button
            class="btn-apply-fix"
            id="apply-btn-${fix.issueId}"
            onclick="applyFix('${fix.issueId}')"
            aria-label="Apply fix for ${escapeHtml(fix.title)}"
          >
            <i class="ti ti-check" aria-hidden="true"></i> Apply fix
          </button>
          <button
            class="btn-copy-fix"
            onclick="copyFix('${fix.issueId}')"
            aria-label="Copy fixed code to clipboard"
          >
            <i class="ti ti-clipboard" aria-hidden="true"></i> Copy patch
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Toggle a fix card open/closed.
 * @param {string} issueId
 */
function toggleFixCard(issueId) {
  const body     = document.getElementById(`fix-body-${issueId}`);
  const chevron  = document.getElementById(`fix-chevron-${issueId}`);
  const header   = body?.previousElementSibling;
  if (!body) return;

  const isOpen = body.classList.toggle('open');
  if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
  if (header)  header.setAttribute('aria-expanded', String(isOpen));
}

/**
 * Mark a fix as applied.
 * @param {string} issueId
 */
function applyFix(issueId) {
  if (_appliedFixes.has(issueId)) return;
  _appliedFixes.add(issueId);

  const card    = document.getElementById(`fix-card-${issueId}`);
  const applyBtn= document.getElementById(`apply-btn-${issueId}`);
  const fix     = (window.AUTO_FIXES || {})[issueId];

  if (card)     card.classList.add('applied');
  if (applyBtn) {
    applyBtn.classList.add('applied');
    applyBtn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Applied';
    applyBtn.disabled  = true;
  }

  if (fix) {
    showToast({
      type : 'ok',
      title: 'Fix applied!',
      desc : `${fix.title} · +${fix.scoreGain} pts`,
    });
  }
}

/**
 * Copy a fix's after-lines to clipboard.
 * @param {string} issueId
 */
async function copyFix(issueId) {
  const fix = (window.AUTO_FIXES || {})[issueId];
  if (!fix) return;

  const text = fix.after.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    showToast({ type: 'info', title: 'Copied to clipboard', desc: fix.file });
  } catch {
    showToast({ type: 'bug', title: 'Copy failed', desc: 'Check browser permissions.' });
  }
}

/**
 * Apply all safe and low-risk fixes at once.
 */
function applyAllFixes() {
  const fixes = Object.values(window.AUTO_FIXES || {});
  const eligible = fixes.filter(f => f.risk === 'safe' || f.risk === 'low');

  eligible.forEach(f => applyFix(f.issueId));

  showToast({
    type : 'ok',
    title: `${eligible.length} fixes applied`,
    desc : 'All safe and low-risk patches marked as done.',
    ms   : 5000,
  });
}
