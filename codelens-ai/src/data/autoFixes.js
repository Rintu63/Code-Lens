/* ============================================================
   data/autoFixes.js
   One patch definition per issue id.
   Consumed by AutoFixEngine.js to display one-click fixes.
   ============================================================ */

window.AUTO_FIXES = {
  'bug-001': {
    issueId    : 'bug-001',
    title      : 'Fix null pointer — add optional chaining',
    file       : 'src/api/userController.js',
    risk       : 'safe',          // safe | low | medium | breaking
    scoreGain  : 12,
    before: [
      '  const user = await getUserById(decoded.id);',
      '  const settings = user.profile.settings;',
      '  return res.json({ settings });',
    ],
    after: [
      '  const user = await getUserById(decoded.id);',
      "  if (!user) return res.status(404).json({ error: 'User not found' });",
      '  const settings = user?.profile?.settings ?? {};',
      '  return res.json({ settings });',
    ],
    explanation: 'Adds a 404 guard and optional chaining so null/undefined users never reach the property access.',
  },

  'security-001': {
    issueId    : 'security-001',
    title      : 'Fix SQL injection — use parameterised query',
    file       : 'src/utils/queryBuilder.js',
    risk       : 'safe',
    scoreGain  : 12,
    before: [
      '  const name = req.query.name;',
      "  const sql = `SELECT * FROM users WHERE name = '${name}'`;",
      '  return db.raw(sql);',
    ],
    after: [
      '  const name = req.query.name;',
      "  return db('users').where({ name }).select('*');",
    ],
    explanation: 'Replaces string interpolation with a Knex parameterised query — values are escaped automatically.',
  },

  'performance-001': {
    issueId    : 'performance-001',
    title      : 'Fix N+1 — switch to eager loading',
    file       : 'src/services/orderService.js',
    risk       : 'low',
    scoreGain  : 8,
    before: [
      '  const orders = await Order.findAll();',
      '  for (const order of orders) {',
      '    order.items = await db.items.findAll({ where: { orderId: order.id } });',
      '  }',
    ],
    after: [
      '  const orders = await Order.findAll({',
      '    include: [{ model: Item, as: \'items\' }],',
      '  });',
    ],
    explanation: 'Collapses N+1 DB round-trips into 2 queries using Sequelize eager loading.',
  },

  'performance-002': {
    issueId    : 'performance-002',
    title      : 'Fix blocking I/O — load config at startup',
    file       : 'src/middleware/configLoader.js',
    risk       : 'low',
    scoreGain  : 4,
    before: [
      '  app.use((req, res, next) => {',
      '    const cfg = fs.readFileSync("./config.json", "utf8");',
      '    req.config = JSON.parse(cfg); next();',
      '  });',
    ],
    after: [
      "  // Load once at startup (non-blocking)",
      "  const _config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));",
      '  app.use((req, res, next) => {',
      '    req.config = _config; next();',
      '  });',
    ],
    explanation: 'Moves the file read outside the hot path. Reads once at startup; all requests share the cached value.',
  },

  'performance-003': {
    issueId    : 'performance-003',
    title      : 'Fix missing index on orders.userId',
    file       : 'migrations/20240115_add_orders.js',
    risk       : 'safe',
    scoreGain  : 4,
    before: [
      "  table.integer('userId').unsigned().notNullable();",
      "  table.foreign('userId').references('users.id');",
    ],
    after: [
      "  table.integer('userId').unsigned().notNullable();",
      "  table.foreign('userId').references('users.id');",
      "  table.index('userId'); // ← added index",
    ],
    explanation: 'Adds a B-tree index on userId so JOIN and WHERE lookups stay O(log n) as the table grows.',
  },

  'smell-001': {
    issueId    : 'smell-001',
    title      : 'Extract magic number to SESSION_TTL_SECONDS',
    file       : 'src/auth/session.js',
    risk       : 'safe',
    scoreGain  : 2,
    before: [
      '  const token = jwt.sign(payload, secret, {',
      '    expiresIn: 3600',
      '  });',
    ],
    after: [
      "  const SESSION_TTL_SECONDS = 3600; // 1 hour — import from constants.js",
      '  const token = jwt.sign(payload, secret, {',
      '    expiresIn: SESSION_TTL_SECONDS',
      '  });',
    ],
    explanation: 'Named constant makes intent explicit and ensures all 4 usages are updated from one place.',
  },

  'bug-002': {
    issueId    : 'bug-002',
    title      : 'Fix off-by-one — correct pagination offset',
    file       : 'src/api/listController.js',
    risk       : 'medium',
    scoreGain  : 8,
    before: [
      '  const page = parseInt(req.query.page) || 1;',
      '  const limit = 20;',
      '  const offset = page * limit;',
    ],
    after: [
      '  const page = parseInt(req.query.page) || 1;',
      '  const limit = 20;',
      '  const offset = (page - 1) * limit; // fixed: page 1 → offset 0',
    ],
    explanation: 'Subtracts 1 from page before multiplying so page 1 starts at offset 0, not 20.',
  },
};
