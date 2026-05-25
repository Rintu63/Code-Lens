/* ============================================================
   components/StatsPanel.js — Analytics / Stats panel
   Reads from window.PATTERNS and window.STATS_METRICS
   ============================================================ */

/**
 * Render the full analytics panel into #stats-root.
 */
function renderStatsPanel() {
  const root = document.getElementById('stats-root');
  if (!root) return;

  root.innerHTML = `
    ${buildKpiRow()}
    ${buildBarChart()}
    ${buildTopPatterns()}
  `;

  // Animate bar widths after paint
  requestAnimationFrame(() => {
    document.querySelectorAll('.bar-fill[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  });
}

/* ── KPI summary row ── */
function buildKpiRow() {
  const metrics = window.STATS_METRICS || [];
  return `
    <div class="pr-meta" style="margin-bottom:1.25rem" role="list" aria-label="Key performance indicators">
      ${metrics.map(m => `
        <div class="meta-card" role="listitem">
          <div class="meta-label">${escapeHtml(m.label)}</div>
          <div class="meta-value ${m.cls}" style="font-size:18px">${escapeHtml(m.value)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ── Horizontal bar chart ── */
function buildBarChart() {
  const patterns = window.PATTERNS || [];
  const bars = patterns.map(p => {
    const pct = Math.round((p.count / p.max) * 100);
    return `
      <div class="chart-bar-row">
        <div class="bar-label">${escapeHtml(p.label)}</div>
        <div class="bar-track" role="progressbar" aria-valuenow="${p.count}" aria-valuemax="${p.max}" aria-label="${p.label}">
          <div class="bar-fill" data-width="${pct}" style="width:0%;background:${p.color}"></div>
        </div>
        <div class="bar-count">${p.count}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="chart-section">
      <div class="section-label">Issue distribution (last 30 PRs)</div>
      ${bars}
    </div>
  `;
}

/* ── Top patterns list ── */
function buildTopPatterns() {
  const patterns = (window.PATTERNS || []).slice(0, 4);
  const rows = patterns.map(p => `
    <div class="pattern-row">
      <div class="pattern-dot" style="background:${p.color}" aria-hidden="true"></div>
      <div class="pattern-name">${escapeHtml(p.label)}</div>
      <div class="pattern-count">${p.count} occurrences</div>
    </div>
  `).join('');

  return `
    <div class="chart-section">
      <div class="section-label">Most common patterns</div>
      ${rows}
    </div>
  `;
}
