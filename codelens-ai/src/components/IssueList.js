/* ============================================================
   components/IssueList.js — Filter bar + rendered issue cards
   Depends on: IssueCard.js, helpers.js, data/issues.js
   ============================================================ */

/** Currently active filter type */
let _activeFilter = 'all';

const FILTER_OPTIONS = [
  { type: 'all',         label: 'All'         },
  { type: 'bug',         label: 'Bugs'        },
  { type: 'security',    label: 'Security'    },
  { type: 'performance', label: 'Performance' },
  { type: 'smell',       label: 'Smells'      },
];

/**
 * Render the full issue list section (header + filters + cards)
 * into #results-root. Replaces any existing issue list.
 * @param {string} [filterType='all']
 */
function renderIssueList(filterType = 'all') {
  _activeFilter = filterType;

  // Remove old issue list section if present
  const old = document.getElementById('issue-list-section');
  if (old) old.remove();

  const filtered = filterType === 'all'
    ? window.ISSUES
    : window.ISSUES.filter(i => i.type === filterType);

  const filterBtns = FILTER_OPTIONS.map(f => {
    const isActive = f.type === filterType;
    const cls      = isActive ? `filter-btn ${typeToFilterClass(f.type)}` : 'filter-btn';
    return `
      <button
        class="${cls}"
        aria-pressed="${isActive}"
        onclick="filterIssues('${f.type}')"
      >${f.label}</button>
    `;
  }).join('');

  const cardCount = filtered.length;

  const html = `
    <section id="issue-list-section" aria-label="Detected issues">
      <!-- Header row -->
      <div class="issues-header">
        <div class="issues-title">
          Issues detected
          <span style="font-size:12px;font-weight:500;color:var(--text-muted);margin-left:6px">(${cardCount})</span>
        </div>
        <div class="filter-row" role="group" aria-label="Filter by issue type">
          ${filterBtns}
        </div>
      </div>

      <!-- Issue cards -->
      <div id="issues-cards" role="list">
        ${cardCount > 0
          ? filtered.map(issue => buildIssueCard(issue)).join('')
          : `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:13px">
               No issues of this type found.
             </div>`
        }
      </div>
    </section>
  `;

  document.getElementById('results-root').insertAdjacentHTML('beforeend', html);
}

/**
 * Called by filter buttons — re-renders the issue list with new filter.
 * @param {string} type
 */
function filterIssues(type) {
  renderIssueList(type);
}
