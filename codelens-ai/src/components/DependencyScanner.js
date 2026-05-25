/* ============================================================
   components/DependencyScanner.js
   Dependency Vulnerability Scanner — CVE list with severity
   badges, CVSS scores, collapsible details, and upgrade CTAs.
   Reads from window.VULNERABILITIES + window.VULN_SUMMARY.
   ============================================================ */

/**
 * Render the scanner into #deps-root.
 */
function renderDependencyScanner() {
  const root   = document.getElementById('deps-root');
  if (!root) return;

  const vulns  = window.VULNERABILITIES || [];
  const sum    = window.VULN_SUMMARY    || {};

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">Dependency Vulnerability Scanner</div>
        <div class="p3-sub">
          Last scanned ${formatScanTime(sum.lastScanned)} &middot;
          ${sum.patchable} of ${sum.total} vulnerabilities have patches available
        </div>
      </div>
      <button class="btn-scan" onclick="rescanDependencies()">
        <i class="ti ti-refresh" aria-hidden="true"></i> Re-scan
      </button>
    </div>

    <!-- Summary strip -->
    <div class="vuln-summary-strip">
      ${buildVulnStat('Total',    sum.total,    'var(--text)'  )}
      ${buildVulnStat('Critical', sum.critical, 'var(--bug)'   )}
      ${buildVulnStat('High',     sum.high,     'var(--sec)'   )}
      ${buildVulnStat('Moderate', sum.moderate, 'var(--perf)'  )}
      ${buildVulnStat('Low',      sum.low,      'var(--ok)'    )}
      ${buildVulnStat('Patchable',sum.patchable,'var(--smell)' )}
    </div>

    <!-- Filter bar -->
    <div class="vuln-toolbar">
      <div class="filter-row">
        <button class="filter-btn f-all" onclick="filterVulns('all',this)">All</button>
        <button class="filter-btn"       onclick="filterVulns('critical',this)">Critical</button>
        <button class="filter-btn"       onclick="filterVulns('high',this)">High</button>
        <button class="filter-btn"       onclick="filterVulns('moderate',this)">Moderate</button>
      </div>
      <button class="btn-apply-fix" onclick="upgradeAll()" style="font-size:12px;padding:6px 14px">
        <i class="ti ti-arrow-up" aria-hidden="true"></i> Upgrade all patchable
      </button>
    </div>

    <!-- CVE cards -->
    <div id="vuln-list" role="list" aria-label="Vulnerability list">
      ${vulns.map(v => buildVulnCard(v)).join('')}
    </div>

    <!-- npm command -->
    <div style="background:var(--bg-3);border:0.5px solid var(--border);border-radius:var(--rad);
                padding:.75rem 1rem;margin-top:1rem;font-family:var(--font-mono);font-size:12px;color:var(--text-muted)">
      <span style="color:var(--text-hint);margin-right:8px">$</span>npm audit fix --force
      <button onclick="copyNpmCommand()" style="float:right;background:none;border:none;cursor:pointer;color:var(--text-hint);font-size:13px">
        <i class="ti ti-clipboard" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

/* ── Stat pill ── */
function buildVulnStat(label, val, color) {
  return `
    <div class="vuln-stat">
      <div class="vuln-stat-val" style="color:${color}">${val ?? 0}</div>
      <div class="vuln-stat-lbl">${label}</div>
    </div>`;
}

/* ── Single CVE card ── */
function buildVulnCard(vuln) {
  const styles  = window.VULN_SEVERITY_STYLES || {};
  const st      = styles[vuln.severity] || { color:'var(--text-muted)', bg:'var(--bg-3)', text:'var(--text-muted)' };
  const typeTag = vuln.type === 'direct'
    ? `<span style="font-size:10px;font-weight:700;color:var(--bug);background:var(--bug-bg);padding:1px 6px;border-radius:8px">direct</span>`
    : `<span style="font-size:10px;font-weight:700;color:var(--text-hint);background:var(--bg-3);padding:1px 6px;border-radius:8px">indirect</span>`;

  return `
    <div class="vuln-card" id="vuln-${vuln.id}" role="listitem"
         style="border-left:3px solid ${st.color}">
      <!-- Collapsed header -->
      <div class="vuln-header" onclick="toggleVulnCard('${vuln.id}')">
        <span class="vuln-sev-badge" style="background:${st.bg};color:${st.text}">${capitalize(vuln.severity)}</span>
        <div class="vuln-name">${escapeHtml(vuln.title)}</div>
        <div class="vuln-pkg">${escapeHtml(vuln.package)}@${escapeHtml(vuln.version)}</div>
        ${typeTag}
        <div class="vuln-cvss" title="CVSS score">CVSS ${vuln.cvss}</div>
        <i class="ti ti-chevron-down" id="vuln-chev-${vuln.id}"
           style="color:var(--text-hint);font-size:14px;transition:transform .2s" aria-hidden="true"></i>
      </div>

      <!-- Expanded body -->
      <div class="vuln-body" id="vuln-body-${vuln.id}">
        <p class="vuln-desc">${escapeHtml(vuln.description)}</p>

        <div class="vuln-meta-grid">
          <div class="vuln-meta-item">
            <div class="vuln-meta-key">CVE ID</div>
            <div class="vuln-meta-val">${escapeHtml(vuln.id)}</div>
          </div>
          <div class="vuln-meta-item">
            <div class="vuln-meta-key">Current version</div>
            <div class="vuln-meta-val" style="color:var(--bug)">${escapeHtml(vuln.version)}</div>
          </div>
          <div class="vuln-meta-item">
            <div class="vuln-meta-key">Fix version</div>
            <div class="vuln-meta-val" style="color:var(--ok)">${escapeHtml(vuln.fixVersion)}</div>
          </div>
          <div class="vuln-meta-item">
            <div class="vuln-meta-key">Dependency path</div>
            <div class="vuln-meta-val">${escapeHtml(vuln.path)}</div>
          </div>
        </div>

        <button class="btn-upgrade" onclick="upgradePackage('${vuln.id}','${escapeHtml(vuln.package)}','${escapeHtml(vuln.fixVersion)}')">
          <i class="ti ti-arrow-up" aria-hidden="true"></i>
          Upgrade to ${escapeHtml(vuln.package)}@${escapeHtml(vuln.fixVersion)}
        </button>
      </div>
    </div>`;
}

/* ── Toggle card ── */
function toggleVulnCard(id) {
  const body = document.getElementById(`vuln-body-${id}`);
  const chev = document.getElementById(`vuln-chev-${id}`);
  if (!body) return;
  const isOpen = body.classList.toggle('open');
  if (chev) chev.style.transform = isOpen ? 'rotate(180deg)' : '';
}

/* ── Filter ── */
function filterVulns(sev, btn) {
  document.querySelectorAll('.filter-row .filter-btn').forEach(b => b.className = 'filter-btn');
  const cls = sev === 'all' ? 'f-all' : sev === 'moderate' ? 'f-perf' : sev === 'critical' ? 'f-bug' : 'f-sec';
  btn.className = `filter-btn ${cls}`;
  const vulns    = window.VULNERABILITIES || [];
  const filtered = sev === 'all' ? vulns : vulns.filter(v => v.severity === sev);
  const list     = document.getElementById('vuln-list');
  if (list) list.innerHTML = filtered.length
    ? filtered.map(v => buildVulnCard(v)).join('')
    : `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:13px">No ${sev} vulnerabilities found.</div>`;
}

/* ── Upgrade single package ── */
function upgradePackage(cveId, pkg, fixVer) {
  const card = document.getElementById(`vuln-${cveId}`);
  if (card) { card.style.opacity = '.45'; card.style.pointerEvents = 'none'; }
  showToast({ type:'ok', title:`Upgrading ${pkg}`, desc:`→ ${pkg}@${fixVer} · run npm install to apply` });
}

/* ── Upgrade all ── */
function upgradeAll() {
  (window.VULNERABILITIES || []).forEach(v => upgradePackage(v.id, v.package, v.fixVersion));
  showToast({ type:'ok', title:'All packages queued for upgrade', desc:'Run npm install to apply changes.', ms:6000 });
}

/* ── Re-scan ── */
function rescanDependencies() {
  showToast({ type:'info', title:'Scanning dependencies…', desc:'npm audit + Snyk OSV check running' });
  setTimeout(() => showToast({ type:'ok', title:'Scan complete', desc:'5 vulnerabilities found (same as before).' }), 2200);
}

/* ── Copy npm command ── */
async function copyNpmCommand() {
  try {
    await navigator.clipboard.writeText('npm audit fix --force');
    showToast({ type:'info', title:'Copied', desc:'npm audit fix --force' });
  } catch {
    showToast({ type:'bug', title:'Copy failed', desc:'Check clipboard permissions.' });
  }
}

function formatScanTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
  catch { return iso; }
}
