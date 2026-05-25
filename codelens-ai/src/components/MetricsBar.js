/* ============================================================
   components/MetricsBar.js — Summary metric cards row
   ============================================================ */

function renderMetricsBar() {
  // Remove any existing metrics bar before re-rendering
  const existing = document.getElementById('metrics-bar');
  if (existing) existing.remove();

  const counts = countByType();

  const metrics = [
    { label: 'Bugs found',     value: counts.bug,         cls: 'v-bug'   },
    { label: 'Security issues',value: counts.security,    cls: 'v-sec'   },
    { label: 'Perf warnings',  value: counts.performance, cls: 'v-perf'  },
    { label: 'Code smells',    value: counts.smell,       cls: 'v-smell' },
    { label: 'Files reviewed', value: 12,                 cls: 'v-ok'    },
  ];

  const html = `
    <div class="pr-meta" id="metrics-bar" role="list" aria-label="Review summary metrics">
      ${metrics.map(m => `
        <div class="meta-card" role="listitem">
          <div class="meta-label">${m.label}</div>
          <div class="meta-value ${m.cls}">${m.value}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Insert after score section
  const scoreSection = document.querySelector('.score-section');
  if (scoreSection) {
    scoreSection.insertAdjacentHTML('afterend', html);
  } else {
    document.getElementById('results-root').insertAdjacentHTML('beforeend', html);
  }
}
