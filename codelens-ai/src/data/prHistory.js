/* ============================================================
   data/prHistory.js  (Part 3)
   Historical PR review records used by PRHistory panel
   and the Team Leaderboard.
   ============================================================ */

window.PR_HISTORY = [
  { id:138, title:'feat: JWT refresh token endpoint',   author:'sarah.kim',   score:91, grade:'A', bugs:0, security:0, perf:1, smell:1, files:5,  additions:142, deletions:38,  reviewMs:1420, mergedAt:'2024-01-10', status:'merged'   },
  { id:139, title:'fix: cart total rounding error',     author:'alex.chen',   score:84, grade:'B', bugs:1, security:0, perf:0, smell:2, files:3,  additions:47,  deletions:19,  reviewMs:980,  mergedAt:'2024-01-11', status:'merged'   },
  { id:140, title:'refactor: split UserService',        author:'john.doe',    score:78, grade:'B', bugs:0, security:0, perf:2, smell:3, files:9,  additions:211, deletions:187, reviewMs:2100, mergedAt:'2024-01-12', status:'merged'   },
  { id:141, title:'chore: upgrade express to 4.19',     author:'bot-renovate',score:97, grade:'A', bugs:0, security:0, perf:0, smell:0, files:2,  additions:14,  deletions:14,  reviewMs:610,  mergedAt:'2024-01-13', status:'merged'   },
  { id:142, title:'feat: user profile settings',        author:'sarah.kim',   score:62, grade:'C', bugs:2, security:1, perf:3, smell:1, files:12, additions:312, deletions:87,  reviewMs:1847, mergedAt:null,         status:'open'     },
  { id:143, title:'chore: update dependencies',         author:'bot-renovate',score:0,  grade:'F', bugs:0, security:0, perf:0, smell:0, files:0,  additions:0,   deletions:0,   reviewMs:203,  mergedAt:null,         status:'failed'   },
  { id:144, title:'fix: correct cart total',            author:'alex.chen',   score:88, grade:'B', bugs:1, security:0, perf:1, smell:0, files:3,  additions:48,  deletions:11,  reviewMs:1612, mergedAt:null,         status:'reviewing'},
];

window.TEAM_MEMBERS = [
  { login:'sarah.kim',    name:'Sarah Kim',     avatar:'SK', prs:12, avgScore:81, criticalFixed:8,  reviewTime:1640 },
  { login:'alex.chen',    name:'Alex Chen',     avatar:'AC', prs:9,  avgScore:86, criticalFixed:5,  reviewTime:1290 },
  { login:'john.doe',     name:'John Doe',      avatar:'JD', prs:7,  avgScore:74, criticalFixed:3,  reviewTime:2050 },
  { login:'maya.patel',   name:'Maya Patel',    avatar:'MP', prs:11, avgScore:92, criticalFixed:11, reviewTime:1120 },
  { login:'bot-renovate', name:'Renovate Bot',  avatar:'RB', prs:6,  avgScore:95, criticalFixed:0,  reviewTime:680  },
];
