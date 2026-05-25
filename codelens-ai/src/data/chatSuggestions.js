/* ============================================================
   data/chatSuggestions.js
   Seed data for the AI Chat Assistant panel (Part 2).
   - QUICK_PROMPTS : one-click suggestion chips shown to the user
   - CANNED_RESPONSES : keyword → response map used by the mock
     AI engine before falling back to the real Anthropic API.
   ============================================================ */

window.QUICK_PROMPTS = [
  { label: '🐛 Explain the null-pointer bug',      text: 'Explain the null pointer bug in userController.js line 47 and show me the safest fix.' },
  { label: '🔒 How to fix SQL injection?',          text: 'How do I fix the SQL injection vulnerability in queryBuilder.js and what are best practices to prevent it?' },
  { label: '⚡ Fix N+1 query problem',              text: 'Show me how to fix the N+1 query problem in orderService.js with a full code example.' },
  { label: '📊 Explain the health score',           text: 'How is the code health score of 62 calculated and what do I need to fix to reach 90+?' },
  { label: '🧪 Generate tests for these issues',    text: 'Write Jest unit tests that would have caught the bugs found in PR #142.' },
  { label: '📋 Summarise review for team Slack',    text: 'Write a concise Slack message summarising the PR #142 review findings for my engineering team.' },
];

/**
 * Keyword-keyed canned responses shown instantly (before API call).
 * Keys are matched with String.includes() (lowercase).
 */
window.CANNED_RESPONSES = {
  'null pointer': `
**Null Pointer Dereference — \`userController.js:47\`**

The crash happens when \`getUserById()\` returns \`null\` or \`undefined\` (expired token, deleted user, etc.) and the code immediately accesses \`.profile.settings\` without a guard.

**Unsafe (current code):**
\`\`\`js
const settings = user.profile.settings;
// TypeError: Cannot read properties of null
\`\`\`

**Safe fix — optional chaining + nullish coalescing:**
\`\`\`js
const user = await getUserById(decoded.id);
if (!user) return res.status(404).json({ error: 'User not found' });
const settings = user?.profile?.settings ?? {};
\`\`\`

**Why this works:**
- \`?.\` short-circuits to \`undefined\` instead of throwing
- \`??\` provides a safe default so downstream code never sees \`undefined\`
- The early 404 guard is cleaner and communicates intent clearly

**Score impact:** Fixing this raises your health score from **62 → 74** (+12 critical).
  `.trim(),

  'sql injection': `
**SQL Injection — \`queryBuilder.js:22\`** (OWASP A03:2021)

String interpolation into raw SQL lets attackers manipulate your query.

**Attack example:**
\`\`\`
GET /users?name=' OR '1'='1
-- Generated SQL:
SELECT * FROM users WHERE name = '' OR '1'='1'
-- Returns ALL users!
\`\`\`

**Unsafe (current code):**
\`\`\`js
const sql = \`SELECT * FROM users WHERE name = '\${name}'\`;
return db.raw(sql);
\`\`\`

**Safe fix — parameterised query (Knex):**
\`\`\`js
return db('users').where({ name }).select('*');
// Knex automatically escapes all values
\`\`\`

**Safe fix — raw with binding:**
\`\`\`js
return db.raw('SELECT * FROM users WHERE name = ?', [name]);
\`\`\`

**Additional hardening:**
- Add input validation (length, allowed chars)
- Use least-privilege DB user (no DROP, no ALTER)
- Enable query logging in production

**Score impact:** Fixing this raises your score from **62 → 74** (+12 critical).
  `.trim(),

  'n+1': `
**N+1 Query Problem — \`orderService.js:89\`**

For every order in the result set, a separate \`SELECT\` is fired to fetch its items. With 100 orders that's **101 database round-trips**.

**Current (N+1):**
\`\`\`js
for (const order of orders) {
  order.items = await db.items.findAll({ where: { orderId: order.id } });
}
// 1 query for orders + N queries for items = N+1 total
\`\`\`

**Fix A — Eager loading (Sequelize):**
\`\`\`js
const orders = await Order.findAll({
  include: [{ model: Item }],   // 2 queries total, always
});
\`\`\`

**Fix B — Manual batch (any ORM):**
\`\`\`js
const orders = await Order.findAll();
const orderIds = orders.map(o => o.id);
const items = await Item.findAll({ where: { orderId: orderIds } });

// Group items by orderId in memory (O(n))
const itemsByOrder = _.groupBy(items, 'orderId');
orders.forEach(o => { o.items = itemsByOrder[o.id] ?? []; });
\`\`\`

**Performance impact:** 101 queries → 2 queries. At p99 latency of 5 ms/query that saves **~495 ms** per request.
  `.trim(),

  'health score': `
**How the Code Health Score is Calculated**

The score starts at **100** and deductions are applied per issue severity:

| Severity | Deduction | Your issues |
|----------|-----------|-------------|
| Critical | −12 pts   | 2 × (null pointer + SQL injection) = −24 |
| High     | −8 pts    | 1 × (N+1 query) = −8                    |
| Medium   | −4 pts    | 2 × (blocking I/O + missing index) = −8 |
| Low      | −2 pts    | 1 × (magic number) = −2                 |

**100 − 24 − 8 − 8 − 2 = 58** → rounded to **62** after partial credit for existing tests.

**Roadmap to A-grade (90+):**
1. Fix both critical issues → +24 pts → score: 86
2. Fix N+1 → +8 pts → score: 94 ✅ Grade A
3. Remaining medium/low issues are optional for merge

The score is recalculated live every time you re-run analysis.
  `.trim(),

  'test': `
**Jest Tests for PR #142 Issues**

\`\`\`js
// __tests__/userController.test.js
describe('getUser', () => {
  it('returns 404 when user is not found', async () => {
    getUserById.mockResolvedValue(null);
    const res = await request(app).get('/user').set('Authorization', 'Bearer valid');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('returns settings when user exists', async () => {
    getUserById.mockResolvedValue({ profile: { settings: { theme: 'dark' } } });
    const res = await request(app).get('/user').set('Authorization', 'Bearer valid');
    expect(res.status).toBe(200);
    expect(res.body.settings.theme).toBe('dark');
  });
});

// __tests__/queryBuilder.test.js
describe('findUserByName', () => {
  it('rejects SQL injection payloads', async () => {
    const malicious = "' OR '1'='1";
    const result = await findUserByName({ query: { name: malicious } });
    expect(result).toHaveLength(0); // no data leak
  });
});

// __tests__/listController.test.js
describe('pagination offset', () => {
  it('page 1 starts at offset 0', () => {
    expect(calcOffset(1, 20)).toBe(0);
  });
  it('page 2 starts at offset 20', () => {
    expect(calcOffset(2, 20)).toBe(20);
  });
});
\`\`\`

Run with: \`npx jest --coverage\`
  `.trim(),

  'slack': `
**Slack message ready to copy:**

---
🤖 **CodeLens AI Review — PR #142** \`acme-corp/backend\`
*Author:* @sarah.kim · *Score:* 62/100 · Grade **C** → needs work before merge

**🔴 Critical (fix before merge)**
• Null pointer dereference \`userController.js:47\` — add \`user?.\` optional chaining
• SQL injection \`queryBuilder.js:22\` — switch to parameterised Knex queries

**🟠 High**
• N+1 queries in \`orderService.js:89\` — use eager loading (\`include: [Item]\`)

**🟡 Medium (can merge, track in backlog)**
• Blocking \`readFileSync\` in middleware
• Missing \`userId\` index on orders table

**✅ Best Practices** — all clear

_Reviewed in 1.8s by 5 AI agents · Fix the 2 criticals to reach score 86+_
---
  `.trim(),
};
