/* ============================================================
   utils/keyboardShortcuts.js
   Global keyboard shortcut system.
   Registers hotkeys for tab navigation, actions, and the
   shortcuts overlay. Shows a floating hint in the corner.
   ============================================================ */

const SHORTCUTS = [
  {
    group: 'Navigation',
    items: [
      { keys: ['1'],        action: 'Review panel',       fn: () => switchTab('review')      },
      { keys: ['2'],        action: 'Diff View',          fn: () => switchTab('diff')        },
      { keys: ['3'],        action: 'Analytics',          fn: () => switchTab('stats')       },
      { keys: ['4'],        action: 'Agents',             fn: () => switchTab('agents')      },
      { keys: ['5'],        action: 'Timeline',           fn: () => switchTab('timeline')    },
      { keys: ['6'],        action: 'AI Chat',            fn: () => switchTab('chat')        },
      { keys: ['7'],        action: 'Auto-Fix Engine',    fn: () => switchTab('autofix')     },
      { keys: ['8'],        action: 'CI / CD',            fn: () => switchTab('cicd')        },
      { keys: ['9'],        action: 'Leaderboard',        fn: () => switchTab('leaderboard') },
      { keys: ['0'],        action: 'Settings',           fn: () => switchTab('settings')    },
    ],
  },
  {
    group: 'Actions',
    items: [
      { keys: ['r'],        action: 'Re-run review',      fn: () => handleAnalyze()          },
      { keys: ['e'],        action: 'Export report',      fn: () => openExportModal()        },
      { keys: ['f'],        action: 'Apply all fixes',    fn: () => { switchTab('autofix'); setTimeout(applyAllFixes, 300); } },
      { keys: ['n'],        action: 'New rule',           fn: () => { switchTab('rules'); setTimeout(()=>openRuleForm(null),300); } },
    ],
  },
  {
    group: 'Filters (on Review tab)',
    items: [
      { keys: ['a'],        action: 'Show all issues',    fn: () => filterIssues('all')        },
      { keys: ['b'],        action: 'Filter bugs',        fn: () => filterIssues('bug')        },
      { keys: ['s'],        action: 'Filter security',    fn: () => filterIssues('security')   },
      { keys: ['p'],        action: 'Filter performance', fn: () => filterIssues('performance')},
    ],
  },
  {
    group: 'Global',
    items: [
      { keys: ['?'],        action: 'Show shortcuts',     fn: () => openKbdOverlay()           },
      { keys: ['Escape'],   action: 'Close overlay / modal', fn: () => closeAllOverlays()      },
    ],
  },
];

/**
 * Bootstrap the keyboard shortcut system.
 * Call once from app.js after DOM is ready.
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', handleGlobalKeydown);
  injectShortcutHint();
}

/* ── Global keydown handler ── */
function handleGlobalKeydown(e) {
  // Ignore when typing in inputs / textareas
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  // Ignore modifier combos (Ctrl+S, Cmd+R etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  for (const group of SHORTCUTS) {
    for (const item of group.items) {
      if (item.keys.includes(e.key)) {
        e.preventDefault();
        item.fn();
        return;
      }
    }
  }
}

/* ── Floating hint button ── */
function injectShortcutHint() {
  const hint = document.createElement('button');
  hint.className = 'shortcut-hint';
  hint.setAttribute('aria-label', 'Show keyboard shortcuts');
  hint.innerHTML = '<kbd>?</kbd> Keyboard shortcuts';
  hint.addEventListener('click', openKbdOverlay);
  document.body.appendChild(hint);
}

/* ── Open shortcuts overlay ── */
function openKbdOverlay() {
  if (document.getElementById('kbd-overlay')) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'kbd-backdrop';
  backdrop.id = 'kbd-overlay';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Keyboard shortcuts');

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeKbdOverlay();
  });

  const groupsHtml = SHORTCUTS.map(group => `
    <div class="kbd-group">
      <div class="kbd-group-title">${escapeHtml(group.group)}</div>
      ${group.items.map(item => `
        <div class="kbd-row">
          <span class="kbd-action">${escapeHtml(item.action)}</span>
          <div class="kbd-keys">
            ${item.keys.map(k => `<kbd>${escapeHtml(k)}</kbd>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  backdrop.innerHTML = `
    <div class="kbd-modal">
      <div class="kbd-header">
        <div class="kbd-title">⌨️ Keyboard Shortcuts</div>
        <button class="kbd-close" onclick="closeKbdOverlay()" aria-label="Close">×</button>
      </div>
      ${groupsHtml}
    </div>
  `;

  document.body.appendChild(backdrop);
}

/* ── Close shortcuts overlay ── */
function closeKbdOverlay() {
  const el = document.getElementById('kbd-overlay');
  if (el) el.remove();
}

/* ── Close any open overlay/modal ── */
function closeAllOverlays() {
  closeKbdOverlay();
  closeExportModal();
}
