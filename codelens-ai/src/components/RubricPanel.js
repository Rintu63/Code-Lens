/* ============================================================
   components/RubricPanel.js
   PR Scoring Rubric — weighted multi-dimension score card
   with collapsible per-criterion breakdown and overall verdict.
   Reads from window.RUBRIC_DIMENSIONS + window.RUBRIC_SUMMARY.
   ============================================================ */

/**
 * Render the rubric panel into #rubric-root.
 */
function renderRubricPanel() {
  const root = document.getElementById('rubric-root');
  if (!root) return;

  const dims = window.RUBRIC_DIMENSIONS || [];
  const sum  = window.RUBRIC_SUMMARY    || {};

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">PR Review Scoring Rubric</div>
        <div class="p3-sub">Weighted quality score across ${dims.length} dimensions · click any card to expand criteria</div>
      </div>
      <button class="btn-new-rule" onclick="exportRubricReport()" style="background:var(--perf-bg);color:var(--perf-text);border:0.5px solid var(--perf)">
        <i class="ti ti-download" aria-hidden="true"></i> Export rubric
      </button>
    </div>

    <!-- Summary band -->
    <div class="rubric-summary-band">
      <div class="rubric-big-score" style="color:${sum.verdictColor}">${sum.totalScore}</div>
      <div style="font-size:20px;color:var(--text-muted);font-weight:300;align-self:flex-end;padding-bottom:4px">/ ${sum.maxTotal}</div>
      <div class="rubric-grade-box" style="background:${sum.verdictColor}22;color:${sum.verdictColor}">${sum.grade}</div>
      <div style="flex:1">
        <div class="rubric-verdict" style="color:${sum.verdictColor}">${sum.verdict}</div>
        <div class="rubric-comment">${escapeHtml(sum.comment)}</div>
      </div>
      ${buildRadarStrip(dims)}
    </div>

    <!-- Dimension cards grid -->
    <div class="rubric-grid" role="list">
      ${dims.map(d => buildRubricDimCard(d)).join('')}
    </div>

    <!-- Weight breakdown bar -->
    <div style="background:var(--bg-2);border:0.5px solid var(--border);border-radius:var(--rad-lg);padding:1rem 1.25rem">
      <div class="issues-title" style="margin-bottom:.75rem">Score breakdown by weight</div>
      ${dims.map(d => {
        const earned = Math.round((d.score / d.maxScore) * d.weight);
        const pct    = Math.round((earned / d.weight) * 100);
        return `
          <div class="chart-bar-row" style="margin-bottom:10px">
            <div class="bar-label" style="width:130px;text-align:right;font-size:12px">${d.label}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%;background:${d.color}"></div>
            </div>
            <div class="bar-count" style="color:${d.color}">${earned}/${d.weight}</div>
          </div>`;
      }).join('')}
    </div>
  `;
}

/* ── Mini radar-style strip (horizontal pills) ── */
function buildRadarStrip(dims) {
  return `
    <div style="display:flex;flex-direction:column;gap:4px;min-width:160px">
      ${dims.map(d => {
        const pct = Math.round((d.score / d.maxScore) * 100);
        return `
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;color:var(--text-muted);width:100px;text-align:right">${d.label}</span>
            <div style="flex:1;height:5px;background:var(--bg-3);border-radius:3px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:${d.color};border-radius:3px;transition:width .7s"></div>
            </div>
            <span style="font-size:10px;font-weight:700;color:${d.color};width:28px">${pct}%</span>
          </div>`;
      }).join('')}
    </div>`;
}

/* ── Single dimension card ── */
function buildRubricDimCard(dim) {
  const pct = Math.round((dim.score / dim.maxScore) * 100);
  const criteriaHtml = dim.criteria.map(c => buildCriterionRow(c)).join('');

  return `
    <div class="rubric-dim-card" role="listitem" id="rdc-${dim.id}">
      <!-- Progress bar at top -->
      <div class="rubric-progress-wrap">
        <div class="rubric-progress-fill" style="width:${pct}%;background:${dim.color}"></div>
      </div>

      <!-- Clickable header -->
      <div class="rubric-dim-header" onclick="toggleRubricDim('${dim.id}')"
           aria-expanded="false" aria-controls="rdb-${dim.id}">
        <div class="rubric-dim-icon" style="background:${dim.color}22">
          <i class="ti ${dim.icon}" style="color:${dim.color}" aria-hidden="true"></i>
        </div>
        <div style="flex:1">
          <div class="rubric-dim-name">${dim.label}</div>
          <div style="font-size:10px;color:var(--text-muted)">${dim.description.substring(0,48)}…</div>
        </div>
        <div style="text-align:right">
          <div class="rubric-dim-score" style="color:${dim.color}">${dim.score}</div>
          <div class="rubric-dim-max">/ ${dim.maxScore}</div>
        </div>
        <span class="rubric-dim-weight">${dim.weight}%</span>
        <i class="ti ti-chevron-down" id="rdc-chev-${dim.id}"
           style="color:var(--text-hint);font-size:13px;transition:transform .2s" aria-hidden="true"></i>
      </div>

      <!-- Collapsible criteria body -->
      <div class="rubric-criteria-body" id="rdb-${dim.id}" role="list">
        ${criteriaHtml}
      </div>
    </div>`;
}

/* ── Single criterion row ── */
function buildCriterionRow(c) {
  const iconMap = {
    pass   : { icon:'ti-circle-check', color:'var(--ok)'  },
    partial: { icon:'ti-circle-half',  color:'var(--perf)'},
    fail   : { icon:'ti-circle-x',    color:'var(--bug)' },
  };
  const style = iconMap[c.status] || iconMap.fail;

  return `
    <div class="rubric-criterion" role="listitem">
      <i class="ti ${style.icon} crit-status-icon" style="color:${style.color}" aria-hidden="true"></i>
      <div style="flex:1">
        <div class="crit-label">${escapeHtml(c.label)}</div>
        ${c.note ? `<div class="crit-note">${escapeHtml(c.note)}</div>` : ''}
      </div>
      <div class="crit-score" style="color:${style.color}">${c.score}/${c.max}</div>
    </div>`;
}

/* ── Toggle expand/collapse ── */
function toggleRubricDim(id) {
  const body   = document.getElementById(`rdb-${id}`);
  const chev   = document.getElementById(`rdc-chev-${id}`);
  const header = body?.previousElementSibling;
  if (!body) return;
  const isOpen = body.classList.toggle('open');
  if (chev)   chev.style.transform  = isOpen ? 'rotate(180deg)' : '';
  if (header) header.setAttribute('aria-expanded', String(isOpen));
}

/* ── Export rubric as markdown ── */
function exportRubricReport() {
  const dims = window.RUBRIC_DIMENSIONS || [];
  const sum  = window.RUBRIC_SUMMARY    || {};
  let md = `# PR #142 Scoring Rubric\n\n`;
  md += `**Total:** ${sum.totalScore}/${sum.maxTotal} · Grade **${sum.grade}** · ${sum.verdict}\n\n`;
  md += `> ${sum.comment}\n\n`;
  dims.forEach(d => {
    md += `## ${d.label} — ${d.score}/${d.maxScore} (weight: ${d.weight}%)\n`;
    d.criteria.forEach(c => {
      const icon = c.status === 'pass' ? '✅' : c.status === 'partial' ? '⚠️' : '❌';
      md += `- ${icon} **${c.label}** (${c.score}/${c.max})${c.note ? ` — ${c.note}` : ''}\n`;
    });
    md += '\n';
  });
  downloadFile('rubric-pr142.md', md, 'text/markdown');
  showToast({ type:'ok', title:'Rubric exported', desc:'rubric-pr142.md downloaded.' });
}