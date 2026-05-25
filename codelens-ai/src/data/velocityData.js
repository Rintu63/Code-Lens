/* ============================================================
   data/velocityData.js
   Review Velocity Dashboard data.
   Weekly throughput, cycle times, reviewer response metrics,
   and merge rate — all for the last 8 weeks.
   Consumed by VelocityPanel.js.
   ============================================================ */

window.VELOCITY_WEEKS = [
  { week:'Nov 27', prsOpened:8,  prsMerged:6,  blockedByAI:2, avgCycleHrs:18.4, avgScore:79 },
  { week:'Dec 4',  prsOpened:11, prsMerged:9,  blockedByAI:1, avgCycleHrs:14.2, avgScore:82 },
  { week:'Dec 11', prsOpened:9,  prsMerged:7,  blockedByAI:3, avgCycleHrs:22.1, avgScore:74 },
  { week:'Dec 18', prsOpened:5,  prsMerged:5,  blockedByAI:0, avgCycleHrs:11.8, avgScore:91 },
  { week:'Dec 25', prsOpened:3,  prsMerged:3,  blockedByAI:0, avgCycleHrs:9.4,  avgScore:94 },
  { week:'Jan 1',  prsOpened:12, prsMerged:10, blockedByAI:2, avgCycleHrs:16.7, avgScore:80 },
  { week:'Jan 8',  prsOpened:14, prsMerged:11, blockedByAI:4, avgCycleHrs:19.3, avgScore:76 },
  { week:'Jan 15', prsOpened:7,  prsMerged:4,  blockedByAI:3, avgCycleHrs:24.6, avgScore:72 },
];

window.VELOCITY_REVIEWER_STATS = [
  { name:'alex.chen',  avatar:'AC', color:'#534AB7', avgResponseHrs:1.8,  reviewsThisWeek:5, approvalRate:88 },
  { name:'priya.nair', avatar:'PN', color:'#1D9E75', avgResponseHrs:3.2,  reviewsThisWeek:4, approvalRate:75 },
  { name:'john.doe',   avatar:'JD', color:'#BA7517', avgResponseHrs:5.7,  reviewsThisWeek:3, approvalRate:67 },
  { name:'sarah.kim',  avatar:'SK', color:'#E24B4A', avgResponseHrs:12.1, reviewsThisWeek:1, approvalRate:50 },
];

window.VELOCITY_KPI = {
  avgCycleTime    : '19.3h',
  mergeRate       : '71%',
  aiBlockRate     : '21%',
  firstReviewTime : '2.4h',
  reopenRate      : '8%',
  throughputWoW   : '+14%',
};