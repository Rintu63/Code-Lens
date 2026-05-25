/* ============================================================
   components/SettingsPanel.js
   Settings panel — sidebar nav + sectioned config forms.
   Persists to localStorage via data/settings.js helpers.
   ============================================================ */

const SETTINGS_SECTIONS = [
  { id: 'integration',  icon: 'ti-plug-connected', label: 'Integration'   },
  { id: 'analysis',     icon: 'ti-search',          label: 'Analysis'      },
  { id: 'notifications',icon: 'ti-bell',            label: 'Notifications' },
  { id: 'thresholds',   icon: 'ti-adjustments',     label: 'Thresholds'    },
  { id: 'display',      icon: 'ti-layout',          label: 'Display'       },
];

let _settings = {};  // live settings object

/**
 * Render the full settings panel into #settings-root.
 */
function renderSettingsPanel() {
  const root = document.getElementById('settings-root');
  if (!root) return;

  _settings = window.loadSettings();

  root.innerHTML = `
    <div class="settings-grid">
      <!-- Sidebar nav -->
      <nav class="settings-nav" aria-label="Settings sections">
        ${SETTINGS_SECTIONS.map((s, i) => `
          <button
            class="settings-nav-item${i === 0 ? ' active' : ''}"
            id="snav-${s.id}"
            onclick="switchSettingsSection('${s.id}')"
            aria-selected="${i === 0}"
          >
            <i class="ti ${s.icon}" aria-hidden="true"></i>
            ${s.label}
          </button>
        `).join('')}
      </nav>

      <!-- Content area -->
      <div class="settings-content">
        ${buildIntegrationSection()}
        ${buildAnalysisSection()}
        ${buildNotificationsSection()}
        ${buildThresholdsSection()}
        ${buildDisplaySection()}

        <div style="display:flex;gap:8px;margin-top:1rem;padding-top:1rem;border-top:0.5px solid var(--border)">
          <button class="btn-save-settings" onclick="saveSettingsForm()">
            <i class="ti ti-device-floppy" aria-hidden="true"></i> Save settings
          </button>
          <button class="btn-modal-cancel" onclick="resetSettings()" style="margin-top:0">
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  `;

  // Activate first section
  switchSettingsSection('integration');
}

/* ── Section switcher ── */
function switchSettingsSection(id) {
  document.querySelectorAll('.settings-nav-item').forEach(b => {
    b.classList.toggle('active', b.id === `snav-${id}`);
    b.setAttribute('aria-selected', String(b.id === `snav-${id}`));
  });
  document.querySelectorAll('.settings-section').forEach(s => {
    s.classList.toggle('active', s.id === `ssec-${id}`);
  });
}

/* ── Toggle helper ── */
function toggle(id, checked) {
  return `
    <label class="toggle" aria-label="${id}">
      <input type="checkbox" id="s-${id}" ${checked ? 'checked' : ''} onchange="onSettingChange('${id}', this.checked)"/>
      <div class="toggle-track" aria-hidden="true"></div>
    </label>
  `;
}

/* ── Text input helper ── */
function textInput(id, val, placeholder = '') {
  return `<input class="settings-input" type="text" id="s-${id}" value="${escapeHtml(val)}" placeholder="${placeholder}" oninput="onSettingChange('${id}', this.value)"/>`;
}

/* ── Select helper ── */
function selectInput(id, options, selected) {
  const opts = options.map(o => `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${o.label}</option>`).join('');
  return `<select class="settings-select" id="s-${id}" onchange="onSettingChange('${id}', this.value)">${opts}</select>`;
}

/* ── INTEGRATION SECTION ── */
function buildIntegrationSection() {
  return `
    <div class="settings-section" id="ssec-integration">
      <div class="settings-group">
        <div class="settings-group-title">Git Provider</div>
        <div class="setting-row">
          <div><div class="setting-label">Provider</div><div class="setting-desc">Source control platform to integrate with</div></div>
          ${selectInput('provider', [
            { value:'github', label:'GitHub' },
            { value:'gitlab', label:'GitLab' },
            { value:'bitbucket', label:'Bitbucket' },
          ], _settings.provider)}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Base URL</div><div class="setting-desc">Leave blank for cloud; set for self-hosted</div></div>
          ${textInput('baseUrl', _settings.baseUrl, 'https://gitlab.company.com')}
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Webhook</div>
        <div class="setting-row">
          <div><div class="setting-label">Auto-review on PR open/update</div><div class="setting-desc">Trigger analysis automatically via webhook</div></div>
          ${toggle('autoReview', _settings.autoReview)}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Webhook secret</div><div class="setting-desc">HMAC secret for payload verification</div></div>
          ${textInput('webhookSecret', _settings.webhookSecret, 'whsec_••••••••')}
        </div>
      </div>
    </div>
  `;
}

/* ── ANALYSIS SECTION ── */
function buildAnalysisSection() {
  const a = _settings.agents || {};
  return `
    <div class="settings-section" id="ssec-analysis">
      <div class="settings-group">
        <div class="settings-group-title">Active Agents</div>
        ${[
          ['bugHunter',     'Bug Hunter',      'Logic errors, null dereferences, off-by-ones'],
          ['security',      'Security Scanner','OWASP Top 10, injection, secrets'],
          ['performance',   'Perf Optimizer',  'N+1 queries, blocking I/O, missing indexes'],
          ['smells',        'Code Smell Detector','Magic numbers, duplicated logic'],
          ['bestPractices', 'Best Practices',  'Lint rules, coverage, conventions'],
        ].map(([key, name, desc]) => `
          <div class="setting-row">
            <div><div class="setting-label">${name}</div><div class="setting-desc">${desc}</div></div>
            ${toggle('agent_' + key, a[key] !== false)}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ── NOTIFICATIONS SECTION ── */
function buildNotificationsSection() {
  const n = _settings.notify || {};
  return `
    <div class="settings-section" id="ssec-notifications">
      <div class="settings-group">
        <div class="settings-group-title">Slack</div>
        <div class="setting-row">
          <div><div class="setting-label">Enable Slack notifications</div></div>
          ${toggle('notify_slack', n.slack)}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Incoming webhook URL</div></div>
          ${textInput('notify_slackWebhook', n.slackWebhook || '', 'https://hooks.slack.com/services/…')}
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-group-title">Email</div>
        <div class="setting-row">
          <div><div class="setting-label">Enable email notifications</div></div>
          ${toggle('notify_email', n.email)}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Recipient email</div></div>
          ${textInput('notify_emailAddress', n.emailAddress || '', 'team@company.com')}
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-group-title">Triggers</div>
        <div class="setting-row">
          <div><div class="setting-label">Notify on critical issues</div></div>
          ${toggle('notify_onCritical', n.onCritical !== false)}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Notify on review complete</div></div>
          ${toggle('notify_onComplete', n.onComplete !== false)}
        </div>
      </div>
    </div>
  `;
}

/* ── THRESHOLDS SECTION ── */
function buildThresholdsSection() {
  const t = _settings.thresholds || {};
  return `
    <div class="settings-section" id="ssec-thresholds">
      <div class="settings-group">
        <div class="settings-group-title">Merge Gate</div>
        <div class="setting-row">
          <div><div class="setting-label">Minimum health score to merge</div><div class="setting-desc">PRs below this score are blocked</div></div>
          <div class="slider-row">
            <input class="settings-slider" type="range" id="s-minScore" min="0" max="100" step="5"
              value="${t.minScore ?? 70}"
              oninput="document.getElementById('sv-minScore').textContent=this.value;onSettingChange('minScore',+this.value)"/>
            <span class="slider-value" id="sv-minScore">${t.minScore ?? 70}</span>
          </div>
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Max critical issues allowed</div><div class="setting-desc">Set to 0 to block any critical issue</div></div>
          <div class="slider-row">
            <input class="settings-slider" type="range" id="s-maxCritical" min="0" max="5" step="1"
              value="${t.maxCritical ?? 0}"
              oninput="document.getElementById('sv-maxCritical').textContent=this.value;onSettingChange('maxCritical',+this.value)"/>
            <span class="slider-value" id="sv-maxCritical">${t.maxCritical ?? 0}</span>
          </div>
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Max high-severity issues allowed</div></div>
          <div class="slider-row">
            <input class="settings-slider" type="range" id="s-maxHigh" min="0" max="10" step="1"
              value="${t.maxHigh ?? 2}"
              oninput="document.getElementById('sv-maxHigh').textContent=this.value;onSettingChange('maxHigh',+this.value)"/>
            <span class="slider-value" id="sv-maxHigh">${t.maxHigh ?? 2}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ── DISPLAY SECTION ── */
function buildDisplaySection() {
  return `
    <div class="settings-section" id="ssec-display">
      <div class="settings-group">
        <div class="settings-group-title">Appearance</div>
        <div class="setting-row">
          <div><div class="setting-label">Theme</div></div>
          ${selectInput('theme', [
            {value:'system',label:'System default'},
            {value:'light', label:'Light'},
            {value:'dark',  label:'Dark'},
          ], _settings.theme || 'system')}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Compact mode</div><div class="setting-desc">Reduce padding and font sizes</div></div>
          ${toggle('compactMode', _settings.compactMode)}
        </div>
        <div class="setting-row">
          <div><div class="setting-label">Show line numbers in code snippets</div></div>
          ${toggle('showLineNumbers', _settings.showLineNumbers !== false)}
        </div>
      </div>
    </div>
  `;
}

/* ── Live setting change tracker ── */
function onSettingChange(key, value) {
  _settings[key] = value;   // simplified flat write; production would use dot-path
}

/* ── Save ── */
function saveSettingsForm() {
  window.saveSettings(_settings);
  showToast({ type:'ok', title:'Settings saved', desc:'Preferences persisted to local storage.' });
}

/* ── Reset ── */
function resetSettings() {
  _settings = JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS));
  window.saveSettings(_settings);
  renderSettingsPanel();
  showToast({ type:'info', title:'Settings reset', desc:'All preferences restored to defaults.' });
}
