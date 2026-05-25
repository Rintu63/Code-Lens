/* ============================================================
   components/AgentsPanel.js — AI Agents panel
   Reads from window.AGENTS (data/agents.js)
   ============================================================ */

/**
 * Render the agents grid into #agents-root.
 */
function renderAgentsPanel() {
  const root = document.getElementById('agents-root');
  if (!root) return;

  const agents = window.AGENTS || [];

  root.innerHTML = `
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:1rem;line-height:1.6">
      Five specialised AI agents run in parallel, each scanning a different
      dimension of your pull request simultaneously.
    </p>
    <div class="agent-grid" role="list" aria-label="Active AI agents">
      ${agents.map(a => buildAgentCard(a)).join('')}
    </div>
  `;
}

/**
 * Build HTML for a single agent card.
 * @param {Object} agent — entry from window.AGENTS
 * @returns {string}
 */
function buildAgentCard(agent) {
  return `
    <div class="agent-card" role="listitem" aria-label="${escapeHtml(agent.name)} agent">
      <div
        class="agent-icon"
        style="background:${agent.bgColor}"
        aria-hidden="true"
      >
        <i class="ti ${agent.icon}" style="color:${agent.iColor};font-size:18px"></i>
      </div>
      <div class="agent-name">${escapeHtml(agent.name)}</div>
      <div class="agent-desc">${escapeHtml(agent.desc)}</div>
      <div class="agent-stat">
        <i class="ti ti-point" aria-hidden="true" style="font-size:12px;color:${agent.iColor}"></i>
        ${escapeHtml(agent.stat)}
      </div>
    </div>
  `;
}
