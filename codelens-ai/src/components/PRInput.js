/* ============================================================
   components/PRInput.js — PR URL input bar + Analyze button
   ============================================================ */

function renderPRInput() {
  const root = document.getElementById('pr-input-root');
  if (!root) return;

  root.innerHTML = `
    <div class="pr-input-card">
      <div class="pr-input-label">PULL REQUEST URL, CODE SNIPPET, OR FILE</div>
      <div class="pr-input-row">
        <input
          class="pr-url-input"
          type="text"
          id="pr-url"
          aria-label="Pull request URL or code snippet"
          placeholder="github.com/org/repo/pull/142 or paste a code snippet…"
          value="github.com/acme-corp/backend/pull/142"
        />
        <button
          class="btn-review"
          id="btn-review"
          aria-label="Start AI code review"
          onclick="handleAnalyze()"
        >
          <i class="ti ti-sparkles" aria-hidden="true"></i> Analyze
        </button>
      </div>
      <div class="pr-input-row" style="margin-top:10px;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div id="upload-status" style="font-size:12px;color:var(--text-muted);flex:1;min-width:220px;">
          Upload a .js, .ts, .py, .java, .go, .rs, or .txt file to scan it for bugs and fix suggestions.
        </div>
        <input
          type="file"
          id="code-file-input"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.cs,.c,.cpp,.h,.hpp,.txt,.md"
          hidden
        />
        <button
          class="fix-btn"
          id="btn-upload-file"
          type="button"
          aria-label="Choose a code file to scan"
        >
          <i class="ti ti-upload" aria-hidden="true"></i> Upload code file
        </button>
      </div>
    </div>
  `;

  const fileInput = document.getElementById('code-file-input');
  const uploadBtn = document.getElementById('btn-upload-file');
  if (fileInput && uploadBtn) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleCodeFileSelection);
  }
}

function handleCodeFileSelection(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  const status = document.getElementById('upload-status');

  if (!file) {
    return;
  }

  if (file.size > 500000) {
    showToast({ type: 'bug', title: 'File too large', desc: 'Please upload a file smaller than 500 KB.' });
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    window.UPLOADED_CODE_SOURCE = {
      name: file.name,
      content: String(reader.result || '').trim(),
    };
    if (status) {
      status.textContent = `Uploaded ${file.name} — ready to scan for bugs and fix suggestions.`;
    }
    showToast({ type: 'ok', title: 'Code file loaded', desc: `${file.name} is ready to review.` });
  };
  reader.onerror = () => {
    showToast({ type: 'bug', title: 'Upload failed', desc: 'The selected file could not be read.' });
    window.UPLOADED_CODE_SOURCE = null;
  };

  reader.readAsText(file);
}

/**
 * Triggered when the Analyze button is clicked.
 * Delegates to reviewRunner then repaints the results.
 */
async function handleAnalyze() {
  const btn         = document.getElementById('btn-review');
  const loadingRoot = document.getElementById('loading-root');
  const resultsRoot = document.getElementById('results-root');

  await runReview({
    btn,
    loadingRoot,
    resultsRoot,
    onComplete: () => {
      const score = computeHealthScore();
      renderScoreCard(score);
      renderMetricsBar();
      renderIssueList('all');
      animateScore(score);
    },
  });
}
