/* ============================================================
   components/RuleManager.js
   Rule Manager — list, enable/disable, add, and delete
   custom code review rules. Reads/writes window.CUSTOM_RULES.
   ============================================================ */

let _ruleFormOpen = false;
let _editingRuleId = null;

/**
 * Render the Rule Manager into #rules-root.
 */
function renderRuleManager() {
  const root = document.getElementById('rules-root');
  if (!root) return;

  const rules   = window.CUSTOM_RULES || [];
  const enabled  = rules.filter(r => r.enabled).length;

  root.innerHTML = `
    <!-- Header -->
    <div class="rule-toolbar">
      <div>
        <div class="p3-title">Custom Rule Manager</div>
        <div class="p3-sub">${enabled} of ${rules.length} rules active &middot; matched ${countTotalMatches()} times in this PR</div>
      </div>
      <button class="btn-new-rule" onclick="openRuleForm(null)" aria-label="Add new rule">
        <i class="ti ti-plus" aria-hidden="true"></i> New rule
      </button>
    </div>

    <!-- Inline add/edit form (hidden by default) -->
    <div id="rule-form-container"></div>

    <!-- Category filter -->
    <div class="filter-row" style="margin-bottom:.85rem">
      <button class="filter-btn f-all"  id="rf-all"  onclick="filterRules('all',  this)">All</button>
      <button class="filter-btn"        id="rf-bug"  onclick="filterRules('bug',  this)">Bugs</button>
      <button class="filter-btn"        id="rf-sec"  onclick="filterRules('security', this)">Security</button>
      <button class="filter-btn"        id="rf-perf" onclick="filterRules('performance',this)">Performance</button>
      <button class="filter-btn"        id="rf-smell"onclick="filterRules('smell',this)">Smells</button>
    </div>

    <!-- Rule list -->
    <div class="rule-list" id="rule-cards" role="list" aria-label="Custom review rules">
      ${rules.map(r => buildRuleCard(r)).join('')}
    </div>
  `;
}

/* ── Build a single rule card ── */
function buildRuleCard(rule) {
  const catStyle = {
    bug        : { badge:'b-bug',        color:'var(--bug)'  },
    security   : { badge:'b-security',   color:'var(--sec)'  },
    performance: { badge:'b-performance',color:'var(--perf)' },
    smell      : { badge:'b-smell',      color:'var(--smell)'},
  }[rule.category] || { badge:'', color:'var(--text-muted)' };

  const sevStyle = {
    critical:'var(--bug)', high:'var(--sec)', medium:'var(--perf)', low:'var(--ok)',
  }[rule.severity] || 'var(--text-muted)';

  const hasMatch = rule.matchCount > 0;

  return `
    <div class="rule-card${rule.enabled ? '' : ' disabled'}"
         id="rule-card-${rule.id}" role="listitem"
         style="border-left:3px solid ${rule.enabled ? catStyle.color : 'var(--border)'}">

      <!-- Header row -->
      <div class="rule-header">
        <!-- Enable toggle -->
        <label class="toggle" aria-label="Enable ${escapeHtml(rule.name)}">
          <input type="checkbox" ${rule.enabled ? 'checked' : ''}
                 onchange="toggleRule('${rule.id}', this.checked)"/>
          <div class="toggle-track" aria-hidden="true"></div>
        </label>

        <div class="rule-name">${escapeHtml(rule.name)}</div>

        <!-- Category badge -->
        <span class="issue-badge ${catStyle.badge}">${rule.category.toUpperCase()}</span>

        <!-- Severity badge -->
        <span style="font-size:10px;font-weight:700;color:${sevStyle}">${rule.severity}</span>

        ${rule.builtIn ? '<span class="rule-built-in">built-in</span>' : ''}
      </div>

      <!-- Body: description + pattern + actions -->
      <div class="rule-body">
        <div>
          <div class="rule-desc">${escapeHtml(rule.description)}</div>
          <div class="rule-pattern" title="Regex pattern">${escapeHtml(rule.pattern)}</div>
          <div class="rule-match-count${hasMatch ? ' has-match' : ''}">
            ${hasMatch
              ? `⚑ ${rule.matchCount} match${rule.matchCount > 1 ? 'es' : ''} in PR #142`
              : 'No matches in this PR'}
          </div>
        </div>
        <div class="rule-actions">
          <button class="btn-rule-edit"   onclick="openRuleForm('${rule.id}')">
            <i class="ti ti-pencil" aria-hidden="true"></i> Edit
          </button>
          ${!rule.builtIn ? `
            <button class="btn-rule-delete" onclick="deleteRule('${rule.id}')">
              <i class="ti ti-trash" aria-hidden="true"></i> Delete
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ── Filter rules by category ── */
function filterRules(cat, btn) {
  // Update active filter button
  document.querySelectorAll('[id^="rf-"]').forEach(b => b.className = 'filter-btn');
  btn.className = `filter-btn f-${cat === 'all' ? 'all' : cat === 'security' ? 'sec' : cat === 'performance' ? 'perf' : cat}`;

  const rules    = window.CUSTOM_RULES || [];
  const filtered = cat === 'all' ? rules : rules.filter(r => r.category === cat);
  const container= document.getElementById('rule-cards');
  if (container) container.innerHTML = filtered.map(r => buildRuleCard(r)).join('');
}

/* ── Toggle rule enabled state ── */
function toggleRule(id, enabled) {
  const rule = (window.CUSTOM_RULES || []).find(r => r.id === id);
  if (!rule) return;
  rule.enabled = enabled;

  const card = document.getElementById(`rule-card-${id}`);
  if (card) {
    card.classList.toggle('disabled', !enabled);
    const catColor = { bug:'var(--bug)', security:'var(--sec)', performance:'var(--perf)', smell:'var(--smell)' }[rule.category];
    card.style.borderLeftColor = enabled ? catColor : 'var(--border)';
  }

  showToast({
    type : enabled ? 'ok' : 'info',
    title: `Rule ${enabled ? 'enabled' : 'disabled'}`,
    desc : rule.name,
  });
}

/* ── Open add/edit form ── */
function openRuleForm(ruleId) {
  _editingRuleId = ruleId;
  const existing = ruleId ? (window.CUSTOM_RULES || []).find(r => r.id === ruleId) : null;
  const container= document.getElementById('rule-form-container');
  if (!container) return;

  const cats = (window.RULE_CATEGORIES || []).map(c =>
    `<option value="${c.value}" ${existing?.category === c.value ? 'selected' : ''}>${c.label}</option>`
  ).join('');

  const sevs = (window.RULE_SEVERITIES || []).map(s =>
    `<option value="${s.value}" ${existing?.severity === s.value ? 'selected' : ''}>${s.label}</option>`
  ).join('');

  container.innerHTML = `
    <div class="rule-form">
      <div class="rule-form-title">${existing ? '✏️ Edit rule' : '➕ New rule'}</div>
      <div class="rule-form-grid">
        <div class="form-field" style="grid-column:1/-1">
          <label for="rf-name">Rule name</label>
          <input class="form-input" id="rf-name" type="text"
                 placeholder="e.g. No console.log in production"
                 value="${existing ? escapeHtml(existing.name) : ''}"/>
        </div>
        <div class="form-field" style="grid-column:1/-1">
          <label for="rf-desc">Description</label>
          <input class="form-input" id="rf-desc" type="text"
                 placeholder="Why this rule matters…"
                 value="${existing ? escapeHtml(existing.description) : ''}"/>
        </div>
        <div class="form-field" style="grid-column:1/-1">
          <label for="rf-pattern">Regex pattern</label>
          <input class="form-input" id="rf-pattern" type="text"
                 placeholder="e.g. console\\.log\\("
                 value="${existing ? escapeHtml(existing.pattern) : ''}"/>
        </div>
        <div class="form-field">
          <label for="rf-cat">Category</label>
          <select class="form-select" id="rf-cat">${cats}</select>
        </div>
        <div class="form-field">
          <label for="rf-sev">Severity</label>
          <select class="form-select" id="rf-sev">${sevs}</select>
        </div>
      </div>
      <div class="rule-form-actions">
        <button class="btn-modal-cancel" onclick="closeRuleForm()">Cancel</button>
        <button class="btn-apply-fix" onclick="saveRule()">
          <i class="ti ti-check" aria-hidden="true"></i>
          ${existing ? 'Update rule' : 'Add rule'}
        </button>
      </div>
    </div>
  `;

  container.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ── Save rule (add or update) ── */
function saveRule() {
  const name    = document.getElementById('rf-name')?.value.trim();
  const desc    = document.getElementById('rf-desc')?.value.trim();
  const pattern = document.getElementById('rf-pattern')?.value.trim();
  const cat     = document.getElementById('rf-cat')?.value;
  const sev     = document.getElementById('rf-sev')?.value;

  if (!name || !pattern) {
    showToast({ type:'bug', title:'Missing fields', desc:'Name and pattern are required.' });
    return;
  }

  if (_editingRuleId) {
    // Update existing
    const rule = (window.CUSTOM_RULES || []).find(r => r.id === _editingRuleId);
    if (rule) Object.assign(rule, { name, description:desc, pattern, category:cat, severity:sev });
    showToast({ type:'ok', title:'Rule updated', desc: name });
  } else {
    // Add new
    const newRule = {
      id        : 'rule-' + Date.now(),
      name, description:desc, pattern,
      category  : cat, severity:sev,
      enabled   : true, builtIn:false, matchCount:0,
    };
    (window.CUSTOM_RULES = window.CUSTOM_RULES || []).push(newRule);
    showToast({ type:'ok', title:'Rule added', desc: name });
  }

  closeRuleForm();
  renderRuleManager();
}

/* ── Delete rule ── */
function deleteRule(id) {
  const idx = (window.CUSTOM_RULES || []).findIndex(r => r.id === id);
  if (idx === -1) return;
  const name = window.CUSTOM_RULES[idx].name;
  window.CUSTOM_RULES.splice(idx, 1);
  showToast({ type:'info', title:'Rule deleted', desc: name });
  renderRuleManager();
}

/* ── Close form ── */
function closeRuleForm() {
  const c = document.getElementById('rule-form-container');
  if (c) c.innerHTML = '';
  _editingRuleId = null;
}

/* ── Count total match hits across all rules ── */
function countTotalMatches() {
  return (window.CUSTOM_RULES || []).reduce((s, r) => s + (r.matchCount || 0), 0);
}
