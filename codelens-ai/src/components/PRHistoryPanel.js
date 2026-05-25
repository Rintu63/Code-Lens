/* ============================================================
   components/PRHistoryPanel.js  (Part 3)
   PR History Dashboard — sortable table of all past PR reviews
   with health score trend, issue breakdown bars, and status chips.
   ============================================================ */

let _historySortKey  = 'id';
let _historySortDir  = -1;   // -1 = desc

/**
 * Render the PR History panel into #history-root.
 */
function renderPRHistoryPanel() {
  const root = document.getElementById('history-root');
  if (!root) return;

  root.innerHTML = `
    <!-- KPI strip -->
    <div class="pr-meta" style="margin-bottom:1.25rem">
      ${buildHistoryKPIs()}
    </div>

    <!-- Trend sparkline -->
    <div class="p3-section">
      <div class="p3-title">Score trend (last 7 PRs)</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:60px;margin-bottom:.5rem">
        ${buildSparkline()}
      </div>
      <div style="font-size:11px;color:var(--text-hint)">Each bar = one PR · hover for score</div>
    </div>

    <!-- Table -->
    <div class="p3-title">All reviewed PRs</div>
    <div style="overflow-x:auto">
      <table class="history-table" role="grid" aria-label="PR review history">
        <thead>
          <tr>
            ${buildTH('id',        'PR #'        )}
            ${buildTH('title',     'Title'       )}
            ${buildTH('author',    'Author'      )}
            ${buildTH('score',     'Score'       )}
            ${buildTH('bugs',      'Bugs'        )}
            ${buildTH('status',    'Status'      )}
            ${buildTH('reviewMs',  'Review time' )}
          </tr>
        </thead>
        <tbody id="history-tbody">
          ${buildHistoryRows()}
        </tbody>
      </table>
    </div>
  `;
}

/* ── KPI strip ── */
function buildHistoryKPIs() {
  const prs    = window.PR_HISTORY || [];
  const merged = prs.filter(p => p.status === 'merged').length;
  const avgScore = Math.round(prs.reduce((s,p) => s + p.score, 0) / prs.length);
  const totalIssues = prs.reduce((s,p) => s + p.bugs + p.security + p.perf + p.smell, 0);
  const avgTime = Math.round(prs.reduce((s,p) => s + p.reviewMs, 0) / prs.length);

  return [
    { label:'PRs reviewed',   value: prs.length,    cls:'v-smell' },
    { label:'Merged',         value: merged,         cls:'v-ok'    },
    { label:'Avg score',      value: avgScore,       cls:'v-perf'  },
    { label:'Total issues',   value: totalIssues,    cls:'v-bug'   },
    { label:'Avg review time',value: avgTime+'ms',   cls:'v-ok'    },
  ].map(m => `
    <div class="meta-card">
      <div class="meta-label">${m.label}</div>
      <div class="meta-value ${m.cls}" style="font-size:18px">${m.value}</div>
    </div>
  `).join('');
}

/* ── Sparkline bars ── */
function buildSparkline() {
  const prs = (window.PR_HISTORY || []).slice().sort((a,b) => a.id - b.id);
  const max = Math.max(...prs.map(p => p.score), 1);
  return prs.map(p => {
    const h   = Math.max(4, Math.round((p.score / max) * 56));
    const col = p.score >= 80 ? 'var(--ok)' : p.score >= 60 ? 'var(--perf)' : 'var(--bug)';
    return `
      <div title="PR #${p.id} · score ${p.score}" style="
        flex:1; height:${h}px; background:${col}; border-radius:3px 3px 0 0;
        cursor:default; transition:opacity .15s; opacity:.85;
      " onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.85"></div>
    `;
  }).join('');
}

/* ── Sortable column header ── */
function buildTH(key, label) {
  const active = _historySortKey === key;
  const arrow  = active ? (_historySortDir === 1 ? ' ↑' : ' ↓') : '';
  return `
    <th style="cursor:pointer;user-select:none" onclick="sortHistory('${key}')" aria-sort="${active ? (_historySortDir===1?'ascending':'descending') : 'none'}">
      ${label}${arrow}
    </th>
  `;
}

/* ── Table rows ── */
function buildHistoryRows() {
  const prs = (window.PR_HISTORY || []).slice().sort((a,b) => {
    const av = a[_historySortKey], bv = b[_historySortKey];
    if (av === null) return 1;
    if (bv === null) return -1;
    return (av < bv ? -1 : av > bv ? 1 : 0) * _historySortDir;
  });

  return prs.map(p => {
    const statusMap = { merged:'prs-merged', open:'prs-open', reviewing:'prs-reviewing', failed:'prs-failed' };
    const scoreCls  = p.grade === 'A' ? 'sp-A' : p.grade === 'B' ? 'sp-B' : p.grade === 'C' ? 'sp-C' : 'sp-D';
    const issues    = p.bugs + p.security + p.perf + p.smell;

    const miniBar = [
      { v:p.bugs,     col:'var(--bug)'   },
      { v:p.security, col:'var(--sec)'   },
      { v:p.perf,     col:'var(--perf)'  },
      { v:p.smell,    col:'var(--smell)' },
    ].filter(s => s.v > 0).map(s => `
      <div class="hmb-seg" style="width:${Math.max(6, s.v*8)}px;background:${s.col}" title="${s.v} issue(s)"></div>
    `).join('');

    return `
      <tr>
        <td><strong style="font-family:var(--font-mono);font-size:12px">#${p.id}</strong></td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">@${escapeHtml(p.author)}</td>
        <td>
          <span class="score-pill ${scoreCls}">${p.score}</span>
        </td>
        <td>
          ${issues > 0
            ? `<div class="history-mini-bar">${miniBar}</div>`
            : `<span style="color:var(--ok);font-size:12px">✓ Clean</span>`
          }
        </td>
        <td><span class="pr-status-chip ${statusMap[p.status]||'prs-open'}">${capitalize(p.status)}</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${p.reviewMs}ms</td>
      </tr>
    `;
  }).join('');
}

/**
 * Re-sort the history table.
 * @param {string} key
 */
function sortHistory(key) {
  if (_historySortKey === key) _historySortDir *= -1;
  else { _historySortKey = key; _historySortDir = -1; }

  const tbody = document.getElementById('history-tbody');
  if (tbody) tbody.innerHTML = buildHistoryRows();

  // Rebuild headers to reflect new sort state
  renderPRHistoryPanel();
}
