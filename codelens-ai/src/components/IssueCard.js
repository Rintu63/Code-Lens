/* ============================================================
   components/IssueCard.js — Renders a single issue card
   Called by IssueList.js for each filtered issue entry.
   ============================================================ */

/**
 * Build the HTML string for one issue card.
 * @param {Object} issue — entry from window.ISSUES
 * @returns {string} HTML string
 */
function buildIssueCard(issue) {
  const codeLines = issue.code.map(l => `
    <div class="code-line${l.hl ? ' line-hl' : ''}">
      <span class="line-num">${l.n}</span>
      <span class="line-code">${escapeHtml(l.t)}</span>
    </div>
  `).join('');

  const badgeLabel = issue.type === 'smell'
    ? 'CODE SMELL'
    : issue.type.toUpperCase();

  const fixText = String(issue.fix || 'No suggested fix available.');

  return `
    <article
      class="issue-card ${typeToCssClass(issue.type)}"
      role="article"
      aria-label="${escapeHtml(issue.title)}"
      onclick="handleIssueFix(${JSON.stringify(fixText)})"
    >
      <!-- Top row: severity dot + badge + title -->
      <div class="issue-top">
        <div class="sev-dot ${sevToDotClass(issue.sev)}" aria-label="Severity: ${issue.sev}" title="${capitalize(issue.sev)}"></div>
        <span class="issue-badge ${typeToBadgeClass(issue.type)}">${badgeLabel}</span>
        <div class="issue-title">${escapeHtml(issue.title)}</div>
      </div>

      <!-- Description -->
      <p class="issue-desc">${escapeHtml(issue.desc)}</p>

      <!-- Code snippet -->
      <div class="code-snippet" aria-label="Code at ${escapeHtml(issue.file)} line ${issue.line}">
        ${codeLines}
      </div>

      <!-- Footer: file location + fix button -->
      <div class="issue-footer">
        <div class="issue-file">
          <i class="ti ti-file-code" aria-hidden="true" style="font-size:13px"></i>
          ${escapeHtml(issue.file)}:${issue.line}
        </div>
        <button
          class="fix-btn"
          aria-label="Suggest fix for ${escapeHtml(issue.title)}"
          onclick="event.stopPropagation(); handleIssueFix(${JSON.stringify(fixText)})"
        >
          <i class="ti ti-wand" aria-hidden="true"></i> Suggest fix ↗
        </button>
      </div>
    </article>
  `;
}

/**
 * Called when a card or its fix button is clicked.
 * Sends a prompt to the parent Claude conversation when available,
 * otherwise falls back to a toast with the suggested fix.
 * @param {string} hint — full fix suggestion
 */
function handleIssueFix(hint) {
  if (typeof sendPrompt === 'function') {
    sendPrompt(`Explain this code issue and show me the full corrected implementation: ${hint}`);
    return;
  }

  showToast({
    type: 'ok',
    title: 'Suggested fix',
    desc: String(hint || 'No suggestion available.'),
    ms: 6500,
  });
}
