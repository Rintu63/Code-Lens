/* ============================================================
   data/agents.js — AI agent definitions
   Rendered by AgentsPanel.js
   ============================================================ */

window.AGENTS = [
  {
    icon  : 'ti-bug',
    bgColor: 'var(--bug-bg)',
    iColor : 'var(--bug)',
    name  : 'Bug Hunter',
    desc  : 'Detects logic errors, null dereferences, off-by-ones, and type mismatches via data-flow and AST analysis.',
    stat  : '2 bugs found',
  },
  {
    icon  : 'ti-shield-lock',
    bgColor: 'var(--sec-bg)',
    iColor : 'var(--sec)',
    name  : 'Security Scanner',
    desc  : 'OWASP Top 10, injection attacks, hardcoded secrets, insecure dependencies, broken auth flows.',
    stat  : '1 critical CVE',
  },
  {
    icon  : 'ti-rocket',
    bgColor: 'var(--perf-bg)',
    iColor : 'var(--perf)',
    name  : 'Perf Optimizer',
    desc  : 'N+1 queries, blocking I/O, missing indexes, memory leaks, expensive re-renders and hot paths.',
    stat  : '3 hotspots',
  },
  {
    icon  : 'ti-plant',
    bgColor: 'var(--smell-bg)',
    iColor : 'var(--smell)',
    name  : 'Code Smell Detector',
    desc  : 'Magic numbers, God classes, long methods, duplicated logic, naming convention violations.',
    stat  : '1 smell',
  },
  {
    icon  : 'ti-git-branch',
    bgColor: 'var(--ok-bg)',
    iColor : 'var(--ok)',
    name  : 'Best Practices',
    desc  : 'Enforces team conventions, lint rules, test coverage thresholds, and architectural patterns.',
    stat  : 'All clear',
  },
];
