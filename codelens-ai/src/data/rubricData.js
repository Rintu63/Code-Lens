/* ============================================================
   data/rubricData.js
   PR Review Scoring Rubric data.
   Defines the rubric dimensions, their weights, sub-criteria,
   and the actual scores awarded to PR #142.
   Consumed by RubricPanel.js.
   ============================================================ */

window.RUBRIC_DIMENSIONS = [
  {
    id       : 'correctness',
    label    : 'Correctness',
    icon     : 'ti-bug',
    color    : 'var(--bug)',
    weight   : 30,          // % of total score
    score    : 14,          // actual score out of 30
    maxScore : 30,
    description: 'Logic is sound, no crashes, no off-by-ones, all edge cases handled.',
    criteria : [
      { label:'No null/undefined dereferences',  score:0,  max:8,  status:'fail',    note:'Null pointer at userController.js:47' },
      { label:'Correct boundary conditions',      score:4,  max:8,  status:'partial', note:'Off-by-one in listController.js:33' },
      { label:'Handles all error paths',          score:6,  max:8,  status:'partial', note:'Missing try/catch in 2 async fns' },
      { label:'Return values are consistent',     score:4,  max:6,  status:'partial', note:'Some paths return undefined implicitly' },
    ],
  },
  {
    id       : 'security',
    label    : 'Security',
    icon     : 'ti-shield-lock',
    color    : 'var(--sec)',
    weight   : 25,
    score    : 10,
    maxScore : 25,
    description: 'No injection vulnerabilities, secrets safe, auth enforced, input validated.',
    criteria : [
      { label:'No SQL / NoSQL injection',        score:0,  max:10, status:'fail',    note:'SQL injection at queryBuilder.js:22' },
      { label:'No hardcoded secrets',            score:5,  max:5,  status:'pass',    note:'No secrets found in diff' },
      { label:'Auth & authorisation enforced',   score:3,  max:5,  status:'partial', note:'Token not validated on 1 route' },
      { label:'Input validated & sanitised',     score:2,  max:5,  status:'partial', note:'Partial — name param unvalidated' },
    ],
  },
  {
    id       : 'performance',
    label    : 'Performance',
    icon     : 'ti-rocket',
    color    : 'var(--perf)',
    weight   : 20,
    score    : 10,
    maxScore : 20,
    description: 'No N+1 queries, no blocking I/O, DB indexes present, efficient algorithms.',
    criteria : [
      { label:'No N+1 query patterns',           score:0,  max:6,  status:'fail',    note:'N+1 in orderService.js:89' },
      { label:'No blocking synchronous I/O',     score:2,  max:5,  status:'fail',    note:'readFileSync in configLoader.js:14' },
      { label:'DB indexes on FK columns',        score:2,  max:5,  status:'fail',    note:'Missing index on orders.userId' },
      { label:'Algorithms are O(n) or better',   score:6,  max:4,  status:'pass',    note:'All loops are linear' },
    ],
  },
  {
    id       : 'maintainability',
    label    : 'Maintainability',
    icon     : 'ti-tools',
    color    : 'var(--smell)',
    weight   : 15,
    score    : 10,
    maxScore : 15,
    description: 'Code is readable, DRY, well-named, free of magic numbers.',
    criteria : [
      { label:'No magic numbers',                score:2,  max:4,  status:'partial', note:'3600 repeated 4× (session.js)' },
      { label:'Functions are single-purpose',    score:3,  max:4,  status:'partial', note:'processOrder() does too much' },
      { label:'Consistent naming conventions',   score:4,  max:4,  status:'pass',    note:'camelCase used throughout' },
      { label:'No duplicated logic',             score:1,  max:3,  status:'partial', note:'12% duplication in orderService' },
    ],
  },
  {
    id       : 'testability',
    label    : 'Test Coverage',
    icon     : 'ti-test-pipe',
    color    : 'var(--ok)',
    weight   : 10,
    score    : 8,
    maxScore : 10,
    description: 'New code is covered by unit tests, edge cases tested.',
    criteria : [
      { label:'Unit tests for new functions',    score:4,  max:5,  status:'partial', note:'3 of 5 new functions tested' },
      { label:'Edge cases covered',             score:2,  max:3,  status:'partial', note:'Null inputs not tested' },
      { label:'No regressions introduced',      score:2,  max:2,  status:'pass',    note:'Existing suite passes' },
    ],
  },
];

window.RUBRIC_SUMMARY = {
  totalScore  : 52,    // sum of actual scores
  maxTotal    : 100,   // sum of maxScores
  grade       : 'C',
  verdict     : 'Needs Work',
  verdictColor: 'var(--bug)',
  comment     : 'Two critical blockers (null pointer + SQL injection) prevent merge. Fix these to reach ≥70.',
};