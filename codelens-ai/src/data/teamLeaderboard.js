/* ============================================================
   data/teamLeaderboard.js
   Developer quality metrics for the Team Leaderboard panel.
   Aggregated over the last 30 days of PR reviews.
   ============================================================ */

window.TEAM_MEMBERS = [
  {
    rank        : 1,
    login       : 'alex.chen',
    name        : 'Alex Chen',
    avatar      : 'AC',
    avatarColor : '#534AB7',
    prsReviewed : 14,
    avgScore    : 89,
    criticalIssues: 0,
    fixRate     : 94,
    streak      : 8,           // consecutive PRs with score ≥ 80
    badges      : ['🏆 Top Scorer', '🔒 Security Pro', '⚡ Speed Demon'],
    trend       : '+4',
    trendUp     : true,
  },
  {
    rank        : 2,
    login       : 'priya.nair',
    name        : 'Priya Nair',
    avatar      : 'PN',
    avatarColor : '#1D9E75',
    prsReviewed : 11,
    avgScore    : 84,
    criticalIssues: 1,
    fixRate     : 88,
    streak      : 5,
    badges      : ['🌱 Most Improved', '🐛 Bug Slayer'],
    trend       : '+7',
    trendUp     : true,
  },
  {
    rank        : 3,
    login       : 'john.doe',
    name        : 'John Doe',
    avatar      : 'JD',
    avatarColor : '#BA7517',
    prsReviewed : 9,
    avgScore    : 76,
    criticalIssues: 2,
    fixRate     : 79,
    streak      : 2,
    badges      : ['📦 Refactor King'],
    trend       : '-3',
    trendUp     : false,
  },
  {
    rank        : 4,
    login       : 'sarah.kim',
    name        : 'Sarah Kim',
    avatar      : 'SK',
    avatarColor : '#E24B4A',
    prsReviewed : 7,
    avgScore    : 68,
    criticalIssues: 4,
    fixRate     : 71,
    streak      : 0,
    badges      : ['🚀 Shipping Fast'],
    trend       : '-8',
    trendUp     : false,
    isCurrent   : true,        // author of PR #142
  },
  {
    rank        : 5,
    login       : 'bot-renovate',
    name        : 'Renovate Bot',
    avatar      : '🤖',
    avatarColor : '#7F77DD',
    prsReviewed : 22,
    avgScore    : 93,
    criticalIssues: 0,
    fixRate     : 100,
    streak      : 22,
    badges      : ['🤖 Automation Hero', '♻️ Dependency Master'],
    trend       : '+1',
    trendUp     : true,
  },
];

/** Team aggregates for the summary strip */
window.TEAM_SUMMARY = {
  totalPRs        : 63,
  avgTeamScore    : 82,
  totalIssuesCaught: 287,
  autoFixRate     : 76,
  topLanguage     : 'JavaScript',
  reviewsThisWeek : 18,
};
