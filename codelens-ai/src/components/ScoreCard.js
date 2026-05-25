/* ============================================================
   components/ScoreCard.js — Health score ring + grade badge
   ============================================================ */

/**
 * Render the score section into #results-root (prepended).
 * @param {number} score — 0-100
 */
function renderScoreCard(score) {
  const root = document.getElementById('results-root');
  if (!root) return;

  const { grade, color, bg } = scoreToGrade(score);
  const R = 37;
  const CIRC = 2 * Math.PI * R;

  // Score ring description
  const desc = score >= 75
    ? 'Code looks solid. Minor improvements suggested — no critical issues.'
    : score >= 50
    ? '2 critical issues require immediate attention before merging. Security vulnerabilities and a null-pointer bug detected.'
    : 'Multiple critical issues detected. This PR should not be merged without fixes.';

  const scoreHtml = `
    <div class="score-section" role="region" aria-label="Code health score">
      <!-- SVG ring -->
      <div class="score-ring-wrap" aria-hidden="true">
        <svg class="score-ring" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
          <circle class="score-track" cx="42" cy="42" r="${R}"/>
          <circle
            class="score-fill"
            id="score-circle"
            cx="42" cy="42" r="${R}"
            stroke="var(--bug)"
            stroke-dasharray="0 ${CIRC}"
          />
        </svg>
        <div class="score-num" id="score-num" aria-label="Score ${score} out of 100">0</div>
      </div>

      <!-- Info -->
      <div class="score-info">
        <div class="score-title">Code Health Score</div>
        <div class="score-desc">${desc}</div>
      </div>

      <!-- Grade -->
      <div
        class="grade-badge"
        style="background:${bg};color:${color}"
        aria-label="Grade ${grade}"
      >${grade}</div>
    </div>
  `;

  // Prepend score card, then metrics + issues follow
  root.innerHTML = scoreHtml + (root.innerHTML || '');
}
