/* ============================================================
   data/prComparisons.js
   Historical PR records used by the PR Comparison Engine.
   Each entry mirrors the shape of the current PR #142 so
   ComparePanel.js can render side-by-side diffs of scores,
   issue counts, file changes, and fix rates.
   ============================================================ */

window.PR_HISTORY = [
  {
    id          : 138,
    title       : 'feat: JWT refresh token rotation',
    author      : 'alex.chen',
    branch      : 'feat/jwt-refresh',
    mergedAt    : '2024-01-10T14:22:00Z',
    score       : 91,
    grade       : 'A',
    filesChanged: 8,
    additions   : 201,
    deletions   : 44,
    issues      : { bug: 0, security: 1, performance: 1, smell: 0 },
    agentMs     : 1203,
    approved    : true,
  },
  {
    id          : 139,
    title       : 'fix: correct cart discount rounding',
    author      : 'priya.nair',
    branch      : 'fix/cart-discount',
    mergedAt    : '2024-01-11T09:05:00Z',
    score       : 85,
    grade       : 'B',
    filesChanged: 3,
    additions   : 67,
    deletions   : 18,
    issues      : { bug: 1, security: 0, performance: 0, smell: 2 },
    agentMs     : 984,
    approved    : true,
  },
  {
    id          : 140,
    title       : 'refactor: split UserService into domain modules',
    author      : 'john.doe',
    branch      : 'refactor/user-service',
    mergedAt    : '2024-01-12T16:47:00Z',
    score       : 78,
    grade       : 'B',
    filesChanged: 19,
    additions   : 541,
    deletions   : 298,
    issues      : { bug: 1, security: 0, performance: 2, smell: 3 },
    agentMs     : 2341,
    approved    : true,
  },
  {
    id          : 141,
    title       : 'chore: upgrade Sequelize to v7',
    author      : 'bot-renovate',
    branch      : 'chore/sequelize-v7',
    mergedAt    : '2024-01-13T11:30:00Z',
    score       : 94,
    grade       : 'A',
    filesChanged: 4,
    additions   : 88,
    deletions   : 76,
    issues      : { bug: 0, security: 0, performance: 1, smell: 0 },
    agentMs     : 876,
    approved    : true,
  },
  {
    id          : 142,
    title       : 'feat: user profile settings endpoint',
    author      : 'sarah.kim',
    branch      : 'feat/user-profile-settings',
    mergedAt    : null,   // current — not yet merged
    score       : 62,
    grade       : 'C',
    filesChanged: 12,
    additions   : 312,
    deletions   : 87,
    issues      : { bug: 2, security: 1, performance: 3, smell: 1 },
    agentMs     : 1847,
    approved    : false,
    isCurrent   : true,
  },
];

/** Trend data: one point per recent PR for sparklines */
window.SCORE_TREND = [
  { pr: 135, score: 72 },
  { pr: 136, score: 68 },
  { pr: 137, score: 80 },
  { pr: 138, score: 91 },
  { pr: 139, score: 85 },
  { pr: 140, score: 78 },
  { pr: 141, score: 94 },
  { pr: 142, score: 62 },
];
