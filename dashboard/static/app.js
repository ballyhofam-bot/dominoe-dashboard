/* ═══════════════════════════════════════════════════════════════════
   Dominoe Operations Dashboard — app.js
   Plain JS, localStorage persistence, no frameworks
   ═══════════════════════════════════════════════════════════════════ */

// ── CONSTANTS ──────────────────────────────────────────────────────
const ENTITIES = {
  detail:      { name: 'R&A Mobile',       full: 'R&A Mobile (Mobile Detail)', color: '#16a34a', own: false },
  carwash:     { name: 'R&A Auto Spa',     full: 'R&A Auto Spa (Car Wash)',    color: '#2563eb', own: false },
  wholesale:   { name: 'Domino Brokers',   full: 'Domino Brokers LLC (Wholesale)', color: '#0f1923', own: true },
  rentals:     { name: 'Domino Auto World', full: 'Domino Auto World (Rentals)', color: '#7c3aed', own: true },
  contractors: { name: '1099 Payments',    full: '1099 Contractor Payments',   color: '#d97706', own: true },
  auctions:    { name: 'Auction Buys',     full: 'Auction Buys',              color: '#dc2626', own: true },
};

const DEFAULT_BANKS = ['PNC', 'South State Bank'];

const ENTITY_TABS = ['overview','detail','carwash','wholesale','rentals','contractors','auctions','banks'];
const TAB_LABELS = { overview:'Overview', detail:'Detail', carwash:'Car Wash', wholesale:'Wholesale', rentals:'Rentals', contractors:'1099', auctions:'Auctions', banks:'Banks' };

const MONTHS = [
  { key: '2026-05', label: 'May', full: 'May 2026' },
  { key: '2026-06', label: 'Jun', full: 'June 2026' },
];

const PAYMENT_METHODS = ['Cash','Card','Venmo','PayPal','Check','SwipeSimple'];
const SERVICE_TYPES = ['Full Detail','Interior','Exterior','Wash Only'];
const WASH_TYPES = ['Basic','Premium','Works'];
const AUCTION_HOUSES = ['Manheim','ADESA','Other'];
const WHOLESALE_SOURCES = ['Manheim','ADESA','Private Sale','Other'];
const RENTAL_PLATFORMS = ['Turo','Direct Rental'];
const RENTAL_EXPENSE_TYPES = ['Insurance','Property Tax','Maintenance','Gas/Fuel','Other'];

const DEFAULT_FLEET = [
  '2026 Nissan Sentra','2025 Jeep Grand Cherokee','2025 Jeep Gladiator High Tide',
  '2025 Toyota Camry Hybrid','2025 Mitsubishi Outlander Sport','2025 Hyundai Sonata',
  '2025 Kia K4','2024 Chrysler Pacifica','2023 Dodge Charger',
  '2023 INFINITI QX60','2023 Hyundai Tucson','2022 Toyota Camry','2016 Mazda CX-5',
];

// ── STORE (localStorage) ──────────────────────────────────────────
const Store = {
  _get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch { return fallback; } },
  _set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },

  getEntries()        { return this._get('domino_entries', []); },
  saveEntries(arr)    { this._set('domino_entries', arr); },
  addEntry(entry)     { const e = this.getEntries(); e.unshift(entry); this.saveEntries(e); },
  deleteEntry(id)     { this.saveEntries(this.getEntries().filter(e => e.id !== id)); },

  getBaselines()      { return this._get('domino_baselines', {}); },
  setBaseline(entity, data) { const b = this.getBaselines(); b[entity] = data; this._set('domino_baselines', b); },

  getFleet()          { return this._get('domino_fleet', DEFAULT_FLEET); },
  saveFleet(arr)      { this._set('domino_fleet', arr); },
  addFleetVehicle(v)  { const f = this.getFleet(); f.push(v); this.saveFleet(f); },
  removeFleetVehicle(i) { const f = this.getFleet(); f.splice(i, 1); this.saveFleet(f); },

  getBanks()          { return this._get('domino_banks', [...DEFAULT_BANKS]); },
  saveBanks(arr)      { this._set('domino_banks', arr); },
  addBank(name)       { const b = this.getBanks(); if (!b.includes(name)) { b.push(name); this.saveBanks(b); } },
  removeBank(name)    { this.saveBanks(this.getBanks().filter(n => n !== name)); },

  getEntityBanks()    { return this._get('domino_entity_banks', {}); },
  setEntityBank(ent, bank) { const m = this.getEntityBanks(); m[ent] = bank; this._set('domino_entity_banks', m); },
  getEntityBank(ent)  { return this.getEntityBanks()[ent] || ''; },
};

if (Store.getFleet().length === 0) Store.saveFleet(DEFAULT_FLEET);

// ── APP STATE ─────────────────────────────────────────────────────
const state = {
  tab: 'overview',
  month: 'both',
  partnerMode: false,
  partnerEntity: 'detail',
  confirmMsg: null,
  receiptPreview: null,
};

let chartInstance = null;

// ── HELPERS ────────────────────────────────────────────────────────
function $(sel) { return document.querySelector(sel); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2 }).format(n || 0);
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function fmtShortDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function matchesMonth(dateStr, monthFilter) {
  if (!monthFilter || monthFilter === 'both') return true;
  return dateStr && dateStr.startsWith(monthFilter);
}

function getFiltered(entity, month) {
  let entries = Store.getEntries();
  if (entity) entries = entries.filter(e => e.entity === entity);
  if (month && month !== 'both') entries = entries.filter(e => matchesMonth(e.date, month));
  return entries;
}

function sumBy(entries, type) {
  return entries.filter(e => e.type === type).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 2500);
}

function contractorTotals() {
  const entries = Store.getEntries().filter(e => e.entity === 'contractors');
  const totals = {};
  entries.forEach(e => {
    const name = (e.contractorName || 'Unknown').trim();
    if (!totals[name]) totals[name] = 0;
    totals[name] += parseFloat(e.amount) || 0;
  });
  return totals;
}

// ── RENDER ENGINE ─────────────────────────────────────────────────
function render() {
  renderHeader();
  renderMonthBar();
  renderTabs();
  renderContent();
}

function renderHeader() {
  const entries = getFiltered(null, state.month);
  const income = sumBy(entries, 'income');
  const expense = sumBy(entries, 'expense');
  const net = income - expense;
  const cls = net >= 0 ? 'positive' : 'negative';

  $('#app-header').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span class="header-brand">Dominoe</span>
      ${entries.length > 0 ? `<span class="header-net ${cls}">${fmt(net)}</span>` : ''}
    </div>
    <button class="partner-toggle ${state.partnerMode ? 'active' : ''}" onclick="togglePartner()">
      ${state.partnerMode ? 'Exit Partner' : 'Partner View'}
    </button>
  `;
}

function renderMonthBar() {
  const btns = MONTHS.map(m =>
    `<button class="month-btn ${state.month === m.key ? 'active' : ''}" onclick="setMonth('${m.key}')">${m.label}</button>`
  ).join('');
  const bothBtn = `<button class="month-btn ${state.month === 'both' ? 'active' : ''}" onclick="setMonth('both')">Both</button>`;
  $('#month-bar').innerHTML = btns + bothBtn;
}

function renderTabs() {
  if (state.partnerMode) { $('#tab-bar').innerHTML = ''; return; }
  $('#tab-bar').innerHTML = ENTITY_TABS.map(t =>
    `<button class="tab-btn ${state.tab === t ? 'active' : ''}" onclick="setTab('${t}')">${TAB_LABELS[t]}</button>`
  ).join('');
}

function renderContent() {
  const c = $('#content');
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  if (state.partnerMode) { renderPartnerView(c); return; }

  if (state.tab === 'overview') { renderOverview(c); return; }
  if (state.tab === 'banks') { renderBanksTab(c); return; }
  if (ENTITIES[state.tab]) { renderEntityTab(c, state.tab); return; }
  c.innerHTML = '';
}

function setTab(t) { state.tab = t; state.confirmMsg = null; state.receiptPreview = null; render(); $('#content').scrollTop = 0; }
function setMonth(m) { state.month = m; render(); }
function togglePartner() {
  state.partnerMode = !state.partnerMode;
  if (state.partnerMode) state.tab = 'overview';
  render();
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────
function renderOverview(container) {
  const all = getFiltered(null, state.month);
  const income = sumBy(all, 'income');
  const expense = sumBy(all, 'expense');
  const net = income - expense;

  let html = '';

  // Hero
  html += `
    <div class="card" style="text-align:center">
      <div class="card-title">Net Profit / Loss</div>
      <div class="hero-number ${net >= 0 ? 'positive' : 'negative'}">${fmt(net)}</div>
    </div>
    <div class="stat-row">
      <div class="stat-box">
        <div class="stat-value" style="color:var(--green)">${fmt(income)}</div>
        <div class="stat-label">Revenue</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:var(--red)">${fmt(expense)}</div>
        <div class="stat-label">Expenses</div>
      </div>
    </div>
  `;

  // Empty state — skip everything else when no data
  if (all.length === 0) {
    html += `<div class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-title">No data for this period</div>
      <div class="empty-sub">Start entering transactions in the entity tabs to see your numbers here</div>
    </div>`;
    container.innerHTML = html;
    return;
  }

  // Entity breakdown
  html += `<div class="section-header">By Entity</div>`;
  html += `<div class="card" style="padding:0 12px;overflow-x:auto"><table class="entity-table"><thead><tr>
    <th>Entity</th><th>Revenue</th><th>Expenses</th><th>Net</th><th>Cost/Rev</th>
  </tr></thead><tbody>`;

  Object.entries(ENTITIES).forEach(([key, ent]) => {
    const ents = getFiltered(key, state.month);
    const inc = sumBy(ents, 'income');
    const exp = sumBy(ents, 'expense');
    const n = inc - exp;
    const ratio = inc > 0 ? ((exp / inc) * 100).toFixed(0) + '%' : 'N/A';
    const color = n >= 0 ? 'var(--green)' : 'var(--red)';
    html += `<tr>
      <td><span class="entity-name"><span class="entity-dot" style="background:${ent.color}"></span>${ent.name}</span></td>
      <td style="color:var(--green)">${fmt(inc)}</td>
      <td style="color:var(--red)">${fmt(exp)}</td>
      <td style="color:${color};font-weight:700">${fmt(n)}</td>
      <td style="color:var(--text2)">${ratio}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;

  // Bank balances summary
  html += renderBankSummary();

  // Month-over-month comparison
  if (state.month === 'both') {
    const may = getFiltered(null, '2026-05');
    const jun = getFiltered(null, '2026-06');
    const mayInc = sumBy(may, 'income'), mayExp = sumBy(may, 'expense'), mayNet = mayInc - mayExp;
    const junInc = sumBy(jun, 'income'), junExp = sumBy(jun, 'expense'), junNet = junInc - junExp;

    const revDiff = junInc - mayInc;
    const expDiff = junExp - mayExp;
    const netDiff = junNet - mayNet;

    html += `<div class="section-header">Month over Month</div>`;
    html += `<div class="compare-grid">
      <div class="compare-col">
        <div class="compare-label">May 2026</div>
        <div class="compare-value" style="color:var(--green)">${fmt(mayInc)}</div>
        <div class="compare-sub">Revenue</div>
        <div class="compare-value" style="color:var(--red);font-size:16px;margin-top:8px">${fmt(mayExp)}</div>
        <div class="compare-sub">Expenses</div>
        <div class="compare-value" style="color:${mayNet>=0?'var(--green)':'var(--red)'};font-size:18px;margin-top:8px">${fmt(mayNet)}</div>
        <div class="compare-sub">Net</div>
      </div>
      <div class="compare-col">
        <div class="compare-label">June 2026</div>
        <div class="compare-value" style="color:var(--green)">${fmt(junInc)}</div>
        <div class="compare-sub">Revenue ${revDiff !== 0 ? `<span class="${revDiff>0?'trend-up':'trend-down'}">${revDiff>0?'▲':'▼'} ${fmt(Math.abs(revDiff))}</span>` : ''}</div>
        <div class="compare-value" style="color:var(--red);font-size:16px;margin-top:8px">${fmt(junExp)}</div>
        <div class="compare-sub">Expenses ${expDiff !== 0 ? `<span class="${expDiff<0?'trend-up':'trend-down'}">${expDiff<0?'▲':'▼'} ${fmt(Math.abs(expDiff))}</span>` : ''}</div>
        <div class="compare-value" style="color:${junNet>=0?'var(--green)':'var(--red)'};font-size:18px;margin-top:8px">${fmt(junNet)}</div>
        <div class="compare-sub">Net ${netDiff !== 0 ? `<span class="${netDiff>0?'trend-up':'trend-down'}">${netDiff>0?'▲':'▼'} ${fmt(Math.abs(netDiff))}</span>` : ''}</div>
      </div>
    </div>`;
  }

  // Chart
  html += `<div class="section-header">Income vs Expenses by Entity</div>`;
  html += `<div class="chart-wrap"><canvas id="overview-chart"></canvas></div>`;

  // Top 5 expense categories
  const expenses = Store.getEntries()
    .filter(e => e.type === 'expense' && matchesMonth(e.date, state.month))
    .sort((a, b) => (parseFloat(b.amount)||0) - (parseFloat(a.amount)||0));

  if (expenses.length > 0) {
    html += `<div class="section-header">Top Expense Categories</div><div class="card" style="padding:8px 14px">`;
    const top5 = expenses.slice(0, 5);
    top5.forEach((e, i) => {
      const entName = ENTITIES[e.entity] ? ENTITIES[e.entity].name : e.entity;
      const desc = e.notes || e.vehicleDesc || e.expenseSubType || 'Expense';
      html += `<div class="leak-row">
        <div class="leak-rank">${i+1}</div>
        <div class="leak-info">
          <div class="leak-desc">${desc}</div>
          <div class="leak-meta">${entName} &middot; ${fmtShortDate(e.date)}</div>
        </div>
        <div class="leak-amount">${fmt(e.amount)}</div>
      </div>`;
    });
    html += `</div>`;
  }

  // Expense leak finder (all expenses sorted by amount)
  if (expenses.length > 0) {
    html += `<div class="section-header">Expense Leak Finder</div>`;
    html += `<p style="font-size:13px;color:var(--text3);margin-bottom:10px">All expenses sorted highest first — where is the money going?</p>`;
    html += `<div class="card" style="padding:8px 14px">`;
    expenses.forEach((e, i) => {
      const entName = ENTITIES[e.entity] ? ENTITIES[e.entity].name : e.entity;
      const desc = e.notes || e.vehicleDesc || e.expenseSubType || e.contractorName || 'Expense';
      html += `<div class="leak-row">
        <div class="leak-rank">${i+1}</div>
        <div class="leak-info">
          <div class="leak-desc">${desc}</div>
          <div class="leak-meta">${entName} &middot; ${fmtShortDate(e.date)} &middot; ${e.paymentMethod || ''}</div>
        </div>
        <div class="leak-amount">${fmt(e.amount)}</div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  renderOverviewChart();
}

function renderOverviewChart() {
  const canvas = document.getElementById('overview-chart');
  if (!canvas) return;

  const labels = [];
  const incomeData = [];
  const expenseData = [];

  Object.entries(ENTITIES).forEach(([key, ent]) => {
    const ents = getFiltered(key, state.month);
    labels.push(ent.name);
    incomeData.push(sumBy(ents, 'income'));
    expenseData.push(sumBy(ents, 'expense'));
  });

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: 'rgba(22,163,74,.75)', borderRadius: 4 },
        { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(220,38,38,.75)', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#64748b', font: { size: 12, family: 'Barlow' } } },
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10, family: 'Barlow' } }, grid: { color: 'rgba(226,232,240,.6)' } },
        y: {
          ticks: { color: '#94a3b8', font: { size: 10, family: 'Barlow' }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) },
          grid: { color: 'rgba(226,232,240,.6)' },
        },
      },
    },
  });
}


// ── ENTITY TAB (form + history) ───────────────────────────────────
function renderEntityTab(container, entity) {
  const ent = ENTITIES[entity];
  let html = '';

  // Bank assignment dropdown
  const assignedBank = Store.getEntityBank(entity);
  const banks = Store.getBanks();
  html += `<div class="bank-assign">
    <label class="field-label">Bank Account</label>
    <select class="select" onchange="setEntityBank('${entity}', this.value)">
      <option value="">Not assigned</option>
      ${banks.map(b => `<option value="${b}" ${b === assignedBank ? 'selected' : ''}>${b}</option>`).join('')}
    </select>
  </div>`;

  // Baseline
  html += renderBaseline(entity);

  // 1099 alerts
  if (entity === 'contractors') {
    html += render1099Alerts();
  }

  // Confirmation message
  if (state.confirmMsg) {
    html += `<div class="confirm-card"><span class="confirm-icon">✅</span><span class="confirm-text">${state.confirmMsg}</span></div>`;
  }

  // Receipt capture
  html += `<div class="field">
    <button class="btn-receipt" onclick="document.getElementById('receipt-input').click()">
      📷 Snap Receipt
    </button>
    <input type="file" id="receipt-input" accept="image/*" capture="environment" style="display:none" onchange="handleReceipt(this)">
  </div>`;

  // Receipt preview
  if (state.receiptPreview) {
    html += `<div class="receipt-preview">
      <img src="${state.receiptPreview}" alt="Receipt">
      <div class="receipt-hint">Fill in the details below from this receipt, then save</div>
    </div>`;
  }

  // Entry form
  html += renderEntityForm(entity);

  // History
  html += renderEntityHistory(entity);

  container.innerHTML = html;
}

function renderBaseline(entity) {
  const bankName = Store.getEntityBank(entity);
  if (!bankName) {
    return `<div class="baseline-section" style="color:var(--text3);font-size:13px">
      Assign a bank account above to track a starting balance
    </div>`;
  }

  const baselines = Store.getBaselines();
  const bl = baselines[bankName];
  const safeBank = bankName.replace(/'/g, "\\'");

  if (bl && bl.amount != null) {
    return `<div class="baseline-section">
      <div class="card-title">${bankName} — Starting Balance</div>
      <div class="baseline-saved">
        <span>As of ${fmtDate(bl.date)}</span>
        <span class="baseline-amount">${fmt(bl.amount)}</span>
      </div>
      <button class="btn-danger" style="margin-top:8px" onclick="clearBaseline('${safeBank}')">Clear</button>
    </div>`;
  }

  return `<div class="baseline-section">
    <div class="card-title">${bankName} — Starting Balance</div>
    <div class="baseline-row">
      <input class="input" type="number" id="bl-amount-${entity}" placeholder="0.00" step=".01">
      <input class="input" type="date" id="bl-date-${entity}" value="${todayStr()}" style="max-width:160px">
      <button class="btn-secondary" onclick="saveBaseline('${entity}')">Set</button>
    </div>
  </div>`;
}

function saveBaseline(entity) {
  const bankName = Store.getEntityBank(entity);
  if (!bankName) { showToast('Assign a bank first'); return; }
  const amount = parseFloat(document.getElementById('bl-amount-' + entity).value);
  const date = document.getElementById('bl-date-' + entity).value;
  if (isNaN(amount)) { showToast('Enter an amount'); return; }
  Store.setBaseline(bankName, { amount, date: date || todayStr() });
  showToast(`${bankName} balance saved`);
  render();
}

function clearBaseline(key) {
  const b = Store.getBaselines();
  delete b[key];
  localStorage.setItem('domino_baselines', JSON.stringify(b));
  showToast('Balance cleared');
  render();
}

function render1099Alerts() {
  const totals = contractorTotals();
  let html = '';
  Object.entries(totals).forEach(([name, total]) => {
    if (total >= 600) {
      html += `<div class="alert-banner danger">
        ⚠️ <strong>${name}</strong> has reached ${fmt(total)} — IRS Form 1099-NEC required.
        <a href="https://www.irs.gov/forms-pubs/about-form-1099-nec" target="_blank" rel="noopener">Learn more</a>
      </div>`;
    } else if (total >= 450) {
      html += `<div class="alert-banner warning">
        ${name}: ${fmt(total)} paid — approaching $600 threshold
      </div>`;
    }
  });
  return html;
}

// ── ENTITY FORMS ──────────────────────────────────────────────────
function renderEntityForm(entity) {
  let html = `<form onsubmit="submitEntry(event, '${entity}')">`;

  // Shared: date
  html += `<div class="field">
    <label class="field-label">Date</label>
    <input class="input" type="date" name="date" value="${todayStr()}" required>
  </div>`;

  // Shared: income / expense toggle
  html += `<div class="field">
    <label class="field-label">Type</label>
    <div class="toggle-row">
      <button type="button" class="toggle-btn income active" data-field="type" data-value="income" onclick="toggleType(this)">Income</button>
      <button type="button" class="toggle-btn expense" data-field="type" data-value="expense" onclick="toggleType(this)">Expense</button>
    </div>
    <input type="hidden" name="type" value="income">
  </div>`;

  // Entity-specific fields
  html += entitySpecificFields(entity);

  // Shared: amount (may be auto-filled by entity logic)
  const hideAmount = (entity === 'wholesale' || entity === 'auctions');
  if (!hideAmount) {
    html += `<div class="field">
      <label class="field-label">Amount</label>
      <input class="input" type="number" name="amount" step=".01" placeholder="0.00" required>
    </div>`;
  }

  // Shared: payment method
  html += `<div class="field">
    <label class="field-label">Payment Method</label>
    <div class="toggle-row">
      ${PAYMENT_METHODS.map((m, i) =>
        `<button type="button" class="toggle-btn ${i===0?'active':''}" data-field="paymentMethod" data-value="${m}" onclick="toggleSelect(this)">${m}</button>`
      ).join('')}
    </div>
    <input type="hidden" name="paymentMethod" value="Cash">
  </div>`;

  // Shared: notes
  html += `<div class="field">
    <label class="field-label">Notes</label>
    <textarea class="input" name="notes" placeholder="Optional notes..." rows="2"></textarea>
  </div>`;

  html += `<button class="btn-submit" type="submit">Save Entry</button>`;
  html += `</form>`;
  return html;
}

function entitySpecificFields(entity) {
  let h = '';
  switch (entity) {

    case 'detail':
      h += selectField('contractorName', 'Contractor Name', null, 'Enter name');
      h += inputField('customerName', 'Customer Name', 'text', 'Customer name');
      h += dropdownField('serviceType', 'Service Type', SERVICE_TYPES);
      h += `<div class="field">
        <label class="field-label">Revenue Share %</label>
        <input class="input" type="number" name="sharePercent" value="50" min="0" max="100" step="1" oninput="calcDetailShare()">
      </div>`;
      h += `<div id="detail-calc" class="calc-row" style="display:none">
        <div><div class="calc-label">Ash's Take</div><div class="calc-value" id="ash-share" style="color:var(--green)">$0.00</div></div>
        <div><div class="calc-label">Contractor's Take</div><div class="calc-value" id="contractor-share">$0.00</div></div>
      </div>`;
      break;

    case 'carwash':
      h += dropdownField('washType', 'Wash Type', WASH_TYPES);
      h += inputField('washCount', 'Number of Washes', 'number', '1');
      break;

    case 'wholesale':
      h += inputField('vehicleDesc', 'Vehicle (Year Make Model)', 'text', '2020 Honda Accord');
      h += inputField('buyPrice', 'Buy Price', 'number', '0.00', '.01');
      h += inputField('sellPrice', 'Sell Price', 'number', '0.00', '.01');
      h += dropdownField('source', 'Source', WHOLESALE_SOURCES);
      h += `<div id="wholesale-calc" class="calc-row" style="display:none">
        <div class="calc-label">Profit / Loss</div>
        <div class="calc-value" id="wholesale-pl">$0.00</div>
      </div>`;
      h += `<input type="hidden" name="amount" value="0">`;
      break;

    case 'rentals':
      h += `<div class="field">
        <label class="field-label">Vehicle</label>
        <select class="select" name="vehicleName">
          <option value="">Select vehicle...</option>
          ${Store.getFleet().map(v => `<option value="${v}">${v}</option>`).join('')}
        </select>
        <div style="margin-top:6px"><button type="button" class="btn-secondary" style="font-size:12px;padding:6px 10px" onclick="addFleetPrompt()">+ Add Vehicle</button></div>
      </div>`;
      h += inputField('rentalPayout', 'Payout / Amount', 'number', '0.00', '.01');
      h += inputField('rentalPeriod', 'Period (e.g. Week of Jun 1)', 'text', 'Week of...');
      h += dropdownField('platform', 'Platform', RENTAL_PLATFORMS);
      h += `<div class="field" id="rental-expense-field" style="display:none">
        <label class="field-label">Expense Type</label>
        <div class="toggle-row">
          ${RENTAL_EXPENSE_TYPES.map((t, i) =>
            `<button type="button" class="toggle-btn ${i===0?'active':''}" data-field="expenseSubType" data-value="${t}" onclick="toggleSelect(this)">${t}</button>`
          ).join('')}
        </div>
        <input type="hidden" name="expenseSubType" value="Insurance">
      </div>`;
      break;

    case 'contractors':
      h += selectField('contractorName', 'Contractor Name', null, 'Enter name');
      h += `<div id="contractor-ytd"></div>`;
      break;

    case 'auctions':
      h += inputField('vehicleDesc', 'Vehicle (Year Make Model)', 'text', '2019 Nissan Altima');
      h += inputField('purchasePrice', 'Purchase Price', 'number', '0.00', '.01');
      h += dropdownField('auctionHouse', 'Auction House', AUCTION_HOUSES);
      h += inputField('fees', 'Fees (transport, buyer fee, etc.)', 'number', '0.00', '.01');
      h += `<div id="auction-calc" class="calc-row" style="display:none">
        <div class="calc-label">Total Cost</div>
        <div class="calc-value" id="auction-total" style="color:var(--red)">$0.00</div>
      </div>`;
      h += `<input type="hidden" name="amount" value="0">`;
      break;
  }
  return h;
}

function inputField(name, label, type, placeholder, step) {
  const s = step ? ` step="${step}"` : '';
  return `<div class="field">
    <label class="field-label">${label}</label>
    <input class="input" type="${type}" name="${name}" placeholder="${placeholder || ''}"${s}>
  </div>`;
}

function selectField(name, label, options, placeholder) {
  return `<div class="field">
    <label class="field-label">${label}</label>
    <input class="input" type="text" name="${name}" placeholder="${placeholder || ''}" list="${name}-list">
  </div>`;
}

function dropdownField(name, label, options) {
  return `<div class="field">
    <label class="field-label">${label}</label>
    <select class="select" name="${name}">
      <option value="">Select...</option>
      ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
    </select>
  </div>`;
}

// ── FORM INTERACTIONS ─────────────────────────────────────────────
function toggleType(btn) {
  const row = btn.parentElement;
  row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const hidden = row.parentElement.querySelector('input[type="hidden"]');
  if (hidden) hidden.value = btn.dataset.value;

  // Show/hide rental expense subtype
  const expField = document.getElementById('rental-expense-field');
  if (expField) {
    expField.style.display = btn.dataset.value === 'expense' ? '' : 'none';
  }
}

function toggleSelect(btn) {
  const row = btn.parentElement;
  row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const hidden = row.parentElement.querySelector('input[type="hidden"]');
  if (hidden) hidden.value = btn.dataset.value;
}

function calcDetailShare() {
  const form = document.querySelector('form');
  if (!form) return;
  const amount = parseFloat(form.querySelector('[name="amount"]')?.value) || 0;
  const pct = parseFloat(form.querySelector('[name="sharePercent"]')?.value) || 0;
  const ashTake = amount * (1 - pct / 100);
  const contractorTake = amount * (pct / 100);
  const calcDiv = document.getElementById('detail-calc');
  if (calcDiv && amount > 0) {
    calcDiv.style.display = 'flex';
    document.getElementById('ash-share').textContent = fmt(ashTake);
    document.getElementById('contractor-share').textContent = fmt(contractorTake);
  }
}

function addFleetPrompt() {
  const v = prompt('Enter vehicle (e.g. 2025 Toyota Camry):');
  if (v && v.trim()) {
    Store.addFleetVehicle(v.trim());
    showToast('Vehicle added to fleet');
    render();
  }
}

function handleReceipt(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    state.receiptPreview = e.target.result;
    render();
  };
  reader.readAsDataURL(input.files[0]);
}

// ── FORM SUBMIT ───────────────────────────────────────────────────
function submitEntry(e, entity) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) data[k] = v;

  const entry = {
    id: genId(),
    entity,
    date: data.date || todayStr(),
    type: data.type || 'income',
    paymentMethod: data.paymentMethod || 'Cash',
    notes: data.notes || '',
    hasReceipt: !!state.receiptPreview,
    createdAt: new Date().toISOString(),
  };

  // Entity-specific processing
  switch (entity) {
    case 'detail': {
      entry.contractorName = data.contractorName || '';
      entry.customerName = data.customerName || '';
      entry.serviceType = data.serviceType || '';
      entry.sharePercent = parseFloat(data.sharePercent) || 50;
      entry.amount = parseFloat(data.amount) || 0;
      entry.ashShare = entry.amount * (1 - entry.sharePercent / 100);
      entry.contractorShare = entry.amount * (entry.sharePercent / 100);
      break;
    }
    case 'carwash': {
      entry.washType = data.washType || '';
      entry.washCount = parseInt(data.washCount) || 1;
      entry.amount = parseFloat(data.amount) || 0;
      break;
    }
    case 'wholesale': {
      entry.vehicleDesc = data.vehicleDesc || '';
      entry.buyPrice = parseFloat(data.buyPrice) || 0;
      entry.sellPrice = parseFloat(data.sellPrice) || 0;
      entry.source = data.source || '';
      entry.profitLoss = entry.sellPrice - entry.buyPrice;
      entry.amount = Math.abs(entry.profitLoss);
      entry.type = entry.profitLoss >= 0 ? 'income' : 'expense';
      if (entry.sellPrice === 0 && entry.buyPrice > 0) {
        entry.type = 'expense';
        entry.amount = entry.buyPrice;
      }
      break;
    }
    case 'rentals': {
      entry.vehicleName = data.vehicleName || '';
      entry.rentalPayout = parseFloat(data.rentalPayout) || 0;
      entry.rentalPeriod = data.rentalPeriod || '';
      entry.platform = data.platform || '';
      entry.expenseSubType = data.expenseSubType || '';
      entry.amount = parseFloat(data.rentalPayout) || parseFloat(data.amount) || 0;
      break;
    }
    case 'contractors': {
      entry.contractorName = data.contractorName || '';
      entry.amount = parseFloat(data.amount) || 0;
      entry.type = 'expense';
      break;
    }
    case 'auctions': {
      entry.vehicleDesc = data.vehicleDesc || '';
      entry.purchasePrice = parseFloat(data.purchasePrice) || 0;
      entry.auctionHouse = data.auctionHouse || '';
      entry.fees = parseFloat(data.fees) || 0;
      entry.totalCost = entry.purchasePrice + entry.fees;
      entry.amount = entry.totalCost;
      entry.type = 'expense';
      break;
    }
  }

  if (!entry.amount || entry.amount <= 0) {
    showToast('Enter a valid amount');
    return;
  }

  Store.addEntry(entry);
  state.confirmMsg = 'Entry saved!';
  state.receiptPreview = null;
  showToast('Entry saved');
  render();
  setTimeout(() => { state.confirmMsg = null; }, 4000);
}

// ── ENTRY HISTORY ─────────────────────────────────────────────────
function renderEntityHistory(entity) {
  const entries = getFiltered(entity, state.month);
  if (entries.length === 0) {
    return `<div class="section-header">History</div>
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No entries yet</div>
        <div class="empty-sub">Save an entry above to see it here</div>
      </div>`;
  }

  let html = `<div class="section-header">History (${entries.length})</div>`;
  html += `<div class="card" style="padding:4px 14px">`;

  entries.forEach(e => {
    const desc = entryDescription(e);
    const color = e.type === 'income' ? 'var(--green)' : 'var(--red)';
    const sign = e.type === 'income' ? '+' : '-';
    const dotColor = ENTITIES[entity] ? ENTITIES[entity].color : '#888';

    html += `<div class="txn-row">
      <div class="txn-dot" style="background:${dotColor}"></div>
      <div class="txn-info">
        <div class="txn-label">${desc}${e.hasReceipt ? ' 📷' : ''}</div>
        <div class="txn-date">${fmtShortDate(e.date)} &middot; ${e.paymentMethod || ''}</div>
      </div>
      <div class="txn-amount" style="color:${color}">${sign}${fmt(e.amount)}</div>
      <div class="txn-actions">
        <button class="btn-danger" onclick="deleteEntry('${e.id}')">✕</button>
      </div>
    </div>`;
  });

  html += `</div>`;

  // Contractor YTD totals for 1099 tab
  if (entity === 'contractors') {
    const totals = contractorTotals();
    if (Object.keys(totals).length > 0) {
      html += `<div class="section-header">Contractor Totals (YTD)</div>`;
      html += `<div class="card" style="padding:12px 14px">`;
      Object.entries(totals).sort((a,b) => b[1] - a[1]).forEach(([name, total]) => {
        const pct = Math.min((total / 600) * 100, 100);
        const barColor = total >= 600 ? 'var(--red)' : total >= 450 ? 'var(--orange)' : 'var(--gold)';
        html += `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span style="font-weight:600">${name}</span>
            <span style="font-weight:700;font-size:16px;color:${total>=600?'var(--red)':'var(--text)'}">${fmt(total)}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${barColor}"></div></div>
          ${total >= 600 ? `<div style="font-size:11px;color:var(--red);margin-top:4px">⚠️ Over $600 — 1099 required</div>` : ''}
        </div>`;
      });
      html += `</div>`;
    }
  }

  return html;
}

function entryDescription(e) {
  switch (e.entity) {
    case 'detail':
      return `${e.serviceType || 'Detail'} — ${e.customerName || 'Customer'}`;
    case 'carwash':
      return `${e.washType || 'Car Wash'}${e.washCount > 1 ? ' ×' + e.washCount : ''}`;
    case 'wholesale':
      if (e.vehicleDesc) return e.vehicleDesc + (e.profitLoss != null ? ` (${e.profitLoss >= 0 ? '+' : ''}${fmt(e.profitLoss)})` : '');
      return 'Wholesale';
    case 'rentals':
      return `${e.vehicleName || 'Rental'}${e.platform ? ' — ' + e.platform : ''}${e.type === 'expense' && e.expenseSubType ? ' (' + e.expenseSubType + ')' : ''}`;
    case 'contractors':
      return e.contractorName || 'Contractor Payment';
    case 'auctions':
      return `${e.vehicleDesc || 'Auction Buy'}${e.auctionHouse ? ' — ' + e.auctionHouse : ''}`;
    default:
      return e.notes || 'Entry';
  }
}

function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  Store.deleteEntry(id);
  showToast('Entry deleted');
  render();
}

// ── PARTNER VIEW ──────────────────────────────────────────────────
function renderPartnerView(container) {
  const ent = ENTITIES[state.partnerEntity];
  const entries = getFiltered(state.partnerEntity, state.month);
  const income = sumBy(entries, 'income');
  const expense = sumBy(entries, 'expense');
  const net = income - expense;

  let html = '';

  html += `<div class="partner-banner">Partner View — ${ent ? ent.full : 'Entity'} Only</div>`;

  // Entity selector
  html += `<div class="field">
    <label class="field-label">Viewing Entity</label>
    <select class="select" onchange="state.partnerEntity=this.value;render()">
      ${Object.entries(ENTITIES).map(([k, v]) =>
        `<option value="${k}" ${k === state.partnerEntity ? 'selected' : ''}>${v.full}</option>`
      ).join('')}
    </select>
  </div>`;

  // Summary
  html += `<div class="stat-row">
    <div class="stat-box">
      <div class="stat-value" style="color:var(--green)">${fmt(income)}</div>
      <div class="stat-label">Revenue</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:var(--red)">${fmt(expense)}</div>
      <div class="stat-label">Expenses</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:${net >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(net)}</div>
      <div class="stat-label">Net</div>
    </div>
  </div>`;

  // Read-only history
  if (entries.length === 0) {
    html += `<div class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-title">No entries</div>
      <div class="empty-sub">No data for this entity in the selected period</div>
    </div>`;
  } else {
    html += `<div class="section-header">Transaction History</div>`;
    html += `<div class="card" style="padding:4px 14px">`;
    entries.forEach(e => {
      const desc = entryDescription(e);
      const color = e.type === 'income' ? 'var(--green)' : 'var(--red)';
      const sign = e.type === 'income' ? '+' : '-';
      html += `<div class="txn-row">
        <div class="txn-dot" style="background:${ent.color}"></div>
        <div class="txn-info">
          <div class="txn-label">${desc}</div>
          <div class="txn-date">${fmtShortDate(e.date)} &middot; ${e.paymentMethod || ''}</div>
        </div>
        <div class="txn-amount" style="color:${color}">${sign}${fmt(e.amount)}</div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

// ── AUTO-CALC WATCHERS ────────────────────────────────────────────
document.addEventListener('input', function(e) {
  const form = e.target.closest('form');
  if (!form) return;

  // Detail: recalculate shares when amount or % changes
  if (e.target.name === 'amount' || e.target.name === 'sharePercent') {
    calcDetailShare();
  }

  // Wholesale: calc profit/loss
  if (e.target.name === 'buyPrice' || e.target.name === 'sellPrice') {
    const buy = parseFloat(form.querySelector('[name="buyPrice"]')?.value) || 0;
    const sell = parseFloat(form.querySelector('[name="sellPrice"]')?.value) || 0;
    const pl = sell - buy;
    const calcDiv = document.getElementById('wholesale-calc');
    const hidden = form.querySelector('input[name="amount"][type="hidden"]');
    if (calcDiv && (buy > 0 || sell > 0)) {
      calcDiv.style.display = 'flex';
      const plEl = document.getElementById('wholesale-pl');
      plEl.textContent = fmt(pl);
      plEl.style.color = pl >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (hidden) hidden.value = Math.abs(pl);
  }

  // Auction: calc total cost
  if (e.target.name === 'purchasePrice' || e.target.name === 'fees') {
    const price = parseFloat(form.querySelector('[name="purchasePrice"]')?.value) || 0;
    const fees = parseFloat(form.querySelector('[name="fees"]')?.value) || 0;
    const total = price + fees;
    const calcDiv = document.getElementById('auction-calc');
    const hidden = form.querySelector('input[name="amount"][type="hidden"]');
    if (calcDiv && total > 0) {
      calcDiv.style.display = 'flex';
      document.getElementById('auction-total').textContent = fmt(total);
    }
    if (hidden) hidden.value = total;
  }

  // Contractor name: show YTD
  if (e.target.name === 'contractorName' && state.tab === 'contractors') {
    const name = e.target.value.trim();
    const ytdDiv = document.getElementById('contractor-ytd');
    if (ytdDiv && name) {
      const totals = contractorTotals();
      const t = totals[name] || 0;
      if (t > 0) {
        ytdDiv.innerHTML = `<div class="calc-row">
          <div class="calc-label">${name} — YTD Paid</div>
          <div class="calc-value" style="color:${t >= 600 ? 'var(--red)' : 'var(--text)'}">${fmt(t)}</div>
        </div>`;
      } else {
        ytdDiv.innerHTML = '';
      }
    }
  }
});

// ── BANK MANAGEMENT ──────────────────────────────────────────────

// Helper: compute per-entity breakdown for a bank
function bankLedger(bank) {
  const baselines = Store.getBaselines();
  const entityBankMap = Store.getEntityBanks();
  const bl = baselines[bank];
  const starting = bl ? (parseFloat(bl.amount) || 0) : 0;
  const lines = [];
  let totalInc = 0, totalExp = 0;

  Object.entries(entityBankMap).filter(([_, b]) => b === bank).forEach(([e]) => {
    const ent = ENTITIES[e];
    if (!ent) return;
    const ents = getFiltered(e, state.month);
    const inc = sumBy(ents, 'income');
    const exp = sumBy(ents, 'expense');
    if (inc > 0 || exp > 0) lines.push({ name: ent.name, color: ent.color, inc, exp, net: inc - exp });
    totalInc += inc;
    totalExp += exp;
  });

  return { starting, totalInc, totalExp, current: starting + totalInc - totalExp, lines, hasBaseline: !!bl, date: bl ? bl.date : null };
}

function bankExplain(ledger) {
  let text = `Started at ${fmt(ledger.starting)}.`;
  if (ledger.lines.length === 0) {
    text += ' No transactions recorded yet.';
    return text;
  }
  const parts = [];
  ledger.lines.forEach(l => {
    if (l.inc > 0 && l.exp > 0) parts.push(`${l.name} brought in ${fmt(l.inc)} and spent ${fmt(l.exp)}`);
    else if (l.inc > 0) parts.push(`${l.name} brought in ${fmt(l.inc)}`);
    else if (l.exp > 0) parts.push(`${l.name} spent ${fmt(l.exp)}`);
  });
  text += ' ' + parts.join('. ') + '.';
  const change = ledger.current - ledger.starting;
  if (change > 0) text += ` That’s ${fmt(change)} more than you started with.`;
  else if (change < 0) text += ` That’s ${fmt(Math.abs(change))} less than you started with.`;
  return text;
}

// Compact summary for Overview
function renderBankSummary() {
  const banks = Store.getBanks();
  if (banks.length === 0) return '';
  const baselines = Store.getBaselines();
  let hasAny = false;

  let cards = '';
  banks.forEach(bank => {
    const bl = baselines[bank];
    if (!bl) return;
    hasAny = true;
    const ledger = bankLedger(bank);

    cards += `<div class="bank-card" style="margin-bottom:10px">
      <div class="bank-card-header" style="margin-bottom:8px">
        <span class="bank-card-name">${bank}</span>
      </div>
      <div class="ledger">
        <div class="ledger-row"><span>Starting Balance</span><span>${fmt(ledger.starting)}</span></div>`;

    if (ledger.lines.length > 0) {
      ledger.lines.forEach(l => {
        if (l.inc > 0) cards += `<div class="ledger-row inc"><span>+ ${l.name}</span><span>+${fmt(l.inc)}</span></div>`;
        if (l.exp > 0) cards += `<div class="ledger-row exp"><span>- ${l.name}</span><span>-${fmt(l.exp)}</span></div>`;
      });
    }

    cards += `<div class="ledger-total"><span>Current Balance</span><span style="color:${ledger.current >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(ledger.current)}</span></div>
      </div>
      <p class="bank-explain">${bankExplain(ledger)}</p>
    </div>`;
  });

  if (!hasAny) return '';
  return `<div class="section-header">Bank Balances</div>${cards}`;
}

// Full Banks tab
function renderBanksTab(container) {
  const banks = Store.getBanks();
  const baselines = Store.getBaselines();
  const entityBankMap = Store.getEntityBanks();
  let html = '';

  // Entity → Bank assignment
  html += `<div class="section-header">Entity → Bank Assignment</div>`;
  html += `<div class="card" style="padding:4px 14px">`;
  const ownEntities = Object.entries(ENTITIES).filter(([_, e]) => e.own);
  const partnerEntities = Object.entries(ENTITIES).filter(([_, e]) => !e.own);

  html += `<div class="assign-group-label">Ash's Own</div>`;
  ownEntities.forEach(([key, ent]) => {
    html += bankAssignRow(key, ent, banks, entityBankMap);
  });
  html += `<div class="assign-group-label" style="margin-top:10px">Partnered</div>`;
  partnerEntities.forEach(([key, ent]) => {
    html += bankAssignRow(key, ent, banks, entityBankMap);
  });
  html += `</div>`;

  // Bank balances
  html += `<div class="section-header">Bank Balances</div>`;

  if (banks.length === 0) {
    html += `<div class="card" style="text-align:center;color:var(--text3);padding:24px">
      <p>No bank accounts yet</p>
    </div>`;
  } else {
    banks.forEach((bank, bi) => {
      const ledger = bankLedger(bank);
      const safeBank = bank.replace(/'/g, "\\'");
      const assigned = Object.entries(entityBankMap)
        .filter(([_, b]) => b === bank)
        .map(([e]) => ENTITIES[e] ? ENTITIES[e].name : e);

      html += `<div class="bank-card">
        <div class="bank-card-header">
          <span class="bank-card-name">${bank}</span>
          <button class="btn-danger" onclick="removeBank('${safeBank}')">✕</button>
        </div>`;

      if (ledger.hasBaseline) {
        html += `<div class="ledger">
          <div class="ledger-row"><span>Starting Balance</span><span>${fmt(ledger.starting)}</span></div>`;

        if (ledger.lines.length > 0) {
          ledger.lines.forEach(l => {
            if (l.inc > 0) html += `<div class="ledger-row inc"><span><span class="entity-dot" style="background:${l.color}"></span> ${l.name}</span><span>+${fmt(l.inc)}</span></div>`;
            if (l.exp > 0) html += `<div class="ledger-row exp"><span><span class="entity-dot" style="background:${l.color}"></span> ${l.name}</span><span>-${fmt(l.exp)}</span></div>`;
          });
        } else if (assigned.length === 0) {
          html += `<div class="ledger-row" style="color:var(--text3)"><span>No entities assigned</span><span></span></div>`;
        } else {
          html += `<div class="ledger-row" style="color:var(--text3)"><span>No transactions yet</span><span></span></div>`;
        }

        html += `<div class="ledger-total"><span>Current Balance</span><span style="color:${ledger.current >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(ledger.current)}</span></div>
        </div>
        <p class="bank-explain">${bankExplain(ledger)}</p>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Starting balance as of ${fmtDate(ledger.date)}</div>
        <div style="margin-top:8px"><button class="btn-danger" onclick="clearBaseline('${safeBank}')">Clear Balance</button></div>`;
      } else {
        html += `<div class="bank-baseline-input">
          <input class="input" type="number" id="bl-bank-${bi}" placeholder="Starting balance" step=".01">
          <input class="input" type="date" id="bl-bankdate-${bi}" value="${todayStr()}" style="max-width:140px">
          <button class="btn-secondary" onclick="saveBankBaseline(${bi})">Set</button>
        </div>`;
        if (assigned.length > 0) {
          html += `<div class="bank-card-entities">${assigned.join(' &middot; ')}</div>`;
        } else {
          html += `<div style="font-size:11px;color:var(--text3);margin-top:8px">No entities assigned yet</div>`;
        }
      }

      html += `</div>`;
    });
  }

  html += `<button class="btn-secondary" style="margin-top:8px;margin-bottom:20px" onclick="addBankPrompt()">+ Add Bank Account</button>`;
  container.innerHTML = html;
}

function bankAssignRow(key, ent, banks, entityBankMap) {
  const currentBank = entityBankMap[key] || '';
  return `<div class="bank-assign-row">
    <div class="bank-assign-entity">
      <span class="entity-dot" style="background:${ent.color}"></span>
      <span>${ent.name}</span>
    </div>
    <select class="select bank-assign-select" onchange="setEntityBank('${key}', this.value)">
      <option value="">—</option>
      ${banks.map(b => `<option value="${b}" ${b === currentBank ? 'selected' : ''}>${b}</option>`).join('')}
    </select>
  </div>`;
}

function setEntityBank(entity, bankName) {
  Store.setEntityBank(entity, bankName);
  showToast(bankName ? `${ENTITIES[entity].name} → ${bankName}` : 'Bank unassigned');
  render();
}

function addBankPrompt() {
  const name = prompt('Enter bank name:');
  if (name && name.trim()) {
    Store.addBank(name.trim());
    showToast('Bank account added');
    render();
  }
}

function removeBank(name) {
  if (!confirm('Remove ' + name + '?')) return;
  const b = Store.getBaselines();
  delete b[name];
  localStorage.setItem('domino_baselines', JSON.stringify(b));
  const mapping = Store.getEntityBanks();
  Object.keys(mapping).forEach(k => { if (mapping[k] === name) delete mapping[k]; });
  localStorage.setItem('domino_entity_banks', JSON.stringify(mapping));
  Store.removeBank(name);
  showToast('Bank removed');
  render();
}

function saveBankBaseline(bankIndex) {
  const banks = Store.getBanks();
  const bankName = banks[bankIndex];
  if (!bankName) return;
  const input = document.getElementById('bl-bank-' + bankIndex);
  if (!input) return;
  const amount = parseFloat(input.value);
  if (isNaN(amount)) { showToast('Enter an amount'); return; }
  const dateInput = document.getElementById('bl-bankdate-' + bankIndex);
  const date = dateInput ? dateInput.value : todayStr();
  Store.setBaseline(bankName, { amount, date: date || todayStr() });
  showToast(`${bankName} balance saved`);
  render();
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', render);
