/* ============================================================
   components/ChecklistPanel.js
   PR Checklist Builder — interactive checklist with progress
   ring, section grouping, auto-failed items from AI review,
   and ability to add custom items per section.
   Reads from window.ACTIVE_CHECKLIST + window.CHECKLIST_SECTIONS.
   ============================================================ */

/**
 * Render checklist into #checklist-root.
 */
function renderChecklistPanel() {
  const root = document.getElementById('checklist-root');
  if (!root) return;

  const items    = window.ACTIVE_CHECKLIST    || [];
  const sections = window.CHECKLIST_SECTIONS  || [];

  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  const failed  = items.filter(i => i.autoFailed && !i.checked).length;
  const required = items.filter(i => i.required && !i.checked).length;
  const pct     = Math.round((checked / total) * 100);

  root.innerHTML = `
    <!-- Header with progress ring -->
    <div class="checklist-header-bar">
      <div class="checklist-progress-ring-wrap" aria-hidden="true">
        ${buildProgressRing(pct)}
      </div>
      <div class="checklist-meta">
        <div class="checklist-meta-title">PR Checklist — #142</div>
        <div class="checklist-meta-sub">
          ${checked}/${total} complete &middot;
          ${failed > 0 ? `<span style="color:var(--bug);font-weight:600">${failed} auto-failed</span> &middot;` : ''}
          ${required > 0 ? `<span style="color:var(--bug)">${required} required items unresolved</span>` : '<span style="color:var(--ok)">All required items clear</span>'}
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn-copy-fix" onclick="exportChecklist()">
          <i class="ti ti-download" aria-hidden="true"></i> Export
        </button>
        <button class="fix-btn" onclick="resetChecklist()">
          <i class="ti ti-refresh" aria-hidden="true"></i> Reset
        </button>
      </div>
    </div>

    <!-- Per-section groups -->
    ${sections.map(sec => buildChecklistSection(sec, items)).join('')}

    <!-- Template selector -->
    <div style="background:var(--bg-2);border:0.5px solid var(--border);border-radius:var(--rad-lg);padding:.85rem 1rem;margin-top:.75rem">
      <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:.5rem">Load a template</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${Object.keys(window.CHECKLIST_TEMPLATES || {}).map(k => `
          <button class="filter-btn" onclick="loadChecklistTemplate('${k}')">
            ${capitalize(k)}
          </button>`).join('')}
      </div>
    </div>
  `;
}

/* ── SVG progress ring ── */
function buildProgressRing(pct) {
  const R    = 22;
  const CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;
  const color= pct >= 80 ? 'var(--ok)' : pct >= 50 ? 'var(--perf)' : 'var(--bug)';
  return `
    <svg class="cl-ring" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
      <circle class="cl-track" cx="27" cy="27" r="${R}"/>
      <circle class="cl-fill" cx="27" cy="27" r="${R}"
              stroke="${color}" stroke-dasharray="${dash.toFixed(1)} ${CIRC.toFixed(1)}"/>
    </svg>
    <div class="cl-num" style="color:${color}">${pct}%</div>`;
}

/* ── Single section group ── */
function buildChecklistSection(section, allItems) {
  const sectionItems = allItems.filter(i => i.section === section);
  if (!sectionItems.length) return '';

  const doneCount = sectionItems.filter(i => i.checked).length;
  const failCount = sectionItems.filter(i => i.autoFailed && !i.checked).length;

  const sectionIconMap = {
    Security     : 'ti-shield-lock',
    Correctness  : 'ti-bug',
    Performance  : 'ti-rocket',
    'Code Quality': 'ti-plant',
    Tests        : 'ti-test-pipe',
    Documentation: 'ti-file-text',
  };

  return `
    <div class="checklist-section-group">
      <div class="checklist-section-title">
        <i class="ti ${sectionIconMap[section] || 'ti-list'}" aria-hidden="true"></i>
        ${section}
        <span class="section-count">${doneCount}/${sectionItems.length}</span>
        ${failCount > 0 ? `<span style="font-size:10px;color:var(--bug);font-weight:700">⚑ ${failCount} failed</span>` : ''}
      </div>

      <div role="list">
        ${sectionItems.map(item => buildChecklistItem(item)).join('')}
      </div>

      <!-- Add custom item row -->
      <div class="cl-add-item-row">
        <input class="cl-add-input" type="text" id="cl-add-${section.replace(/\s/g,'-')}"
               placeholder="Add custom item to ${section}…"
               onkeydown="if(event.key==='Enter')addChecklistItem('${section}',this)"/>
        <button class="cl-add-btn" onclick="addChecklistItem('${section}', document.getElementById('cl-add-${section.replace(/\s/g,'-')}'))">+</button>
      </div>
    </div>`;
}

/* ── Single checklist item ── */
function buildChecklistItem(item) {
  let checkboxClass = 'cl-checkbox';
  let checkboxContent = '';

  if (item.autoFailed && !item.checked) {
    checkboxClass += ' auto-failed';
    checkboxContent = '<i class="ti ti-x" aria-hidden="true"></i>';
  } else if (item.checked) {
    checkboxClass += ' checked';
    checkboxContent = '<i class="ti ti-check" aria-hidden="true"></i>';
  }

  const rowClass = item.autoFailed && !item.checked
    ? 'checklist-item auto-failed'
    : item.checked ? 'checklist-item checked' : 'checklist-item';

  return `
    <div class="${rowClass}" role="listitem"
         onclick="toggleChecklistItem('${item.id}')"
         aria-checked="${item.checked}">
      <div class="${checkboxClass}" aria-hidden="true">${checkboxContent}</div>
      <div style="flex:1">
        <div class="cl-item-text">${escapeHtml(item.text)}</div>
        ${item.note       ? `<div class="cl-item-note">${escapeHtml(item.note)}</div>` : ''}
        ${item.required   ? `<div class="cl-required">Required to merge</div>` : ''}
      </div>
      ${item.autoFailed && !item.checked
        ? `<span style="font-size:10px;color:var(--bug);font-weight:700;flex-shrink:0">AI: Failed</span>`
        : ''}
    </div>`;
}

/* ── Toggle item checked state ── */
function toggleChecklistItem(id) {
  const item = (window.ACTIVE_CHECKLIST || []).find(i => i.id === id);
  if (!item || (item.autoFailed && !item.checked)) {
    if (item?.autoFailed) showToast({ type:'bug', title:'Auto-failed item', desc:'Fix the underlying issue first before checking this off.' });
    return;
  }
  item.checked = !item.checked;
  renderChecklistPanel();
  animateChecklistRing();
}

/* ── Re-animate the progress ring after toggle ── */
function animateChecklistRing() {
  const items   = window.ACTIVE_CHECKLIST || [];
  const pct     = Math.round((items.filter(i => i.checked).length / items.length) * 100);
  const R       = 22, CIRC = 2 * Math.PI * R;
  const fill    = document.querySelector('.cl-fill');
  const numEl   = document.querySelector('.cl-num');
  const color   = pct >= 80 ? 'var(--ok)' : pct >= 50 ? 'var(--perf)' : 'var(--bug)';
  if (fill) { fill.setAttribute('stroke', color); fill.setAttribute('stroke-dasharray', `${(pct/100)*CIRC} ${CIRC}`); }
  if (numEl){ numEl.textContent = pct + '%'; numEl.style.color = color; }
}

/* ── Add custom item ── */
function addChecklistItem(section, inputEl) {
  const text = inputEl?.value?.trim();
  if (!text) return;
  const newItem = {
    id      : 'cl-custom-' + Date.now(),
    section,
    text,
    checked : false,
    required: false,
    autoFailed:false,
    note    : '',
  };
  (window.ACTIVE_CHECKLIST = window.ACTIVE_CHECKLIST || []).push(newItem);
  renderChecklistPanel();
  showToast({ type:'ok', title:'Item added', desc:text.substring(0,50) });
}

/* ── Load a template ── */
function loadChecklistTemplate(type) {
  const tpl = (window.CHECKLIST_TEMPLATES || {})[type] || [];
  const existing = (window.ACTIVE_CHECKLIST || []).filter(i => !tpl.some(t => t.id === i.id));
  window.ACTIVE_CHECKLIST = [
    ...existing,
    ...tpl.map(t => ({ ...t, checked:false, autoFailed:false, section: capitalize(type), note:'' })),
  ];
  renderChecklistPanel();
  showToast({ type:'ok', title:`${capitalize(type)} template loaded`, desc:`${tpl.length} items added.` });
}

/* ── Export checklist as markdown ── */
function exportChecklist() {
  const items    = window.ACTIVE_CHECKLIST || [];
  const sections = window.CHECKLIST_SECTIONS || [];
  let md = `# PR #142 Checklist\n\n`;
  sections.forEach(sec => {
    const sItems = items.filter(i => i.section === sec);
    if (!sItems.length) return;
    md += `## ${sec}\n`;
    sItems.forEach(i => { md += `- [${i.checked ? 'x' : ' '}] ${i.text}${i.note ? ` *(${i.note})*` : ''}\n`; });
    md += '\n';
  });
  downloadFile('checklist-pr142.md', md, 'text/markdown');
  showToast({ type:'ok', title:'Checklist exported', desc:'checklist-pr142.md' });
}

/* ── Reset all items ── */
function resetChecklist() {
  (window.ACTIVE_CHECKLIST || []).forEach(i => { if (!i.autoFailed) i.checked = false; });
  renderChecklistPanel();
}