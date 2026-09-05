// =========================
// ACCOUNTANT BANO SETTINGS
// =========================
const WHATSAPP_NUMBER = "91XXXXXXXXXX";
const CONTACT_EMAIL = "rupaiyaguruji@gmail.com";

// Add / edit your PDFs here.
// image = preview image path
// pdf = optional preview PDF path
// paymentLink = your payment link
const products = [
  {
    id: 1,
    title: "GST Complete Guide",
    description: "Practical GST Notes in simple Hindi.",
    price: 99,
    oldPrice: 199,
    category: "GST",
    image: "images/pdf1.svg",
    pdf: "pdf/pdf1.pdf",
    paymentLink: "YOUR_PAYMENT_LINK",
    badge: "BEST SELLER",
    pages: "100+ Pages",
    language: "Hindi"
  },
  {
    id: 2,
    title: "Tally Prime Complete Notes",
    description: "Tally Prime ke practical concepts aur notes.",
    price: 149,
    oldPrice: 249,
    category: "Tally",
    image: "images/pdf2.svg",
    pdf: "pdf/pdf2.pdf",
    paymentLink: "YOUR_PAYMENT_LINK",
    badge: "NEW",
    pages: "120+ Pages",
    language: "Hindi"
  },
  {
    id: 3,
    title: "Accountant Excel Formula Guide",
    description: "Accountant ke kaam aane wale useful Excel formulas.",
    price: 79,
    oldPrice: 149,
    category: "Excel",
    image: "images/pdf3.svg",
    pdf: "pdf/pdf3.pdf",
    paymentLink: "YOUR_PAYMENT_LINK",
    badge: "POPULAR",
    pages: "80+ Pages",
    language: "Hindi"
  }
];

let activeCategory = "All";

const $ = (selector) => document.querySelector(selector);

function whatsappUrl(message = "Hello Accountant Bano, mujhe PDF ke regarding information chahiye.") {
  const clean = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function setContactLinks() {
  const links = ["navWhatsApp","heroWhatsApp","contactWhatsApp","sideWhatsApp","floatingWhatsApp","footerWhatsApp"];
  links.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = whatsappUrl();
  });
}

function discount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return "";
  return `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`;
}

function money(value) {
  return `₹${value}`;
}

function renderCategories() {
  const categories = ["All", ...new Set(products.map(p => p.category))];
  $("#categories").innerHTML = categories.map(cat =>
    `<button class="category ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`
  ).join("");

  document.querySelectorAll(".category").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function getFilteredProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();
  return products.filter(p => {
    const categoryMatch = activeCategory === "All" || p.category === activeCategory;
    const searchMatch = !query || `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(query);
    return categoryMatch && searchMatch;
  });
}

function renderProducts() {
  const list = getFilteredProducts();
  $("#emptyState").hidden = list.length !== 0;

  $("#productGrid").innerHTML = list.map((p, index) => {
    const off = discount(p.price, p.oldPrice);
    return `
      <article class="product-card" style="animation-delay:${index * 70}ms">
        <div class="product-image">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='images/pdf1.svg'">
        </div>
        <div class="product-body">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="price-row">
            <span class="price">${money(p.price)}</span>
            ${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}
            ${off ? `<span class="discount">${off}</span>` : ""}
          </div>
          <div class="card-actions">
            <button class="btn light details-btn" data-id="${p.id}">View Details</button>
            <a class="btn primary buy-btn" href="${p.paymentLink}" target="_blank" rel="noopener">🛒 Buy Now</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", () => openModal(Number(btn.dataset.id)));
  });
}

function openModal(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  $("#modalImage").src = p.image;
  $("#modalImage").alt = p.title;
  $("#modalTitle").textContent = p.title;
  $("#modalDescription").textContent = p.description;
  $("#modalBadge").textContent = p.badge || "";
  $("#modalBadge").style.display = p.badge ? "inline-block" : "none";
  $("#modalMeta").textContent = [p.pages, p.language, p.category].filter(Boolean).join(" • ");
  $("#modalPrice").textContent = money(p.price);
  $("#modalOldPrice").textContent = p.oldPrice ? money(p.oldPrice) : "";
  $("#modalDiscount").textContent = discount(p.price, p.oldPrice);
  $("#modalBuy").href = p.paymentLink;

  const preview = $("#modalPreview");
  if (p.pdf) {
    preview.href = p.pdf;
    preview.style.display = "inline-flex";
  } else {
    preview.style.display = "none";
  }

  $("#modalWhatsApp").href = whatsappUrl(`Hello Accountant Bano, mujhe "${p.title}" PDF ke regarding information chahiye.`);
  $("#productModal").classList.add("open");
  $("#productModal").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("#productModal").classList.remove("open");
  $("#productModal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#searchInput").addEventListener("input", renderProducts);
$("#modalClose").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

$("#menuBtn").addEventListener("click", () => {
  $("#navLinks").classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

setContactLinks();
renderCategories();
renderProducts();
