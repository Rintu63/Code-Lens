/* ============================================================
   components/OwnershipPanel.js
   Code Ownership Map — shows each changed file's owner(s),
   expertise level, review status, and recommends who should
   review based on ownership.
   Reads from window.OWNERSHIP_MAP + window.OWNERSHIP_REVIEWERS.
   ============================================================ */

/**
 * Render the ownership panel into #ownership-root.
 */
function renderOwnershipPanel() {
  const root = document.getElementById('ownership-root');
  if (!root) return;

  const files     = window.OWNERSHIP_MAP       || [];
  const reviewers = window.OWNERSHIP_REVIEWERS || [];

  const needsReview = files.filter(f => f.reviewStatus === 'none' || f.reviewStatus === 'requested').length;
  const totalIssues = files.reduce((s,f) => s + f.issueCount, 0);

  root.innerHTML = `
    <!-- Header -->
    <div class="p3-header">
      <div>
        <div class="p3-title">Code Ownership Map</div>
        <div class="p3-sub">${files.length} files &middot; ${needsReview} awaiting review &middot; ${totalIssues} issues across ownership boundaries</div>
      </div>
    </div>

    <div class="ownership-layout">
      <!-- File list -->
      <div class="ownership-file-list" role="list" aria-label="Changed files with owners">
        ${files.map(f => buildOwnershipRow(f)).join('')}
      </div>

      <!-- Reviewer sidebar -->
      <div class="reviewer-sidebar">
        <div class="reviewer-sidebar-title">Suggested reviewers</div>
        ${reviewers.map(r => buildReviewerRow(r)).join('')}
        <button class="btn-request-review" onclick="requestAllReviewers()">
          <i class="ti ti-send" aria-hidden="true"></i> Request reviews
        </button>
        <div style="margin-top:.85rem;padding-top:.75rem;border-top:0.5px solid var(--border)">
          <div class="reviewer-sidebar-title">Coverage summary</div>
          ${buildCoverageSummary(files)}
        </div>
      </div>
    </div>
  `;
}

/* ── Single file ownership row ── */
function buildOwnershipRow(file) {
  const shortPath  = file.path.replace('src/', '').replace('migrations/', 'migrations/');
  const fileName   = file.path.split('/').pop();

  const statusStyles = {
    requested: { cls:'rs-requested', label:'Requested' },
    reviewed : { cls:'rs-reviewed',  label:'Reviewed'  },
    approved : { cls:'rs-approved',  label:'Approved'  },
    none     : { cls:'rs-none',      label:'Not requested'},
  };
  const ss = statusStyles[file.reviewStatus] || statusStyles.none;

  const expClass = { expert:'exp-expert', familiar:'exp-familiar', unfamiliar:'exp-unfamiliar' }[file.expertise] || 'exp-familiar';

  const avatarColors = {
    'alex.chen':'#534AB7','priya.nair':'#1D9E75',
    'john.doe':'#BA7517','sarah.kim':'#E24B4A','bot-renovate':'#7F77DD',
  };

  const ownerAvatars = file.owners.map(o => {
    const initials = o.split('.').map(p => p[0].toUpperCase()).join('');
    const color    = avatarColors[o] || '#888';
    return `<div class="ownership-avatar-sm" style="background:${color}" title="${o}">${initials}</div>`;
  }).join('');

  const issueIndicator = file.issueCount > 0
    ? `<span style="font-size:10px;color:var(--bug);font-weight:700">⚑ ${file.issueCount}</span>`
    : `<span style="font-size:10px;color:var(--ok)">✓</span>`;

  return `
    <div class="ownership-row" role="listitem"
         style="border-left:3px solid ${file.ownerColor}"
         aria-label="${fileName}, owner: ${file.primaryOwner}">
      <!-- File info -->
      <div>
        <div class="ownership-file-name" title="${file.path}">${escapeHtml(shortPath)}</div>
        <div class="ownership-file-sub">${file.linesOwned} LOC &middot; last modified ${file.lastModified}</div>
      </div>

      <!-- Owner avatars -->
      <div class="ownership-avatars">${ownerAvatars}</div>

      <!-- Expertise -->
      <span class="expertise-badge ${expClass}">${file.expertise}</span>

      <!-- Review status -->
      <span class="review-status-badge ${ss.cls}">${ss.label}</span>

      <!-- Issue count -->
      ${issueIndicator}
    </div>`;
}

/* ── Reviewer recommendation row ── */
function buildReviewerRow(r) {
  return `
    <div class="reviewer-row">
      <div class="reviewer-avatar-md" style="background:${r.color}">${r.avatar}</div>
      <div style="flex:1;min-width:0">
        <div class="reviewer-name">${r.name}</div>
        <div class="reviewer-exp">${r.expertise}</div>
      </div>
      ${r.recommended ? '<span class="reviewer-rec">⭐ Pick</span>' : ''}
    </div>`;
}

/* ── Coverage summary block ── */
function buildCoverageSummary(files) {
  const approved  = files.filter(f => f.reviewStatus === 'approved').length;
  const reviewed  = files.filter(f => f.reviewStatus === 'reviewed').length;
  const requested = files.filter(f => f.reviewStatus === 'requested').length;
  const none      = files.filter(f => f.reviewStatus === 'none').length;
  const total     = files.length;

  return `
    <div style="display:flex;flex-direction:column;gap:4px">
      ${[
        ['Approved',      approved,  'var(--ok)'        ],
        ['Reviewed',      reviewed,  'var(--smell)'     ],
        ['Requested',     requested, 'var(--perf)'      ],
        ['Not requested', none,      'var(--text-hint)' ],
      ].map(([l,v,c]) => `
        <div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0">
          <span style="color:var(--text-muted)">${l}</span>
          <span style="font-weight:700;color:${c}">${v}/${total}</span>
        </div>`).join('')}
      <div style="margin-top:6px;height:5px;background:var(--bg-3);border-radius:3px;overflow:hidden;display:flex">
        ${[
          [approved,'var(--ok)'],
          [reviewed,'var(--smell)'],
          [requested,'var(--perf)'],
          [none,'var(--border-2)'],
        ].map(([v,c]) => `<div style="flex:${v};background:${c};transition:flex .5s"></div>`).join('')}
      </div>
    </div>`;
}

/* ── Request reviews from all recommended reviewers ── */
function requestAllReviewers() {
  const recommended = (window.OWNERSHIP_REVIEWERS || []).filter(r => r.recommended);
  const names = recommended.map(r => r.name).join(', ');
  showToast({ type:'ok', title:'Reviews requested', desc:`Notified: ${names}`, ms:5000 });
  // Update statuses in memory
  (window.OWNERSHIP_MAP || []).forEach(f => {
    if (f.reviewStatus === 'none') f.reviewStatus = 'requested';
  });
  renderOwnershipPanel();
}