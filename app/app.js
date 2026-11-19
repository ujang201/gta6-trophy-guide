// Leonida Trophy Guide: a checklist and tracker for the 55 PlayStation 5 trophies
// of Grand Theft Auto VI. Static, offline, no libraries. Progress lives in
// localStorage; export and import move it as a JSON file. Sources are cited
// beside every guide and open only when the reader follows the link.
const KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 4, 5, 8, 9, 15, 16, 20, 21, 28, 33, 35, 42];

const SOURCES = {
  exophase: { label: 'Exophase — GTA VI trophies', url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/' },
  psnprofiles: { label: 'PSNProfiles — GTA VI trophy list', url: 'https://psnprofiles.com/trophies/grand-theft-auto-vi' },
  powerpyx: { label: 'PowerPyx — GTA 6 Trophy Guide & Roadmap', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
  gtabase: { label: 'GTABase — GTA 6 Trophy Guide & Achievements List', url: 'https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series' },
  planetgta6: { label: 'Planet GTA 6 — GTA 6 Trophies', url: 'https://www.planetgta6.com/en/gta-6-trophies/' },
  outputlag: { label: 'Output Lag — GTA 6 Trophy List', url: 'https://outputlag.com/guides/gta-6-trophy-list/' },
  keengamer: { label: 'KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap', url: 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/' },
  gtavibes: { label: 'GTA Vibes — GTA 6 Trophy List', url: 'https://www.gtavibes.com/guides/gta-6-trophy-list-achievements' },
};

const params = new URLSearchParams(location.search);
const demo = params.get('demo') === '1';

const rowsEl = document.getElementById('rows');
const emptyEl = document.getElementById('empty');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const onlineNote = document.getElementById('onlineNote');
const progressFill = document.getElementById('progressFill');
const progressCount = document.getElementById('progressCount');
const progressByGrade = document.getElementById('progressByGrade');
const sourceList = document.getElementById('sourceList');

let earned = new Set();
if (demo) {
  earned = new Set(DEMO_EARNED);
} else {
  try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); }
  catch { earned = new Set(); }
}

let trophies = [];
let kind = params.get('filter') || 'all';
let selectedId = null;

function save() {
  if (demo) return;
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(grade) {
  return grade === 'platinum' ? 'Platinum' : grade[0].toUpperCase() + grade.slice(1);
}

function isHidden(trophy) {
  return spoilerEl.checked && trophy.secret && !earned.has(trophy.id);
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  const grade = gradeEl.value;
  return trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length || 55;
  const n = earned.size;
  progressFill.style.width = `${Math.round((n / total) * 100)}%`;
  progressCount.textContent = `${n} of ${total} earned`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${have}/${all} ${g}`;
  }).join(' · ');
  progressByGrade.textContent = byGrade;
}

function renderRows() {
  const list = visibleTrophies();
  onlineNote.hidden = kind !== 'online';
  emptyEl.hidden = list.length > 0;
  rowsEl.innerHTML = '';
  for (const t of list) {
    const tr = document.createElement('tr');
    if (selectedId === t.id) tr.classList.add('selected');
    if (earned.has(t.id)) tr.classList.add('earned-row');
    const hidden = isHidden(t);
    const check = document.createElement('td');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save();
      renderProgress();
      renderRows();
      renderDetail();
    });
    check.appendChild(box);
    tr.appendChild(check);
    const name = document.createElement('td');
    name.className = 'trophy-name';
    if (hidden) {
      name.textContent = 'Hidden trophy — earn it to reveal';
      const d = document.createElement('span');
      d.className = 'desc';
      d.textContent = 'Story trophy, hidden on PlayStation until earned.';
      name.appendChild(d);
    } else {
      name.textContent = t.name;
      const d = document.createElement('span');
      d.className = 'desc';
      d.textContent = t.description;
      name.appendChild(d);
    }
    tr.appendChild(name);
    const grade = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = gradeLabel(t.grade);
    grade.appendChild(badge);
    tr.appendChild(grade);
    const kindCell = document.createElement('td');
    kindCell.className = 'kind';
    let kindText = t.kind === 'story' ? 'Story' : t.kind === 'collectibles' ? 'Collectibles' : 'Activities';
    if (t.missable) kindText += ' · ⚠ Missable';
    if (t.secret) kindText += ' · Hidden';
    kindCell.textContent = kindText;
    tr.appendChild(kindCell);
    tr.addEventListener('click', () => {
      selectedId = t.id;
      renderRows();
      renderDetail();
    });
    rowsEl.appendChild(tr);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  detailEl.innerHTML = '';
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-hint';
    p.textContent = 'Select a trophy to read its guide and sources.';
    detailEl.appendChild(p);
    return;
  }
  const hidden = isHidden(t);
  const h = document.createElement('h3');
  h.textContent = hidden ? 'Hidden trophy' : t.name;
  detailEl.appendChild(h);
  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = hidden
    ? 'A story trophy, hidden on PlayStation until earned. Turn the spoiler setting off to see it.'
    : `“${t.description}” — official description, ${gradeLabel(t.grade)}.`;
  detailEl.appendChild(off);
  const flags = document.createElement('div');
  flags.className = 'flags';
  const mk = (text, cls) => {
    const s = document.createElement('span');
    s.className = `badge ${cls}`;
    s.textContent = text;
    return s;
  };
  flags.appendChild(mk(gradeLabel(t.grade), t.grade));
  flags.appendChild(mk(t.kind === 'story' ? 'Story' : t.kind === 'collectibles' ? 'Collectibles' : 'Activities', 'silver'));
  if (t.missable) flags.appendChild(mk('⚠ Missable', 'bronze'));
  if (t.secret) flags.appendChild(mk('Hidden', 'platinum'));
  detailEl.appendChild(flags);
  if (!hidden) {
    const g = document.createElement('p');
    g.className = 'guide';
    g.textContent = t.guide;
    detailEl.appendChild(g);
    const src = document.createElement('div');
    src.className = 'sources';
    const sh = document.createElement('h4');
    sh.textContent = 'Sources';
    src.appendChild(sh);
    const ul = document.createElement('ul');
    for (const key of t.sources) {
      const s = SOURCES[key];
      if (!s) continue;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.label;
      li.appendChild(a);
      ul.appendChild(li);
    }
    src.appendChild(ul);
    detailEl.appendChild(src);
  }
  const earnedBtn = document.createElement('p');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    save();
    renderProgress();
    renderRows();
    renderDetail();
  });
  earnedBtn.appendChild(toggle);
  detailEl.appendChild(earnedBtn);
}

function renderSources() {
  sourceList.innerHTML = '';
  for (const key of Object.keys(SOURCES)) {
    const s = SOURCES[key];
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    li.appendChild(a);
    sourceList.appendChild(li);
  }
}

document.querySelectorAll('.filters button').forEach((btn) => {
  if (btn.dataset.kind === kind) btn.classList.add('on');
  else btn.classList.remove('on');
  btn.addEventListener('click', () => {
    kind = btn.dataset.kind;
    document.querySelectorAll('.filters button').forEach((b) => b.classList.toggle('on', b === btn));
    renderRows();
  });
});
searchEl.addEventListener('input', renderRows);
gradeEl.addEventListener('change', renderRows);
spoilerEl.addEventListener('change', () => { renderRows(); renderDetail(); });
if (params.get('spoiler') === 'on') spoilerEl.checked = true;

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importFile').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    save();
    renderProgress();
    renderRows();
    renderDetail();
  } catch {
    alert('That file is not a progress export from this guide.');
  }
  ev.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderProgress();
    renderRows();
    renderDetail();
  }
});

const data = await (await fetch('data/trophies.json')).json();
trophies = data.trophies;
if (demo) selectedId = 28;
renderProgress();
renderRows();
renderDetail();
renderSources();
if (params.get('view') === 'roadmap') {
  window.scrollTo(0, document.getElementById('roadmap').offsetTop);
}
if (params.get('view') === 'tracker') {
  window.scrollTo(0, document.querySelector('.tracker').offsetTop);
}
