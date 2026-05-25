/* ============================================================
   components/SnoozePanel.js
   Snooze & Remind System — shows snoozed issues with remind
   times, reasons, wake/dismiss actions, and a form to snooze
   any detected issue with a custom duration and reason.
   Reads from window.SNOOZE_ITEMS + window.SNOOZE_DURATIONS.
   ============================================================ */

let _snoozeFormOpen    = false;
let _snoozeSelectedIssue = null;
let _snoozeDurationHrs   = 24;

/**
 * Render the snooze panel into #snooze-root.
 */
function renderSnoozePanel() {
  const root = document.getElementById('snooze-root');
  if (!root) return;

  const items     = window.SNOOZE_ITEMS     || [];
  const snoozed   = items.filter(i => i.status === 'snoozed').length;
  const reminded  = items.filter(i => i.status === 'reminded').length;

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">Snooze &amp; Remind</div>
        <div class="p3-sub">
          ${snoozed} snoozed &middot;
          ${reminded > 0
            ? `<span style="color:var(--bug);font-weight:600">${reminded} reminder${reminded>1?'s':''} due</span>`
            : 'no reminders due'}
        </div>
      </div>
      <button class="btn-new-rule" onclick="openSnoozeForm()" style="background:var(--perf-bg);color:var(--perf-text);border:0.5px solid var(--perf)">
        <i class="ti ti-clock" aria-hidden="true"></i> Snooze an issue
      </button>
    </div>

    <!-- Snooze form (injected here) -->
    <div id="snooze-form-container"></div>

    <!-- Snoozed items list -->
    ${items.length
      ? `<div class="snooze-list" role="list" aria-label="Snoozed issues">
           ${items.map(item => buildSnoozeCard(item)).join('')}
         </div>`
      : `<div class="snooze-empty">
           <i class="ti ti-bell-off" aria-hidden="true"></i>
           No issues snoozed. Use the button above to snooze any detected issue.
         </div>`
    }

    <!-- Reminder rules info box -->
    <div style="background:var(--bg-2);border:0.5px solid var(--border);border-radius:var(--rad);
                padding:.75rem 1rem;margin-top:1rem;font-size:12px;color:var(--text-muted);
                display:flex;align-items:flex-start;gap:8px">
      <i class="ti ti-info-circle" style="color:var(--smell);flex-shrink:0;margin-top:1px" aria-hidden="true"></i>
      <span>
        Snoozed issues are hidden from the review dashboard until the remind time.
        Critical and high-severity issues cannot be snoozed for more than 3 days.
        All snoozed items are logged to the audit trail.
      </span>
    </div>
  `;
}

/* ── Single snooze card ── */
function buildSnoozeCard(item) {
  const styles  = window.SNOOZE_STATUS_STYLES || {};
  const st      = styles[item.status] || styles.snoozed;
  const typeMap = { bug:'var(--bug)', security:'var(--sec)', performance:'var(--perf)', smell:'var(--smell)' };
  const typeColor = typeMap[item.type] || 'var(--text-muted)';

  const remindDate = item.remindAt
    ? new Date(item.remindAt).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
    : '—';
  const snoozedDate = item.snoozedAt
    ? new Date(item.snoozedAt).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
    : '—';

  const isReminded = item.status === 'reminded';

  return `
    <div class="snooze-card${isReminded ? ' reminded' : ''}${item.status === 'resolved' ? ' resolved' : ''}"
         id="snz-card-${item.id}" role="listitem">

      <!-- Status icon -->
      <div class="snooze-status-icon" style="background:${st.bg}">
        <i class="ti ${st.icon}" style="color:${st.color}${item.status==='reminded'?';animation:pulse 1.2s infinite':''}"
           aria-hidden="true"></i>
      </div>

      <!-- Content -->
      <div>
        <div class="snooze-title">
          ${escapeHtml(item.title)}
          <span class="issue-badge" style="background:${typeColor}22;color:${typeColor};font-size:9px;margin-left:4px">${item.type.toUpperCase()}</span>
          <span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:8px;margin-left:4px;background:${st.bg};color:${st.color}">${st.label}</span>
        </div>
        <div class="snooze-file">${escapeHtml(item.file)}</div>
        <div class="snooze-reason">"${escapeHtml(item.reason)}"</div>
        <div class="snooze-meta">
          <span>Snoozed ${snoozedDate}</span>
          <span>·</span>
          <span ${isReminded?`style="color:var(--bug);font-weight:600"`:''}">
            <i class="ti ti-bell" style="font-size:10px" aria-hidden="true"></i>
            Remind ${remindDate}
          </span>
          ${item.remindCount > 0 ? `<span>· Reminded ${item.remindCount}×</span>` : ''}
        </div>
      </div>

      <!-- Actions -->
      <div class="snooze-actions">
        <button class="btn-snooze-action wake" onclick="wakeSnooze('${item.id}')"
                title="Un-snooze and show this issue now">
          <i class="ti ti-bell-ringing" aria-hidden="true"></i> Wake
        </button>
        <button class="btn-snooze-action" onclick="extendSnooze('${item.id}')"
                title="Snooze for another 24 hours">
          <i class="ti ti-clock-plus" aria-hidden="true"></i> Extend
        </button>
        <button class="btn-snooze-action" onclick="dismissSnooze('${item.id}')"
                title="Dismiss permanently — won't remind again"
                style="color:var(--text-hint)">
          <i class="ti ti-x" aria-hidden="true"></i> Dismiss
        </button>
      </div>
    </div>`;
}

/* ── Open snooze form ── */
function openSnoozeForm() {
  const container = document.getElementById('snooze-form-container');
  if (!container) return;

  const issues    = (window.ISSUES || []).filter(i =>
    !(window.SNOOZE_ITEMS || []).some(s => s.issueId === i.id && s.status === 'snoozed')
  );
  const durations = window.SNOOZE_DURATIONS || [];

  const issueOpts = issues.map(i =>
    `<option value="${i.id}">${i.type.toUpperCase()} · ${i.title.substring(0,50)}</option>`
  ).join('');

  container.innerHTML = `
    <div class="rule-form" style="margin-bottom:1rem">
      <div class="rule-form-title">⏰ Snooze an Issue</div>

      <!-- Issue picker -->
      <div class="form-field" style="margin-bottom:.75rem">
        <label>Select issue to snooze</label>
        <select class="form-select" id="snz-issue-select" style="width:100%">${issueOpts}</select>
      </div>

      <!-- Duration buttons -->
      <div class="form-field" style="margin-bottom:.75rem">
        <label>Remind me in</label>
        <div class="snooze-duration-grid">
          ${durations.map(d => `
            <button class="snooze-dur-btn${d.hours===24?' active':''}"
                    id="sdur-${d.hours}"
                    onclick="selectSnoozeDuration(${d.hours}, this)">
              ${d.label}
            </button>`).join('')}
        </div>
      </div>

      <!-- Reason -->
      <div class="form-field" style="margin-bottom:.75rem">
        <label>Reason (optional)</label>
        <input class="form-input" id="snz-reason" type="text"
               placeholder="Why are you snoozing this? Will be shown in the audit trail…"/>
      </div>

      <div class="rule-form-actions">
        <button class="btn-modal-cancel"
                onclick="document.getElementById('snooze-form-container').innerHTML=''">
          Cancel
        </button>
        <button class="btn-apply-fix" onclick="saveSnooze()">
          <i class="ti ti-clock" aria-hidden="true"></i> Snooze issue
        </button>
      </div>
    </div>`;
}

/* ── Select duration ── */
function selectSnoozeDuration(hours, btn) {
  if (hours === null) {
    const custom = prompt('Enter hours to snooze (1–720):', '48');
    hours = parseInt(custom);
    if (isNaN(hours) || hours < 1 || hours > 720) { showToast({ type:'bug', title:'Invalid duration', desc:'Enter a number between 1 and 720.' }); return; }
  }
  _snoozeDurationHrs = hours;
  document.querySelectorAll('.snooze-dur-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

/* ── Save snooze ── */
function saveSnooze() {
  const issueId  = document.getElementById('snz-issue-select')?.value;
  const reason   = document.getElementById('snz-reason')?.value.trim() || 'No reason provided.';
  const issue    = (window.ISSUES || []).find(i => i.id === issueId);

  if (!issue) { showToast({ type:'bug', title:'No issue selected', desc:'Pick an issue to snooze.' }); return; }
  if (issue.severity === 'critical' && _snoozeDurationHrs > 72) {
    showToast({ type:'bug', title:'Cannot snooze critical issues > 3 days', desc:'Reduce the duration or fix the issue first.' });
    return;
  }

  const remindAt = new Date(Date.now() + _snoozeDurationHrs * 3600 * 1000).toISOString();

  const newSnooze = {
    id        : 'snz-' + Date.now(),
    issueId   : issue.id,
    title     : issue.title,
    file      : issue.file,
    severity  : issue.sev,
    type      : issue.type,
    snoozedBy : 'you',
    snoozedAt : new Date().toISOString(),
    remindAt,
    reason,
    status    : 'snoozed',
    remindCount: 0,
  };

  window.SNOOZE_ITEMS = window.SNOOZE_ITEMS || [];
  window.SNOOZE_ITEMS.unshift(newSnooze);

  document.getElementById('snooze-form-container').innerHTML = '';
  renderSnoozePanel();
  showToast({ type:'ok', title:'Issue snoozed', desc:`"${issue.title.substring(0,40)}…" · remind in ${_snoozeDurationHrs}h` });
}

/* ── Wake (un-snooze) ── */
function wakeSnooze(id) {
  const item = (window.SNOOZE_ITEMS || []).find(i => i.id === id);
  if (!item) return;
  item.status = 'resolved';
  renderSnoozePanel();
  showToast({ type:'ok', title:'Issue un-snoozed', desc:`"${item.title.substring(0,40)}" is now visible again.` });
}

/* ── Extend by 24h ── */
function extendSnooze(id) {
  const item = (window.SNOOZE_ITEMS || []).find(i => i.id === id);
  if (!item) return;
  const current = new Date(item.remindAt);
  current.setHours(current.getHours() + 24);
  item.remindAt = current.toISOString();
  renderSnoozePanel();
  showToast({ type:'info', title:'Snooze extended', desc:`Remind time pushed by 24 hours.` });
}

/* ── Dismiss ── */
function dismissSnooze(id) {
  const item = (window.SNOOZE_ITEMS || []).find(i => i.id === id);
  if (!item) return;
  item.status = 'dismissed';
  renderSnoozePanel();
  showToast({ type:'info', title:'Snooze dismissed', desc:`Won't remind again about "${item.title.substring(0,40)}".` });
}