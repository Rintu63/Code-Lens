/* ============================================================
   components/ActivityFeed.js
   Activity Feed + Collaboration Presence panel.
   Shows a chronological stream of review events and a live
   presence sidebar of collaborators currently on the PR.
   Simulates new events arriving every few seconds.
   Reads from window.ACTIVITY_EVENTS + window.ACTIVE_COLLABORATORS.
   ============================================================ */

let _feedInterval  = null;
let _feedEvents    = [];

/**
 * Render the activity feed into #activity-root.
 */
function renderActivityFeed() {
  const root = document.getElementById('activity-root');
  if (!root) return;

  // Clone data so we can push simulated events
  _feedEvents = [...(window.ACTIVITY_EVENTS || [])];

  // Clear any existing simulator
  if (_feedInterval) clearInterval(_feedInterval);

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">Activity Feed</div>
        <div class="p3-sub">Real-time PR events &amp; collaborator presence</div>
      </div>
      <div class="live-badge" aria-label="Live feed active">
        <div class="pulse-dot" style="background:var(--bug)" aria-hidden="true"></div>
        LIVE
      </div>
    </div>

    <div class="activity-wrap">
      <!-- Feed column -->
      <div class="activity-feed" id="activity-feed-list" role="log" aria-live="polite" aria-label="Activity events">
        ${_feedEvents.slice().reverse().map(e => buildActivityItem(e)).join('')}
      </div>

      <!-- Presence sidebar -->
      <div class="presence-panel" role="complementary" aria-label="Active collaborators">
        <div class="presence-title">On this PR now</div>
        ${(window.ACTIVE_COLLABORATORS || []).map(c => buildPresenceUser(c)).join('')}

        <div style="margin-top:1rem;padding-top:.75rem;border-top:0.5px solid var(--border)">
          <div class="presence-title">PR snapshot</div>
          ${buildPRSnapshot()}
        </div>
      </div>
    </div>
  `;

  // Start live-event simulator
  startFeedSimulator();
}

/* ── Single activity item ── */
function buildActivityItem(evt) {
  const isString  = typeof evt.avatar === 'string' && evt.avatar.length <= 2;
  const avatarContent = isString && evt.avatar.match(/[^\x00-\x7F]/)
    ? evt.avatar   // emoji
    : `<span>${escapeHtml(evt.avatar)}</span>`;

  const timeLabel  = formatActivityTime(evt.timestamp);

  return `
    <div class="activity-item" id="act-${evt.id}">
      <div style="display:flex;flex-direction:column;align-items:center;gap:0">
        <div class="activity-avatar" style="background:${evt.avatarBg}" aria-hidden="true">
          ${avatarContent}
        </div>
        <div class="activity-icon-badge" style="border-color:${evt.iconColor || 'var(--border)'}">
          <i class="ti ${evt.icon}" style="color:${evt.iconColor || 'var(--text-muted)'}" aria-hidden="true"></i>
        </div>
      </div>
      <div class="activity-content">
        <div class="activity-msg">
          <strong>${escapeHtml(evt.actor)}</strong> — ${escapeHtml(evt.message)}
        </div>
        ${evt.detail ? `<div class="activity-detail">${escapeHtml(evt.detail)}</div>` : ''}
        <div class="activity-time">${timeLabel}</div>
      </div>
    </div>`;
}

/* ── Presence user row ── */
function buildPresenceUser(collab) {
  const dotClass = collab.status === 'reviewing'  ? 'reviewing'
                 : collab.status === 'commenting' ? 'commenting'
                 : 'idle';
  const statusLabel = collab.status === 'reviewing'  ? '👀 Reviewing'
                    : collab.status === 'commenting' ? '✍️ Commenting'
                    : '💤 Idle';
  return `
    <div class="presence-user">
      <div class="presence-avatar" style="background:${collab.color}">
        ${escapeHtml(collab.avatar)}
        <div class="presence-dot ${dotClass}" title="${collab.status}"></div>
      </div>
      <div>
        <div class="presence-name">${escapeHtml(collab.name)}</div>
        <div class="presence-status">${statusLabel}</div>
      </div>
    </div>`;
}

/* ── PR snapshot mini-stats ── */
function buildPRSnapshot() {
  const counts = countByType();
  return `
    <div style="display:flex;flex-direction:column;gap:4px">
      ${[
        ['Health score', '62/100', 'var(--bug)'],
        ['Files changed','12',     'var(--text)'],
        ['Bugs',         counts.bug,      'var(--bug)'],
        ['Security',     counts.security, 'var(--sec)'],
        ['Perf issues',  counts.performance,'var(--perf)'],
        ['Open comments','3',      'var(--smell)'],
      ].map(([l,v,c]) => `
        <div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0">
          <span style="color:var(--text-muted)">${l}</span>
          <span style="font-weight:700;color:${c}">${v}</span>
        </div>`).join('')}
    </div>`;
}

/* ── Simulated live events ── */
const SIMULATED_EVENTS = [
  {
    actor:'priya.nair', avatar:'PN', avatarBg:'#1D9E75',
    message:'Left a review comment on orderService.js',
    detail:'"The N+1 fix with eager loading looks correct — good improvement!"',
    icon:'ti-message-circle', iconColor:'var(--ok)', type:'comment',
  },
  {
    actor:'CodeLens AI', avatar:'🤖', avatarBg:'#534AB7',
    message:'Score updated after latest push',
    detail:'62 → 74/100 · null pointer fixed · 1 critical remaining',
    icon:'ti-chart-line', iconColor:'var(--smell-dark)', type:'score_update',
  },
  {
    actor:'john.doe', avatar:'JD', avatarBg:'#BA7517',
    message:'Approved the SQL injection fix',
    detail:'"Parameterised query is the right approach here."',
    icon:'ti-thumb-up', iconColor:'var(--ok)', type:'approval',
  },
  {
    actor:'CI Pipeline', avatar:'⚙️', avatarBg:'#7F77DD',
    message:'Re-analysis triggered — processing',
    detail:'5 agents running on commit b7d1f3e',
    icon:'ti-loader-2', iconColor:'var(--smell)', type:'review_started',
  },
];

let _simIdx = 0;

function startFeedSimulator() {
  _feedInterval = setInterval(() => {
    const template = SIMULATED_EVENTS[_simIdx % SIMULATED_EVENTS.length];
    _simIdx++;

    const newEvt = {
      ...template,
      id       : 'act-sim-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    _feedEvents.push(newEvt);

    const list = document.getElementById('activity-feed-list');
    if (!list) { clearInterval(_feedInterval); return; }

    // Prepend new item with highlight flash
    const div = document.createElement('div');
    div.innerHTML = buildActivityItem(newEvt);
    const item = div.firstElementChild;
    item.style.background = 'var(--smell-bg)';
    item.style.borderRadius = 'var(--rad)';
    list.prepend(item);
    setTimeout(() => { item.style.background = ''; item.style.transition = 'background .6s'; }, 800);

    // Show toast for important events
    if (newEvt.type === 'score_update') {
      showToast({ type:'ok', title:'Score updated', desc:newEvt.detail, ms:4000 });
    }
  }, 8000); // new event every 8s
}

/* ── Time formatter ── */
function formatActivityTime(iso) {
  if (!iso) return '';
  try {
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)  return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString();
  } catch { return iso; }
}
