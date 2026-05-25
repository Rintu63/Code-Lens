/* ============================================================
   data/patterns.js — Stats panel data: issue patterns & metrics
   ============================================================ */

window.PATTERNS = [
  { label: 'N+1 queries',       count: 38, max: 50, color: 'var(--perf)' },
  { label: 'Null dereference',  count: 31, max: 50, color: 'var(--bug)'  },
  { label: 'Magic numbers',     count: 26, max: 50, color: 'var(--smell)'},
  { label: 'Missing indexes',   count: 22, max: 50, color: 'var(--perf)' },
  { label: 'SQL injection',     count: 18, max: 50, color: 'var(--sec)'  },
  { label: 'Hardcoded secrets', count:  9, max: 50, color: 'var(--sec)'  },
];

window.STATS_METRICS = [
  { label: 'Avg review time', value: '1.8s', cls: 'v-ok'   },
  { label: 'PRs reviewed today', value: '24', cls: 'v-smell'},
  { label: 'Issues caught',   value: '143',  cls: 'v-bug'   },
  { label: 'Auto-fix rate',   value: '71%',  cls: 'v-ok'   },
];
