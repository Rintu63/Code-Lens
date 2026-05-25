/* ============================================================
   utils/reviewRunner.js — Real review pipeline with backend + fallback
   ============================================================ */

const REVIEW_STEPS = [
  'Connecting to CodeLens review service...',
  'Validating input and source type...',
  'Gathering code context...',
  'Running AI review checks...',
  'Generating fixes and severity ranking...',
  'Rendering production-ready review results...',
];

const API_BASE = window.CODE_REVIEW_API_BASE || 'http://localhost:8000';

const DEMO_ISSUES = (window.ISSUES || []).map(issue => ({
  ...issue,
  code: issue.code ? issue.code.map(line => ({ ...line })) : [],
}));

function cloneIssue(issue) {
  return {
    ...issue,
    code: issue.code ? issue.code.map(line => ({ ...line })) : [],
  };
}

function getReviewSource() {
  const uploaded = window.UPLOADED_CODE_SOURCE;
  const inputEl = document.getElementById('pr-url');
  const raw = inputEl ? inputEl.value.trim() : '';

  if (uploaded && uploaded.content) {
    return { source_type: 'uploaded', input: uploaded.content, label: uploaded.name || 'uploaded-code' };
  }

  if (raw) {
    if (/^https?:\/\//i.test(raw) || /^github\.com\//i.test(raw)) {
      return { source_type: 'github', input: raw, label: 'github-pr' };
    }

    if (raw.includes('\n') || /\b(function|class|const|let|var|def|import|from|public|private|if\s*\(|for\s*\(|while\s*\(|SELECT|INSERT|UPDATE|DELETE)\b/.test(raw)) {
      return { source_type: 'pasted', input: raw, label: 'pasted-code' };
    }
  }

  return { source_type: 'github', input: 'github.com/acme-corp/backend/pull/142', label: 'demo-pr' };
}

function buildFallbackCodeSnippet(lines, index, fileName) {
  const start = Math.max(0, index - 1);
  const end = Math.min(lines.length, index + 2);
  return lines.slice(start, end).map((line, offset) => ({
    line: start + offset + 1,
    text: line,
    highlight: start + offset === index,
  }));
}

function localFallbackIssues(sourceType, inputText, label) {
  const lines = inputText.split(/\r?\n/);
  const issues = [];
  const fileName = sourceType === 'github' ? `${label || 'github-patch'}.diff` : `${label || 'uploaded-source'}.txt`;

  function addIssue(issue) {
    const existing = issues.some(i => i.title === issue.title && i.file === issue.file && i.line === issue.line);
    if (!existing) issues.push(issue);
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (/\beval\s*\(|\bnew Function\s*\(/.test(trimmed)) {
      addIssue({
        id: `fallback-security-${idx}`,
        type: 'security',
        sev: 'critical',
        title: 'Dangerous dynamic code execution',
        desc: 'Dynamic evaluation can execute arbitrary code and is unsafe when user-controlled input is involved.',
        file: fileName,
        line: idx + 1,
        code: buildFallbackCodeSnippet(lines, idx, fileName),
        fix: 'Replace eval/new Function with explicit parsing logic or a safe whitelist-based parser.',
      });
    }

    if (/\binnerHTML\b\s*=|document\.write\s*\(/.test(trimmed)) {
      addIssue({
        id: `fallback-xss-${idx}`,
        type: 'security',
        sev: 'critical',
        title: 'Unsafe DOM injection path',
        desc: 'Writing untrusted HTML directly into the DOM can expose the app to cross-site scripting.',
        file: fileName,
        line: idx + 1,
        code: buildFallbackCodeSnippet(lines, idx, fileName),
        fix: 'Escape or sanitize untrusted input before writing it to the DOM and prefer textContent when possible.',
      });
    }

    if (/(readFileSync|openSync)\s*\(/.test(trimmed)) {
      addIssue({
        id: `fallback-performance-${idx}`,
        type: 'performance',
        sev: 'high',
        title: 'Blocking synchronous file I/O',
        desc: 'Synchronous file operations block the event loop and reduce throughput under load.',
        file: fileName,
        line: idx + 1,
        code: buildFallbackCodeSnippet(lines, idx, fileName),
        fix: 'Use async file APIs or load the data once at startup instead of reading it synchronously inside request flow.',
      });
    }

    if (/\bpage\s*\*\s*limit\b|offset\s*=\s*page\s*\*\s*limit/.test(trimmed)) {
      addIssue({
        id: `fallback-pagination-${idx}`,
        type: 'bug',
        sev: 'high',
        title: 'Pagination offset bug',
        desc: 'The offset calculation skips the first page of results, which leads to missing records.',
        file: fileName,
        line: idx + 1,
        code: buildFallbackCodeSnippet(lines, idx, fileName),
        fix: 'Use (page - 1) * limit instead of page * limit.',
      });
    }

    if (/\.profile\./.test(trimmed) && !trimmed.includes('?.profile') && /\buser\b/.test(trimmed)) {
      addIssue({
        id: `fallback-null-${idx}`,
        type: 'bug',
        sev: 'high',
        title: 'Possible null dereference on user profile access',
        desc: 'The code reads nested user fields without checking whether the user object is defined.',
        file: fileName,
        line: idx + 1,
        code: buildFallbackCodeSnippet(lines, idx, fileName),
        fix: 'Guard the user value before reading nested fields or use optional chaining with a safe fallback.',
      });
    }

    if (/\b(3600|86400|604800|1000|60000)\b/.test(trimmed)) {
      addIssue({
        id: `fallback-smell-${idx}`,
        type: 'smell',
        sev: 'low',
        title: 'Magic number should be named constant',
        desc: 'A hard-coded timeout constant makes the code harder to maintain and more error-prone.',
        file: fileName,
        line: idx + 1,
        code: buildFallbackCodeSnippet(lines, idx, fileName),
        fix: 'Replace the raw literal with a named constant such as SESSION_TTL_SECONDS or MAX_RETRY_DELAY.',
      });
    }
  });

  return issues;
}

function normalizeIssue(issue, fallbackFile) {
  const code = Array.isArray(issue.code)
    ? issue.code.map(line => ({
        n: line.line || line.n || 1,
        t: line.text || line.t || '',
        hl: Boolean(line.highlight || line.hl),
      }))
    : [{ n: issue.line || 1, t: '', hl: true }];

  return {
    id: issue.id || `${issue.type}-${fallbackFile}-${issue.line || 1}`,
    type: issue.type || 'smell',
    sev: issue.severity || issue.sev || 'medium',
    title: issue.title || 'Untitled review finding',
    desc: issue.description || issue.desc || 'No description available.',
    file: issue.file || fallbackFile,
    line: issue.line || 1,
    code,
    fix: issue.fix || 'Review the affected code path and add the appropriate guard or refactor.',
  };
}

function normalizeBackendResponse(payload) {
  const issues = Array.isArray(payload?.issues) ? payload.issues : [];
  const fallbackFile = payload?.label || 'reviewed-source';
  return issues.map(issue => normalizeIssue(issue, fallbackFile));
}

async function fetchReviewResult(source) {
  const response = await fetch(`${API_BASE}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_type: source.source_type,
      input: source.input,
      filename: source.source_type === 'uploaded' ? source.label : undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Review service returned ${response.status}`);
  }

  const payload = await response.json();
  return normalizeBackendResponse(payload);
}

function getDemoIssues() {
  return DEMO_ISSUES.map(cloneIssue);
}

async function runReview({ loadingRoot, resultsRoot, btn, onComplete }) {
  resultsRoot.classList.add('hidden');
  loadingRoot.classList.remove('hidden');

  btn.classList.add('loading');
  btn.innerHTML = '<i class="ti ti-loader-2 icon-spin" aria-hidden="true"></i> Scanning...';

  loadingRoot.innerHTML = `
    <div class="loading-wrap">
      <div class="loading-spinner" aria-hidden="true"></div>
      <div class="loading-text">AI agents scanning your code review request…</div>
      <div class="loading-steps" id="step-list">
        ${REVIEW_STEPS.map((s, i) => `<div class="loading-step" id="step-${i}">○ ${s}</div>`).join('')}
      </div>
    </div>
  `;

  const source = getReviewSource();
  let step = 0;
  const interval = setInterval(() => {
    if (step > 0) {
      const prev = document.getElementById(`step-${step - 1}`);
      if (prev) {
        prev.classList.remove('active');
        prev.classList.add('done');
        prev.textContent = '✓ ' + REVIEW_STEPS[step - 1];
      }
    }

    if (step < REVIEW_STEPS.length) {
      const current = document.getElementById(`step-${step}`);
      if (current) {
        current.classList.add('active');
        current.textContent = '▶ ' + REVIEW_STEPS[step];
      }
      step++;
    }
  }, 320);

  try {
    const issues = await fetchReviewResult(source);
    window.ISSUES = issues;
  } catch (error) {
    const fallbackText = source.input || '';
    window.ISSUES = localFallbackIssues(source.source_type, fallbackText, source.label);

    if (source.source_type !== 'github' || fallbackText) {
      showToast({
        type: 'info',
        title: 'Using local fallback review',
        desc: 'The live review service is unavailable, so the app is using a local fast-path analysis.',
        ms: 5500,
      });
    }

    if (source.source_type === 'github' && !fallbackText) {
      window.ISSUES = getDemoIssues();
    }
  } finally {
    clearInterval(interval);
    const stepNodes = document.querySelectorAll('.loading-step');
    stepNodes.forEach(node => {
      node.classList.remove('active');
      node.classList.add('done');
      node.textContent = '✓ ' + node.textContent.replace(/^▶ /, '');
    });

    setTimeout(() => {
      loadingRoot.classList.add('hidden');
      resultsRoot.classList.remove('hidden');
      btn.classList.remove('loading');
      btn.innerHTML = '<i class="ti ti-sparkles" aria-hidden="true"></i> Analyze';

      if (typeof onComplete === 'function') onComplete();
    }, 280);
  }
}
