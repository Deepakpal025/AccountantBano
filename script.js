// =========================================================
// ACCOUNTANT BANO — script.js
// =========================================================

// EDIT SOCIAL LINKS HERE
const CONFIG = {
  instagram: "https://instagram.com/accountant_bano",
  telegram: "https://superprofile.bio/vig/6a9f8557a7db3900137edac3",
  youtube: "https://youtube.com/@YOUR-CHANNEL",
  whatsapp: "https://wa.me/918750916925",
  websiteName: "Accountant Bano"
};

// Course links — edit as needed
const COURSE_LINKS = {
  tally: "#",
  gst: "#",
  excel: "#",
  training: "#"
};

const CATEGORY_ICONS = {
  Tally: "fa-file-invoice",
  GST: "fa-receipt",
  TDS: "fa-scale-balanced",
  Excel: "fa-table",
  Notes: "fa-book",
  Course: "fa-graduation-cap",
  Community: "fa-users",
  Important: "fa-circle-exclamation"
};

let allUpdates = [];
let activeCategory = "All";
let activeSearch = "";

document.addEventListener("DOMContentLoaded", () => {
  applySocialLinks();
  document.getElementById("year").textContent = new Date().getFullYear();
  loadUpdates();
  setupSearch();
  setupScrollTop();
  setupCourseLinks();
});

// ---------------------------------------------------------
// SOCIAL LINKS — applies CONFIG values to every element
// with a data-social attribute
// ---------------------------------------------------------
function applySocialLinks() {
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.getAttribute("data-social");
    if (CONFIG[key]) {
      el.setAttribute("href", CONFIG[key]);
      if (key !== "telegram" || el.getAttribute("href") !== "#telegram") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
    }
  });
}

function setupCourseLinks() {
  document.querySelectorAll(".course-link").forEach((el) => {
    const key = el.getAttribute("data-course");
    if (COURSE_LINKS[key]) {
      el.setAttribute("href", COURSE_LINKS[key]);
    }
  });
}

// ---------------------------------------------------------
// LOAD updates.json AND RENDER CARDS
// UPDATE CARDS ARE LOADED FROM updates.json
// ---------------------------------------------------------
async function loadUpdates() {
  const grid = document.getElementById("updatesGrid");
  renderSkeleton(grid);

  try {
    const res = await fetch("updates.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch updates.json");
    const data = await res.json();

    allUpdates = (data.updates || []).sort((a, b) => {
      // Pinned items always first, then newest first (by date string order in file)
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    buildCategoryFilters(allUpdates);
    renderUpdates();
  } catch (err) {
    grid.innerHTML = `<p class="error-text">Updates could not be loaded. Please try again.</p>`;
    console.error(err);
  }
}

function renderSkeleton(grid) {
  grid.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-media"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    `;
    grid.appendChild(card);
  }
}

// ---------------------------------------------------------
// CATEGORY FILTER
// ---------------------------------------------------------
function buildCategoryFilters(updates) {
  const wrap = document.getElementById("categoryFilters");
  const categories = ["All", ...new Set(updates.map((u) => u.category).filter(Boolean))];

  wrap.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat === activeCategory ? " is-active" : "");
    btn.textContent = cat;
    btn.setAttribute("data-category", cat);
    btn.addEventListener("click", () => {
      activeCategory = cat;
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderUpdates();
    });
    wrap.appendChild(btn);
  });
}

// ---------------------------------------------------------
// SEARCH
// ---------------------------------------------------------
function setupSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", (e) => {
    activeSearch = e.target.value.trim().toLowerCase();
    renderUpdates();
  });
}

// ---------------------------------------------------------
// RENDER FILTERED CARDS
// ---------------------------------------------------------
function renderUpdates() {
  const grid = document.getElementById("updatesGrid");
  const emptyState = document.getElementById("emptyState");

  let filtered = allUpdates.filter((u) => {
    const matchesCategory = activeCategory === "All" || u.category === activeCategory;
    const matchesSearch =
      !activeSearch ||
      (u.title || "").toLowerCase().includes(activeSearch) ||
      (u.description || "").toLowerCase().includes(activeSearch) ||
      (u.category || "").toLowerCase().includes(activeSearch);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  filtered.forEach((update) => {
    grid.appendChild(buildCard(update));
  });
}

function buildCard(update) {
  const card = document.createElement("article");
  card.className = "update-card";

  const iconClass = CATEGORY_ICONS[update.category] || "fa-file-lines";

  // IMAGE HANDLING — fallback placeholder icon if no image provided
  const mediaHTML = update.image
    ? `<img src="${escapeAttr(update.image)}" alt="${escapeAttr(update.title || "Update")}" loading="lazy" onerror="this.remove()">`
    : `<i class="fa-solid ${iconClass} placeholder-icon"></i>`;

  card.innerHTML = `
    ${update.pinned ? `<div class="badge--pinned">📌 Important</div>` : ""}
    <div class="update-card__media">
      ${mediaHTML}
      ${update.new ? `<span class="badge badge--new">NEW</span>` : ""}
      ${update.category ? `<span class="badge badge--category">${escapeHTML(update.category)}</span>` : ""}
    </div>
    <div class="update-card__body">
      <h3 class="update-card__title">${escapeHTML(update.title || "Untitled Update")}</h3>
      <p class="update-card__desc">${escapeHTML(update.description || "")}</p>
      <div class="update-card__meta">
        <span class="update-card__date">${escapeHTML(update.date || "")}</span>
      </div>
      <div class="update-card__actions">
        <button class="btn-download" type="button">${escapeHTML(update.button || "View")}</button>
        <button class="btn-share" type="button" aria-label="Share this update"><i class="fa-solid fa-share-nodes"></i></button>
      </div>
    </div>
  `;

  // LINK HANDLING
  card.querySelector(".btn-download").addEventListener("click", () => openLink(update.link));

  // SHARE BUTTON
  card.querySelector(".btn-share").addEventListener("click", () => shareUpdate(update));

  return card;
}

// ---------------------------------------------------------
// LINK HANDLING — PDF / Telegram / YouTube / external
// ---------------------------------------------------------
function openLink(link) {
  if (!link) return;
  window.open(link, "_blank", "noopener");
}

// ---------------------------------------------------------
// SHARE BUTTON — Web Share API with clipboard fallback
// ---------------------------------------------------------
async function shareUpdate(update) {
  const shareData = {
    title: update.title || CONFIG.websiteName,
    text: update.description || "",
    url: absoluteUrl(update.link)
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // user cancelled share — no action needed
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.url);
      showToast("Link copied to clipboard");
    } catch (err) {
      showToast("Could not copy link");
    }
  }
}

function absoluteUrl(link) {
  if (!link) return window.location.href;
  try {
    return new URL(link, window.location.href).href;
  } catch (e) {
    return link;
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ---------------------------------------------------------
// SCROLL TO TOP
// ---------------------------------------------------------
function setupScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  window.addEventListener("scroll", () => {
    btn.hidden = window.scrollY < 400;
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}
