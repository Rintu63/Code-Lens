/* ============================================================
   components/Header.js — App header (Part 1 + Part 2 actions)
   ============================================================ */

function renderHeader() {
  const root = document.getElementById('header-root');
  if (!root) return;

  root.innerHTML = `
    <header class="header" role="banner">
      <div class="header-left">
        <div class="header-logo" aria-hidden="true">
          <img src="/assets/logo.svg" alt="CodeLens logo" />
        </div>
        <div>
          <div class="header-title">CodeLens AI</div>
          <div class="header-subtitle">AI-powered pull request review agent</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">

        <!-- PR info chip -->
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);
                    background:var(--bg-2);border:0.5px solid var(--border);
                    border-radius:20px;padding:4px 10px;display:flex;align-items:center;gap:6px">
          <i class="ti ti-git-pull-request" aria-hidden="true" style="font-size:12px"></i>
          acme-corp/backend #142
        </div>

        <!-- Notification bell -->
        <button
          class="tab"
          style="padding:5px 10px;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center"
          onclick="showSampleNotifications()"
          aria-label="Show notifications"
          title="Notifications"
        >
          <i class="ti ti-bell" aria-hidden="true" style="font-size:16px"></i>
        </button>

        <!-- Agent status -->
        <div class="agent-status" role="status" aria-live="polite">
          <div class="pulse-dot" aria-hidden="true"></div>
          5 agents active
        </div>
      </div>
    </header>
  `;
}

/** Demo: fire a burst of sample toasts to show the notification system */
function showSampleNotifications() {
  const samples = [
    { type:'bug',  title:'Critical bug detected',   desc:'Null pointer at userController.js:47', ms:5000 },
    { type:'sec',  title:'Security vulnerability',  desc:'SQL injection in queryBuilder.js:22',  ms:6500 },
    { type:'ok',   title:'Review complete',          desc:'PR #142 · 7 issues · score 62/100',   ms:8000 },
  ];
  samples.forEach((s, i) => setTimeout(() => showToast(s), i * 600));
}
