/* ============================================================
   components/DiffView.js — Annotated diff viewer
   Reads from window.DIFF_FILES (data/diffLines.js)
   ============================================================ */

/**
 * Render all diff file blocks into #diff-root.
 */
function renderDiffView() {
  const root = document.getElementById('diff-root');
  if (!root) return;

  const blocks = (window.DIFF_FILES || []).map(file => buildDiffBlock(file)).join('');
  root.innerHTML = blocks || '<p style="color:var(--text-muted);padding:1rem">No diff data available.</p>';
}

/**
 * Build HTML for a single diff file block.
 * @param {{ header: string, lines: Array }} file
 * @returns {string} HTML
 */
function buildDiffBlock(file) {
  const linesHtml = file.lines.map(l => buildDiffLine(l)).join('');

  return `
    <div class="diff-file-block">
      <div class="diff-header" aria-label="File: ${escapeHtml(file.header)}">
        <i class="ti ti-file-code" aria-hidden="true" style="margin-right:6px"></i>
        ${escapeHtml(file.header)}
      </div>
      <div class="diff-body" role="region" aria-label="Diff content">
        ${linesHtml}
      </div>
    </div>
  `;
}

/**
 * Build HTML for a single diff line or inline comment.
 * @param {{ type: string, sign?: string, text?: string }} line
 * @returns {string}
 */
function buildDiffLine(line) {
  if (line.type === 'comment') {
    return `
      <div class="inline-comment" role="note">
        <i class="ti ti-message-circle" aria-hidden="true"></i>
        <span>${escapeHtml(line.text)}</span>
      </div>
    `;
  }

  const signClass = line.sign === '+' ? 'add'
                  : line.sign === '-' ? 'rem'
                  : 'neu';

  const displaySign = line.sign === '···' ? '···' : line.sign;

  return `
    <div class="diff-line ${line.type || 'neutral'}">
      <span class="diff-sign ${signClass}" aria-hidden="true">${escapeHtml(displaySign || ' ')}</span>
      <span class="diff-text">${escapeHtml(line.text || '')}</span>
    </div>
  `;
}
