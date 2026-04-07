/* MiCA Readiness Workspace — App */

const CIRC = 2 * Math.PI * 34; // 213.63

const state = {
  action1Done: false,
  action2Done: false,
  activeWs: 'governance',
  activeFlow: null,   // null | { actionId, step }
};

/* ── Workstream data ── */
const workstreams = [
  {
    id: 'governance',
    title: 'Governance',
    desc: 'Management structure, oversight, and fit-and-proper materials.',
    detailDesc: 'Covers management, oversight, governance structure, and application materials related to responsible management. Latvijas Banka requires clear evidence that the applicant has sound governance arrangements.',
    nextSteps: [
      'Finalize management responsibilities summary',
      'Complete governance structure overview',
      'Review and approve fit-and-proper information pack',
    ],
    docsToPrep: [
      'Management responsibilities summary',
      'Governance structure overview',
      'Fit-and-proper information pack',
    ],
    docs: [
      { name: 'Governance_Structure.pdf', status: 'uploaded' },
      { name: 'Management_Responsibilities.docx', status: 'uploaded' },
      { name: 'Fit_and_Proper_Pack.pdf', status: 'needs-review' },
    ],
    baseProgress: 75,
    boostOnAction: 1,
  },
  {
    id: 'exchange',
    title: 'Exchange Operations',
    desc: 'Programme of operations, pricing methodology, and transfer flows.',
    detailDesc: 'Covers how NorthCrypto\'s crypto exchange operations are described for the CASP application, including the programme of operations, pricing methodology, and transfer service flows.',
    nextSteps: [
      'Finalize exchange pricing methodology document',
      'Draft trading and exchange policy',
      'Map customer order flow for transfer services',
    ],
    docsToPrep: [
      'Programme of operations',
      'Exchange pricing methodology',
      'Trading / exchange policy',
      'Transfer service flow summary',
    ],
    docs: [
      { name: 'Programme_of_Operations.pdf', status: 'uploaded' },
      { name: 'Exchange_Pricing_Methodology.docx', status: 'needs-review' },
      { name: 'Transfer_Service_Flow.pdf', status: 'uploaded' },
    ],
    baseProgress: 60,
    boostOnAction: 2,
  },
  {
    id: 'customer',
    title: 'Customer Protection',
    desc: 'Complaints handling, fee transparency, and customer disclosures.',
    detailDesc: 'Covers complaints handling, customer-facing documentation, and basic customer protection materials required under MiCA Article 71 and related provisions.',
    nextSteps: [
      'Draft complaints handling procedure',
      'Prepare fee transparency summary',
      'Review customer disclosure documents',
    ],
    docsToPrep: [
      'Complaints handling procedure',
      'Fee transparency summary',
      'Customer disclosure pack',
    ],
    docs: [
      { name: 'Complaints_Handling_Procedure.docx', status: 'missing' },
      { name: 'Customer_Disclosures.pdf', status: 'uploaded' },
    ],
    baseProgress: 58,
    boostOnAction: null,
  },
  {
    id: 'outsourcing',
    title: 'Outsourcing & Controls',
    desc: 'Vendor mapping, outsourced functions, and asset segregation.',
    detailDesc: 'Covers third-party vendors, outsourced functions, control ownership, and segregation of customer assets. MiCA requires CASPs to maintain clear records of outsourced arrangements.',
    nextSteps: [
      'Complete control ownership matrix',
      'Map all outsourced functions with risk ratings',
      'Verify safeguarding and segregation arrangements',
    ],
    docsToPrep: [
      'Vendor mapping',
      'Outsourced functions summary',
      'Control ownership matrix',
      'Segregation of customer assets summary',
    ],
    docs: [
      { name: 'Vendor_Mapping.xlsx', status: 'uploaded' },
      { name: 'Control_Ownership_Matrix.pdf', status: 'missing' },
      { name: 'Safeguarding_and_Segregation_Summary.pdf', status: 'uploaded' },
    ],
    baseProgress: 75,
    boostOnAction: null,
  },
];

/* ── Demo actions ── */
const demoActions = [
  {
    id: 1,
    title: 'Resolve governance package',
    stateKey: 'action1Done',
    relatedWs: 'governance',
    flaggedFile: 'Fit_and_Proper_Pack.pdf',
    flowText: 'The fit-and-proper information pack has been flagged for review. Upload the corrected version with updated director declarations and signatures.',
    confirmLabel: 'Confirm upload (simulated)',
    loadingText: 'Reviewing governance documents…',
  },
  {
    id: 2,
    title: 'Resolve exchange pricing review',
    stateKey: 'action2Done',
    relatedWs: 'exchange',
    flaggedFile: 'Exchange_Pricing_Methodology.docx',
    flowText: 'The exchange pricing methodology document requires review. Upload the updated version with revised fee schedules and spread calculations.',
    confirmLabel: 'Confirm upload (simulated)',
    loadingText: 'Reviewing exchange operations policy…',
  },
];

/* ── Helpers ── */
function getWsProgress(ws) {
  let p = ws.baseProgress;
  if (ws.boostOnAction === 1 && state.action1Done) p += 8;
  if (ws.boostOnAction === 2 && state.action2Done) p += 8;
  return Math.min(p, 100);
}

/* Overall score = average of all workstream progress values */
function calcOverallScore() {
  const total = workstreams.reduce((sum, ws) => sum + getWsProgress(ws), 0);
  return Math.round(total / workstreams.length);
}
function getBadgeInfo(progress) {
  if (progress >= 80) return { label: 'On track', color: 'green' };
  if (progress >= 55) return { label: 'In progress', color: 'blue' };
  if (progress >= 30) return { label: 'Needs attention', color: 'amber' };
  return { label: 'Not started', color: 'red' };
}
const DOC_ICONS = { '.pdf': '📄', '.docx': '📝', '.xlsx': '📊' };
function docIcon(name) {
  const ext = name.substring(name.lastIndexOf('.'));
  return DOC_ICONS[ext] || '📄';
}
const STATUS_LABELS = { 'uploaded': 'Uploaded', 'missing': 'Missing', 'needs-review': 'Needs review' };

/* ── Init ── */
function init() {
  loadState();
  renderAll();
  bindSidebar();
  bindActions();
  bindReset();
}

function renderAll() {
  renderScore();
  renderSidebarNav();
  renderWsDetail();
  renderActions();
}

/* ── Persistence ── */
function loadState() {
  try {
    const s = localStorage.getItem('mica_demo_state');
    if (s) {
      const saved = JSON.parse(s);
      state.action1Done = !!saved.action1Done;
      state.action2Done = !!saved.action2Done;
    }
  } catch (_) {}
}
function saveState() {
  try {
    localStorage.setItem('mica_demo_state', JSON.stringify({
      action1Done: state.action1Done,
      action2Done: state.action2Done,
    }));
  } catch (_) {}
}

/* ── Score ── */
function renderScore() {
  const score = calcOverallScore();
  const ring = document.getElementById('progressRing');
  ring.style.strokeDashoffset = CIRC * (1 - score / 100);
  ring.style.stroke = score >= 71 ? 'var(--green-600)' : 'var(--blue-500)';

  document.getElementById('scoreValue').textContent = score;
  document.getElementById('scoreHighlight').textContent = score + '%';

  const badge = document.getElementById('statusBadge');
  if (score >= 71) {
    badge.textContent = 'On track';
    badge.style.background = 'var(--green-100)';
    badge.style.color = 'var(--green-600)';
  } else {
    badge.textContent = 'Partially prepared';
    badge.style.background = 'var(--amber-100)';
    badge.style.color = 'var(--amber-600)';
  }

  const remaining = [state.action1Done, state.action2Done].filter(d => !d).length;
  const hint = document.getElementById('actionsHint');
  if (remaining === 0) {
    hint.textContent = '✓ All actions completed';
    hint.style.color = 'var(--green-600)';
  } else {
    hint.textContent = `⚡ ${remaining} action${remaining > 1 ? 's' : ''} available`;
    hint.style.color = 'var(--blue-600)';
  }
}

/* ── Sidebar nav ── */
function renderSidebarNav() {
  const nav = document.getElementById('wsNav');
  nav.innerHTML = workstreams.map(ws => {
    const p = getWsProgress(ws);
    const b = getBadgeInfo(p);
    const active = ws.id === state.activeWs ? ' active' : '';
    return `<button class="sb-ws-item${active}" data-ws="${ws.id}">
      <span class="sb-ws-dot sb-ws-dot--${b.color}"></span>
      ${ws.title}
      <span class="sb-ws-pct">${p}%</span>
    </button>`;
  }).join('');
}

function bindSidebar() {
  document.getElementById('wsNav').addEventListener('click', (e) => {
    const btn = e.target.closest('.sb-ws-item');
    if (!btn) return;
    state.activeWs = btn.dataset.ws;
    renderSidebarNav();
    renderWsDetail();
  });
}

/* ── Workstream detail panel ── */
function renderWsDetail() {
  const ws = workstreams.find(w => w.id === state.activeWs);
  if (!ws) return;
  const p = getWsProgress(ws);
  const b = getBadgeInfo(p);
  const panel = document.getElementById('wsDetailPanel');

  panel.innerHTML = `
    <div class="ws-detail-head">
      <div class="ws-detail-title">${ws.title}</div>
      <span class="badge badge--${b.color}">${b.label} · ${p}%</span>
    </div>
    <div class="progress-sm">
      <div class="progress-sm-fill" style="width:${p}%;background:var(--${b.color === 'green' ? 'green-600' : b.color === 'blue' ? 'blue-500' : b.color === 'amber' ? 'amber-600' : 'red-600'})"></div>
    </div>
    <div class="ws-detail-desc">${ws.detailDesc}</div>
    <div class="detail-section">
      <div class="detail-section-label">Next steps</div>
      <ul class="detail-steps">
        ${ws.nextSteps.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    <div class="detail-section">
      <div class="detail-section-label">Documents</div>
      <div class="doc-table">
        ${ws.docs.map(d => `
          <div class="doc-row">
            <span class="doc-name"><span class="doc-icon">${docIcon(d.name)}</span>${d.name}</span>
            <span class="doc-badge doc-badge--${d.status}">${STATUS_LABELS[d.status]}</span>
          </div>`).join('')}
      </div>
    </div>
  `;
}

/* ── Actions panel ── */
function renderActions() {
  const container = document.getElementById('actionsContainer');
  container.innerHTML = demoActions.map(a => {
    // If this action has an active step flow, render that instead
    if (state.activeFlow && state.activeFlow.actionId === a.id) {
      return renderStepFlow(a);
    }
    const done = state[a.stateKey];
    return `
      <div class="action-card ${done ? 'action-card--done' : ''}">
        <div class="action-card-title">
          ${done ? '<span class="done-check">✓</span>' : ''}${a.title}
        </div>
        <div class="action-card-desc">${done ? 'Resolved · Readiness +2% applied' : 'Document flagged for review'}</div>
        ${done
          ? `<button class="btn-action btn-action--done" disabled>✓ Completed</button>`
          : `<div class="action-card-boost">+2% readiness</div>
             <button class="btn-action btn-action--primary" data-start-flow="${a.id}">Fix now</button>`
        }
      </div>`;
  }).join('');
}

function renderStepFlow(action) {
  return `
    <div class="step-flow">
      <div class="step-flow-title">${action.title}</div>
      <div class="step-body">
        <div class="step-text">${action.flowText}</div>
        <div class="step-file-row">
          <span class="step-file-name">${docIcon(action.flaggedFile)} ${action.flaggedFile}</span>
          <span class="step-file-badge">Needs review</span>
        </div>
        <button class="btn-step btn-step--primary" data-flow-confirm="${action.id}">${action.confirmLabel}</button>
        <div class="step-sim-label">This is a simulated action</div>
      </div>
    </div>`;
}

function bindActions() {
  document.getElementById('actionsContainer').addEventListener('click', (e) => {
    // "Fix now" → open flow
    const startBtn = e.target.closest('[data-start-flow]');
    if (startBtn) {
      const id = Number(startBtn.dataset.startFlow);
      state.activeFlow = { actionId: id };
      renderActions();
      return;
    }

    // Confirm → loading → complete
    const confirmBtn = e.target.closest('[data-flow-confirm]');
    if (confirmBtn) {
      const id = Number(confirmBtn.dataset.flowConfirm);
      const action = demoActions.find(a => a.id === id);

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span class="spinner"></span> ${action.loadingText}`;

      setTimeout(() => {
        state[action.stateKey] = true;
        state.activeFlow = null;
        saveState();
        renderAll();
      }, 2000);
    }
  });
}

/* ── Keyboard ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.activeFlow) {
    state.activeFlow = null;
    renderActions();
  }
});

/* ── Reset ── */
function bindReset() {
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.action1Done = false;
    state.action2Done = false;
    state.activeWs = 'governance';
    state.activeFlow = null;
    saveState();
    renderAll();
  });
}

document.addEventListener('DOMContentLoaded', init);
