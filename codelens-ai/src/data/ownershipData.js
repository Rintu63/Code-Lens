/* ============================================================
   data/ownershipData.js
   Code Ownership Map data for PR #142.
   Maps each changed file to its primary owner(s), expertise
   level, and whether they've been notified / reviewed.
   Consumed by OwnershipPanel.js.
   ============================================================ */

window.OWNERSHIP_MAP = [
  {
    path        : 'src/api/userController.js',
    owners      : ['sarah.kim', 'alex.chen'],
    primaryOwner: 'alex.chen',
    expertise   : 'expert',      // expert | familiar | unfamiliar
    linesOwned  : 187,
    lastModified: '2024-01-08',
    reviewStatus: 'requested',   // requested | reviewed | approved | none
    issueCount  : 2,
    ownerColor  : '#534AB7',
  },
  {
    path        : 'src/utils/queryBuilder.js',
    owners      : ['john.doe'],
    primaryOwner: 'john.doe',
    expertise   : 'expert',
    linesOwned  : 134,
    lastModified: '2023-12-14',
    reviewStatus: 'reviewed',
    issueCount  : 1,
    ownerColor  : '#BA7517',
  },
  {
    path        : 'src/services/orderService.js',
    owners      : ['priya.nair', 'john.doe'],
    primaryOwner: 'priya.nair',
    expertise   : 'expert',
    linesOwned  : 289,
    lastModified: '2024-01-11',
    reviewStatus: 'none',
    issueCount  : 2,
    ownerColor  : '#1D9E75',
  },
  {
    path        : 'src/middleware/configLoader.js',
    owners      : ['alex.chen'],
    primaryOwner: 'alex.chen',
    expertise   : 'familiar',
    linesOwned  : 67,
    lastModified: '2023-11-22',
    reviewStatus: 'approved',
    issueCount  : 1,
    ownerColor  : '#534AB7',
  },
  {
    path        : 'src/auth/session.js',
    owners      : ['alex.chen', 'sarah.kim'],
    primaryOwner: 'alex.chen',
    expertise   : 'expert',
    linesOwned  : 58,
    lastModified: '2024-01-03',
    reviewStatus: 'requested',
    issueCount  : 1,
    ownerColor  : '#534AB7',
  },
  {
    path        : 'src/api/listController.js',
    owners      : ['sarah.kim'],
    primaryOwner: 'sarah.kim',
    expertise   : 'expert',
    linesOwned  : 112,
    lastModified: '2024-01-15',
    reviewStatus: 'none',
    issueCount  : 1,
    ownerColor  : '#E24B4A',
  },
  {
    path        : 'migrations/20240115_add_orders.js',
    owners      : ['john.doe', 'priya.nair'],
    primaryOwner: 'john.doe',
    expertise   : 'familiar',
    linesOwned  : 24,
    lastModified: '2024-01-15',
    reviewStatus: 'none',
    issueCount  : 1,
    ownerColor  : '#BA7517',
  },
];

window.OWNERSHIP_REVIEWERS = [
  { login:'alex.chen',  name:'Alex Chen',  avatar:'AC', color:'#534AB7', expertise:'Security + Auth expert',  recommended:true  },
  { login:'john.doe',   name:'John Doe',   avatar:'JD', color:'#BA7517', expertise:'DB & query expert',        recommended:true  },
  { login:'priya.nair', name:'Priya Nair', avatar:'PN', color:'#1D9E75', expertise:'Order service owner',      recommended:true  },
  { login:'sarah.kim',  name:'Sarah Kim',  avatar:'SK', color:'#E24B4A', expertise:'PR author',                recommended:false },
];