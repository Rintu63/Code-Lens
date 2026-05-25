/* ============================================================
   components/TemplatesPanel.js
   Review Templates — browse, preview, and copy structured
   review comment templates with {{variable}} placeholders.
   Reads from window.REVIEW_TEMPLATES + window.TEMPLATE_CATEGORIES.
   ============================================================ */

let _activeTplId   = null;
let _tplFilterCat  = 'all';

/**
 * Render the templates panel into #templates-root.
 */
function renderTemplatesPanel() {
  const root = document.getElementById('templates-root');
  if (!root) return;

  const templates = window.REVIEW_TEMPLATES || [];
  if (!_activeTplId && templates.length) _activeTplId = templates[0].id;

  const filtered = _tplFilterCat === 'all'
    ? templates
    : templates.filter(t => t.category === _tplFilterCat);

  const active = templates.find(t => t.id === _activeTplId) || templates[0];

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">Review Comment Templates</div>
        <div class="p3-sub">${templates.length} templates &middot; click a placeholder to fill it in</div>
      </div>
      <!-- Category filter -->
      <div class="filter-row">
        ${(window.TEMPLATE_CATEGORIES || []).map(c => `
          <button class="filter-btn${_tplFilterCat===c.value ? ' '+ getCatFilterClass(c.value) : ''}"
                  onclick="setTplFilter('${c.value}')">
            ${c.label}
          </button>`).join('')}
      </div>
    </div>

    <div class="templates-wrap">
      <!-- Sidebar: template list -->
      <div class="templates-sidebar" role="list" aria-label="Template list">
        ${filtered.map(t => buildTplSidebarItem(t)).join('')}
      </div>

      <!-- Preview pane -->
      <div class="template-preview" role="region" aria-label="Template preview">
        ${active ? buildTplPreview(active) : '<div style="padding:2rem;color:var(--text-muted)">No template selected.</div>'}
      </div>
    </div>
  `;
}

/* ── Category filter class ── */
function getCatFilterClass(cat) {
  return { all:'f-all', bug:'f-bug', security:'f-sec', performance:'f-perf', smell:'f-smell', general:'f-all' }[cat] || 'f-all';
}

/* ── Set category filter ── */
function setTplFilter(cat) {
  _tplFilterCat = cat;
  const templates = window.REVIEW_TEMPLATES || [];
  const filtered  = cat === 'all' ? templates : templates.filter(t => t.category === cat);
  if (filtered.length && !filtered.find(t => t.id === _activeTplId)) {
    _activeTplId = filtered[0].id;
  }
  renderTemplatesPanel();
}

/* ── Sidebar item ── */
function buildTplSidebarItem(tpl) {
  const isActive = tpl.id === _activeTplId;
  const catIcon  = { bug:'🐛', security:'🔒', performance:'⚡', smell:'🌱', general:'✅' }[tpl.category] || '📝';
  return `
    <div class="tpl-sidebar-item${isActive ? ' active' : ''}"
         role="listitem" onclick="selectTemplate('${tpl.id}')"
         aria-pressed="${isActive}">
      <div class="tpl-sidebar-name">${catIcon} ${escapeHtml(tpl.name)}</div>
      <div class="tpl-sidebar-meta">Used ${tpl.uses}× &middot; ${tpl.tags.slice(0,2).join(', ')}</div>
    </div>`;
}

/* ── Full preview pane ── */
function buildTplPreview(tpl) {
  // Highlight {{placeholders}} as clickable chips
  const highlighted = escapeHtml(tpl.body).replace(
    /\{\{(\w+)\}\}/g,
    '<span class="tpl-placeholder" title="Click to fill" onclick="fillPlaceholder(\'$1\')">{{$1}}</span>'
  );

  const catBadgeClass = { bug:'b-bug', security:'b-security', performance:'b-performance', smell:'b-smell', general:'b-ok' }[tpl.category] || '';

  return `
    <div class="tpl-preview-header">
      <div>
        <div class="tpl-preview-title">${escapeHtml(tpl.name)}</div>
        <div style="display:flex;gap:6px;margin-top:4px;align-items:center">
          <span class="issue-badge ${catBadgeClass}">${tpl.category.toUpperCase()}</span>
          ${tpl.tags.map(tag=>`<span style="font-size:10px;background:var(--bg-3);padding:1px 7px;border-radius:8px;color:var(--text-muted)">#${tag}</span>`).join('')}
          <span style="font-size:11px;color:var(--text-hint);margin-left:4px">Used ${tpl.uses}×</span>
        </div>
      </div>
    </div>

    <!-- Template body with highlighted placeholders -->
    <div class="tpl-preview-body" id="tpl-body-${tpl.id}">${highlighted}</div>

    <!-- Variable chips -->
    <div class="tpl-vars">
      <span style="font-size:11px;color:var(--text-hint);align-self:center">Variables:</span>
      ${tpl.variables.map(v => `
        <span class="tpl-var-chip" onclick="fillPlaceholder('${v}')" title="Click to fill {{${v}}}">
          {{${v}}}
        </span>`).join('')}
    </div>

    <!-- Actions -->
    <div class="tpl-actions">
      <button class="btn-apply-fix" onclick="copyTemplate('${tpl.id}')">
        <i class="ti ti-clipboard" aria-hidden="true"></i> Copy to clipboard
      </button>
      <button class="btn-copy-fix" onclick="insertTemplateToChat('${tpl.id}')">
        <i class="ti ti-message-circle" aria-hidden="true"></i> Send to AI Chat
      </button>
      <button class="btn-copy-fix" onclick="resetTemplatePlaceholders('${tpl.id}')">
        <i class="ti ti-refresh" aria-hidden="true"></i> Reset
      </button>
      <span style="margin-left:auto;font-size:11px;color:var(--text-hint);align-self:center">
        ${tpl.body.length} chars
      </span>
    </div>`;
}

/* ── Select a template ── */
function selectTemplate(id) {
  _activeTplId = id;
  renderTemplatesPanel();
}

/* ── Fill a placeholder via prompt ── */
function fillPlaceholder(varName) {
  const value = prompt(`Enter value for {{${varName}}}:`, '');
  if (value === null) return; // cancelled

  const tpl = (window.REVIEW_TEMPLATES || []).find(t => t.id === _activeTplId);
  if (!tpl) return;

  // Replace in the live DOM body (not the source data)
  const bodyEl = document.getElementById(`tpl-body-${tpl.id}`);
  if (!bodyEl) return;

  // Replace all matching placeholder spans with filled text
  bodyEl.querySelectorAll('.tpl-placeholder').forEach(span => {
    if (span.textContent === `{{${varName}}}`) {
      const filled = document.createElement('strong');
      filled.style.color = 'var(--ok)';
      filled.textContent = value || `{{${varName}}}`;
      span.replaceWith(filled);
    }
  });

  // Update the corresponding var chip colour
  document.querySelectorAll('.tpl-var-chip').forEach(chip => {
    if (chip.textContent.trim() === `{{${varName}}}`) {
      chip.style.background = 'var(--ok-bg)';
      chip.style.color      = 'var(--ok-text)';
      chip.style.borderColor= 'var(--ok)';
    }
  });
}

/* ── Reset placeholders back to {{var}} ── */
function resetTemplatePlaceholders(tplId) {
  _activeTplId = tplId;
  renderTemplatesPanel();
}

/* ── Copy rendered template to clipboard ── */
async function copyTemplate(tplId) {
  const bodyEl = document.getElementById(`tpl-body-${tplId}`);
  const text   = bodyEl ? bodyEl.innerText : '';
  try {
    await navigator.clipboard.writeText(text);
    showToast({ type:'ok', title:'Template copied', desc:'Paste it as a PR review comment.' });
  } catch {
    showToast({ type:'bug', title:'Copy failed', desc:'Check clipboard permissions.' });
  }
}

/* ── Send template to AI Chat for further editing ── */
function insertTemplateToChat(tplId) {
  const tpl = (window.REVIEW_TEMPLATES || []).find(t => t.id === tplId);
  if (!tpl) return;
  switchTab('chat');
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = `Help me customise this review template for PR #142:\n\n${tpl.body.substring(0, 200)}…`;
      input.focus();
    }
  }, 150);
}
