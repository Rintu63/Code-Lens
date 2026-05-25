/* ============================================================
   data/snoozeData.js
   Snooze & Remind system data.
   Tracks which issues/tasks have been snoozed, until when,
   and the reason. Consumed by SnoozePanel.js.
   ============================================================ */

window.SNOOZE_ITEMS = [
  {
    id          : 'snz-001',
    issueId     : 'performance-003',
    title       : 'Missing index on orders.userId',
    file        : 'migrations/20240115_add_orders.js',
    severity    : 'medium',
    type        : 'performance',
    snoozedBy   : 'sarah.kim',
    snoozedAt   : '2024-01-15T09:55:00Z',
    remindAt    : '2024-01-17T09:00:00Z',
    reason      : 'Will add in a follow-up migration PR this sprint — low urgency since orders table is small.',
    status      : 'snoozed',    // snoozed | reminded | resolved | dismissed
    remindCount : 0,
  },
  {
    id          : 'snz-002',
    issueId     : 'smell-001',
    title       : 'Magic number 3600 repeated 4×',
    file        : 'src/auth/session.js',
    severity    : 'low',
    type        : 'smell',
    snoozedBy   : 'sarah.kim',
    snoozedAt   : '2024-01-15T10:00:00Z',
    remindAt    : '2024-01-22T09:00:00Z',
    reason      : 'Agreed with team this is low priority. Will create a constants.js refactor ticket.',
    status      : 'snoozed',
    remindCount : 0,
  },
  {
    id          : 'snz-003',
    issueId     : 'performance-002',
    title       : 'Synchronous readFileSync blocking event loop',
    file        : 'src/middleware/configLoader.js',
    severity    : 'medium',
    type        : 'performance',
    snoozedBy   : 'john.doe',
    snoozedAt   : '2024-01-14T15:00:00Z',
    remindAt    : '2024-01-15T15:00:00Z',
    reason      : 'Config is only 1 KB and rarely changes — acceptable short-term. Remind me tomorrow.',
    status      : 'reminded',
    remindCount : 1,
  },
];

window.SNOOZE_DURATIONS = [
  { label:'1 hour',    hours:1   },
  { label:'Tomorrow',  hours:24  },
  { label:'3 days',    hours:72  },
  { label:'1 week',    hours:168 },
  { label:'Custom…',   hours:null},
];

window.SNOOZE_STATUS_STYLES = {
  snoozed  : { icon:'ti-clock',        color:'var(--perf)',  bg:'var(--perf-bg)',  label:'Snoozed'   },
  reminded : { icon:'ti-bell-ringing', color:'var(--bug)',   bg:'var(--bug-bg)',   label:'Reminded'  },
  resolved : { icon:'ti-check',        color:'var(--ok)',    bg:'var(--ok-bg)',    label:'Resolved'  },
  dismissed: { icon:'ti-x',           color:'var(--text-hint)',bg:'var(--bg-3)',  label:'Dismissed' },
};