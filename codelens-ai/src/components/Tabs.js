/* ============================================================
   components/Tabs.js — Full tab bar (Parts 1 + 2 + 3 + 4 + 5)
   ============================================================ */
const TAB_DEFS = [
  { id:'review',      icon:'ti-git-pull-request', label:'Review',       badge:()=>(window.ISSUES||[]).length },
  { id:'diff',        icon:'ti-git-diff',          label:'Diff',         badge:null },
  { id:'stats',       icon:'ti-chart-bar',          label:'Analytics',    badge:null },
  { id:'agents',      icon:'ti-robot',              label:'Agents',       badge:null },
  { id:'timeline',    icon:'ti-timeline',           label:'Timeline',     badge:null },
  { id:'chat',        icon:'ti-message-circle',     label:'AI Chat',      badge:null, accent:'#534AB7' },
  { id:'autofix',     icon:'ti-wand',               label:'Auto-Fix',     badge:()=>Object.keys(window.AUTO_FIXES||{}).length, accent:'#1D9E75' },
  { id:'webhook',     icon:'ti-webhook',            label:'Webhooks',     badge:null, accent:'#BA7517' },
  { id:'settings',    icon:'ti-settings',           label:'Settings',     badge:null },
  { id:'compare',     icon:'ti-git-compare',        label:'Compare',      badge:null, accent:'#7F77DD' },
  { id:'leaderboard', icon:'ti-trophy',             label:'Leaderboard',  badge:null, accent:'#F4B942' },
  { id:'cicd',        icon:'ti-brand-github',       label:'CI/CD',        badge:null, accent:'#D85A30' },
  { id:'rules',       icon:'ti-list-check',         label:'Rules',        badge:()=>(window.CUSTOM_RULES||[]).filter(r=>r.enabled).length },
  { id:'heatmap',     icon:'ti-temperature',        label:'Heatmap',      badge:null, accent:'#E24B4A' },
  { id:'deps',        icon:'ti-package',            label:'Deps',         badge:()=>(window.VULN_SUMMARY||{}).total, accent:'#D85A30' },
  { id:'activity',    icon:'ti-activity',           label:'Activity',     badge:null, accent:'#1D9E75' },
  { id:'templates',   icon:'ti-template',           label:'Templates',    badge:null, accent:'#7F77DD' },
  { id:'testgen',     icon:'ti-test-pipe',          label:'Test Gen',     badge:null, accent:'#534AB7' },
  { id:'rubric',     icon:'ti-clipboard-check',    label:'Rubric',       badge:null, accent:'#1D9E75' },
  { id:'ownership',  icon:'ti-user-check',          label:'Ownership',    badge:null, accent:'#534AB7' },
  { id:'velocity',   icon:'ti-trending-up',         label:'Velocity',     badge:null, accent:'#BA7517' },
  { id:'checklist',  icon:'ti-list-details',        label:'Checklist',    badge:null, accent:'#7F77DD' },
];

function renderTabs() {
  const root = document.getElementById('tabs-root');
  if (!root) return;
  root.innerHTML = `
    <nav class="tabs" role="tablist" aria-label="Dashboard sections">
      ${TAB_DEFS.map(t => {
        const bv = typeof t.badge==='function'?t.badge():null;
        const as = t.accent?`style="color:${t.accent}"` :'';
        return `<button class="tab${t.id==='review'?' active':''}" id="tab-${t.id}"
          role="tab" aria-selected="${t.id==='review'}" aria-controls="panel-${t.id}"
          onclick="switchTab('${t.id}')">
          <i class="ti ${t.icon}" aria-hidden="true" ${as}></i>${t.label}
          ${bv!==null?`<span class="tab-badge">${bv}</span>`:''}
        </button>`;
      }).join('')}
      <button class="tab" onclick="openExportModal()"
              style="margin-left:auto;border-color:var(--perf);color:var(--perf)"
              aria-label="Export report">
        <i class="ti ti-download" aria-hidden="true"></i> Export
      </button>
    </nav>`;
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t=>{
    const a=t.id===`tab-${name}`;
    t.classList.toggle('active',a);
    t.setAttribute('aria-selected',String(a));
  });
  document.querySelectorAll('.panel').forEach(p=>{
    p.classList.toggle('active',p.id===`panel-${name}`);
  });
}
