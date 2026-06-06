"use strict";

const CDRAGON_DATA_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";
const CDRAGON_ASSET_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default";
const DDRAGON_SPLASH_BASE = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash";
const ORIGIN_DATA_URL =
  "https://gist.githubusercontent.com/Kerrders/0067d88dfd982c272e20dcb496f4dbc7/raw/champions.json";

const ATLAS_STORAGE_KEY = "runeterra-atlas-cache-v1";
const DETAIL_STORAGE_KEY = "runeterra-atlas-details-v1";
const OFFLINE_CACHE_NAME = "runeterra-atlas-offline-v1";

const REGIONS = [
  {
    id: "freljord",
    name: "Freljord",
    subtitle: "Frozen northern tribes",
    description:
      "A harsh realm of iceborn warriors, ancient demigods, and rival tribes fighting for survival.",
    color: "#8ed8ff",
    x: 39,
    y: 14,
  },
  {
    id: "demacia",
    name: "Demacia",
    subtitle: "Kingdom of honor",
    description:
      "A proud, lawful kingdom that prizes justice, courage, and order while fearing uncontrolled magic.",
    color: "#f0d99b",
    x: 24,
    y: 43,
  },
  {
    id: "noxus",
    name: "Noxus",
    subtitle: "Empire of strength",
    description:
      "A brutal but meritocratic empire where ambition, conquest, and personal power shape destiny.",
    color: "#d64f5f",
    x: 50,
    y: 42,
  },
  {
    id: "ionia",
    name: "Ionia",
    subtitle: "The First Lands",
    description:
      "A spiritual archipelago where living magic, ancient traditions, and independence define the land.",
    color: "#e686c8",
    x: 77,
    y: 43,
  },
  {
    id: "piltover",
    name: "Piltover",
    subtitle: "City of progress",
    description:
      "A glittering city of invention, trade, and hextech built above the undercity of Zaun.",
    color: "#f6c85f",
    x: 61,
    y: 57,
  },
  {
    id: "zaun",
    name: "Zaun",
    subtitle: "The undercity",
    description:
      "A volatile labyrinth of chemtech, ingenuity, and survival beneath Piltover's polished bridges.",
    color: "#77dd77",
    x: 58,
    y: 62,
  },
  {
    id: "shurima",
    name: "Shurima",
    subtitle: "Sun-disc empire",
    description:
      "A vast desert of buried empires, ascended legends, nomad tribes, and impossible ruins.",
    color: "#d9a441",
    x: 47,
    y: 72,
  },
  {
    id: "mount-targon",
    name: "Mount Targon",
    subtitle: "Celestial peak",
    description:
      "A towering mountain where mortals climb toward the heavens and become vessels for Aspects.",
    color: "#b49cff",
    x: 35,
    y: 76,
  },
  {
    id: "ixtal",
    name: "Ixtal",
    subtitle: "Elemental kingdom",
    description:
      "A secluded jungle civilization shaped by elemental mastery and guarded from the wider world.",
    color: "#22d3a6",
    x: 57,
    y: 78,
  },
  {
    id: "bilgewater",
    name: "Bilgewater",
    subtitle: "Port of rogues",
    description:
      "A lawless harbor of hunters, pirates, sea monsters, and bargains made under lantern light.",
    color: "#ff9b54",
    x: 76,
    y: 70,
  },
  {
    id: "shadow-isles",
    name: "Shadow Isles",
    subtitle: "The Black Mist",
    description:
      "A cursed archipelago where ruination, restless spirits, and the Black Mist haunt the living.",
    color: "#55e6c1",
    x: 88,
    y: 79,
  },
  {
    id: "the-void",
    name: "The Void",
    subtitle: "Endless hunger",
    description:
      "An unknowable abyss pressing into reality through monsters, prophets, and impossible corruption.",
    color: "#b967ff",
    x: 43,
    y: 91,
  },
  {
    id: "bandle-city",
    name: "Bandle City",
    subtitle: "Yordle realm",
    description:
      "A whimsical hidden realm whose portals connect yordles to nearly every corner of Runeterra.",
    color: "#9ee66e",
    x: 70,
    y: 26,
  },
  {
    id: "runeterra",
    name: "Runeterra",
    subtitle: "World wanderers",
    description:
      "Champions whose stories cross borders, predate nations, or belong to the wider world itself.",
    color: "#0ac8b9",
    x: 50,
    y: 53,
  },
];

const REGION_BY_ID = Object.fromEntries(REGIONS.map((region) => [region.id, region]));
const ROLE_ORDER = ["assassin", "fighter", "mage", "marksman", "support", "tank"];

const state = {
  champions: [],
  details: {},
  selectedChampionId: null,
  selectedRegionId: "all",
  regionFilter: "all",
  roleFilter: "all",
  search: "",
  activeView: "champions",
  isLoading: true,
  offlineDownloadedAt: null,
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  collectElements();
  setupEventListeners();
  registerServiceWorker();
  renderStaticRegions();
  renderLoadingCards();
  loadAtlas();
});

function collectElements() {
  elements.searchInput = document.getElementById("searchInput");
  elements.regionFilter = document.getElementById("regionFilter");
  elements.roleFilter = document.getElementById("roleFilter");
  elements.statusLine = document.getElementById("statusLine");
  elements.championGrid = document.getElementById("championGrid");
  elements.championDetail = document.getElementById("championDetail");
  elements.resultCount = document.getElementById("resultCount");
  elements.championCount = document.getElementById("championCount");
  elements.regionCount = document.getElementById("regionCount");
  elements.offlineStatus = document.getElementById("offlineStatus");
  elements.dataSource = document.getElementById("dataSource");
  elements.mapCanvas = document.getElementById("mapCanvas");
  elements.mapRegionDetail = document.getElementById("mapRegionDetail");
  elements.regionGrid = document.getElementById("regionGrid");
  elements.resetRegionButton = document.getElementById("resetRegionButton");
  elements.downloadButton = document.getElementById("downloadButton");
  elements.quickDownloadButton = document.getElementById("quickDownloadButton");
  elements.downloadProgress = document.getElementById("downloadProgress");
  elements.downloadLog = document.getElementById("downloadLog");
  elements.offlineCardTitle = document.getElementById("offlineCardTitle");
  elements.offlineCardDescription = document.getElementById("offlineCardDescription");
}

function setupEventListeners() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderFilteredChampions();
  });

  elements.regionFilter.addEventListener("change", (event) => {
    selectRegion(event.target.value, false);
  });

  elements.roleFilter.addEventListener("change", (event) => {
    state.roleFilter = event.target.value;
    renderFilteredChampions();
  });

  elements.championGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-champion-id]");
    if (card) {
      selectChampion(card.dataset.championId);
    }
  });

  elements.mapCanvas.addEventListener("click", (event) => {
    const pin = event.target.closest("[data-region-id]");
    if (pin) {
      selectRegion(pin.dataset.regionId, false);
    }
  });

  elements.regionGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-region-id]");
    if (card) {
      selectRegion(card.dataset.regionId, true);
    }
  });

  elements.resetRegionButton.addEventListener("click", () => selectRegion("all", false));
  elements.downloadButton.addEventListener("click", downloadOfflineAtlas);
  elements.quickDownloadButton.addEventListener("click", () => {
    setView("offline");
    downloadOfflineAtlas();
  });
}

async function loadAtlas() {
  state.isLoading = true;
  setStatus("Loading champion data...");

  const stored = loadStoredAtlas();
  if (stored.champions.length) {
    state.champions = stored.champions;
    state.details = stored.details;
    state.offlineDownloadedAt = stored.downloadedAt;
    hydrateChampionsWithDetails();
    state.isLoading = false;
    setStatus("Loaded cached champion data. Checking for updates...");
    renderAll();
  }

  try {
    const champions = await fetchFreshChampionAtlas();
    state.champions = mergeStoredDetails(champions, state.details);
    state.isLoading = false;
    saveStoredAtlas(state.champions, state.details, state.offlineDownloadedAt);
    setStatus("Live champion data loaded.");
    renderAll();
  } catch (error) {
    console.warn("Could not refresh live champion data.", error);
    state.isLoading = false;
    if (state.champions.length) {
      setStatus("Offline mode: using the last downloaded champion atlas.");
    } else {
      setStatus("Could not load champion data. Connect to the internet and try again.", true);
      renderAll();
    }
  }
}

async function fetchFreshChampionAtlas() {
  const [summary, origins] = await Promise.all([
    fetchJson(`${CDRAGON_DATA_BASE}/champion-summary.json`),
    fetchOriginData().catch((error) => {
      console.warn("Origin data unavailable.", error);
      return [];
    }),
  ]);

  return mergeChampionData(summary, origins);
}

async function fetchOriginData() {
  const origins = await fetchJson(ORIGIN_DATA_URL);
  return Array.isArray(origins) ? origins : [];
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.json();
}

function mergeChampionData(summary, origins) {
  const originLookup = buildOriginLookup(origins);

  return summary
    .filter((champion) => champion && champion.id > 0 && champion.name && champion.alias)
    .map((champion) => {
      const origin =
        originLookup.get(normalizeKey(champion.alias)) || originLookup.get(normalizeKey(champion.name)) || {};
      const regionId = normalizeRegionId(origin.region) || inferRegion(champion);
      const region = REGION_BY_ID[regionId] || REGION_BY_ID.runeterra;
      const roles = Array.isArray(champion.roles) ? champion.roles.filter(Boolean) : [];

      return {
        uid: String(champion.id),
        name: champion.name,
        alias: champion.alias,
        title: champion.description || origin.title || "Champion of Runeterra",
        roles,
        roleText: formatList(roles),
        regionId: region.id,
        regionName: region.name,
        lane: normalizeMetaValue(origin.lane),
        resource: normalizeMetaValue(origin.resource),
        releaseDate: origin.releaseDate || null,
        iconUrl: assetUrl(champion.squarePortraitPath),
        splashUrl: `${DDRAGON_SPLASH_BASE}/${encodeURIComponent(champion.alias)}_0.jpg`,
        shortBio: "",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildOriginLookup(origins) {
  const lookup = new Map();
  origins.forEach((origin) => {
    if (!origin) {
      return;
    }
    if (origin.id) {
      lookup.set(normalizeKey(origin.id), origin);
    }
    if (origin.name) {
      lookup.set(normalizeKey(origin.name), origin);
    }
  });
  return lookup;
}

function inferRegion(champion) {
  const text = `${champion.name || ""} ${champion.description || ""}`.toLowerCase();
  const regionKeywords = {
    demacia: ["demacia", "demacian"],
    noxus: ["noxus", "noxian"],
    freljord: ["freljord"],
    ionia: ["ionia", "ionian"],
    piltover: ["piltover"],
    zaun: ["zaun"],
    shurima: ["shurima", "shuriman"],
    "mount-targon": ["targon", "aspect"],
    ixtal: ["ixtal", "ixtali"],
    bilgewater: ["bilgewater", "bounty hunter", "pirate"],
    "shadow-isles": ["shadow isles", "ruined", "black mist"],
    "the-void": ["void"],
    "bandle-city": ["yordle", "bandle"],
  };

  const found = Object.entries(regionKeywords).find(([, keywords]) =>
    keywords.some((keyword) => text.includes(keyword)),
  );
  return found ? found[0] : "runeterra";
}

function normalizeRegionId(region) {
  if (!region) {
    return "";
  }

  const normalized = String(region).toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  const aliases = {
    bandlecity: "bandle-city",
    bilgewater: "bilgewater",
    demacia: "demacia",
    freljord: "freljord",
    ionia: "ionia",
    ixtal: "ixtal",
    mounttargon: "mount-targon",
    "mount-targon": "mount-targon",
    noxus: "noxus",
    piltover: "piltover",
    runeterra: "runeterra",
    shadowisles: "shadow-isles",
    "shadow-isles": "shadow-isles",
    shurima: "shurima",
    void: "the-void",
    "the-void": "the-void",
    zaun: "zaun",
  };
  return aliases[normalized.replace(/-/g, "")] || aliases[normalized] || normalized;
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeMetaValue(value) {
  if (!value) {
    return "";
  }
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(", ");
}

function assetUrl(path) {
  if (!path) {
    return "";
  }
  const cleanPath = String(path).replace(/^\/+/, "");
  return encodeURI(`${CDRAGON_ASSET_BASE}/${cleanPath}`);
}

function setView(view) {
  state.activeView = view;
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  document.querySelectorAll(".nav-link[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (view === "map") {
    renderMap();
    renderMapRegionDetail();
  }
  if (view === "regions") {
    renderRegions();
  }
}

function selectRegion(regionId, goToChampions) {
  state.regionFilter = regionId;
  state.selectedRegionId = regionId;
  elements.regionFilter.value = regionId;
  renderFilteredChampions();
  renderMap();
  renderMapRegionDetail();
  renderRegions();

  if (goToChampions) {
    setView("champions");
  }
}

async function selectChampion(uid) {
  state.selectedChampionId = uid;
  renderFilteredChampions();
  renderChampionDetail();

  if (!state.details[uid] && navigator.onLine) {
    try {
      setStatus("Fetching champion lore...");
      const detail = await fetchChampionDetail(uid);
      state.details[uid] = detail;
      hydrateChampionsWithDetails();
      saveStoredAtlas(state.champions, state.details, state.offlineDownloadedAt);
      setStatus("Champion lore loaded.");
      renderFilteredChampions();
      renderChampionDetail();
    } catch (error) {
      console.warn("Could not fetch champion detail.", error);
      setStatus("Champion detail is unavailable right now. Showing summary data.", true);
    }
  }
}

async function fetchChampionDetail(uid) {
  const detail = await fetchJson(`${CDRAGON_DATA_BASE}/champions/${encodeURIComponent(uid)}.json`);
  return compactChampionDetail(detail);
}

function compactChampionDetail(detail) {
  const baseSkin = Array.isArray(detail.skins)
    ? detail.skins.find((skin) => skin.isBase) || detail.skins[0] || {}
    : {};

  return {
    uid: String(detail.id),
    title: detail.title || "",
    shortBio: detail.shortBio || "",
    roles: Array.isArray(detail.roles) ? detail.roles.filter(Boolean) : [],
    splashUrl: assetUrl(baseSkin.uncenteredSplashPath || baseSkin.splashPath || baseSkin.tilePath),
    tileUrl: assetUrl(baseSkin.tilePath),
    tacticalInfo: detail.tacticalInfo || null,
    playstyleInfo: detail.playstyleInfo || null,
  };
}

function hydrateChampionsWithDetails() {
  state.champions = mergeStoredDetails(state.champions, state.details);
}

function mergeStoredDetails(champions, details) {
  return champions.map((champion) => {
    const detail = details[champion.uid];
    if (!detail) {
      return champion;
    }
    return {
      ...champion,
      title: detail.title || champion.title,
      roles: detail.roles && detail.roles.length ? detail.roles : champion.roles,
      roleText:
        detail.roles && detail.roles.length ? formatList(detail.roles) : champion.roleText || formatList(champion.roles),
      shortBio: detail.shortBio || champion.shortBio,
      splashUrl: detail.splashUrl || champion.splashUrl,
      tileUrl: detail.tileUrl || champion.tileUrl,
    };
  });
}

function renderAll() {
  populateFilters();
  renderFilteredChampions();
  renderChampionDetail();
  renderMap();
  renderMapRegionDetail();
  renderRegions();
  renderOfflineStatus();
  elements.championCount.textContent = String(state.champions.length || 0);
  elements.regionCount.textContent = String(REGIONS.length);
}

function renderLoadingCards() {
  elements.championGrid.innerHTML = Array.from({ length: 12 }, () => '<div class="loading-card"></div>').join("");
}

function populateFilters() {
  const currentRegion = state.regionFilter;
  elements.regionFilter.innerHTML = [
    '<option value="all">All regions</option>',
    ...REGIONS.map((region) => `<option value="${escapeHtml(region.id)}">${escapeHtml(region.name)}</option>`),
  ].join("");
  elements.regionFilter.value = currentRegion;

  const roles = new Set(ROLE_ORDER);
  state.champions.forEach((champion) => champion.roles.forEach((role) => roles.add(role)));
  elements.roleFilter.innerHTML = [
    '<option value="all">All roles</option>',
    ...Array.from(roles)
      .filter(Boolean)
      .sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b))
      .map((role) => `<option value="${escapeHtml(role)}">${escapeHtml(capitalize(role))}</option>`),
  ].join("");
  elements.roleFilter.value = state.roleFilter;
}

function renderFilteredChampions() {
  const champions = getFilteredChampions();
  elements.resultCount.textContent = `${champions.length} ${champions.length === 1 ? "result" : "results"}`;

  if (!champions.length) {
    elements.championGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">*</span>
        <h2>No champions found</h2>
        <p>Try another search, region, or role filter.</p>
      </div>
    `;
    return;
  }

  elements.championGrid.innerHTML = champions.map(renderChampionCard).join("");
}

function getFilteredChampions() {
  return state.champions.filter((champion) => {
    const matchesRegion = state.regionFilter === "all" || champion.regionId === state.regionFilter;
    const matchesRole = state.roleFilter === "all" || champion.roles.includes(state.roleFilter);
    const searchable = [
      champion.name,
      champion.title,
      champion.regionName,
      champion.roleText,
      champion.shortBio,
      champion.lane,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !state.search || searchable.includes(state.search);
    return matchesRegion && matchesRole && matchesSearch;
  });
}

function renderChampionCard(champion) {
  const isActive = champion.uid === state.selectedChampionId ? " active" : "";
  const title = champion.title || "Champion of Runeterra";
  const region = REGION_BY_ID[champion.regionId] || REGION_BY_ID.runeterra;

  return `
    <button class="champion-card${isActive}" type="button" data-champion-id="${escapeHtml(champion.uid)}">
      <img src="${escapeHtml(champion.splashUrl || champion.iconUrl)}" alt="" loading="lazy" />
      <div class="champion-card-body">
        <h3>${escapeHtml(champion.name)}</h3>
        <p>${escapeHtml(title)}</p>
        <div class="chip-row">
          <span class="chip region-chip">${escapeHtml(region.name)}</span>
          ${champion.roles.slice(0, 2).map((role) => `<span class="chip">${escapeHtml(capitalize(role))}</span>`).join("")}
        </div>
      </div>
    </button>
  `;
}

function renderChampionDetail() {
  const champion = state.champions.find((item) => item.uid === state.selectedChampionId);
  if (!champion) {
    elements.championDetail.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">*</span>
        <h2>Select a champion</h2>
        <p>Choose any card to read lore, see region origin, roles, and art.</p>
      </div>
    `;
    return;
  }

  const region = REGION_BY_ID[champion.regionId] || REGION_BY_ID.runeterra;
  const bio = champion.shortBio || "Download or open this champion online to load the full lore summary.";
  const releaseDate = champion.releaseDate ? String(champion.releaseDate) : "Unknown";
  const lane = champion.lane || "Flexible";
  const resource = champion.resource || "Varies";

  elements.championDetail.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHtml(champion.splashUrl || champion.iconUrl)}" alt="" />
      <div>
        <p class="eyebrow">${escapeHtml(region.name)}</p>
        <h2>${escapeHtml(champion.name)}</h2>
        <p>${escapeHtml(champion.title || "Champion of Runeterra")}</p>
      </div>
    </div>
    <div class="detail-body">
      <div class="chip-row">
        <span class="chip region-chip">From ${escapeHtml(region.name)}</span>
        ${champion.roles.map((role) => `<span class="chip">${escapeHtml(capitalize(role))}</span>`).join("")}
      </div>
      <div class="detail-meta">
        <div class="meta-card"><small>Lane</small><strong>${escapeHtml(lane)}</strong></div>
        <div class="meta-card"><small>Resource</small><strong>${escapeHtml(resource)}</strong></div>
        <div class="meta-card"><small>Released</small><strong>${escapeHtml(releaseDate)}</strong></div>
        <div class="meta-card"><small>Origin</small><strong>${escapeHtml(region.subtitle)}</strong></div>
      </div>
      <p>${escapeHtml(bio)}</p>
      <button class="ghost-action compact" type="button" data-view="map" onclick="document.querySelector('[data-view=map]').click()">See on map</button>
    </div>
  `;
}

function renderMap() {
  const counts = getRegionCounts();
  elements.mapCanvas.innerHTML = `
    ${renderMapArt()}
    ${REGIONS.map((region) => {
      const active = state.selectedRegionId === region.id || state.regionFilter === region.id ? " active" : "";
      const count = counts.get(region.id) || 0;
      return `
        <button
          class="map-pin${active}"
          type="button"
          data-region-id="${escapeHtml(region.id)}"
          style="left:${region.x}%; top:${region.y}%; --pin-color:${region.color}; --pin-glow:${hexToGlow(region.color)}"
          aria-label="${escapeHtml(region.name)}, ${count} champions"
        >
          <span class="pin-dot" aria-hidden="true"></span>
          <span class="pin-label">
            <strong>${escapeHtml(region.name)}</strong>
            <span>${count} ${count === 1 ? "champion" : "champions"}</span>
          </span>
        </button>
      `;
    }).join("")}
  `;
}

function renderMapArt() {
  return `
    <svg class="map-art" viewBox="0 0 1000 700" role="img" aria-label="Stylized land and sea shapes of Runeterra">
      <defs>
        <linearGradient id="land" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#17304b" />
          <stop offset="55%" stop-color="#10243a" />
          <stop offset="100%" stop-color="#0a1828" />
        </linearGradient>
        <linearGradient id="shore" x1="0" x2="1">
          <stop offset="0%" stop-color="#c8aa6e" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#0ac8b9" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="1000" height="700" fill="transparent" />
      <path d="M132 270 C96 203 128 110 244 74 C340 44 432 83 470 154 C512 235 466 318 370 352 C260 391 168 343 132 270Z" fill="url(#land)" stroke="url(#shore)" stroke-width="4" />
      <path d="M425 271 C380 199 443 115 555 121 C659 126 724 198 711 292 C696 401 590 451 496 410 C446 388 450 327 425 271Z" fill="url(#land)" stroke="url(#shore)" stroke-width="4" />
      <path d="M280 489 C335 397 493 403 574 470 C661 543 617 651 494 667 C365 683 214 600 280 489Z" fill="url(#land)" stroke="url(#shore)" stroke-width="4" />
      <path d="M697 392 C742 330 841 312 907 365 C967 414 938 508 853 537 C767 566 653 501 697 392Z" fill="url(#land)" stroke="url(#shore)" stroke-width="4" />
      <path d="M668 136 C723 80 813 87 858 144 C911 211 855 297 771 288 C690 279 617 187 668 136Z" fill="url(#land)" stroke="url(#shore)" stroke-width="4" opacity="0.86" />
      <path d="M400 584 C441 559 493 568 523 602 C481 638 428 635 400 584Z" fill="#241342" stroke="#b967ff" stroke-opacity="0.45" stroke-width="3" />
      <path d="M163 268 C212 246 258 247 304 272" fill="none" stroke="#8ed8ff" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round" />
      <path d="M453 309 C513 286 585 301 636 352" fill="none" stroke="#d64f5f" stroke-opacity="0.2" stroke-width="10" stroke-linecap="round" />
      <path d="M717 421 C763 400 823 407 866 450" fill="none" stroke="#ff9b54" stroke-opacity="0.22" stroke-width="9" stroke-linecap="round" />
    </svg>
  `;
}

function renderMapRegionDetail() {
  const region =
    state.selectedRegionId === "all" ? null : REGION_BY_ID[state.selectedRegionId] || REGION_BY_ID[state.regionFilter];
  if (!region) {
    elements.mapRegionDetail.innerHTML = `
      <p class="eyebrow">World overview</p>
      <h2>Choose a map marker</h2>
      <p>Pick any region marker to filter champions and learn what makes that part of Runeterra distinct.</p>
      <div class="detail-meta">
        <div class="meta-card"><small>Champions</small><strong>${state.champions.length}</strong></div>
        <div class="meta-card"><small>Regions</small><strong>${REGIONS.length}</strong></div>
      </div>
    `;
    return;
  }

  const champions = state.champions.filter((champion) => champion.regionId === region.id);
  elements.mapRegionDetail.innerHTML = `
    <p class="eyebrow">${escapeHtml(region.subtitle)}</p>
    <h2>${escapeHtml(region.name)}</h2>
    <p>${escapeHtml(region.description)}</p>
    <div class="detail-meta">
      <div class="meta-card"><small>Champions</small><strong>${champions.length}</strong></div>
      <div class="meta-card"><small>Map location</small><strong>${region.x}%, ${region.y}%</strong></div>
    </div>
    <div class="mini-list">
      ${champions.slice(0, 18).map(renderMiniChampion).join("")}
    </div>
    <button class="primary-action" type="button" data-view="champions" onclick="document.querySelector('[data-view=champions]').click()">Browse these champions</button>
  `;
}

function renderStaticRegions() {
  populateFilters();
  renderRegions();
  renderMap();
  renderMapRegionDetail();
}

function renderRegions() {
  const counts = getRegionCounts();
  elements.regionGrid.innerHTML = REGIONS.map((region) => {
    const champions = state.champions.filter((champion) => champion.regionId === region.id);
    const count = counts.get(region.id) || 0;
    return `
      <button
        class="region-card"
        type="button"
        data-region-id="${escapeHtml(region.id)}"
        style="--region-color:${region.color}; --region-glow:${hexToGlow(region.color)}"
      >
        <div class="region-card-top">
          <div>
            <p class="eyebrow">${escapeHtml(region.subtitle)}</p>
            <h3>${escapeHtml(region.name)}</h3>
          </div>
          <span class="region-mark" aria-hidden="true"></span>
        </div>
        <p>${escapeHtml(region.description)}</p>
        <footer>
          <span class="chip region-chip">${count} ${count === 1 ? "champion" : "champions"}</span>
          ${champions.slice(0, 3).map((champion) => `<span class="chip">${escapeHtml(champion.name)}</span>`).join("")}
        </footer>
      </button>
    `;
  }).join("");
}

function renderMiniChampion(champion) {
  return `
    <span class="mini-champion">
      <img src="${escapeHtml(champion.iconUrl)}" alt="" loading="lazy" />
      ${escapeHtml(champion.name)}
    </span>
  `;
}

function getRegionCounts() {
  const counts = new Map(REGIONS.map((region) => [region.id, 0]));
  state.champions.forEach((champion) => {
    counts.set(champion.regionId, (counts.get(champion.regionId) || 0) + 1);
  });
  return counts;
}

function renderOfflineStatus() {
  const hasOffline = Boolean(state.offlineDownloadedAt || state.champions.length);
  const downloaded = state.offlineDownloadedAt ? formatDate(state.offlineDownloadedAt) : "";
  elements.offlineStatus.textContent = hasOffline ? "Ready" : "Online only";
  elements.dataSource.textContent = state.offlineDownloadedAt
    ? `Offline package saved ${downloaded}`
    : state.champions.length
      ? "Champion data is cached locally"
      : "No offline data saved yet";
  elements.offlineCardTitle.textContent = state.offlineDownloadedAt
    ? "Offline package downloaded"
    : "Offline package not downloaded yet";
  elements.offlineCardDescription.textContent = state.offlineDownloadedAt
    ? `Last saved ${downloaded}. Download again any time to refresh the roster.`
    : "Use the button below to cache all available champion data.";
}

async function downloadOfflineAtlas() {
  if (elements.downloadButton.disabled) {
    return;
  }

  elements.downloadButton.disabled = true;
  elements.quickDownloadButton.disabled = true;
  setDownloadProgress(0, "Starting offline download...");

  try {
    const champions = await fetchFreshChampionAtlas();
    const details = { ...state.details };
    let completedDetails = 0;

    await runPool(champions, 6, async (champion) => {
      try {
        details[champion.uid] = await fetchChampionDetail(champion.uid);
      } catch (error) {
        console.warn(`Could not cache detail for ${champion.name}.`, error);
      } finally {
        completedDetails += 1;
        setDownloadProgress(
          Math.round((completedDetails / champions.length) * 68),
          `Downloaded lore ${completedDetails}/${champions.length}`,
        );
      }
    });

    const hydratedChampions = mergeStoredDetails(champions, details);
    const assetUrls = collectAssetUrls(hydratedChampions);
    let completedAssets = 0;

    if ("caches" in window) {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await runPool(assetUrls, 10, async (url) => {
        try {
          const response = await fetch(url, { mode: "no-cors", cache: "reload" });
          await cache.put(url, response);
        } catch (error) {
          console.warn(`Could not cache asset ${url}.`, error);
        } finally {
          completedAssets += 1;
          const assetProgress = assetUrls.length ? completedAssets / assetUrls.length : 1;
          setDownloadProgress(
            68 + Math.round(assetProgress * 30),
            `Cached artwork ${completedAssets}/${assetUrls.length}`,
          );
        }
      });
    }

    state.champions = hydratedChampions;
    state.details = details;
    state.offlineDownloadedAt = new Date().toISOString();
    saveStoredAtlas(state.champions, state.details, state.offlineDownloadedAt);
    setDownloadProgress(100, "Offline atlas saved. You can now browse without a connection.");
    setStatus("Offline atlas downloaded.");
    renderAll();
  } catch (error) {
    console.error("Offline download failed.", error);
    setDownloadProgress(0, "Download failed. Check your connection and try again.");
    setStatus("Offline download failed. Check your connection and try again.", true);
  } finally {
    elements.downloadButton.disabled = false;
    elements.quickDownloadButton.disabled = false;
  }
}

function collectAssetUrls(champions) {
  const urls = new Set();
  champions.forEach((champion) => {
    [champion.iconUrl, champion.splashUrl, champion.tileUrl].filter(Boolean).forEach((url) => urls.add(url));
  });
  return Array.from(urls);
}

async function runPool(items, limit, worker) {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      await worker(item);
    }
  });
  await Promise.all(workers);
}

function setDownloadProgress(percent, message) {
  elements.downloadProgress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  elements.downloadLog.textContent = message;
}

function loadStoredAtlas() {
  try {
    const atlas = JSON.parse(localStorage.getItem(ATLAS_STORAGE_KEY) || "{}");
    const details = JSON.parse(localStorage.getItem(DETAIL_STORAGE_KEY) || "{}");
    return {
      champions: Array.isArray(atlas.champions) ? atlas.champions : [],
      downloadedAt: atlas.downloadedAt || null,
      details: details && typeof details === "object" ? details : {},
    };
  } catch (error) {
    console.warn("Could not read stored atlas.", error);
    return { champions: [], details: {}, downloadedAt: null };
  }
}

function saveStoredAtlas(champions, details, downloadedAt) {
  const compactChampions = champions.map((champion) => ({
    uid: champion.uid,
    name: champion.name,
    alias: champion.alias,
    title: champion.title,
    roles: champion.roles,
    roleText: champion.roleText,
    regionId: champion.regionId,
    regionName: champion.regionName,
    lane: champion.lane,
    resource: champion.resource,
    releaseDate: champion.releaseDate,
    iconUrl: champion.iconUrl,
    splashUrl: champion.splashUrl,
    tileUrl: champion.tileUrl,
    shortBio: champion.shortBio,
  }));

  try {
    localStorage.setItem(
      ATLAS_STORAGE_KEY,
      JSON.stringify({ champions: compactChampions, downloadedAt: downloadedAt || null }),
    );
    localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(details || {}));
  } catch (error) {
    console.warn("Could not store atlas locally.", error);
    setStatus("Browser storage is full, so only part of the offline atlas may be saved.", true);
  }
}

function setStatus(message, isError = false) {
  elements.statusLine.textContent = message;
  elements.statusLine.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function formatList(items) {
  return (items || []).map(capitalize).join(", ");
}

function capitalize(value) {
  if (!value) {
    return "";
  }
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return "recently";
  }
}

function hexToGlow(hex) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, 0.42)`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.warn("Service worker registration failed.", error);
    });
  }
}
