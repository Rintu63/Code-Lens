/* ============================================================
   data/vulnerabilities.js
   Dependency vulnerability scan results for PR #142.
   Mirrors the shape of npm audit / Snyk / OSV report data.
   Consumed by DependencyScanner.js.
   ============================================================ */

window.VULNERABILITIES = [
  {
    id          : 'CVE-2023-44270',
    package     : 'postcss',
    version     : '7.0.39',
    fixVersion  : '8.4.31',
    severity    : 'moderate',
    cvss        : 5.3,
    title       : 'PostCSS line return parsing error',
    description : 'PostCSS before 8.4.31 fails to parse CSS with a mix of line terminators, potentially allowing attacker-controlled CSS to bypass security filters.',
    path        : 'autoprefixer > postcss',
    introduced  : 'package.json',
    patchable   : true,
    type        : 'indirect',
  },
  {
    id          : 'CVE-2024-29041',
    package     : 'express',
    version     : '4.18.2',
    fixVersion  : '4.19.2',
    severity    : 'moderate',
    cvss        : 6.1,
    title       : 'Express.js open redirect vulnerability',
    description : 'Express.js 4.x before 4.19.2 allows open redirects via a specially crafted URL passed to res.redirect(), which could enable phishing attacks.',
    path        : 'express',
    introduced  : 'package.json',
    patchable   : true,
    type        : 'direct',
  },
  {
    id          : 'CVE-2024-21538',
    package     : 'cross-spawn',
    version     : '7.0.3',
    fixVersion  : '7.0.6',
    severity    : 'high',
    cvss        : 7.5,
    title       : 'Regular expression denial of service (ReDoS)',
    description : 'cross-spawn before 7.0.6 is vulnerable to ReDoS via a specially crafted path argument that causes catastrophic backtracking.',
    path        : 'jest > cross-spawn',
    introduced  : 'package.json (devDependencies)',
    patchable   : true,
    type        : 'indirect',
  },
  {
    id          : 'CVE-2023-26159',
    package     : 'follow-redirects',
    version     : '1.15.3',
    fixVersion  : '1.15.4',
    severity    : 'moderate',
    cvss        : 6.1,
    title       : 'Improper URL sanitization leading to open redirect',
    description : 'follow-redirects before 1.15.4 fails to properly sanitize URL inputs, allowing attackers to redirect requests to arbitrary hosts.',
    path        : 'axios > follow-redirects',
    introduced  : 'package.json',
    patchable   : true,
    type        : 'indirect',
  },
  {
    id          : 'GHSA-3xgq-45jj-v275',
    package     : 'tough-cookie',
    version     : '2.5.0',
    fixVersion  : '4.1.3',
    severity    : 'critical',
    cvss        : 9.1,
    title       : 'Prototype pollution in tough-cookie',
    description : 'tough-cookie before 4.1.3 allows prototype pollution via the CookieJar, which can be exploited to inject arbitrary properties onto Object.prototype.',
    path        : 'supertest > tough-cookie',
    introduced  : 'package.json (devDependencies)',
    patchable   : true,
    type        : 'indirect',
  },
];

window.VULN_SUMMARY = {
  total      : 5,
  critical   : 1,
  high       : 1,
  moderate   : 3,
  low        : 0,
  patchable  : 5,
  lastScanned: '2024-01-15T09:41:08Z',
};

window.VULN_SEVERITY_STYLES = {
  critical : { color:'var(--bug)',  bg:'var(--bug-bg)',  text:'var(--bug-text)'  },
  high     : { color:'var(--sec)',  bg:'var(--sec-bg)',  text:'var(--sec-text)'  },
  moderate : { color:'var(--perf)', bg:'var(--perf-bg)', text:'var(--perf-text)' },
  low      : { color:'var(--ok)',   bg:'var(--ok-bg)',   text:'var(--ok-text)'   },
};
