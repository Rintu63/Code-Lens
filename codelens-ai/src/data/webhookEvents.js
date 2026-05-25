/* ============================================================
   data/webhookEvents.js
   Mock GitHub webhook payloads used by WebhookSimulator.js.
   Structure mirrors real GitHub webhook event objects so the
   simulator feels authentic.
   ============================================================ */

window.WEBHOOK_EVENTS = [
  {
    id        : 'evt-001',
    event     : 'pull_request',
    action    : 'opened',
    timestamp : '2024-01-15T09:41:02Z',
    status    : 'processed',
    durationMs: 1847,
    payload   : {
      number     : 142,
      title      : 'feat: add user profile settings endpoint',
      state      : 'open',
      draft      : false,
      additions  : 312,
      deletions  : 87,
      changed_files: 12,
      head       : { ref: 'feat/user-profile-settings', sha: 'a3f9c1d' },
      base       : { ref: 'main', sha: '0b4e22a' },
      user       : { login: 'sarah.kim', avatar_url: '' },
      html_url   : 'https://github.com/acme-corp/backend/pull/142',
    },
  },
  {
    id        : 'evt-002',
    event     : 'pull_request',
    action    : 'synchronize',
    timestamp : '2024-01-15T10:12:44Z',
    status    : 'processed',
    durationMs: 1624,
    payload   : {
      number  : 142,
      title   : 'feat: add user profile settings endpoint',
      state   : 'open',
      head    : { ref: 'feat/user-profile-settings', sha: 'b7d1f3e' },
      base    : { ref: 'main', sha: '0b4e22a' },
      user    : { login: 'sarah.kim' },
    },
  },
  {
    id        : 'evt-003',
    event     : 'pull_request',
    action    : 'opened',
    timestamp : '2024-01-15T11:05:17Z',
    status    : 'failed',
    durationMs: 203,
    error     : 'HMAC signature mismatch — webhook secret may be wrong',
    payload   : {
      number  : 143,
      title   : 'chore: update dependencies',
      state   : 'open',
      head    : { ref: 'chore/deps', sha: 'c2a0b44' },
      base    : { ref: 'main', sha: '0b4e22a' },
      user    : { login: 'bot-renovate' },
    },
  },
  {
    id        : 'evt-004',
    event     : 'pull_request_review',
    action    : 'submitted',
    timestamp : '2024-01-15T11:30:09Z',
    status    : 'skipped',
    reason    : 'Event type not configured for analysis',
    payload   : {
      review  : { state: 'approved', user: { login: 'john.doe' } },
      pull_request: { number: 141 },
    },
  },
  {
    id        : 'evt-005',
    event     : 'pull_request',
    action    : 'opened',
    timestamp : '2024-01-15T14:22:31Z',
    status    : 'processing',
    durationMs: null,
    payload   : {
      number  : 144,
      title   : 'fix: correct cart total calculation',
      state   : 'open',
      additions: 48,
      deletions: 11,
      changed_files: 3,
      head    : { ref: 'fix/cart-total', sha: 'd9e5b12' },
      base    : { ref: 'main', sha: '0b4e22a' },
      user    : { login: 'alex.chen' },
    },
  },
];

/** Status → badge style map */
window.WEBHOOK_STATUS_STYLES = {
  processed : { label: 'Processed', cls: 'ws-ok'         },
  failed    : { label: 'Failed',    cls: 'ws-bug'        },
  skipped   : { label: 'Skipped',  cls: 'ws-muted'      },
  processing: { label: 'Running…', cls: 'ws-processing'  },
};
