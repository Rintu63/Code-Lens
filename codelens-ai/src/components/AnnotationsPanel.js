/* ============================================================
   components/AnnotationsPanel.js
   Annotation Pinboard — pin warnings, notes, questions, praise,
   and bookmarks to specific file+line locations in the PR.
   Reads from window.ANNOTATIONS + window.ANNOTATION_TYPE_STYLES.
   ============================================================ */

let _annFilter = 'all';

/**
 * Render the annotations panel into #annotations-root.
 */
function renderAnnotationsPanel() {
  const root  = document.getElementById('annotations-root');
  if (!root) return;

  const anns   = window.ANNOTATIONS || [];
  const styles = window.ANNOTATION_TYPE_STYLES || {};

  const pinned   = anns.filter(a => a.pinned && !a.resolved).length;
  const unresolved = anns.filter(a => !a.resolved).length;

  const filtered = _annFilter === 'all'     ? anns
                 : _annFilter === 'pinned'  ? anns.filter(a => a.pinned)
                 : _annFilter === 'open'    ? anns.filter(a => !a.resolved)
                 : anns.filter(a => a.type === _annFilter);

  root.innerHTML = `
    <!-- Header -->
    <div class="annotation-toolbar">
      <div>
        <div class="p3-title">Annotation Pinboard</div>
        <div class="p3-sub">${anns.length} annotations &middot; ${pinned} pinned &middot; ${unresolved} open</div>
      </div>
      <button class="btn-new-annotation" onclick="openNewAnnotationForm()">
        <i class="ti ti-pin" aria-hidden="true"></i> New pin
      </button>
    </div>

    <!-- Filters -->
    <div class="filter-row" style="margin-bottom:1rem;flex-wrap:wrap">
      ${buildAnnFilter('all',      'All')}
      ${buildAnnFilter('pinned',   '📌 Pinned')}
      ${buildAnnFilter('open',     '🔓 Open')}
      ${buildAnnFilter('warning',  '⚠️ Warning')}
      ${buildAnnFilter('note',     '📝 Note')}
      ${buildAnnFilter('question', '❓ Question')}
      ${buildAnnFilter('praise',   '👍 Praise')}
      ${buildAnnFilter('bookmark', '🔖 Bookmark')}
    </div>

    <!-- New annotation form (injected here) -->
    <div id="ann-form-container"></div>

    <!-- Card grid -->
    <div class="annotation-grid" role="list" aria-label="Code annotations">
      ${filtered.length
        ? filtered.map(a => buildAnnotationCard(a)).join('')
        : `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1">
             No annotations in this filter.
           </div>`}
    </div>
  `;
}

/* ── Filter button ── */
function buildAnnFilter(type, label) {
  const isActive = _annFilter === type;
  const cls = isActive
    ? type === 'all' || type === 'pinned' || type === 'open' ? 'filter-btn f-all'
    : type === 'warning' ? 'filter-btn f-bug'
    : type === 'note'    ? 'filter-btn f-perf'
    : type === 'question'? 'filter-btn f-sec'
    : type === 'praise'  ? 'filter-btn f-all'
    : 'filter-btn f-smell'
    : 'filter-btn';
  return `<button class="${cls}" onclick="setAnnFilter('${type}')">${label}</button>`;
}

function setAnnFilter(type) {
  _annFilter = type;
  renderAnnotationsPanel();
}

/* ── Single annotation card ── */
function buildAnnotationCard(ann) {
  const styles = window.ANNOTATION_TYPE_STYLES || {};
  const st     = styles[ann.type] || { icon:'ti-note', color:'var(--text-muted)', bg:'var(--bg-3)', label:'Note' };

  const isString = typeof ann.avatar === 'string' && ann.avatar.length <= 2;
  const avatarContent = isString && ann.avatar.match(/[^\x00-\x7F]/) ? ann.avatar : escapeHtml(ann.avatar);

  const shortFile = ann.file.split('/').pop();

  return `
    <div class="annotation-card${ann.resolved ? ' resolved' : ''}${ann.pinned ? ' pinned' : ''}"
         id="ann-card-${ann.id}" role="listitem"
         style="border-left:3px solid ${st.color}">

      <!-- Card header -->
      <div class="ann-card-header" style="background:${st.bg}22">
        <i class="ti ${st.icon} ann-type-icon" style="color:${st.color}" aria-hidden="true"></i>
        <div class="ann-title">${escapeHtml(ann.title)}</div>
        ${ann.pinned ? '<i class="ti ti-pin ann-pin-icon" style="color:var(--perf)" aria-hidden="true"></i>' : ''}
      </div>

      <!-- Card body -->
      <div class="ann-card-body">
        <div class="ann-body-text">${escapeHtml(ann.body)}</div>
        ${ann.code
          ? `<div class="ann-code-snippet" title="${escapeHtml(ann.code)}">${escapeHtml(ann.code)}</div>`
          : ''}
        <div class="ann-tags">
          ${ann.tags.map(t => `<span class="ann-tag">#${t}</span>`).join('')}
        </div>
      </div>

      <!-- Card footer -->
      <div class="ann-card-footer">
        <div class="ann-author-avatar" style="background:${ann.color}">${avatarContent}</div>
        <div class="ann-author-name">${ann.author}</div>
        <div class="ann-file-ref">${shortFile}:${ann.line}</div>
        <button class="ann-action-btn" onclick="togglePin('${ann.id}')" title="${ann.pinned ? 'Unpin' : 'Pin'}">
          <i class="ti ti-pin${ann.pinned ? '-filled' : ''}" aria-hidden="true"></i>
        </button>
        <button class="ann-action-btn" onclick="resolveAnnotation('${ann.id}')" title="${ann.resolved ? 'Re-open' : 'Resolve'}">
          <i class="ti ti-check${ann.resolved ? '-circle' : ''}" aria-hidden="true"></i>
        </button>
        <button class="ann-action-btn" onclick="deleteAnnotation('${ann.id}')" title="Delete" style="color:var(--bug)">
          <i class="ti ti-trash" aria-hidden="true"></i>
        </button>
      </div>
    </div>`;
}

/* ── Toggle pin ── */
function togglePin(id) {
  const ann = (window.ANNOTATIONS || []).find(a => a.id === id);
  if (!ann) return;
  ann.pinned = !ann.pinned;
  renderAnnotationsPanel();
  showToast({ type:'info', title: ann.pinned ? 'Pinned' : 'Unpinned', desc: ann.title });
}

/* ── Resolve annotation ── */
function resolveAnnotation(id) {
  const ann = (window.ANNOTATIONS || []).find(a => a.id === id);
  if (!ann) return;
  ann.resolved = !ann.resolved;
  renderAnnotationsPanel();
  showToast({ type: ann.resolved ? 'ok' : 'info', title: ann.resolved ? 'Resolved' : 'Re-opened', desc: ann.title });
}

/* ── Delete annotation ── */
function deleteAnnotation(id) {
  const idx = (window.ANNOTATIONS || []).findIndex(a => a.id === id);
  if (idx === -1) return;
  const title = window.ANNOTATIONS[idx].title;
  window.ANNOTATIONS.splice(idx, 1);
  renderAnnotationsPanel();
  showToast({ type:'info', title:'Annotation deleted', desc: title });
}

/* ── New annotation inline form ── */
function openNewAnnotationForm() {
  const container = document.getElementById('ann-form-container');
  if (!container) return;

  const styles = window.ANNOTATION_TYPE_STYLES || {};
  const typeOpts = Object.entries(styles).map(([k,s]) =>
    `<option value="${k}">${s.label}</option>`).join('');

  container.innerHTML = `
    <div class="rule-form" style="margin-bottom:1rem">
      <div class="rule-form-title">📌 New Annotation</div>
      <div class="rule-form-grid">
        <div class="form-field">
          <label>Type</label>
          <select class="form-select" id="ann-type">${typeOpts}</select>
        </div>
        <div class="form-field">
          <label>File</label>
          <input class="form-input" id="ann-file" type="text" placeholder="src/api/userController.js" value="src/api/userController.js"/>
        </div>
        <div class="form-field" style="grid-column:1/-1">
          <label>Title</label>
          <input class="form-input" id="ann-title" type="text" placeholder="Short summary…"/>
        </div>
        <div class="form-field" style="grid-column:1/-1">
          <label>Body</label>
          <input class="form-input" id="ann-body" type="text" placeholder="Detailed explanation…"/>
        </div>
        <div class="form-field">
          <label>Line number</label>
          <input class="form-input" id="ann-line" type="number" placeholder="47" value="47"/>
        </div>
        <div class="form-field">
          <label>Tags (comma-separated)</label>
          <input class="form-input" id="ann-tags" type="text" placeholder="critical, security"/>
        </div>
      </div>
      <div class="rule-form-actions">
        <button class="btn-modal-cancel" onclick="document.getElementById('ann-form-container').innerHTML=''">Cancel</button>
        <button class="btn-apply-fix" onclick="saveNewAnnotation()">
          <i class="ti ti-pin" aria-hidden="true"></i> Pin annotation
        </button>
      </div>
    </div>`;
}

/* ── Save new annotation ── */
function saveNewAnnotation() {
  const type  = document.getElementById('ann-type')?.value  || 'note';
  const title = document.getElementById('ann-title')?.value.trim();
  const body  = document.getElementById('ann-body')?.value.trim();
  const file  = document.getElementById('ann-file')?.value.trim() || 'unknown';
  const line  = parseInt(document.getElementById('ann-line')?.value) || 1;
  const tags  = (document.getElementById('ann-tags')?.value || '').split(',').map(t=>t.trim()).filter(Boolean);

  if (!title) { showToast({ type:'bug', title:'Title required', desc:'Add a title for your annotation.' }); return; }

  const styles = window.ANNOTATION_TYPE_STYLES || {};
  const st = styles[type] || styles.note;

  window.ANNOTATIONS = window.ANNOTATIONS || [];
  window.ANNOTATIONS.unshift({
    id:'ann-new-'+Date.now(), type, author:'you', avatar:'YO',
    color:'#534AB7', file, line, title, body: body || '',
    code:'', tags, pinned:false, resolved:false, createdAt:new Date().toISOString(),
  });

  document.getElementById('ann-form-container').innerHTML = '';
  renderAnnotationsPanel();
  showToast({ type:'ok', title:'Annotation pinned', desc:title });
}