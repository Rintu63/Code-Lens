/* ============================================================
   components/ComparePanel.js
   PR Comparison Engine — renders a sortable comparison table
   of historical PRs plus an SVG sparkline score trend chart.
   Reads from window.PR_HISTORY and window.SCORE_TREND.
   ============================================================ */

let _compareSortKey = 'id';
let _compareSortDir = 'desc';

/**
 * Render the full comparison panel into #compare-root.
 */
function renderComparePanel() {
  const root = document.getElementById('compare-root');
  if (!root) return;

  root.innerHTML = `
    <!-- Section header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">PR Comparison Engine</div>
        <div class="p3-sub">Compare quality metrics across recent pull requests</div>
      </div>
      <div style="display:flex;gap:6px">
        ${buildSortBtn('score','Score')}
        ${buildSortBtn('id','PR #')}
        ${buildSortBtn('filesChanged','Files')}
      </div>
    </div>

    <!-- Sparkline trend -->
    ${buildSparkline()}

    <!-- Comparison table -->
    <div class="compare-table-wrap">
      <table class="compare-table" aria-label="PR comparison table">
        <thead>
          <tr>
            <th>PR</th>
            <th>Author</th>
            <th>Title</th>
            <th>Score</th>
            <th>Bugs</th>
            <th>Security</th>
            <th>Perf</th>
            <th>Files</th>
            <th>+/−</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody id="compare-tbody">
          ${buildCompareRows()}
        </tbody>
      </table>
    </div>

    <!-- Delta callout for current PR -->
    ${buildDeltaCallout()}
  `;
}

/* ── Sort button ── */
function buildSortBtn(key, label) {
  const isActive = _compareSortKey === key;
  return `
    <button
      class="filter-btn${isActive ? ' f-all' : ''}"
      onclick="sortCompare('${key}')"
      aria-pressed="${isActive}"
    >${label} ${isActive ? (_compareSortDir === 'asc' ? '↑' : '↓') : ''}</button>
  `;
}

/* ── Sort handler ── */
function sortCompare(key) {
  if (_compareSortKey === key) {
    _compareSortDir = _compareSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _compareSortKey = key;
    _compareSortDir = 'desc';
  }
  renderComparePanel();
}

/* ── Build sorted table rows ── */
function buildCompareRows() {
  const data = [...(window.PR_HISTORY || [])].sort((a, b) => {
    const av = a[_compareSortKey], bv = b[_compareSortKey];
    const mul = _compareSortDir === 'asc' ? 1 : -1;
    return (av > bv ? 1 : av < bv ? -1 : 0) * mul;
  });

  const AVATAR_COLORS = {
    'alex.chen'    : '#534AB7',
    'priya.nair'   : '#1D9E75',
    'john.doe'     : '#BA7517',
    'sarah.kim'    : '#E24B4A',
    'bot-renovate' : '#7F77DD',
  };

  return data.map(pr => {
    const initials = pr.author === 'bot-renovate' ? '🤖'
      : pr.author.split('.').map(p => p[0].toUpperCase()).join('');
    const color    = AVATAR_COLORS[pr.author] || '#888';
    const gradeClass = pr.score >= 90 ? 'sp-a' : pr.score >= 75 ? 'sp-b' : 'sp-c';
    const duration = pr.agentMs < 1000
      ? pr.agentMs + 'ms'
      : (pr.agentMs / 1000).toFixed(1) + 's';
    const isCurrent = pr.isCurrent;

    return `
      <tr class="${isCurrent ? 'current-pr' : ''}" aria-label="PR #${pr.id}${isCurrent ? ' (current)' : ''}">
        <td>
          <strong>#${pr.id}</strong>
          ${isCurrent ? '<span class="current-badge">NOW</span>' : ''}
        </td>
        <td>
          <div class="pr-author-chip">
            <div class="pr-avatar" style="background:${color}">${initials}</div>
            <span style="font-size:12px;color:var(--text-muted)">${pr.author.split('.')[0]}</span>
          </div>
        </td>
        <td>
          <div class="pr-title-cell" title="${escapeHtml(pr.title)}">${escapeHtml(pr.title)}</div>
        </td>
        <td><span class="score-pill ${gradeClass}">${pr.score}</span></td>
        <td style="color:${pr.issues.bug     > 0 ? 'var(--bug)'  : 'var(--text-muted)'}; font-weight:${pr.issues.bug     > 0 ? 700 : 400}">${pr.issues.bug}</td>
        <td style="color:${pr.issues.security> 0 ? 'var(--sec)'  : 'var(--text-muted)'}; font-weight:${pr.issues.security> 0 ? 700 : 400}">${pr.issues.security}</td>
        <td style="color:${pr.issues.performance>0?'var(--perf)':'var(--text-muted)'}; font-weight:${pr.issues.performance>0?700:400}">${pr.issues.performance}</td>
        <td style="color:var(--text-muted)">${pr.filesChanged}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">
          <span style="color:var(--ok)">+${pr.additions}</span>
          <span style="color:var(--bug)"> −${pr.deletions}</span>
        </td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-hint)">${duration}</td>
      </tr>
    `;
  }).join('');
}

/* ── SVG Sparkline ── */
function buildSparkline() {
  const data   = window.SCORE_TREND || [];
  if (!data.length) return '';

  const W = 560, H = 90, PAD = { t:16, r:20, b:28, l:36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const minScore = Math.min(...data.map(d => d.score)) - 5;
  const maxScore = Math.max(...data.map(d => d.score)) + 5;

  const xScale = i => PAD.l + (i / (data.length - 1)) * innerW;
  const yScale = v => PAD.t + innerH - ((v - minScore) / (maxScore - minScore)) * innerH;

  const points = data.map((d, i) => `${xScale(i).toFixed(1)},${yScale(d.score).toFixed(1)}`);
  const polyline = points.join(' ');

  // Area path
  const first = data[0], last = data[data.length - 1];
  const areaPath = [
    `M ${xScale(0).toFixed(1)},${yScale(first.score).toFixed(1)}`,
    ...data.slice(1).map((d, i) => `L ${xScale(i + 1).toFixed(1)},${yScale(d.score).toFixed(1)}`),
    `L ${xScale(data.length - 1).toFixed(1)},${(PAD.t + innerH).toFixed(1)}`,
    `L ${xScale(0).toFixed(1)},${(PAD.t + innerH).toFixed(1)}`,
    'Z',
  ].join(' ');

  // Y-axis labels
  const yLabels = [minScore + 5, 80, maxScore - 5].map(v => `
    <text x="${PAD.l - 6}" y="${yScale(v).toFixed(1)}" text-anchor="end"
          style="font-family:var(--font-mono);font-size:10px;fill:var(--text-hint)">${Math.round(v)}</text>
    <line x1="${PAD.l}" y1="${yScale(v).toFixed(1)}" x2="${W - PAD.r}" y2="${yScale(v).toFixed(1)}"
          stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3,3"/>
  `).join('');

  // Dots + PR labels
  const dots = data.map((d, i) => {
    const cx = xScale(i).toFixed(1);
    const cy = yScale(d.score).toFixed(1);
    const isCurrent = d.pr === 142;
    return `
      <circle cx="${cx}" cy="${cy}" r="${isCurrent ? 5 : 3.5}"
              fill="${isCurrent ? 'var(--bug)' : 'var(--smell-dark)'}"
              stroke="var(--bg)" stroke-width="2"/>
      <text x="${cx}" y="${(parseFloat(cy) - 9).toFixed(1)}" text-anchor="middle"
            style="font-family:var(--font-display);font-size:10px;font-weight:700;fill:${isCurrent ? 'var(--bug)' : 'var(--text)'}">
        ${d.score}
      </text>
      <text x="${cx}" y="${(PAD.t + innerH + 14).toFixed(1)}" text-anchor="middle"
            style="font-family:var(--font-mono);font-size:9px;fill:var(--text-hint)">
        #${d.pr}
      </text>
    `;
  }).join('');

  return `
    <div class="sparkline-wrap">
      <div class="sparkline-title">Health score trend — last 8 PRs</div>
      <svg class="sparkline-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
           xmlns="http://www.w3.org/2000/svg" aria-label="Score trend chart">
        <defs>
          <linearGradient id="spark-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="var(--smell-dark)" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="var(--smell-dark)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yLabels}
        <path d="${areaPath}" fill="url(#spark-gradient)"/>
        <polyline points="${polyline}" fill="none"
                  stroke="var(--smell-dark)" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
      </svg>
    </div>
  `;
}

/* ── Delta callout comparing current PR to team avg ── */
function buildDeltaCallout() {
  const history    = (window.PR_HISTORY || []).filter(p => !p.isCurrent);
  const avgScore   = Math.round(history.reduce((s, p) => s + p.score, 0) / history.length);
  const current    = (window.PR_HISTORY || []).find(p => p.isCurrent);
  if (!current) return '';

  const delta      = current.score - avgScore;
  const deltaColor = delta >= 0 ? 'var(--ok)' : 'var(--bug)';
  const deltaSign  = delta >= 0 ? '+' : '';

  return `
    <div style="background:var(--bg-2);border:0.5px solid var(--border);border-radius:var(--rad-lg);
                padding:.9rem 1.1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
      <div style="font-size:13px;flex:1">
        PR #142 scores <strong style="color:${deltaColor}">${deltaSign}${delta} pts</strong>
        vs. team average of <strong>${avgScore}/100</strong>.
        ${delta < 0
          ? `Fix the 2 critical issues to reach the team baseline.`
          : `Great work — above the team baseline!`
        }
      </div>
      <button class="fix-btn" onclick="switchTab('autofix')">
        <i class="ti ti-wand" aria-hidden="true"></i> Go to Auto-Fix
      </button>
    </div>
  `;
}
