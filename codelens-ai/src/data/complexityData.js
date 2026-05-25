/* ============================================================
   data/complexityData.js
   Code complexity metrics per file in PR #142.
   Used by HeatmapPanel.js to render the complexity heatmap,
   cyclomatic complexity bars, and function-level breakdown.
   ============================================================ */

window.COMPLEXITY_FILES = [
  {
    path        : 'src/api/userController.js',
    complexity  : 24,   // cyclomatic complexity
    loc         : 187,
    functions   : 8,
    avgFnLength : 23,
    maxNesting  : 5,
    duplication : 12,   // % duplicated lines
    changed     : true, // in this PR diff
    hotspot     : true,
    functions_detail: [
      { name:'getUser',         complexity:8,  loc:42, issues:2 },
      { name:'updateProfile',   complexity:6,  loc:38, issues:1 },
      { name:'deleteAccount',   complexity:5,  loc:31, issues:0 },
      { name:'listSessions',    complexity:3,  loc:24, issues:0 },
      { name:'validatePayload', complexity:2,  loc:18, issues:0 },
    ],
  },
  {
    path        : 'src/utils/queryBuilder.js',
    complexity  : 18,
    loc         : 134,
    functions   : 6,
    avgFnLength : 22,
    maxNesting  : 4,
    duplication : 8,
    changed     : true,
    hotspot     : true,
    functions_detail: [
      { name:'findUserByName',  complexity:7,  loc:28, issues:1 },
      { name:'buildWhereClause',complexity:5,  loc:34, issues:0 },
      { name:'paginate',        complexity:4,  loc:22, issues:1 },
      { name:'sanitize',        complexity:2,  loc:12, issues:0 },
    ],
  },
  {
    path        : 'src/services/orderService.js',
    complexity  : 31,
    loc         : 289,
    functions   : 11,
    avgFnLength : 26,
    maxNesting  : 6,
    duplication : 19,
    changed     : true,
    hotspot     : true,
    functions_detail: [
      { name:'processOrder',    complexity:12, loc:68, issues:2 },
      { name:'calculateTotal',  complexity:8,  loc:44, issues:0 },
      { name:'applyDiscounts',  complexity:6,  loc:38, issues:1 },
      { name:'notifyShipping',  complexity:3,  loc:22, issues:0 },
      { name:'archiveOrder',    complexity:2,  loc:18, issues:0 },
    ],
  },
  {
    path        : 'src/middleware/configLoader.js',
    complexity  : 9,
    loc         : 67,
    functions   : 3,
    avgFnLength : 22,
    maxNesting  : 3,
    duplication : 4,
    changed     : true,
    hotspot     : false,
    functions_detail: [
      { name:'loadConfig',      complexity:5,  loc:32, issues:1 },
      { name:'validateConfig',  complexity:3,  loc:22, issues:0 },
      { name:'mergeDefaults',   complexity:1,  loc:13, issues:0 },
    ],
  },
  {
    path        : 'src/auth/session.js',
    complexity  : 7,
    loc         : 58,
    functions   : 4,
    avgFnLength : 14,
    maxNesting  : 2,
    duplication : 6,
    changed     : true,
    hotspot     : false,
    functions_detail: [
      { name:'createSession',   complexity:3,  loc:22, issues:1 },
      { name:'destroySession',  complexity:2,  loc:16, issues:0 },
      { name:'verifyToken',     complexity:2,  loc:20, issues:0 },
    ],
  },
  {
    path        : 'src/api/listController.js',
    complexity  : 13,
    loc         : 112,
    functions   : 5,
    avgFnLength : 22,
    maxNesting  : 3,
    duplication : 7,
    changed     : true,
    hotspot     : false,
    functions_detail: [
      { name:'listOrders',      complexity:5,  loc:34, issues:1 },
      { name:'listUsers',       complexity:4,  loc:28, issues:0 },
      { name:'search',          complexity:3,  loc:22, issues:0 },
      { name:'paginate',        complexity:1,  loc:12, issues:0 },
    ],
  },
  {
    path        : 'migrations/20240115_add_orders.js',
    complexity  : 3,
    loc         : 24,
    functions   : 2,
    avgFnLength : 12,
    maxNesting  : 1,
    duplication : 0,
    changed     : true,
    hotspot     : false,
    functions_detail: [
      { name:'up',   complexity:2, loc:16, issues:1 },
      { name:'down', complexity:1, loc:8,  issues:0 },
    ],
  },
];

/** Thresholds for colouring the heatmap cells */
window.COMPLEXITY_THRESHOLDS = {
  low    : { max:10, color:'var(--ok)',   bg:'var(--ok-bg)',   label:'Low'      },
  medium : { max:20, color:'var(--perf)', bg:'var(--perf-bg)', label:'Medium'   },
  high   : { max:30, color:'var(--sec)',  bg:'var(--sec-bg)',  label:'High'     },
  critical:{ max:Infinity, color:'var(--bug)', bg:'var(--bug-bg)', label:'Critical' },
};
