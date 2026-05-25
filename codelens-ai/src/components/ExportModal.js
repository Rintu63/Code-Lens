/* ============================================================
   components/ExportModal.js
   Export Report modal.
   Triggered by the Export button in the header (Part 2).
   Offers Markdown, JSON, and HTML download options.
   ============================================================ */

const EXPORT_OPTIONS = [
  {
    id    : 'markdown',
    icon  : '📝',
    name  : 'Markdown',
    desc  : 'Human-readable report for GitHub wikis, Notion, or Confluence',
    fn    : 'exportMarkdown',
  },
  {
    id    : 'json',
    icon  : '🔧',
    name  : 'JSON',
    desc  : 'Machine-readable payload for CI pipelines and custom integrations',
    fn    : 'exportJSON',
  },
  {
    id    : 'html',
    icon  : '🌐',
    name  : 'HTML Report',
    desc  : 'Standalone styled report to share with stakeholders via email or browser',
    fn    : 'exportHTML',
  },
];

let _selectedExport = 'markdown';

/**
 * Open the export modal.
 */
function openExportModal() {
  // Remove existing modal if any
  const existing = document.getElementById('export-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'export-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Export review report');

  // Click outside to close
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeExportModal();
  });

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">📤 Export Review Report</div>
        <button class="modal-close" onclick="closeExportModal()" aria-label="Close modal">×</button>
      </div>

      <p style="font-size:13px;color:var(--text-muted);margin-bottom:1rem">
        Choose a format for <strong>PR #142</strong> review report (${(window.ISSUES || []).length} issues, score ${computeHealthScore()}/100).
      </p>

      <!-- Export options -->
      <div role="radiogroup" aria-label="Export format">
        ${EXPORT_OPTIONS.map(opt => `
          <div
            class="export-option${opt.id === _selectedExport ? ' selected' : ''}"
            id="export-opt-${opt.id}"
            role="radio"
            aria-checked="${opt.id === _selectedExport}"
            tabindex="0"
            onclick="selectExportOption('${opt.id}')"
            onkeydown="if(event.key==='Enter'||event.key===' ')selectExportOption('${opt.id}')"
          >
            <div class="export-icon">${opt.icon}</div>
            <div>
              <div class="export-name">${opt.name}</div>
              <div class="export-desc">${opt.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="modal-footer">
        <button class="btn-modal-cancel" onclick="closeExportModal()">Cancel</button>
        <button class="btn-modal-export" onclick="confirmExport()">
          <i class="ti ti-download" aria-hidden="true"></i> Download
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  // Focus the modal
  backdrop.querySelector('.modal').focus?.();
}

/**
 * Select an export option.
 */
function selectExportOption(id) {
  _selectedExport = id;
  document.querySelectorAll('.export-option').forEach(el => {
    const isSelected = el.id === `export-opt-${id}`;
    el.classList.toggle('selected', isSelected);
    el.setAttribute('aria-checked', String(isSelected));
  });
}

/**
 * Trigger the chosen export.
 */
function confirmExport() {
  closeExportModal();
  const opt = EXPORT_OPTIONS.find(o => o.id === _selectedExport);
  if (opt && typeof window[opt.fn] === 'function') {
    window[opt.fn]();
  }
}

/**
 * Close and remove the export modal.
 */
function closeExportModal() {
  const backdrop = document.getElementById('export-modal-backdrop');
  if (backdrop) {
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity .15s';
    setTimeout(() => backdrop.remove(), 160);
  }
}
