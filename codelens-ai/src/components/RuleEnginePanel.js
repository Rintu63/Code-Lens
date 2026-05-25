/* ============================================================
   components/RuleEnginePanel.js  (Part 3)
   Rule Engine — view, toggle, and create custom review rules.
   Rules are stored in window.REVIEW_RULES and persisted to
   localStorage under 'codelens_rules'.
   ============================================================ */

let _showRuleForm = false;
let _ruleFilter   = 'all';  // 'all'|'bug'|'security'|'smell'|'performance'

/**
 * Render the Rule Engine into #rules-root.
 */
function renderRuleEnginePanel() {
  const root = document.getElementById('rules-root');
  if (!root) return;

  _loadRules();

  const rules    = window.REVIEW_RULES || [];
  const filtered = _ruleFilter === 'all' ? rules : rules.filter(r => r.category === _ruleFilter);
  const enabled  = rules.filter(r => r.enabled).length;

  root.innerHTML = `
    <!-- Toolbar -->
    <div class="rule-toolbar">
      <div style="font-size:13px;color:var(--text-muted)">
        <strong style="color:var(--text)">${enabled}</strong> of ${rules.length} rules active
      </div>
      <div style="flex:1"></div>
      ${['all','bug','security','smell'].map(f => `
        <button class="filter-btn${_ruleFilter===f?' f-'+f:''}" onclick="filterRules('${f}')">
          ${f === 'all' ? 'All' : capitalize(f)}
        </button>
      `).join('')}
      <button class="btn-add-rule" onclick="toggleRuleForm()">
        <i class="ti ti-plus" aria-hidden="true"></i> Add rule
      </button>
    </div>

    <!-- Inline add-rule form -->
    <div class="rule-form${_showRuleForm ? ' open' : ''}" id="rule-form">
      <div style="font-size:14px;font-weight:700;margin-bottom:.75rem">New custom rule</div>
      <div class="rule-form-grid">
        <div>
          <div class="rf-label">Rule name *</div>
          <input class="rf-input" type="text" id="rf-name" placeholder="No console.log in production" />
        </div>
        <div>
          <div class="rf-label">Category</div>
          <select class="rf-select" id="rf-category">
            <option value="smell">Code Smell</option>
            <option value="bug">Bug</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
          </select>
        </div>
        <div>
          <div class="rf-label">Severity</div>
          <select class="rf-select" id="rf-severity">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <div class="rf-label">Regex pattern</div>
          <input class="rf-input" type="text" id="rf-pattern" placeholder="console\\.log\\(" />
        </div>
        <div style="grid-column:1/-1">
          <div class="rf-label">Violation message *</div>
          <input class="rf-input" type="text" id="rf-message" placeholder="Remove console.log before merging." />
        </div>
        <div style="grid-column:1/-1">
          <div class="rf-label">Fix hint</div>
          <input class="rf-input" type="text" id="rf-hint" placeholder="Use a structured logger instead." />
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-apply-fix" onclick="saveNewRule()">
          <i class="ti ti-check" aria-hidden="true"></i> Save rule
        </button>
        <button class="btn-copy-fix" onclick="toggleRuleForm()">Cancel</button>
      </div>
    </div>

    <!-- Rule cards -->
    <div id="rule-list" role="list" aria-label="Review rules">
      ${filtered.length > 0
        ? filtered.map(r => buildRuleCard(r)).join('')
        : `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:13px">No rules in this category.</div>`
      }
    </div>
  `;
}

/* ── Single rule card ── */
function buildRuleCard(rule) {
  const catIconMap = {
    bug        : { icon:'ti-bug',         bg:'var(--bug-bg)',  ic:'var(--bug)'   },
    security   : { icon:'ti-shield-lock', bg:'var(--sec-bg)',  ic:'var(--sec)'   },
    smell      : { icon:'ti-plant',       bg:'var(--smell-bg)',ic:'var(--smell)' },
    performance: { icon:'ti-rocket',      bg:'var(--perf-bg)', ic:'var(--perf)'  },
  };
  const meta = catIconMap[rule.category] || catIconMap.smell;

  return `
    <div class="rule-card cat-${rule.category}${rule.enabled ? '' : ' disabled'}" role="listitem" id="rc-${rule.id}">
      <!-- Icon -->
      <div class="rule-icon" style="background:${meta.bg}" aria-hidden="true">
        <i class="ti ${meta.icon}" style="color:${meta.ic}"></i>
      </div>

      <!-- Info -->
      <div>
        <div class="rule-name">
          ${escapeHtml(rule.name)}
          ${rule.builtIn ? '<span class="built-in-tag">BUILT-IN</span>' : ''}
        </div>
        <div class="rule-detail">
          ${capitalize(rule.category)} · ${capitalize(rule.severity)} severity
          ${rule.pattern ? `· <code style="font-size:10px;background:var(--bg-3);padding:1px 4px;border-radius:3px">${escapeHtml(rule.pattern.substring(0,30))}${rule.pattern.length>30?'…':''}</code>` : ''}
        </div>
        <div class="rule-detail" style="margin-top:2px;color:var(--text-hint)">${escapeHtml(rule.message)}</div>
      </div>

      <!-- Severity badge -->
      <span class="risk-badge risk-${rule.severity === 'critical' ? 'medium' : rule.severity === 'high' ? 'low' : 'safe'}">
        ${capitalize(rule.severity)}
      </span>

      <!-- Actions -->
      <div class="rule-actions">
        ${!rule.builtIn ? `
          <button class="btn-rule-edit" onclick="deleteRule('${rule.id}')" aria-label="Delete rule">
            <i class="ti ti-trash" aria-hidden="true"></i>
          </button>
        ` : ''}
        <label class="toggle" aria-label="Enable ${escapeHtml(rule.name)}">
          <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleRule('${rule.id}', this.checked)" />
          <div class="toggle-track" aria-hidden="true"></div>
        </label>
      </div>
    </div>
  `;
}

/* ── Actions ── */

function toggleRuleForm() {
  _showRuleForm = !_showRuleForm;
  renderRuleEnginePanel();
}

function filterRules(cat) {
  _ruleFilter = cat;
  renderRuleEnginePanel();
}

function toggleRule(id, enabled) {
  const rule = (window.REVIEW_RULES || []).find(r => r.id === id);
  if (rule) {
    rule.enabled = enabled;
    _saveRules();
    const card = document.getElementById(`rc-${id}`);
    if (card) card.classList.toggle('disabled', !enabled);
    showToast({ type: enabled ? 'ok' : 'info', title: `Rule ${enabled ? 'enabled' : 'disabled'}`, desc: rule.name });
  }
}

function deleteRule(id) {
  window.REVIEW_RULES = (window.REVIEW_RULES || []).filter(r => r.id !== id);
  _saveRules();
  renderRuleEnginePanel();
  showToast({ type:'info', title:'Rule deleted', desc:'Custom rule removed.' });
}

function saveNewRule() {
  const name    = document.getElementById('rf-name')?.value.trim();
  const message = document.getElementById('rf-message')?.value.trim();
  if (!name || !message) {
    showToast({ type:'bug', title:'Missing fields', desc:'Name and message are required.' });
    return;
  }

  const newRule = {
    id       : 'rule-custom-' + Date.now(),
    name,
    category : document.getElementById('rf-category')?.value || 'smell',
    severity : document.getElementById('rf-severity')?.value || 'medium',
    enabled  : true,
    builtIn  : false,
    pattern  : document.getElementById('rf-pattern')?.value.trim() || '',
    message,
    fixHint  : document.getElementById('rf-hint')?.value.trim() || '',
  };

  window.REVIEW_RULES = [...(window.REVIEW_RULES || []), newRule];
  _saveRules();
  _showRuleForm = false;
  renderRuleEnginePanel();
  showToast({ type:'ok', title:'Rule created', desc: name });
}

/* ── Persistence ── */
function _saveRules() {
  try { localStorage.setItem('codelens_rules', JSON.stringify(window.REVIEW_RULES)); } catch {}
}
function _loadRules() {
  try {
    const raw = localStorage.getItem('codelens_rules');
    if (raw) window.REVIEW_RULES = JSON.parse(raw);
  } catch {}
}
