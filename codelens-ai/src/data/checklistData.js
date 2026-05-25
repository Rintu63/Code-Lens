/* ============================================================
   data/checklistData.js
   PR Checklist Builder data.
   Default checklists per PR type and the current checklist
   state for PR #142. Consumed by ChecklistPanel.js.
   ============================================================ */

window.CHECKLIST_TEMPLATES = {
  feature: [
    { id:'ct-f-01', text:'Business logic matches the spec / ticket',         required:true  },
    { id:'ct-f-02', text:'All acceptance criteria are implemented',           required:true  },
    { id:'ct-f-03', text:'UI changes are reviewed in both light & dark mode', required:false },
    { id:'ct-f-04', text:'API contract is documented (OpenAPI / JSDoc)',      required:true  },
    { id:'ct-f-05', text:'Feature flag added if applicable',                  required:false },
    { id:'ct-f-06', text:'Analytics / telemetry events fired correctly',      required:false },
  ],
  bugfix: [
    { id:'ct-b-01', text:'Root cause is identified and documented',           required:true  },
    { id:'ct-b-02', text:'Regression test added for the fixed bug',           required:true  },
    { id:'ct-b-03', text:'Fix does not break existing tests',                 required:true  },
    { id:'ct-b-04', text:'Related edge cases are handled',                    required:true  },
    { id:'ct-b-05', text:'Hotfix branch & release notes updated if needed',   required:false },
  ],
  refactor: [
    { id:'ct-r-01', text:'Behaviour is unchanged (all tests pass)',           required:true  },
    { id:'ct-r-02', text:'Performance is equal or better',                   required:true  },
    { id:'ct-r-03', text:'Dead code has been removed',                       required:false },
    { id:'ct-r-04', text:'Complexity metrics have improved',                 required:false },
    { id:'ct-r-05', text:'No unintended scope creep',                        required:true  },
  ],
};

/* Active checklist for PR #142 (feature PR) */
window.ACTIVE_CHECKLIST = [
  /* ── Security ── */
  { id:'cl-001', section:'Security',      text:'No SQL injection or raw query string interpolation', checked:false, required:true,  autoFailed:true,  note:'SQL injection found at queryBuilder.js:22' },
  { id:'cl-002', section:'Security',      text:'No hardcoded secrets, API keys, or passwords',       checked:true,  required:true,  autoFailed:false, note:'' },
  { id:'cl-003', section:'Security',      text:'Authentication enforced on all new endpoints',       checked:false, required:true,  autoFailed:false, note:'' },
  { id:'cl-004', section:'Security',      text:'User input validated and sanitised',                 checked:false, required:true,  autoFailed:true,  note:'name param unvalidated in queryBuilder' },
  /* ── Correctness ── */
  { id:'cl-005', section:'Correctness',   text:'No null / undefined dereferences',                   checked:false, required:true,  autoFailed:true,  note:'Null pointer at userController.js:47' },
  { id:'cl-006', section:'Correctness',   text:'Off-by-one errors checked (loops, pagination)',      checked:false, required:true,  autoFailed:true,  note:'Pagination offset wrong at listController.js:33' },
  { id:'cl-007', section:'Correctness',   text:'All async functions have error handling',            checked:false, required:false, autoFailed:false, note:'' },
  /* ── Performance ── */
  { id:'cl-008', section:'Performance',   text:'No N+1 database queries',                            checked:false, required:true,  autoFailed:true,  note:'N+1 in orderService.js:89' },
  { id:'cl-009', section:'Performance',   text:'No blocking synchronous I/O in request handlers',   checked:false, required:true,  autoFailed:true,  note:'readFileSync in configLoader.js:14' },
  { id:'cl-010', section:'Performance',   text:'DB indexes exist on all foreign key columns',       checked:false, required:false, autoFailed:true,  note:'Missing index on orders.userId' },
  /* ── Code Quality ── */
  { id:'cl-011', section:'Code Quality',  text:'No magic numbers — named constants used',            checked:false, required:false, autoFailed:true,  note:'3600 repeated 4× without constant' },
  { id:'cl-012', section:'Code Quality',  text:'Functions are small and single-purpose',            checked:true,  required:false, autoFailed:false, note:'' },
  { id:'cl-013', section:'Code Quality',  text:'No commented-out code in the diff',                 checked:true,  required:false, autoFailed:false, note:'' },
  /* ── Tests ── */
  { id:'cl-014', section:'Tests',         text:'Unit tests added for all new functions',             checked:false, required:true,  autoFailed:false, note:'' },
  { id:'cl-015', section:'Tests',         text:'Test coverage ≥ 80%',                               checked:true,  required:true,  autoFailed:false, note:'Coverage at 83%' },
  { id:'cl-016', section:'Tests',         text:'Edge cases tested (null inputs, empty arrays)',      checked:false, required:false, autoFailed:false, note:'' },
  /* ── Documentation ── */
  { id:'cl-017', section:'Documentation', text:'JSDoc comments on all public functions',            checked:false, required:false, autoFailed:false, note:'' },
  { id:'cl-018', section:'Documentation', text:'README / CHANGELOG updated if API changed',         checked:true,  required:false, autoFailed:false, note:'' },
  { id:'cl-019', section:'Documentation', text:'PR description is complete and links the ticket',   checked:true,  required:false, autoFailed:false, note:'' },
];

window.CHECKLIST_SECTIONS = ['Security','Correctness','Performance','Code Quality','Tests','Documentation'];