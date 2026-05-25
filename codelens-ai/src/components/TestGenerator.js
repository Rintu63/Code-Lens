/* ============================================================
   components/TestGenerator.js
   AI Test Generator — select detected issues, choose a test
   framework, and generate targeted unit tests via the
   Anthropic API. Falls back to canned templates offline.
   ============================================================ */

let _testFramework   = 'jest';
let _selectedIssues  = new Set();
let _generatedCode   = '';

/* ── Canned tests per issue type (offline fallback) ── */
const CANNED_TESTS = {
  'bug-001': `// userController.test.js — Null pointer guard
describe('getUser', () => {
  it('returns 404 when user is not found', async () => {
    getUserById.mockResolvedValue(null);
    const res = await request(app)
      .get('/user')
      .set('Authorization', 'Bearer valid_token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('returns settings when user exists', async () => {
    getUserById.mockResolvedValue({
      profile: { settings: { theme: 'dark' } }
    });
    const res = await request(app)
      .get('/user')
      .set('Authorization', 'Bearer valid_token');
    expect(res.status).toBe(200);
    expect(res.body.settings.theme).toBe('dark');
  });

  it('handles missing profile gracefully', async () => {
    getUserById.mockResolvedValue({ profile: null });
    const res = await request(app)
      .get('/user')
      .set('Authorization', 'Bearer valid_token');
    expect(res.status).toBe(200);
    expect(res.body.settings).toEqual({});
  });
});`,

  'security-001': `// queryBuilder.test.js — SQL injection prevention
describe('findUserByName', () => {
  it('rejects SQL injection payload', async () => {
    const malicious = "' OR '1'='1";
    const result = await findUserByName({ query: { name: malicious } });
    expect(result).toHaveLength(0);
  });

  it('sanitises special characters in name', async () => {
    const xss = '<script>alert(1)</script>';
    const result = await findUserByName({ query: { name: xss } });
    expect(result).toHaveLength(0);
  });

  it('returns correct user for valid name', async () => {
    db.mock.users = [{ id: 1, name: 'alice' }];
    const result = await findUserByName({ query: { name: 'alice' } });
    expect(result[0].name).toBe('alice');
  });
});`,

  'bug-002': `// listController.test.js — Pagination offset
describe('calcOffset', () => {
  it('page 1 returns offset 0', () => {
    expect(calcOffset(1, 20)).toBe(0);
  });
  it('page 2 returns offset 20', () => {
    expect(calcOffset(2, 20)).toBe(20);
  });
  it('page 3 returns offset 40', () => {
    expect(calcOffset(3, 20)).toBe(40);
  });
  it('handles custom limit', () => {
    expect(calcOffset(2, 50)).toBe(50);
  });
});`,

  'performance-001': `// orderService.test.js — N+1 query prevention
describe('listOrders', () => {
  it('fetches orders with items in 2 queries (not N+1)', async () => {
    const querySpy = jest.spyOn(db, 'query');
    await listOrders();
    // Eager loading = 1 query for orders + 1 JOIN for items
    expect(querySpy).toHaveBeenCalledTimes(2);
  });

  it('returns orders with items populated', async () => {
    const orders = await listOrders();
    expect(orders[0]).toHaveProperty('items');
    expect(Array.isArray(orders[0].items)).toBe(true);
  });
});`,
};

/**
 * Render the test generator into #testgen-root.
 */
function renderTestGenerator() {
  const root = document.getElementById('testgen-root');
  if (!root) return;

  // Pre-select all issues by default
  if (_selectedIssues.size === 0) {
    (window.ISSUES || []).forEach(i => _selectedIssues.add(i.id));
  }

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">AI Test Generator</div>
        <div class="p3-sub">Generate targeted unit tests for every detected issue</div>
      </div>
    </div>

    <div class="testgen-layout">
      <!-- Left: controls -->
      <div class="testgen-left">

        <!-- Issue picker -->
        <div class="testgen-issue-picker">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:.6rem;letter-spacing:.3px">SELECT ISSUES TO TEST</div>
          ${(window.ISSUES || []).map(issue => buildIssuePickerRow(issue)).join('')}
        </div>

        <!-- Framework selector -->
        <div class="testgen-options">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:.6rem;letter-spacing:.3px">TEST FRAMEWORK</div>
          ${['jest','vitest','mocha'].map(f => `
            <div class="testgen-opt-row">
              <label class="testgen-opt-label" for="tf-${f}">${capitalize(f)}</label>
              <label class="toggle" aria-label="${f}">
                <input type="radio" name="framework" id="tf-${f}" value="${f}"
                       ${_testFramework===f?'checked':''} style="opacity:0;width:0;height:0"
                       onchange="selectFramework('${f}')"/>
                <div class="toggle-track" style="${_testFramework===f?'background:var(--smell-dark)':''}" aria-hidden="true"></div>
              </label>
            </div>`).join('')}

          <div style="margin-top:.75rem;padding-top:.75rem;border-top:0.5px solid var(--border)">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:.6rem;letter-spacing:.3px">OPTIONS</div>
            ${[
              ['Include mocks',   'includeMocks'],
              ['Edge cases',      'edgeCases'],
              ['TypeScript types','typescript'],
            ].map(([l,k]) => `
              <div class="testgen-opt-row">
                <label class="testgen-opt-label" for="to-${k}">${l}</label>
                <label class="toggle">
                  <input type="checkbox" id="to-${k}" checked/>
                  <div class="toggle-track" aria-hidden="true"></div>
                </label>
              </div>`).join('')}
          </div>
        </div>

        <!-- Generate button -->
        <button class="btn-generate-tests" id="btn-generate-tests" onclick="generateTests()">
          <i class="ti ti-sparkles" aria-hidden="true"></i>
          Generate tests with AI
        </button>
      </div>

      <!-- Right: output -->
      <div class="testgen-right">
        <div class="testgen-output">
          <div class="testgen-output-header">
            <span id="testgen-file-label">Output</span>
            <div style="display:flex;gap:6px">
              <button class="btn-copy-fix" onclick="copyGeneratedTests()" style="font-size:11px;padding:3px 10px">
                <i class="ti ti-clipboard" aria-hidden="true"></i> Copy
              </button>
              <button class="btn-copy-fix" onclick="downloadTests()" style="font-size:11px;padding:3px 10px">
                <i class="ti ti-download" aria-hidden="true"></i> Download
              </button>
            </div>
          </div>
          <div id="testgen-code-area">
            ${_generatedCode
              ? `<pre class="testgen-code">${escapeHtml(_generatedCode)}</pre>`
              : buildTestgenPlaceholder()}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ── Issue picker row ── */
function buildIssuePickerRow(issue) {
  const catClass = { bug:'b-bug', security:'b-security', performance:'b-performance', smell:'b-smell' }[issue.type] || '';
  const isChecked = _selectedIssues.has(issue.id);
  return `
    <div class="testgen-issue-item" onclick="toggleTestIssue('${issue.id}')">
      <input type="checkbox" id="ti-${issue.id}" ${isChecked?'checked':''}
             onchange="toggleTestIssue('${issue.id}')" onclick="event.stopPropagation()"/>
      <label class="testgen-issue-label" for="ti-${issue.id}">${escapeHtml(issue.title)}</label>
      <span class="testgen-issue-type issue-badge ${catClass}">${issue.type.toUpperCase()}</span>
    </div>`;
}

/* ── Placeholder state ── */
function buildTestgenPlaceholder() {
  return `
    <div class="testgen-placeholder">
      <i class="ti ti-test-pipe" style="font-size:32px;color:var(--border-2)" aria-hidden="true"></i>
      <span>Select issues and click <strong>Generate tests</strong></span>
      <span style="font-size:11px;color:var(--text-hint)">${_selectedIssues.size} issues selected &middot; ${_testFramework}</span>
    </div>`;
}

/* ── Toggle issue selection ── */
function toggleTestIssue(id) {
  if (_selectedIssues.has(id)) _selectedIssues.delete(id);
  else _selectedIssues.add(id);
  // Update checkbox state
  const cb = document.getElementById(`ti-${id}`);
  if (cb) cb.checked = _selectedIssues.has(id);
  // Update placeholder count
  const ph = document.querySelector('.testgen-placeholder span:last-child');
  if (ph) ph.textContent = `${_selectedIssues.size} issues selected · ${_testFramework}`;
}

/* ── Select framework ── */
function selectFramework(fw) {
  _testFramework = fw;
  ['jest','vitest','mocha'].forEach(f => {
    const track = document.querySelector(`#tf-${f} + .toggle-track, label[for="tf-${f}"] .toggle-track`);
    // Force re-render of options section to update visuals
  });
  _generatedCode = ''; // Clear so user re-generates
}

/* ── Main generate action ── */
async function generateTests() {
  const btn = document.getElementById('btn-generate-tests');
  if (!btn) return;

  const selected = (window.ISSUES || []).filter(i => _selectedIssues.has(i.id));
  if (!selected.length) {
    showToast({ type:'bug', title:'No issues selected', desc:'Select at least one issue to generate tests for.' });
    return;
  }

  // Loading state
  btn.classList.add('loading');
  btn.innerHTML = '<i class="ti ti-loader-2 icon-spin" aria-hidden="true"></i> Generating…';

  const codeArea = document.getElementById('testgen-code-area');
  if (codeArea) codeArea.innerHTML = buildLoadingTests();

  // Build combined canned code first (instant offline response)
  const cannedParts = selected
    .filter(i => CANNED_TESTS[i.id])
    .map(i => CANNED_TESTS[i.id]);

  if (cannedParts.length) {
    await delay(900 + Math.random() * 600);
    _generatedCode = cannedParts.join('\n\n// ─────────────────────────────────\n\n');
    showGeneratedCode(_generatedCode, selected, false);
    btn.classList.remove('loading');
    btn.innerHTML = '<i class="ti ti-sparkles" aria-hidden="true"></i> Generate tests with AI';
    return;
  }

  // Fallback: call Anthropic API
  try {
    const issueDesc = selected.map(i =>
      `- [${i.type.toUpperCase()}] ${i.title} in ${i.file}:${i.line}\n  Fix: ${i.fix}`
    ).join('\n');

    const prompt = `You are a senior JavaScript test engineer.
Generate ${_testFramework} unit tests for the following code issues found in a PR review:

${issueDesc}

Requirements:
- Use ${_testFramework} syntax
- Include describe/it blocks
- Mock external dependencies
- Cover the happy path AND the edge cases that expose each bug
- Include a comment explaining what each test verifies
- Keep tests concise and focused

Return ONLY the test code, no explanations outside code comments.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        model     : 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages  : [{ role:'user', content: prompt }],
      }),
    });
    const data = await res.json();
    _generatedCode = (data.content || []).map(b => b.text || '').join('').replace(/```(?:js|javascript)?\n?/g,'').trim();
    showGeneratedCode(_generatedCode, selected, true);
  } catch (err) {
    if (codeArea) codeArea.innerHTML = `<div class="testgen-placeholder"><span style="color:var(--bug)">⚠ API error: ${escapeHtml(err.message)}</span></div>`;
  }

  btn.classList.remove('loading');
  btn.innerHTML = '<i class="ti ti-sparkles" aria-hidden="true"></i> Generate tests with AI';
}

/* ── Show generated code ── */
function showGeneratedCode(code, issues, fromApi) {
  const codeArea = document.getElementById('testgen-code-area');
  const label    = document.getElementById('testgen-file-label');
  if (label) label.textContent = `__tests__/pr142.${_testFramework}.test.js`;
  if (codeArea) codeArea.innerHTML = `<pre class="testgen-code">${escapeHtml(code)}</pre>`;
  showToast({
    type : 'ok',
    title: fromApi ? 'Tests generated by AI' : 'Tests generated',
    desc : `${issues.length} issue${issues.length>1?'s':''} covered · ${_testFramework}`,
  });
}

/* ── Loading animation inside output ── */
function buildLoadingTests() {
  return `
    <div class="testgen-placeholder">
      <div class="loading-spinner" style="width:24px;height:24px;margin:0" aria-hidden="true"></div>
      <span>AI is writing your tests…</span>
    </div>`;
}

/* ── Copy generated tests ── */
async function copyGeneratedTests() {
  if (!_generatedCode) {
    showToast({ type:'bug', title:'Nothing to copy', desc:'Generate tests first.' });
    return;
  }
  try {
    await navigator.clipboard.writeText(_generatedCode);
    showToast({ type:'ok', title:'Tests copied', desc:'Paste into your test file.' });
  } catch {
    showToast({ type:'bug', title:'Copy failed', desc:'Check clipboard permissions.' });
  }
}

/* ── Download as .test.js file ── */
function downloadTests() {
  if (!_generatedCode) {
    showToast({ type:'bug', title:'Nothing to download', desc:'Generate tests first.' });
    return;
  }
  downloadFile(`pr142.${_testFramework}.test.js`, _generatedCode, 'text/javascript');
  showToast({ type:'ok', title:'Test file downloaded', desc:`pr142.${_testFramework}.test.js` });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
