/* ============================================================
   utils/scoreAnimator.js — Animates the SVG score ring + number
   ============================================================ */

/**
 * Animate the circular score ring from 0 → target score.
 *
 * @param {number} target      — final score (0–100)
 * @param {string} circleId    — id of the <circle> element to animate
 * @param {string} numElId     — id of the <div> showing the numeric score
 * @param {number} [radius=37] — SVG circle radius (must match SKILL.md viewBox)
 */
function animateScore(target, circleId = 'score-circle', numElId = 'score-num', radius = 37) {
  const circle = document.getElementById(circleId);
  const numEl  = document.getElementById(numElId);
  if (!circle || !numEl) return;

  const circumference = 2 * Math.PI * radius;
  const steps = 45;
  const increment = target / steps;
  let current = 0;

  // Set ring stroke colour based on score range
  const strokeColor = target >= 75 ? 'var(--ok)'
                    : target >= 50 ? 'var(--perf)'
                    : 'var(--bug)';
  circle.setAttribute('stroke', strokeColor);

  const interval = setInterval(() => {
    current = Math.min(current + increment, target);
    const dash = (current / 100) * circumference;
    circle.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
    numEl.textContent = Math.round(current);
    if (current >= target) clearInterval(interval);
  }, 25);
}
