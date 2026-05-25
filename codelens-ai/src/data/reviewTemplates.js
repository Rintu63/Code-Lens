/* ============================================================
   data/reviewTemplates.js
   PR review comment templates.
   Each template has a category, trigger pattern, and body text
   with {{placeholders}} substituted at render time.
   Consumed by TemplatesPanel.js.
   ============================================================ */

window.REVIEW_TEMPLATES = [
  {
    id       : 'tpl-001',
    name     : 'Null pointer guard',
    category : 'bug',
    tags     : ['null', 'guard', 'optional-chaining'],
    uses     : 47,
    body     :
`**🐛 Null Pointer Risk**

\`{{variable}}\` may be \`null\` or \`undefined\` at line {{line}}.
Accessing \`.{{property}}\` without a guard will throw a \`TypeError\` at runtime.

**Suggested fix:**
\`\`\`js
const {{variable}} = await {{source}};
if (!{{variable}}) return res.status(404).json({ error: '{{entity}} not found' });
const {{result}} = {{variable}}?.{{property}} ?? {};
\`\`\`

**Why this matters:** This will crash in production when {{scenario}}.`,
    variables: ['variable','line','property','source','entity','result','scenario'],
  },
  {
    id       : 'tpl-002',
    name     : 'SQL injection warning',
    category : 'security',
    tags     : ['sql', 'injection', 'owasp'],
    uses     : 31,
    body     :
`**🔒 Security: SQL Injection (OWASP A03:2021)**

String interpolation in SQL queries at line {{line}} allows attackers to inject arbitrary SQL.

**Attack vector:** \`GET {{endpoint}}?{{param}}=' OR '1'='1\`

**Fix — use parameterised queries:**
\`\`\`js
// ❌ Vulnerable
const sql = \`SELECT * FROM {{table}} WHERE {{column}} = '\${{{param}}}'\`;

// ✅ Safe (Knex)
return db('{{table}}').where({ {{column}}: {{param}} }).select('*');
\`\`\`

**References:** [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)`,
    variables: ['line','endpoint','param','table','column'],
  },
  {
    id       : 'tpl-003',
    name     : 'N+1 query pattern',
    category : 'performance',
    tags     : ['n+1', 'query', 'eager-loading'],
    uses     : 38,
    body     :
`**⚡ Performance: N+1 Query Detected**

The loop at line {{line}} fires a separate DB query per \`{{entity}}\`.
With {{count}} records this becomes {{count}}+1 = **{{total}} DB round-trips**.

**Fix — eager loading:**
\`\`\`js
// ❌ N+1
for (const {{item}} of {{collection}}) {
  {{item}}.{{relation}} = await {{RelationModel}}.findAll({ where: { {{fk}}: {{item}}.id } });
}

// ✅ Eager (2 queries always)
const {{collection}} = await {{Model}}.findAll({
  include: [{ model: {{RelationModel}}, as: '{{relation}}' }],
});
\`\`\`

**Estimated impact:** Saves ~{{savings}}ms per request at p99.`,
    variables: ['line','entity','count','total','item','collection','RelationModel','fk','Model','relation','savings'],
  },
  {
    id       : 'tpl-004',
    name     : 'Magic number extraction',
    category : 'smell',
    tags     : ['magic-number', 'constant', 'maintainability'],
    uses     : 22,
    body     :
`**🌱 Code Smell: Magic Number**

The value \`{{value}}\` at line {{line}} is used without explanation.
This number appears {{occurrences}} time(s) across the codebase — a single constant change would need {{occurrences}} edits.

**Fix:**
\`\`\`js
// src/constants.js
export const {{CONSTANT_NAME}} = {{value}}; // {{explanation}}

// Usage
import { {{CONSTANT_NAME}} } from '../constants';
expiresIn: {{CONSTANT_NAME}}
\`\`\``,
    variables: ['value','line','occurrences','CONSTANT_NAME','explanation'],
  },
  {
    id       : 'tpl-005',
    name     : 'Missing error handling',
    category : 'bug',
    tags     : ['async', 'error-handling', 'try-catch'],
    uses     : 19,
    body     :
`**🐛 Missing Error Handling**

The \`async\` function at line {{line}} has no \`try/catch\`.
An unhandled promise rejection from \`{{expression}}\` will crash the request without returning a meaningful HTTP error.

**Fix:**
\`\`\`js
async function {{fnName}}(req, res) {
  try {
    const result = await {{expression}};
    return res.json(result);
  } catch (err) {
    console.error('[{{fnName}}]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
\`\`\``,
    variables: ['line','expression','fnName'],
  },
  {
    id       : 'tpl-006',
    name     : 'Approve with praise',
    category : 'general',
    tags     : ['approval', 'positive', 'feedback'],
    uses     : 64,
    body     :
`**✅ Looks great!**

Clean implementation of {{feature}}. The code is well-structured and the {{aspect}} is handled correctly.

A few minor optional improvements:
- {{suggestion_1}}
- {{suggestion_2}}

**Approving** — feel free to merge once CI is green. 🚀`,
    variables: ['feature','aspect','suggestion_1','suggestion_2'],
  },
];

window.TEMPLATE_CATEGORIES = [
  { value:'all',         label:'All templates' },
  { value:'bug',         label:'Bug'           },
  { value:'security',    label:'Security'      },
  { value:'performance', label:'Performance'   },
  { value:'smell',       label:'Code Smell'    },
  { value:'general',     label:'General'       },
];
