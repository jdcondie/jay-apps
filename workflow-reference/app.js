const data = workflowData;

let activeCategory = 'all';
let searchQuery = '';
let openCards = new Set();

const CATEGORY_ORDER = ['lead', 'admin', 'ops', 'sales', 'knowledge'];
const CATEGORY_LABELS = {
  lead: '📞 Lead & Communications',
  admin: '📋 Admin & Data Entry',
  ops: '⚙️ Operations',
  sales: '💼 Sales',
  knowledge: '🧠 Internal Knowledge'
};

function getFilteredData() {
  return data.filter(w => {
    const matchCat = activeCategory === 'all' || w.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      w.name.toLowerCase().includes(q) ||
      w.preview.toLowerCase().includes(q) ||
      w.problem.toLowerCase().includes(q) ||
      w.pitch.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

function groupByCategory(items) {
  const groups = {};
  CATEGORY_ORDER.forEach(c => {
    const group = items.filter(i => i.category === c);
    if (group.length) groups[c] = { label: CATEGORY_LABELS[c], items: group };
  });
  return groups;
}

function renderSidebar(filtered) {
  const sidebar = document.getElementById('sidebar');
  const groups = groupByCategory(filtered);
  sidebar.innerHTML = '';
  Object.entries(groups).forEach(([cat, group]) => {
    const sec = document.createElement('div');
    sec.className = 'sidebar-section';
    sec.innerHTML = `<div class="sidebar-label">${group.label}</div>`;
    group.items.forEach(w => {
      const a = document.createElement('a');
      a.className = 'sidebar-item';
      a.href = '#' + w.id;
      a.innerHTML = `<span class="sidebar-dot"></span>${w.name}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const el = document.getElementById(w.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (!openCards.has(w.id)) {
            toggleCard(w.id);
          }
        }
      });
      sec.appendChild(a);
    });
    sidebar.appendChild(sec);
  });
}

function renderCard(w) {
  const isOpen = openCards.has(w.id);
  const levelClass = w.level === 1 ? 'level-1' : 'level-2';
  const levelText = w.level === 1 ? 'Level 1 — Native AI' : 'Level 2 — AI + Automation';

  const stepsHtml = w.steps.map((s, i) => {
    const isLast = s.isLast;
    return `
      <div class="flow-step ${isLast ? 'flow-last' : ''}">
        <div class="flow-connector">
          <div class="flow-num">${i + 1}</div>
          ${!isLast ? '<div class="flow-line"></div>' : ''}
        </div>
        <div class="flow-content">
          <div class="flow-label">${s.label}</div>
          <div class="flow-detail">${s.detail}</div>
        </div>
      </div>`;
  }).join('');

  const qsHtml = w.discoveryQs.map(q => `
    <div class="discovery-q">
      <span class="q-icon">→</span>
      <span>${q}</span>
    </div>`).join('');

  const toolsHtml = w.tools.map(t => `
    <div class="tool-item">
      <span class="tool-badge ${t.badge}">${t.badge === 'trigger' ? 'Trigger' : t.badge === 'ai' ? 'AI Layer' : 'Output'}</span>
      <div>
        <div class="tool-name">${t.name}</div>
        <div class="tool-desc">${t.desc}</div>
      </div>
    </div>`).join('');

  return `
    <div class="workflow-card ${isOpen ? 'open' : ''}" id="${w.id}" data-id="${w.id}">
      <div class="card-header" onclick="toggleCard('${w.id}')">
        <div class="card-header-left">
          <span class="card-emoji">${w.emoji}</span>
          <div>
            <div class="card-name">${w.name}</div>
            <div class="card-preview">${w.preview}</div>
          </div>
        </div>
        <span class="level-badge ${levelClass}">${levelText}</span>
        <span class="card-expand">▾</span>
      </div>
      <div class="card-body">
        <div class="card-tabs">
          <button class="card-tab active" onclick="switchTab(this, '${w.id}', 'problem')">Problem</button>
          <button class="card-tab" onclick="switchTab(this, '${w.id}', 'solution')">Automation Flow</button>
          <button class="card-tab" onclick="switchTab(this, '${w.id}', 'roi')">ROI Pitch</button>
          <button class="card-tab" onclick="switchTab(this, '${w.id}', 'tools')">Tool Stack</button>
        </div>
        <div class="card-panel active" data-panel="${w.id}-problem">
          <div class="problem-text">${w.problem}</div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--orange);margin-bottom:10px;">Discovery Questions to Ask</div>
          <div class="discovery-qs">${qsHtml}</div>
        </div>
        <div class="card-panel" data-panel="${w.id}-solution">
          <div class="flow-steps">${stepsHtml}</div>
        </div>
        <div class="card-panel" data-panel="${w.id}-roi">
          <div class="roi-grid">
            <div class="roi-card"><div class="roi-label">Time Saved</div><div class="roi-value"><span>${w.roi.time}</span></div></div>
            <div class="roi-card"><div class="roi-label">Cost Impact</div><div class="roi-value">${w.roi.cost}</div></div>
            <div class="roi-card"><div class="roi-label">Hire Avoided</div><div class="roi-value">${w.roi.hire}</div></div>
            <div class="roi-card"><div class="roi-label">Speed</div><div class="roi-value">${w.roi.speed}</div></div>
          </div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--orange);margin:16px 0 8px;">Say This to the Client</div>
          <div class="pitch-line">"${w.pitch}"</div>
        </div>
        <div class="card-panel" data-panel="${w.id}-tools">
          <div class="tools-list">${toolsHtml}</div>
        </div>
      </div>
    </div>`;
}

function renderContent() {
  const content = document.getElementById('content');
  const empty = document.getElementById('emptyState');
  const filtered = getFilteredData();
  const count = document.getElementById('resultCount');

  if (filtered.length === 0) {
    content.innerHTML = '';
    content.appendChild(empty);
    empty.classList.add('visible');
    count.textContent = '0 results';
    renderSidebar([]);
    return;
  }

  empty.classList.remove('visible');
  count.textContent = `${filtered.length} workflow${filtered.length !== 1 ? 's' : ''}`;

  const groups = groupByCategory(filtered);
  let html = '';
  Object.entries(groups).forEach(([cat, group]) => {
    html += `<div class="section-block">
      <div class="section-eyebrow">${group.label}</div>`;
    group.items.forEach(w => { html += renderCard(w); });
    html += '</div>';
  });

  content.innerHTML = html;
  content.appendChild(empty);
  renderSidebar(filtered);
}

function toggleCard(id) {
  if (openCards.has(id)) {
    openCards.delete(id);
  } else {
    openCards.add(id);
  }
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.toggle('open', openCards.has(id));
}

function switchTab(btn, id, panel) {
  const card = document.getElementById(id);
  card.querySelectorAll('.card-tab').forEach(t => t.classList.remove('active'));
  card.querySelectorAll('.card-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const target = card.querySelector(`[data-panel="${id}-${panel}"]`);
  if (target) target.classList.add('active');
}

// Filter buttons
document.getElementById('filterBar').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.category;
  renderContent();
});

// Search
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
searchInput.addEventListener('input', e => {
  searchQuery = e.target.value;
  searchClear.style.display = searchQuery ? 'block' : 'none';
  renderContent();
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.style.display = 'none';
  searchInput.focus();
  renderContent();
});

// Init
renderContent();
