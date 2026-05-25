/* ============================================================
   utils/toastNotifier.js
   Lightweight toast notification system.
   Usage:
     showToast({ type:'ok', title:'Fixed!', desc:'Patch applied.' });
     showToast({ type:'bug', title:'Error', desc:'Could not apply.' });
   Types: 'ok' | 'bug' | 'sec' | 'info'
   ============================================================ */

(function () {
  const ICONS = {
    ok  : '✅',
    bug : '🐛',
    sec : '🔒',
    info: '💡',
  };

  const AUTO_DISMISS_MS = 4200;

  /** Ensure the container exists */
  function getContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  /**
   * Show a toast notification.
   * @param {Object} opts
   * @param {string} opts.type    — 'ok'|'bug'|'sec'|'info'
   * @param {string} opts.title   — bold heading
   * @param {string} [opts.desc]  — optional detail line
   * @param {number} [opts.ms]    — auto-dismiss delay (default 4200)
   */
  window.showToast = function ({ type = 'info', title, desc = '', ms = AUTO_DISMISS_MS }) {
    const container = getContainer();
    const icon      = ICONS[type] || '💬';

    const toast = document.createElement('div');
    toast.className = `toast t-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
      <div class="toast-icon" aria-hidden="true">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss notification">×</button>
    `;

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

    container.appendChild(toast);

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(toast), ms);

    // Pause timer on hover
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => {
      setTimeout(() => dismiss(toast), 1200);
    });
  };

  function dismiss(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }
})();
