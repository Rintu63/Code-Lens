/* ============================================================
   components/WebhookSimulator.js
   Webhook Simulator panel.
   Displays incoming webhook event log and lets users fire
   a simulated pull_request.opened event to test the pipeline.
   ============================================================ */

/**
 * Render the webhook simulator into #webhook-root.
 */
function renderWebhookSimulator() {
  const root = document.getElementById('webhook-root');
  if (!root) return;

  root.innerHTML = `
    <!-- Toolbar -->
    <div class="webhook-toolbar">
      <div class="webhook-url-box" title="Your CodeLens webhook endpoint">
        <i class="ti ti-link" aria-hidden="true" style="flex-shrink:0"></i>
        <span class="webhook-url-text">https://codelens.ai/webhook/acme-corp/backend</span>
        <button
          style="background:none;border:none;cursor:pointer;color:var(--text-hint);font-size:13px;padding:0"
          onclick="copyWebhookUrl()"
          aria-label="Copy webhook URL"
        >
          <i class="ti ti-clipboard" aria-hidden="true"></i>
        </button>
      </div>

      <button class="btn-fire-webhook" onclick="fireTestWebhook()">
        <i class="ti ti-send" aria-hidden="true"></i> Fire test event
      </button>
    </div>

    <!-- Stats strip -->
    <div style="display:flex;gap:.75rem;margin-bottom:1rem;flex-wrap:wrap">
      ${buildWebhookStat('Received today', '24', 'var(--text)')}
      ${buildWebhookStat('Processed',       '22', 'var(--ok)'  )}
      ${buildWebhookStat('Failed',           '1',  'var(--bug)' )}
      ${buildWebhookStat('Skipped',          '1',  'var(--text-muted)')}
      ${buildWebhookStat('Avg latency',    '1.6s','var(--perf)' )}
    </div>

    <!-- Event list -->
    <div class="issues-title" style="margin-bottom:.75rem">Recent events</div>
    <div id="webhook-event-list" role="list" aria-label="Webhook events">
      ${(window.WEBHOOK_EVENTS || []).map(e => buildWebhookRow(e)).join('')}
    </div>
  `;
}

/* ── Stat pill ── */
function buildWebhookStat(label, value, color) {
  return `
    <div style="background:var(--bg);border:0.5px solid var(--border);border-radius:var(--rad);
                padding:.5rem .85rem;flex:1;min-width:90px">
      <div style="font-size:18px;font-weight:700;color:${color}">${value}</div>
      <div style="font-size:11px;color:var(--text-muted)">${label}</div>
    </div>
  `;
}

/* ── Single event row ── */
function buildWebhookRow(evt) {
  const style = (window.WEBHOOK_STATUS_STYLES || {})[evt.status] || { label: evt.status, cls: 'ws-muted' };
  const pr    = evt.payload?.number ? `PR #${evt.payload.number}` : '';
  const actor = evt.payload?.user?.login ? `@${evt.payload.user.login}` : '';
  const time  = new Date(evt.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const duration = evt.durationMs ? `${evt.durationMs} ms` : '—';

  const iconMap = { opened:'ti-git-pull-request', synchronize:'ti-refresh', submitted:'ti-check', processing:'ti-loader-2' };
  const icon = iconMap[evt.action] || 'ti-webhook';

  return `
    <div class="webhook-event-row" role="listitem" id="wh-${evt.id}">
      <div class="webhook-event-icon">
        <i class="ti ${icon}" aria-hidden="true" style="color:var(--text-muted)"></i>
      </div>

      <div>
        <div class="webhook-event-name">${escapeHtml(evt.event)} · ${escapeHtml(evt.action)}</div>
        <div class="webhook-event-meta">
          ${pr ? `<strong>${pr}</strong> · ` : ''}
          ${actor} · ${time}
          ${evt.error ? `<span style="color:var(--bug)"> · ${escapeHtml(evt.error)}</span>` : ''}
          ${evt.reason ? `<span style="color:var(--text-hint)"> · ${escapeHtml(evt.reason)}</span>` : ''}
        </div>
      </div>

      <span class="ws-badge ${style.cls}">${style.label}</span>

      <div class="webhook-duration">${duration}</div>
    </div>
  `;
}

/**
 * Simulate firing a new PR webhook event.
 */
function fireTestWebhook() {
  const newEvt = {
    id        : 'evt-sim-' + Date.now(),
    event     : 'pull_request',
    action    : 'opened',
    timestamp : new Date().toISOString(),
    status    : 'processing',
    durationMs: null,
    payload   : {
      number : 145,
      title  : 'test: simulated webhook event',
      state  : 'open',
      additions: 12, deletions: 3, changed_files: 2,
      head   : { ref: 'test/webhook-sim', sha: 'abc1234' },
      base   : { ref: 'main', sha: '0b4e22a' },
      user   : { login: 'you' },
    },
  };

  // Prepend to event list in DOM
  const list = document.getElementById('webhook-event-list');
  if (list) {
    const temp = document.createElement('div');
    temp.innerHTML = buildWebhookRow(newEvt);
    list.prepend(temp.firstElementChild);
  }

  showToast({ type:'info', title:'Webhook fired!', desc:'PR #145 · pull_request.opened sent to pipeline.' });

  // Simulate processing → processed after 2.5s
  setTimeout(() => {
    newEvt.status    = 'processed';
    newEvt.durationMs= 1612;
    const row = document.getElementById(`wh-${newEvt.id}`);
    if (row) {
      const temp = document.createElement('div');
      temp.innerHTML = buildWebhookRow(newEvt);
      row.replaceWith(temp.firstElementChild);
    }
    showToast({ type:'ok', title:'Webhook processed', desc:'PR #145 reviewed in 1,612 ms.' });
  }, 2500);
}

/**
 * Copy the webhook URL to clipboard.
 */
async function copyWebhookUrl() {
  const url = 'https://codelens.ai/webhook/acme-corp/backend';
  try {
    await navigator.clipboard.writeText(url);
    showToast({ type:'info', title:'URL copied', desc: url });
  } catch {
    showToast({ type:'bug', title:'Copy failed', desc:'Check browser clipboard permissions.' });
  }
}
