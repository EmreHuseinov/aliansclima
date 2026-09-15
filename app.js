const SITE = { whatsapp: "359897877362" };
const STORE = "aliansclima_products_v3";
const defaultProducts = Array.isArray(window.ALIANS_PRODUCTS) ? window.ALIANS_PRODUCTS : [];
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const capacityNumber = value => Number(String(value).replace(/\D/g, ""));
const euro = value => new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
let activeBrand = "";

function products() {
  try {
    const saved = localStorage.getItem(STORE);
    return saved ? JSON.parse(saved) : defaultProducts;
  } catch { return defaultProducts; }
}

function renderBrandTabs() {
  const items = products();
  const counts = items.reduce((result, item) => ({ ...result, [item.brand]: (result[item.brand] || 0) + 1 }), {});
  const brands = Object.keys(counts).sort((a, b) => a.localeCompare(b));
  document.querySelector("#brandTabs").innerHTML = [
    `<button class="brand-tab ${activeBrand === "" ? "active" : ""}" type="button" data-brand="" aria-pressed="${activeBrand === ""}"><span>Всички</span><small>${items.length}</small></button>`,
    ...brands.map(brand => `<button class="brand-tab ${activeBrand === brand ? "active" : ""}" type="button" data-brand="${escapeHtml(brand)}" aria-pressed="${activeBrand === brand}"><span>${escapeHtml(brand)}</span><small>${counts[brand]}</small></button>`)
  ].join("");
}

function filteredProducts() {
  const query = document.querySelector("#search").value.trim().toLocaleLowerCase("bg");
  const btu = document.querySelector("#btuFilter").value;
  const energy = document.querySelector("#energyFilter").value;
  return products().filter(item => {
    const label = `${item.brand} ${item.name}`.toLocaleLowerCase("bg");
    return (!query || label.includes(query)) &&
      (!activeBrand || item.brand === activeBrand) &&
      (!btu || capacityNumber(item.capacity) === Number(btu)) &&
      (!energy || item.energyCooling === energy || item.energyHeating === energy);
  });
}

function productCard(item) {
  const modelName = String(item.name || item.model || `Модел ${item.id}`).trim();
  const title = `${item.brand} ${modelName}`;
  const productKind = /^(MFYA|MFM|GVH)/i.test(modelName) ? "КОЛОНЕН КЛИМАТИК" : "СТЕНЕН КЛИМАТИК";
  return `<article class="product-card">
    <div class="product-media">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">
      ${item.freeInstallation ? `<span class="installation-badge">Безплатен монтаж</span>` : ""}
    </div>
    <div class="product-card-body">
      <div class="product-top"><span class="product-brand">${productKind}</span><span class="capacity-pill">${escapeHtml(item.capacity)} BTU</span></div>
      <h3>${escapeHtml(title)}</h3>
      <div class="spec-list">
        <div><span>Охлаждане</span><strong>${escapeHtml(item.energyCooling)}</strong></div>
        <div><span>Отопление</span><strong>${escapeHtml(item.energyHeating)}</strong></div>
        <div><span>Гаранция</span><strong>${escapeHtml(item.warranty)} месеца</strong></div>
      </div>
      <div class="visible-specs">
        <div class="visible-specs-title">Технически данни</div>
        <div><span>Мощност при охлаждане</span><strong>${escapeHtml(item.powerCooling)} kW</strong></div>
        <div><span>Мощност при отопление</span><strong>${escapeHtml(item.powerHeating)} kW</strong></div>
        <div><span>Консумация при охлаждане</span><strong>${escapeHtml(item.consumptionCooling)} kW</strong></div>
        <div><span>Консумация при отопление</span><strong>${escapeHtml(item.consumptionHeating)} kW</strong></div>
        <div><span>Размер В × Ш × Д</span><strong>${escapeHtml(item.dimensions)} mm</strong></div>
        <div><span>Звуково налягане</span><strong>${escapeHtml(item.sound)} dB</strong></div>
      </div>
      <div class="product-bottom">
        <div class="product-price">${item.normalPrice > item.price ? `<del>${euro(item.normalPrice)}</del>` : ""}<strong>${euro(item.price)}</strong><span>с ДДС · ${item.freeInstallation ? "с безплатен монтаж" : ""}</span></div>
        <button class="product-enquiry" type="button" data-product="${escapeHtml(title)}">Запитване</button>
      </div>
    </div>
  </article>`;
}

function renderProducts() {
  const list = filteredProducts();
  const grid = document.querySelector("#productGrid");
  const empty = document.querySelector("#emptyState");
  document.querySelector("#resultCount").textContent = `${activeBrand ? `${activeBrand} · ` : ""}${list.length} ${list.length === 1 ? "модел" : "модела"}`;
  grid.innerHTML = list.map(productCard).join("");
  empty.hidden = list.length > 0;
  grid.hidden = list.length === 0;
}

function clearFilters() {
  activeBrand = "";
  ["search", "btuFilter", "energyFilter"].forEach(id => document.getElementById(id).value = "");
  renderBrandTabs();
  renderProducts();
}

function openEnquiry(product) {
  document.querySelector("#service").value = "Избор на климатик";
  document.querySelector("#message").value = `Интересувам се от ${product}. Моля за повече информация.`;
  document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => document.querySelector("#name").focus(), 500);
}

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#primary-nav");
menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});
menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  menu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}));

document.querySelector("#brandTabs").addEventListener("click", event => {
  const button = event.target.closest("[data-brand]");
  if (!button) return;
  activeBrand = button.dataset.brand;
  renderBrandTabs();
  renderProducts();
});
["search", "btuFilter", "energyFilter"].forEach(id => document.getElementById(id).addEventListener("input", renderProducts));
document.querySelector("#clearFilters").addEventListener("click", clearFilters);
document.querySelector("#emptyClear").addEventListener("click", clearFilters);
document.querySelector("#productGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-product]");
  if (button) openEnquiry(button.dataset.product);
});
document.querySelectorAll("[data-service]").forEach(link => link.addEventListener("click", () => document.querySelector("#service").value = link.dataset.service));

document.querySelector("#contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.querySelector("#name").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const service = document.querySelector("#service").value;
  const message = document.querySelector("#message").value.trim();
  const text = [`Здравейте, казвам се ${name}.`, `Телефон: ${phone}`, `Услуга: ${service}`, message ? `Съобщение: ${message}` : ""].filter(Boolean).join("\n");
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
});

renderBrandTabs();
renderProducts();
