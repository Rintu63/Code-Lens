/* ============================================================
   components/CICDPanel.js
   CI/CD Status Panel — shows the full pipeline for PR #142:
   overall status header, quality gate checks grid, and
   collapsible job cards with inline log output.
   Reads from window.CICD_PIPELINE and window.JOB_STATUS_STYLES.
   ============================================================ */

/**
 * Render the CI/CD panel into #cicd-root.
 */
function renderCICDPanel() {
  const root = document.getElementById('cicd-root');
  if (!root) return;

  const pipeline = window.CICD_PIPELINE || {};
  const styles   = window.JOB_STATUS_STYLES || {};
  const overall  = styles[pipeline.status] || styles.pending;

  root.innerHTML = `
    <!-- Section header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">CI / CD Pipeline</div>
        <div class="p3-sub">Pipeline ${pipeline.pipelineId} &middot; commit ${pipeline.commit}</div>
      </div>
      <button class="btn-new-rule" onclick="rerunPipeline()" style="background:var(--perf-bg);color:var(--perf-text);border:0.5px solid var(--perf)">
        <i class="ti ti-refresh" aria-hidden="true"></i> Re-run
      </button>
    </div>

    <!-- Pipeline overview card -->
    <div class="cicd-pipeline-header">
      <div class="pipeline-status-dot"
           style="background:${overall.color}${pipeline.status==='running'?';animation:pulse 1.2s infinite':''}"
           aria-hidden="true"></div>
      <div class="pipeline-info">
        <div class="pipeline-title">${escapeHtml(pipeline.branch)}</div>
        <div class="pipeline-meta">
          ${pipeline.commit} &middot; triggered ${formatPipelineTime(pipeline.triggeredAt)}
        </div>
      </div>
      <div class="pipeline-overall"
           style="background:${overall.color}22;color:${overall.color};border:0.5px solid ${overall.color}">
        <i class="ti ${overall.icon}" aria-hidden="true"></i> ${overall.label}
      </div>
    </div>

    <!-- Quality Gate checks -->
    <div class="issues-title" style="margin-bottom:.6rem">
      Quality Gates
      <span style="font-size:12px;font-weight:500;color:var(--text-muted);margin-left:6px">
        (${countPassedGates(pipeline.gates)} / ${(pipeline.gates||[]).length} passed)
      </span>
    </div>
    <div class="gates-grid" role="list" aria-label="Quality gate checks">
      ${(pipeline.gates||[]).map(g => buildGateCard(g)).join('')}
    </div>

    <!-- Job list -->
    <div class="issues-title" style="margin-bottom:.75rem">Pipeline Jobs</div>
    <div class="job-list" role="list" aria-label="CI/CD jobs">
      ${(pipeline.jobs||[]).map(j => buildJobCard(j)).join('')}
    </div>
  `;
}

/* ── Gate card ── */
function buildGateCard(gate) {
  const st = window.JOB_STATUS_STYLES || {};
  const style = st[gate.status] || st.pending;
  return `
    <div class="gate-card" role="listitem"
         style="border-left:3px solid ${style.color}"
         aria-label="${escapeHtml(gate.name)}: ${gate.status}">
      <i class="ti ${style.icon} gate-icon" style="color:${style.color}" aria-hidden="true"></i>
      <div style="flex:1;min-width:0">
        <div class="gate-name">${escapeHtml(gate.name)}</div>
        <div class="gate-required">${gate.required ? 'Required' : 'Optional'}</div>
      </div>
      <div class="gate-value" style="color:${style.color}">${escapeHtml(gate.value)}</div>
    </div>
  `;
}

/* ── Job card ── */
function buildJobCard(job) {
  const st    = window.JOB_STATUS_STYLES || {};
  const style = st[job.status] || st.pending;
  const dur   = job.durationS > 0 ? `${job.durationS}s` : '—';
  const logs  = buildJobLogs(job.logs || [], job.status);

  return `
    <div class="job-card" id="job-card-${job.id}" role="listitem">
      <div class="job-header"
           onclick="toggleJobLogs('${job.id}')"
           aria-expanded="false"
           aria-controls="job-logs-${job.id}">
        <i class="ti ${style.icon} job-status-icon"
           style="color:${style.color}${job.status==='running'?';animation:spin .7s linear infinite':''}"
           aria-hidden="true"></i>
        <div class="job-name">${escapeHtml(job.name)}</div>
        <span class="job-stage">${escapeHtml(job.stage)}</span>
        <div class="job-duration">${dur}</div>
        <i class="ti ti-chevron-down" aria-hidden="true"
           id="job-chev-${job.id}"
           style="color:var(--text-hint);font-size:14px;transition:transform .2s;margin-left:4px"></i>
      </div>
      <div class="job-logs" id="job-logs-${job.id}" aria-label="Logs for ${escapeHtml(job.name)}">
        ${logs}
      </div>
    </div>
  `;
}

/* ── Log lines ── */
function buildJobLogs(lines, jobStatus) {
  return lines.map(line => {
    const cls = line.startsWith('✖') || line.startsWith('❌') || line.toLowerCase().includes('fail') || line.toLowerCase().includes('error')
      ? 'err'
      : line.startsWith('✓') || line.toLowerCase().includes('pass') || line.toLowerCase().includes('no vulner')
      ? 'ok'
      : line.toLowerCase().includes('warn')
      ? 'warn'
      : '';
    return `<div class="log-line ${cls}">${escapeHtml(line)}</div>`;
  }).join('');
}

/* ── Toggle job logs open/closed ── */
function toggleJobLogs(jobId) {
  const logs   = document.getElementById(`job-logs-${jobId}`);
  const chev   = document.getElementById(`job-chev-${jobId}`);
  const header = logs?.previousElementSibling;
  if (!logs) return;
  const isOpen = logs.classList.toggle('open');
  if (chev)   chev.style.transform = isOpen ? 'rotate(180deg)' : '';
  if (header) header.setAttribute('aria-expanded', String(isOpen));
}

/* ── Simulate re-run ── */
function rerunPipeline() {
  showToast({ type:'info', title:'Pipeline re-triggered', desc:'PR #142 · 6 jobs queued on ubuntu-latest' });
}

/* ── Helpers ── */
function countPassedGates(gates) {
  return (gates||[]).filter(g => g.status === 'passed').length;
}

function formatPipelineTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}
