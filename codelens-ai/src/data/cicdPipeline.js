/* ============================================================
   data/cicdPipeline.js
   CI/CD pipeline status records for PR #142.
   Consumed by CICDPanel.js to render job status cards,
   logs, and gate checks.
   ============================================================ */

window.CICD_PIPELINE = {
  pipelineId : 'pipe-4421',
  branch     : 'feat/user-profile-settings',
  commit     : 'b7d1f3e',
  triggeredAt: '2024-01-15T09:41:10Z',
  status     : 'failed',       // overall: 'running'|'passed'|'failed'|'pending'

  /* ── Gate checks (code-quality gates) ── */
  gates: [
    { name: 'Health score ≥ 70',      status: 'failed',  value: '62/100',  required: true  },
    { name: 'Zero critical issues',    status: 'failed',  value: '2 found', required: true  },
    { name: 'High issues ≤ 2',         status: 'passed',  value: '1/2',     required: true  },
    { name: 'Test coverage ≥ 80%',     status: 'passed',  value: '83%',     required: true  },
    { name: 'No secrets in diff',      status: 'passed',  value: 'Clean',   required: true  },
    { name: 'Lint: zero errors',       status: 'warning', value: '3 warnings', required: false },
    { name: 'Bundle size Δ ≤ 5%',      status: 'passed',  value: '+1.2%',   required: false },
  ],

  /* ── Individual CI jobs ── */
  jobs: [
    {
      id       : 'job-001',
      name     : 'Install dependencies',
      stage    : 'setup',
      status   : 'passed',
      durationS: 18,
      runner   : 'ubuntu-latest',
      logs     : ['npm ci completed', '847 packages installed', 'No vulnerabilities found'],
    },
    {
      id       : 'job-002',
      name     : 'Unit tests',
      stage    : 'test',
      status   : 'passed',
      durationS: 42,
      runner   : 'ubuntu-latest',
      logs     : ['PASS src/__tests__/auth.test.js', 'PASS src/__tests__/orders.test.js', '147 tests passed, 0 failed', 'Coverage: 83.4%'],
    },
    {
      id       : 'job-003',
      name     : 'ESLint',
      stage    : 'lint',
      status   : 'warning',
      durationS: 8,
      runner   : 'ubuntu-latest',
      logs     : ['✖ 3 warnings found', 'src/api/userController.js: no-unused-vars (line 12)', 'src/services/orderService.js: prefer-const (line 44)', 'src/utils/queryBuilder.js: eqeqeq (line 31)'],
    },
    {
      id       : 'job-004',
      name     : 'CodeLens AI Review',
      stage    : 'quality',
      status   : 'failed',
      durationS: 2,
      runner   : 'codelens-agent',
      logs     : ['5 agents initialized', 'Bug Hunter: 2 issues (1 critical)', 'Security Scanner: 1 critical — SQL injection', 'Perf Optimizer: 3 issues', 'Health score: 62 — BELOW threshold of 70', '❌ Gate failed: merge blocked'],
    },
    {
      id       : 'job-005',
      name     : 'Build & bundle',
      stage    : 'build',
      status   : 'skipped',
      durationS: 0,
      runner   : 'ubuntu-latest',
      logs     : ['Skipped: quality gate failed'],
    },
    {
      id       : 'job-006',
      name     : 'Deploy to staging',
      stage    : 'deploy',
      status   : 'skipped',
      durationS: 0,
      runner   : 'ubuntu-latest',
      logs     : ['Skipped: quality gate failed'],
    },
  ],
};

/** Status → display style */
window.JOB_STATUS_STYLES = {
  passed : { icon:'ti-circle-check',   color:'var(--ok)',         label:'Passed'  },
  failed : { icon:'ti-circle-x',       color:'var(--bug)',        label:'Failed'  },
  warning: { icon:'ti-alert-triangle', color:'var(--perf)',       label:'Warning' },
  running: { icon:'ti-loader-2',       color:'var(--smell-dark)', label:'Running' },
  skipped: { icon:'ti-minus-circle',   color:'var(--text-hint)',  label:'Skipped' },
  pending: { icon:'ti-clock',          color:'var(--text-muted)', label:'Pending' },
};
