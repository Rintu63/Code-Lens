/* ============================================================
   components/VelocityPanel.js
   Review Velocity Dashboard — weekly throughput SVG bar chart,
   KPI strip, cycle-time trend, and per-reviewer response stats.
   Reads from window.VELOCITY_WEEKS, window.VELOCITY_KPI,
   and window.VELOCITY_REVIEWER_STATS.
   ============================================================ */

/**
 * Render the velocity dashboard into #velocity-root.
 */
function renderVelocityPanel() {
  const root = document.getElementById('velocity-root');
  if (!root) return;

  const weeks    = window.VELOCITY_WEEKS          || [];
  const kpi      = window.VELOCITY_KPI            || {};
  const reviewers= window.VELOCITY_REVIEWER_STATS || [];

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">Review Velocity Dashboard</div>
        <div class="p3-sub">Last 8 weeks &middot; throughput, cycle time, and reviewer responsiveness</div>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="velocity-kpi-row">
      ${buildVelKPI('Avg cycle time',     kpi.avgCycleTime,    'var(--perf)'  )}
      ${buildVelKPI('Merge rate',         kpi.mergeRate,       'var(--ok)'    )}
      ${buildVelKPI('AI block rate',      kpi.aiBlockRate,     'var(--bug)'   )}
      ${buildVelKPI('First review',       kpi.firstReviewTime, 'var(--smell)' )}
      ${buildVelKPI('Reopen rate',        kpi.reopenRate,      'var(--sec)'   )}
      ${buildVelKPI('Throughput WoW',     kpi.throughputWoW,   'var(--ok)'    )}
    </div>

    <!-- Throughput bar chart -->
    <div class="velocity-chart-wrap">
      <div class="velocity-chart-title">Weekly PR throughput (merged vs opened)</div>
      ${buildThroughputChart(weeks)}
    </div>

    <!-- Cycle time trend -->
    <div class="velocity-chart-wrap">
      <div class="velocity-chart-title">Avg cycle time (hours) — lower is better</div>
      ${buildCycleTimeChart(weeks)}
    </div>

    <!-- Reviewer stats -->
    <div class="issues-title" style="margin-bottom:.75rem">Reviewer response times</div>
    <div class="reviewer-velocity-list">
      ${reviewers.map(r => buildReviewerVelRow(r)).join('')}
    </div>
  `;
}

/* ── KPI card ── */
function buildVelKPI(label, val, color) {
  return `
    <div class="velocity-kpi-card">
      <div class="vel-kpi-val" style="color:${color}">${val ?? '—'}</div>
      <div class="vel-kpi-lbl">${label}</div>
    </div>`;
}

/* ── SVG grouped bar chart (merged vs opened) ── */
function buildThroughputChart(weeks) {
  if (!weeks.length) return '';
  const W = 580, H = 140, PAD = { t:12, r:16, b:36, l:32 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...weeks.flatMap(w => [w.prsOpened, w.prsMerged]));
  const groupW = innerW / weeks.length;
  const barW   = (groupW - 6) / 3;

  const bars = weeks.map((w, i) => {
    const x   = PAD.l + i * groupW + 3;
    const openH  = (w.prsOpened  / maxVal) * innerH;
    const mergeH = (w.prsMerged  / maxVal) * innerH;
    const blockH = (w.blockedByAI/ maxVal) * innerH;
    const baseY  = PAD.t + innerH;
    return `
      <rect x="${x}"          y="${baseY - openH}"  width="${barW}" height="${openH}"  fill="var(--smell-dark)" opacity=".7" rx="2"/>
      <rect x="${x + barW + 2}" y="${baseY - mergeH}" width="${barW}" height="${mergeH}" fill="var(--ok)"          opacity=".85" rx="2"/>
      <rect x="${x + (barW+2)*2}" y="${baseY - blockH}" width="${barW}" height="${blockH}" fill="var(--bug)"      opacity=".75" rx="2"/>
      <text x="${x + groupW/2 - 3}" y="${H - 4}" text-anchor="middle"
            style="font-family:var(--font-mono);font-size:9px;fill:var(--text-hint)">${w.week.replace(' ','&#10;')}</text>`;
  }).join('');

  // Y axis labels
  const yLabels = [0, Math.round(maxVal/2), maxVal].map(v => {
    const y = PAD.t + innerH - (v / maxVal) * innerH;
    return `<text x="${PAD.l - 4}" y="${y + 3}" text-anchor="end" style="font-size:9px;font-family:var(--font-mono);fill:var(--text-hint)">${v}</text>
            <line x1="${PAD.l}" y1="${y}" x2="${W - PAD.r}" y2="${y}" stroke="var(--border)" stroke-width=".5" stroke-dasharray="3,3"/>`;
  }).join('');

  const legend = `
    <div style="display:flex;gap:14px;margin-top:.5rem;font-size:11px;color:var(--text-muted)">
      <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:2px;background:var(--smell-dark);opacity:.7"></div>Opened</div>
      <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:2px;background:var(--ok);opacity:.85"></div>Merged</div>
      <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:2px;background:var(--bug);opacity:.75"></div>Blocked by AI</div>
    </div>`;

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;overflow:visible">
      ${yLabels}${bars}
    </svg>
    ${legend}`;
}

/* ── SVG line chart for cycle time ── */
function buildCycleTimeChart(weeks) {
  if (!weeks.length) return '';
  const W = 580, H = 100, PAD = { t:12, r:16, b:28, l:36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxH   = Math.max(...weeks.map(w => w.avgCycleHrs)) + 4;
  const minH   = Math.max(0, Math.min(...weeks.map(w => w.avgCycleHrs)) - 4);

  const xS = i => PAD.l + (i / (weeks.length - 1)) * innerW;
  const yS = v => PAD.t + innerH - ((v - minH) / (maxH - minH)) * innerH;

  const pts    = weeks.map((w,i) => `${xS(i).toFixed(1)},${yS(w.avgCycleHrs).toFixed(1)}`).join(' ');
  const firstX = xS(0), lastX = xS(weeks.length - 1);
  const areaPath = `M${firstX},${yS(weeks[0].avgCycleHrs)} ${weeks.slice(1).map((w,i)=>`L${xS(i+1).toFixed(1)},${yS(w.avgCycleHrs).toFixed(1)}`).join(' ')} L${lastX},${PAD.t+innerH} L${firstX},${PAD.t+innerH}Z`;

  const labels = weeks.map((w,i) => `
    <circle cx="${xS(i).toFixed(1)}" cy="${yS(w.avgCycleHrs).toFixed(1)}" r="3" fill="var(--perf)" stroke="var(--bg)" stroke-width="1.5"/>
    <text x="${xS(i).toFixed(1)}" y="${H-2}" text-anchor="middle" style="font-size:9px;font-family:var(--font-mono);fill:var(--text-hint)">${w.week.split(' ')[0]}</text>`).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;overflow:visible">
      <defs>
        <linearGradient id="cycle-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="var(--perf)" stop-opacity=".2"/>
          <stop offset="100%" stop-color="var(--perf)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#cycle-grad)"/>
      <polyline points="${pts}" fill="none" stroke="var(--perf)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${labels}
    </svg>`;
}

/* ── Reviewer velocity row ── */
function buildReviewerVelRow(r) {
  const responseColor = r.avgResponseHrs <= 2   ? 'var(--ok)'
                      : r.avgResponseHrs <= 6   ? 'var(--perf)'
                      : 'var(--bug)';
  return `
    <div class="reviewer-vel-row">
      <div class="vel-reviewer-avatar" style="background:${r.color}">${r.avatar}</div>
      <div>
        <div class="vel-reviewer-name">${r.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${r.reviewsThisWeek} reviews this week</div>
      </div>
      <span class="vel-stat-pill" style="color:${responseColor};border-color:${responseColor}20">⏱ ${r.avgResponseHrs}h avg</span>
      <span class="vel-stat-pill">✓ ${r.approvalRate}% approval</span>
      <span class="vel-stat-pill">${r.reviewsThisWeek} reviews</span>
    </div>`;
}