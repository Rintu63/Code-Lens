/* ============================================================
   data/customRules.js
   Custom lint / review rules editable in the Rule Manager.
   Each rule has a pattern (regex string), severity, category,
   and an enabled flag. Rules are evaluated against diff lines.
   ============================================================ */

window.CUSTOM_RULES = [
  {
    id         : 'rule-001',
    name       : 'No console.log in production',
    description: 'console.log statements should be removed before merging to main.',
    pattern    : 'console\\.log\\(',
    category   : 'smell',
    severity   : 'low',
    enabled    : true,
    builtIn    : false,
    matchCount : 3,
  },
  {
    id         : 'rule-002',
    name       : 'Detect hardcoded API keys',
    description: 'Strings matching common API key patterns (sk-, pk-, AIza, etc.) are flagged.',
    pattern    : '(sk-|pk-|AIza|AKIA)[A-Za-z0-9]{16,}',
    category   : 'security',
    severity   : 'critical',
    enabled    : true,
    builtIn    : false,
    matchCount : 0,
  },
  {
    id         : 'rule-003',
    name       : 'No TODO/FIXME in diff',
    description: 'New TODO or FIXME comments should not be introduced; use issue tracker instead.',
    pattern    : '(TODO|FIXME|HACK|XXX):?',
    category   : 'smell',
    severity   : 'medium',
    enabled    : true,
    builtIn    : false,
    matchCount : 1,
  },
  {
    id         : 'rule-004',
    name       : 'Require async/await error handling',
    description: 'Async functions must be wrapped in try/catch or use .catch().',
    pattern    : 'await\\s+\\w+(?!\\.catch|try)',
    category   : 'bug',
    severity   : 'medium',
    enabled    : false,
    builtIn    : false,
    matchCount : 0,
  },
  {
    id         : 'rule-005',
    name       : 'No eval() usage',
    description: 'eval() is a security risk and performance anti-pattern.',
    pattern    : '\\beval\\s*\\(',
    category   : 'security',
    severity   : 'critical',
    enabled    : true,
    builtIn    : true,
    matchCount : 0,
  },
  {
    id         : 'rule-006',
    name       : 'Enforce === over ==',
    description: 'Use strict equality to avoid type coercion bugs.',
    pattern    : '(?<![=!])={2}(?!=)',
    category   : 'bug',
    severity   : 'low',
    enabled    : true,
    builtIn    : true,
    matchCount : 2,
  },
];

/** Rule category options */
window.RULE_CATEGORIES = [
  { value: 'bug',         label: 'Bug' },
  { value: 'security',    label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'smell',       label: 'Code Smell' },
];

/** Rule severity options */
window.RULE_SEVERITIES = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High'     },
  { value: 'medium',   label: 'Medium'   },
  { value: 'low',      label: 'Low'      },
];
