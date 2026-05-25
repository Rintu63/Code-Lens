/* ============================================================
   data/ruleEngine.js  (Part 3)
   Custom rule definitions for the Rule Engine panel.
   Each rule has: id, name, category, severity, enabled,
   pattern (regex string), message, fixHint, builtIn flag.
   ============================================================ */

window.REVIEW_RULES = [
  /* ── Built-in rules (always present) ── */
  {
    id       : 'rule-001',
    name     : 'No console.log in production',
    category : 'smell',
    severity : 'medium',
    enabled  : true,
    builtIn  : true,
    pattern  : 'console\\.log\\(',
    message  : 'Remove console.log before merging to production.',
    fixHint  : 'Use a structured logger (winston, pino) instead.',
  },
  {
    id       : 'rule-002',
    name     : 'No TODO without ticket reference',
    category : 'smell',
    severity : 'low',
    enabled  : true,
    builtIn  : true,
    pattern  : 'TODO(?!.*PROJ-\\d)',
    message  : 'TODO comments must reference a ticket (e.g. TODO PROJ-123).',
    fixHint  : 'Add the Jira/Linear ticket ID or delete the comment.',
  },
  {
    id       : 'rule-003',
    name     : 'Detect hardcoded secrets',
    category : 'security',
    severity : 'critical',
    enabled  : true,
    builtIn  : true,
    pattern  : '(password|secret|api_key|apikey)\\s*=\\s*["\'][^"\']{6,}',
    message  : 'Possible hardcoded secret detected.',
    fixHint  : 'Move to environment variables or a secrets manager.',
  },
  {
    id       : 'rule-004',
    name     : 'No eval() usage',
    category : 'security',
    severity : 'critical',
    enabled  : true,
    builtIn  : true,
    pattern  : '\\beval\\s*\\(',
    message  : 'eval() is a security risk and performance bottleneck.',
    fixHint  : 'Replace with JSON.parse() or a safer alternative.',
  },
  {
    id       : 'rule-005',
    name     : 'Async functions must have try/catch',
    category : 'bug',
    severity : 'high',
    enabled  : true,
    builtIn  : true,
    pattern  : 'async\\s+function[^{]+\\{(?![^}]*try)',
    message  : 'Async function lacks error handling — unhandled promise rejections crash the process.',
    fixHint  : 'Wrap the body in try/catch or use a global error handler.',
  },
  {
    id       : 'rule-006',
    name     : 'Functions over 50 lines',
    category : 'smell',
    severity : 'low',
    enabled  : false,
    builtIn  : true,
    pattern  : '',   // handled by line-count analysis, not regex
    message  : 'Function exceeds 50 lines — consider splitting.',
    fixHint  : 'Extract logical blocks into smaller named helpers.',
  },

  /* ── Custom team rules (user-created) ── */
  {
    id       : 'rule-custom-001',
    name     : 'Require JSDoc on exported functions',
    category : 'smell',
    severity : 'low',
    enabled  : true,
    builtIn  : false,
    pattern  : 'export\\s+(async\\s+)?function(?!\\s*\\*)[^(]+\\([^)]*\\)\\s*\\{(?!.*\\/\\*\\*)',
    message  : 'Exported function is missing a JSDoc comment.',
    fixHint  : 'Add /** @param ... @returns ... */ above the function.',
  },
  {
    id       : 'rule-custom-002',
    name     : 'No direct res.send with raw DB objects',
    category : 'security',
    severity : 'medium',
    enabled  : true,
    builtIn  : false,
    pattern  : 'res\\.(send|json)\\(\\s*(await\\s+)?\\w+\\.findAll\\(',
    message  : 'Sending raw DB results exposes all fields including sensitive ones.',
    fixHint  : 'Map the result to a DTO before sending.',
  },
];
