/* ============================================================
   data/diffLines.js — Annotated diff content for Diff View panel
   Each entry: { type: 'added'|'removed'|'neutral'|'comment', sign, text }
   ============================================================ */

window.DIFF_FILES = [
  {
    header: 'src/api/userController.js  ·  +47 −12 lines',
    lines : [
      { type: 'neutral',  sign: '···', text: '// userController.js' },
      { type: 'neutral',  sign: ' ',   text: 'async function getUser(req, res) {' },
      { type: 'neutral',  sign: ' ',   text: '  const token = req.headers.authorization.split(" ")[1];' },
      { type: 'neutral',  sign: ' ',   text: '  const decoded = jwt.verify(token, secret);' },
      { type: 'neutral',  sign: ' ',   text: '  const user = await getUserById(decoded.id);' },
      { type: 'removed',  sign: '-',   text: '  const settings = user.profile.settings;' },
      { type: 'added',    sign: '+',   text: '  const settings = user?.profile?.settings ?? {};' },
      { type: 'neutral',  sign: ' ',   text: '  return res.json({ settings });' },
      { type: 'neutral',  sign: ' ',   text: '}' },
      { type: 'comment',  text: '⚑ AI: Optional chaining added — prevents null-pointer crash at line 47. Consider a 404 guard if getUserById returns null.' },
      { type: 'neutral',  sign: '···', text: '' },
      { type: 'neutral',  sign: ' ',   text: 'async function listOrders(req, res) {' },
      { type: 'removed',  sign: '-',   text: '  for (const order of orders) {' },
      { type: 'removed',  sign: '-',   text: '    order.items = await db.items.findAll({ where: { orderId: order.id }});' },
      { type: 'removed',  sign: '-',   text: '  }' },
      { type: 'added',    sign: '+',   text: '  const orders = await Order.findAll({ include: [{ model: Item }] });' },
      { type: 'neutral',  sign: ' ',   text: '  return res.json(orders);' },
      { type: 'neutral',  sign: ' ',   text: '}' },
      { type: 'comment',  text: '⚑ AI: Replaced N+1 loop with eager loading — reduces 101 queries to 2 for 100 orders.' },
    ],
  },
  {
    header: 'src/utils/queryBuilder.js  ·  +23 −5 lines',
    lines : [
      { type: 'neutral',  sign: '···', text: '// queryBuilder.js' },
      { type: 'neutral',  sign: ' ',   text: 'function findUserByName(req) {' },
      { type: 'neutral',  sign: ' ',   text: '  const name = req.query.name;' },
      { type: 'removed',  sign: '-',   text: "  const sql = `SELECT * FROM users WHERE name = '${name}'`;" },
      { type: 'removed',  sign: '-',   text: '  return db.raw(sql);' },
      { type: 'added',    sign: '+',   text: "  return db.select('*').from('users').where({ name });" },
      { type: 'neutral',  sign: ' ',   text: '}' },
      { type: 'comment',  text: '⚑ AI: String interpolation replaced with parameterized query. Eliminates SQL injection (OWASP A03:2021).' },
    ],
  },
];
