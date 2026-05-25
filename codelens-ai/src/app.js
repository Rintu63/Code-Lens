/* ============================================================
   app.js — Application bootstrap (Parts 1 + 2 + 3 + 4 + 5)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Shell */
  renderHeader();
  renderTabs();
  /* 2. Part 1 */
  renderPRInput();
  const score = computeHealthScore();
  renderScoreCard(score);
  renderMetricsBar();
  renderIssueList('all');
  requestAnimationFrame(() => animateScore(score));
  renderDiffView();
  renderStatsPanel();
  renderAgentsPanel();
  renderTimelinePanel();
  /* 3. Part 2 */
  renderChatPanel();
  renderAutoFixEngine();
  renderSettingsPanel();
  renderWebhookSimulator();
  /* 4. Part 3 */
  renderComparePanel();
  renderLeaderboardPanel();
  renderCICDPanel();
  renderRuleManager();
  /* 5. Part 4 */
  renderHeatmapPanel();
  renderDependencyScanner();
  renderActivityFeed();
  renderTemplatesPanel();
  renderTestGenerator();
  /* 6. Part 5 */
  renderRubricPanel();
  renderOwnershipPanel();
  renderVelocityPanel();
  renderChecklistPanel();
  /* 7. Keyboard shortcuts */
  initKeyboardShortcuts();

  console.info('%cCodeLens AI%c — Parts 1–5 fully mounted ✓',
    'font-weight:700;color:#534AB7','color:inherit');
});
