/* ============================================================
   components/TimelinePanel.js — Chronological audit trail
   Reads from window.TIMELINE_EVENTS (data/timeline.js)
   ============================================================ */

/**
 * Render the full timeline into #timeline-root.
 */
function renderTimelinePanel() {
  const root = document.getElementById('timeline-root');
  if (!root) return;

  const events = window.TIMELINE_EVENTS || [];

  root.innerHTML = `
    <div role="list" aria-label="Review audit trail">
      ${events.map((e, i) => buildTimelineItem(e, i === events.length - 1)).join('')}
    </div>
  `;
}

/**
 * Build HTML for a single timeline item.
 * @param {Object} evt       — entry from window.TIMELINE_EVENTS
 * @param {boolean} isLast   — suppress connector line on last item
 * @returns {string}
 */
function buildTimelineItem(evt, isLast) {
  return `
    <div class="tl-item" role="listitem">
      <!-- Left: dot + connector line -->
      <div class="tl-left" aria-hidden="true">
        <div class="tl-dot" style="background:${evt.bgColor}">
          <i class="ti ${evt.icon}" style="color:${evt.iColor};font-size:14px"></i>
        </div>
        ${isLast ? '' : '<div class="tl-line"></div>'}
      </div>

      <!-- Right: content -->
      <div class="tl-content">
        <div class="tl-action">${escapeHtml(evt.action)}</div>
        <div class="tl-detail">${escapeHtml(evt.detail)}</div>
        <div class="tl-time" aria-label="Time: ${evt.time}">
          <i class="ti ti-clock" aria-hidden="true" style="font-size:11px;margin-right:3px"></i>
          ${escapeHtml(evt.time)}
        </div>
      </div>
    </div>
  `;
}
