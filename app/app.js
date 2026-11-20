// Leonida Trophy Guide — tracker for the 55 GTA VI trophies on PlayStation 5.
// Static and offline: the trophy data comes from data/trophies.json in this app,
// progress lives in localStorage only, and nothing is fetched from the network.

const DATA_URL = "data/trophies.json";
const STORAGE_KEY = "leonida-trophy-guide-v1";

const KIND_LABELS = {
  all: "All trophies",
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  side: "Side quests",
  robbery: "Robbery",
  money: "Money",
  misc: "One-offs",
  online: "Online",
};
const KIND_ORDER = ["all", "story", "missable", "collectibles", "activities", "side", "robbery", "money", "misc", "online"];
const STAGE_LABELS = { story: "Roadmap step 1 — story", "100%": "Roadmap step 2 — 100%", cleanup: "Roadmap step 3 — clean-up" };

const state = {
  earned: new Set(),
  spoiler: false,
  filter: "all",
  search: "",
};

const listEl = document.getElementById("trophyList");
const emptyEl = document.getElementById("emptyState");
const resultEl = document.getElementById("resultCount");
const searchEl = document.getElementById("search");
const spoilerEl = document.getElementById("spoilerToggle");

let trophyData = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) state.earned = new Set(saved.earned.filter((n) => Number.isInteger(n)));
    if (typeof saved.spoiler === "boolean") state.spoiler = saved.spoiler;
  } catch (err) {
    console.warn("Saved progress could not be read, starting fresh.", err);
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b), spoiler: state.spoiler }));
}

async function loadTrophyData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error("Could not load " + DATA_URL);
  trophyData = await response.json();
}

function trophyMatchesFilter(trophy) {
  if (state.filter === "online") return false;
  if (state.filter === "missable") return trophy.missable === true;
  if (state.filter !== "all" && trophy.kind !== state.filter) return false;
  if (state.search) {
    const haystack = (trophy.name + " " + trophy.description + " " + trophy.guide).toLowerCase();
    if (!haystack.includes(state.search)) return false;
  }
  return true;
}

function spoilerMasks(trophy) {
  // Spoiler mode hides the name, description and guide of hidden story
  // trophies until they are earned. Everything else stays visible.
  return state.spoiler && trophy.secret === true && trophy.kind === "story" && !state.earned.has(trophy.id);
}

function gradeBadge(trophy) {
  const badge = document.createElement("span");
  badge.className = "badge " + trophy.grade;
  badge.textContent = trophy.grade;
  return badge;
}

function kindTag(trophy) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  return tag;
}

function renderTrophyCard(trophy) {
  const item = document.createElement("li");
  item.className = "trophy" + (state.earned.has(trophy.id) ? " earned" : "");

  const head = document.createElement("div");
  head.className = "trophy-head";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = state.earned.has(trophy.id);
  checkbox.setAttribute("aria-label", "Mark " + trophy.name + " as earned");
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) state.earned.add(trophy.id);
    else state.earned.delete(trophy.id);
    saveProgress();
    renderTrophyList();
  });
  head.appendChild(checkbox);

  const nameWrap = document.createElement("div");
  const name = document.createElement("span");
  name.className = "trophy-name";
  if (spoilerMasks(trophy)) {
    name.classList.add("masked");
    name.textContent = "Hidden story trophy";
  } else {
    name.textContent = trophy.name;
  }
  nameWrap.appendChild(name);
  nameWrap.appendChild(gradeBadge(trophy));
  nameWrap.appendChild(kindTag(trophy));
  if (trophy.secret) {
    const secretTag = document.createElement("span");
    secretTag.className = "tag secret";
    secretTag.textContent = "Hidden on PS5";
    nameWrap.appendChild(secretTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement("span");
    missTag.className = "tag missable";
    missTag.textContent = "Missable — do it in Chapter 1";
    nameWrap.appendChild(missTag);
  }
  const stageTag = document.createElement("span");
  stageTag.className = "tag";
  stageTag.textContent = STAGE_LABELS[trophy.stage] || trophy.stage;
  nameWrap.appendChild(stageTag);
  head.appendChild(nameWrap);
  item.appendChild(head);

  const desc = document.createElement("p");
  desc.className = "trophy-desc";
  desc.textContent = spoilerMasks(trophy)
    ? "Complete the story to reveal this trophy."
    : "Official description: “" + trophy.description + "”";
  item.appendChild(desc);

  if (!spoilerMasks(trophy)) {
    const guide = document.createElement("p");
    guide.className = "trophy-guide";
    const guideLabel = document.createElement("strong");
    guideLabel.textContent = "How to unlock it: ";
    guide.appendChild(guideLabel);
    guide.appendChild(document.createTextNode(trophy.guide));
    item.appendChild(guide);

    const sources = document.createElement("p");
    sources.className = "trophy-sources";
    sources.textContent = "Sources: ";
    (trophy.sources || []).forEach((source, index) => {
      if (index > 0) sources.appendChild(document.createTextNode(" · "));
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = source.name;
      sources.appendChild(link);
    });
    item.appendChild(sources);
  }
  return item;
}

function renderTrophyList() {
  listEl.innerHTML = "";
  const shown = trophyData.trophies.filter(trophyMatchesFilter);
  shown.forEach((trophy) => listEl.appendChild(renderTrophyCard(trophy)));
  emptyEl.hidden = shown.length > 0;
  if (state.filter === "online") {
    resultEl.textContent = "No online trophies — every one of the 55 is single-player.";
  } else {
    resultEl.textContent = "Showing " + shown.length + " of " + trophyData.trophies.length + " trophies.";
  }
  updateProgress();
}

function updateProgress() {
  const total = trophyData.trophies.length;
  const earned = state.earned.size;
  const percent = Math.round((earned / total) * 100);
  document.getElementById("earnedCount").textContent = earned + " / " + total + " earned";
  document.getElementById("percentLabel").textContent = percent + "% to platinum";
  document.getElementById("progressFill").style.width = percent + "%";
  const counts = {};
  trophyData.trophies.forEach((trophy) => {
    if (state.earned.has(trophy.id)) counts[trophy.grade] = (counts[trophy.grade] || 0) + 1;
  });
  document.getElementById("gradeCounts").textContent =
    "Platinum " + (counts.platinum || 0) + "/1 · Gold " + (counts.gold || 0) + "/2 · Silver " +
    (counts.silver || 0) + "/6 · Bronze " + (counts.bronze || 0) + "/46";
}

function renderFilters() {
  const filtersEl = document.getElementById("filters");
  KIND_ORDER.forEach((kind) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = KIND_LABELS[kind];
    chip.setAttribute("aria-pressed", String(state.filter === kind));
    chip.addEventListener("click", () => {
      state.filter = kind;
      renderFilters();
      renderTrophyList();
    });
    filtersEl.appendChild(chip);
  });
}

function renderRoadmap() {
  const stepsEl = document.getElementById("roadmapSteps");
  trophyData.roadmap.forEach((step) => {
    const card = document.createElement("div");
    card.className = "step";
    const heading = document.createElement("h3");
    heading.textContent = "Step " + step.step + ": " + step.title + " ";
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = "· " + step.time;
    heading.appendChild(time);
    const body = document.createElement("p");
    body.textContent = step.text;
    card.appendChild(heading);
    card.appendChild(body);
    stepsEl.appendChild(card);
  });
}

function exportProgress() {
  const payload = JSON.stringify({ app: "leonida-trophy-guide", earned: [...state.earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leonida-trophy-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed.earned) ? parsed.earned : parsed;
      const valid = new Set(trophyData.trophies.map((trophy) => trophy.id));
      state.earned = new Set(ids.filter((id) => valid.has(id)));
      saveProgress();
      renderTrophyList();
    } catch (err) {
      alert("That file could not be imported as trophy progress.");
    }
  };
  reader.readAsText(file);
}

function wireControls() {
  searchEl.addEventListener("input", () => {
    state.search = searchEl.value.trim().toLowerCase();
    renderTrophyList();
  });
  spoilerEl.checked = state.spoiler;
  spoilerEl.addEventListener("change", () => {
    state.spoiler = spoilerEl.checked;
    saveProgress();
    renderTrophyList();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  const importInput = document.getElementById("importFile");
  document.getElementById("importBtn").addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", () => {
    if (importInput.files && importInput.files[0]) importProgressFile(importInput.files[0]);
    importInput.value = "";
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Clear all checked trophies?")) {
      state.earned.clear();
      saveProgress();
      renderTrophyList();
    }
  });
}

async function startGuide() {
  loadProgress();
  await loadTrophyData();
  renderRoadmap();
  renderFilters();
  wireControls();
  renderTrophyList();
}

startGuide().catch((err) => {
  listEl.innerHTML = "";
  resultEl.textContent = "The trophy data could not be loaded. Serve this folder over HTTP and try again.";
  console.error(err);
});
