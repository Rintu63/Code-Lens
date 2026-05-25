/* ============================================================
   components/HeatmapPanel.js — Code Complexity Heatmap
   Reads from window.COMPLEXITY_FILES + window.COMPLEXITY_THRESHOLDS
   ============================================================ */

let _heatmapSelected = null;

function renderHeatmapPanel() {
  const root = document.getElementById('heatmap-root');
  if (!root) return;
  const files = window.COMPLEXITY_FILES || [];
  const thresh = window.COMPLEXITY_THRESHOLDS || {};
  const avgC = Math.round(files.reduce((s,f)=>s+f.complexity,0)/files.length);
  const hotspots = files.filter(f=>f.hotspot).length;
  const totalLoc = files.reduce((s,f)=>s+f.loc,0);

  root.innerHTML = `
    <div class="p3-header">
      <div>
        <div class="p3-title">Code Complexity Heatmap</div>
        <div class="p3-sub">${files.length} files &middot; avg complexity ${avgC} &middot; ${hotspots} hotspots &middot; ${totalLoc} LOC</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="filter-btn f-all" onclick="sortHeatmap('complexity',this)" id="hm-sort-complexity">Complexity</button>
        <button class="filter-btn"       onclick="sortHeatmap('loc',this)"        id="hm-sort-loc">LOC</button>
        <button class="filter-btn"       onclick="sortHeatmap('duplication',this)"id="hm-sort-dup">Duplication</button>
      </div>
    </div>
    <div class="hm-legend">
      ${Object.entries(thresh).map(([,t])=>`<div class="hm-legend-item"><div class="hm-legend-dot" style="background:${t.color}"></div>${t.label}</div>`).join('')}
      <div class="hm-legend-item" style="margin-left:auto"><div class="hm-legend-dot" style="background:var(--smell-dark)"></div>Modified in PR</div>
    </div>
    <div id="hm-detail-container"></div>
    <div class="heatmap-grid" id="heatmap-grid">${files.map(f=>buildHeatmapCell(f)).join('')}</div>
    <div style="margin-top:1.25rem">
      <div class="issues-title" style="margin-bottom:.75rem">Complexity by file</div>
      ${files.map(f=>buildComplexityBar(f)).join('')}
    </div>`;
}

function getTier(complexity) {
  const thresh = window.COMPLEXITY_THRESHOLDS || {};
  return Object.entries(thresh).find(([,t])=>complexity<=t.max)?.[1] || thresh.critical;
}

function buildHeatmapCell(file) {
  const tier = getTier(file.complexity);
  const short = file.path.split('/').pop();
  const isSelected = _heatmapSelected === file.path;
  return `
    <div class="heatmap-cell"
         style="background:${tier.bg};border-color:${isSelected?tier.color:'var(--border)'};border-width:${isSelected?'2px':'0.5px'}"
         onclick="selectHeatmapCell('${escapeHtml(file.path)}')"
         role="button" tabindex="0"
         aria-label="${short}, complexity ${file.complexity}">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${tier.color};border-radius:var(--rad-lg) var(--rad-lg) 0 0"></div>
      ${file.changed?'<span class="hm-badge-changed">CHANGED</span>':''}
      ${file.hotspot?`<span style="position:absolute;top:10px;right:${file.changed?70:10}px;font-size:10px">🔥</span>`:''}
      <div class="hm-file" title="${file.path}">${file.path}</div>
      <div class="hm-score" style="color:${tier.color}">${file.complexity}</div>
      <div class="hm-label" style="color:${tier.color}">${tier.label} complexity</div>
      <div class="hm-meta">
        <span class="hm-tag">${file.loc} LOC</span>
        <span class="hm-tag">${file.functions} fns</span>
        <span class="hm-tag">${file.duplication}% dup</span>
      </div>
    </div>`;
}

function buildComplexityBar(file) {
  const tier = getTier(file.complexity);
  const maxC = Math.max(...(window.COMPLEXITY_FILES||[]).map(f=>f.complexity));
  const pct = Math.round((file.complexity/maxC)*100);
  const short = file.path.split('/').pop();
  return `
    <div class="chart-bar-row" style="margin-bottom:8px">
      <div class="bar-label" style="width:160px;text-align:right;font-family:var(--font-mono);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${file.path}">${escapeHtml(short)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${tier.color}"></div></div>
      <div class="bar-count" style="color:${tier.color}">${file.complexity}</div>
    </div>`;
}

function selectHeatmapCell(filePath) {
  if (_heatmapSelected === filePath) {
    _heatmapSelected = null;
    renderHeatmapPanel();
    return;
  }
  _heatmapSelected = filePath;
  const file = (window.COMPLEXITY_FILES||[]).find(f=>f.path===filePath);
  if (!file) return;
  const tier = getTier(file.complexity);
  const maxFnC = Math.max(...file.functions_detail.map(f=>f.complexity));
  const fnRows = file.functions_detail.map(fn=>{
    const fnTier = getTier(fn.complexity);
    const barPct = Math.round((fn.complexity/maxFnC)*100);
    return `<tr>
      <td style="font-family:var(--font-mono);font-size:12px">${escapeHtml(fn.name)}()</td>
      <td><div style="display:flex;align-items:center;gap:6px"><div class="fn-bar-wrap"><div class="fn-bar" style="width:${barPct}%;background:${fnTier.color}"></div></div><span style="font-size:12px;font-weight:700;color:${fnTier.color}">${fn.complexity}</span></div></td>
      <td style="font-size:12px;color:var(--text-muted)">${fn.loc} LOC</td>
      <td style="font-size:12px">${fn.issues>0?`<span style="color:var(--bug);font-weight:700">⚑ ${fn.issues}</span>`:'<span style="color:var(--ok)">✓</span>'}</td>
    </tr>`;
  }).join('');

  renderHeatmapPanel();
  const container = document.getElementById('hm-detail-container');
  if (!container) return;
  container.innerHTML = `
    <div class="hm-detail">
      <div class="hm-detail-title">
        <i class="ti ti-file-code" style="color:${tier.color}" aria-hidden="true"></i>
        <span style="font-family:var(--font-mono);font-size:13px">${escapeHtml(file.path)}</span>
        <button onclick="_heatmapSelected=null;renderHeatmapPanel()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-hint);font-size:18px">&times;</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:1rem">
        ${[['LOC',file.loc,'var(--text)'],['Functions',file.functions,'var(--smell)'],['Max nesting',file.maxNesting,'var(--perf)'],['Duplication',file.duplication+'%','var(--bug)']].map(([l,v,c])=>`
          <div style="background:var(--bg);border:0.5px solid var(--border);border-radius:var(--rad);padding:.5rem .75rem;text-align:center">
            <div style="font-size:18px;font-weight:800;color:${c}">${v}</div>
            <div style="font-size:10px;color:var(--text-muted)">${l}</div>
          </div>`).join('')}
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:.5rem;letter-spacing:.3px">FUNCTION BREAKDOWN</div>
      <table class="fn-table">
        <thead><tr><th>Function</th><th>Complexity</th><th>LOC</th><th>Issues</th></tr></thead>
        <tbody>${fnRows}</tbody>
      </table>
    </div>`;
}

function sortHeatmap(key, btn) {
  document.querySelectorAll('[id^="hm-sort-"]').forEach(b=>b.className='filter-btn');
  if(btn) btn.className='filter-btn f-all';
  (window.COMPLEXITY_FILES||[]).sort((a,b)=>b[key]-a[key]);
  const grid = document.getElementById('heatmap-grid');
  if(grid) grid.innerHTML = (window.COMPLEXITY_FILES||[]).map(f=>buildHeatmapCell(f)).join('');
}
