/* ============================================================
   components/LeaderboardPanel.js
   Team Leaderboard — developer quality rankings, badges, streaks.
   Reads from window.TEAM_MEMBERS and window.TEAM_SUMMARY.
   ============================================================ */

let _lbSort = 'rank';

function renderLeaderboardPanel() {
  const root = document.getElementById('leaderboard-root');
  if (!root) return;

  root.innerHTML = `
    <div class="p3-header">
      <div>
        <div class="p3-title">Team Quality Leaderboard</div>
        <div class="p3-sub">Last 30 days &middot; ${(window.TEAM_SUMMARY||{}).totalPRs||0} PRs reviewed</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${buildLbSortBtn('rank','Rank')}
        ${buildLbSortBtn('avgScore','Score')}
        ${buildLbSortBtn('fixRate','Fix Rate')}
        ${buildLbSortBtn('streak','Streak')}
      </div>
    </div>
    ${buildTeamSummary()}
    <div class="leaderboard-list" role="list">${buildLeaderboardRows()}</div>
    <div style="margin-top:1rem;padding:.75rem 1rem;background:var(--bg-2);border:0.5px solid var(--border);
                border-radius:var(--rad);font-size:12px;color:var(--text-muted)">
      💡 <strong>Tip:</strong> Fix the 2 critical issues in PR #142 to raise
      <strong>sarah.kim</strong>'s average from 68 &rarr; ~74.
    </div>
  `;
}

function buildLbSortBtn(key, label) {
  return `<button class="filter-btn${_lbSort===key?' f-all':''}" onclick="sortLeaderboard('${key}')">${label}</button>`;
}

function sortLeaderboard(key) { _lbSort = key; renderLeaderboardPanel(); }

function buildTeamSummary() {
  const s = window.TEAM_SUMMARY || {};
  const stats = [
    { label:'Avg team score',  val:s.avgTeamScore||'—',          color:'var(--ok)'   },
    { label:'Total PRs',       val:s.totalPRs||'—',              color:'var(--text)'  },
    { label:'Issues caught',   val:s.totalIssuesCaught||'—',     color:'var(--bug)'   },
    { label:'Auto-fix rate',   val:(s.autoFixRate||'—')+'%',     color:'var(--smell)' },
    { label:'PRs this week',   val:s.reviewsThisWeek||'—',       color:'var(--perf)'  },
  ];
  return `<div class="leaderboard-summary">${stats.map(s=>`
    <div class="lb-stat">
      <div class="lb-stat-val" style="color:${s.color}">${s.val}</div>
      <div class="lb-stat-lbl">${s.label}</div>
    </div>`).join('')}</div>`;
}

function buildLeaderboardRows() {
  const sortFns = {
    rank:     (a,b)=>a.rank-b.rank,
    avgScore: (a,b)=>b.avgScore-a.avgScore,
    fixRate:  (a,b)=>b.fixRate-a.fixRate,
    streak:   (a,b)=>b.streak-a.streak,
  };
  return [...(window.TEAM_MEMBERS||[])].sort(sortFns[_lbSort]||sortFns.rank).map(m=>{
    const rankClass  = m.rank===1?'r1':m.rank===2?'r2':m.rank===3?'r3':'';
    const rankIcon   = m.rank===1?'🥇':m.rank===2?'🥈':m.rank===3?'🥉':m.rank;
    const scoreColor = m.avgScore>=85?'var(--ok)':m.avgScore>=70?'var(--perf)':'var(--bug)';
    const trendClass = m.trendUp?'up':'down';
    const trendSign  = m.trendUp?'↑':'↓';
    const streakHtml = m.streak>0
      ? `<span style="font-size:11px;color:var(--ok)" title="${m.streak} PRs ≥80 in a row">🔥 ${m.streak}</span>`
      : `<span style="font-size:11px;color:var(--text-hint)">—</span>`;
    return `
      <div class="lb-row${m.isCurrent?' lb-current':''}${m.rank<=2?' lb-top':''}" role="listitem">
        <div class="lb-rank ${rankClass}">${rankIcon}</div>
        <div class="lb-avatar" style="background:${m.avatarColor}">${m.avatar}</div>
        <div class="lb-info">
          <div class="lb-name">${escapeHtml(m.name)}${m.isCurrent?'<span class="current-badge" style="font-size:9px">PR #142</span>':''}</div>
          <div class="lb-badges">${m.badges.map(b=>`<span class="lb-badge-chip">${b}</span>`).join('')}</div>
        </div>
        <div class="lb-score" style="color:${scoreColor}">${m.avgScore}</div>
        <div class="lb-trend ${trendClass}">${trendSign}${m.trend.replace(/[+-]/,'')}</div>
        <div class="lb-prs">${streakHtml}<div style="font-size:11px;color:var(--text-hint);margin-top:2px">${m.prsReviewed} PRs</div></div>
      </div>`;
  }).join('');
}
