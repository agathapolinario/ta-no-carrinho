// ---------- Dados de produtos (mock) ----------
const PRODUCTS = [
  { id: 1, name: "Maçã Gala", cat: "Hortifruti", emoji: "🍎", price: 8.90, unit: "kg", desc: "Selecionada, doce e crocante. Vendida por kg.", discount: true },
  { id: 2, name: "Banana Prata", cat: "Hortifruti", emoji: "🍌", price: 5.49, unit: "kg", desc: "Fresquinha, direto do produtor. Vendida por kg." },
  { id: 3, name: "Peito de Frango", cat: "Açougue", emoji: "🍗", price: 16.90, unit: "kg", desc: "Peito de frango resfriado, sem osso." },
  { id: 4, name: "Leite Integral", cat: "Mercearia", emoji: "🥛", price: 5.20, unit: "un", desc: "Leite integral UHT, caixa de 1 litro.", discount: true },
  { id: 5, name: "Arroz Branco", cat: "Mercearia", emoji: "🍚", price: 22.90, unit: "5kg", desc: "Arroz branco tipo 1, pacote de 5kg." },
  { id: 6, name: "Detergente", cat: "Limpeza", emoji: "🧴", price: 2.79, unit: "un", desc: "Detergente líquido neutro, 500ml." },
  { id: 7, name: "Café Torrado", cat: "Mercearia", emoji: "☕", price: 14.50, unit: "500g", desc: "Café torrado e moído tradicional." },
  { id: 8, name: "Batata Frita Congelada", cat: "Congelados", emoji: "🍟", price: 11.90, unit: "un", desc: "Batata pré-frita congelada, pacote 1kg." },
];

let cart = {}; // id -> { product, qty }
let currentProduct = PRODUCTS[0];
let detailQty = 1;
const history = ["view-onboarding"];

// ---------- Navegação ----------
function navigate(viewId, opts = {}) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (!target) return;
  target.classList.add("active");
  if (!opts.skipHistory) history.push(viewId);

  if (viewId === "view-home") renderGrid("product-grid", PRODUCTS);
  if (viewId === "view-search") renderGrid("search-grid", PRODUCTS);
  if (viewId === "view-cart") renderCart();
  if (viewId === "view-checkout") renderCheckout();
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-nav]");
  if (btn) {
    navigate(btn.dataset.nav);
  }
});

// ---------- Render produtos ----------
function money(v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

function renderGrid(containerId, products) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      ${p.discount ? '<span class="discount-tag">OFERTA</span>' : ""}
      <div class="product-emoji">${p.emoji}</div>
      <div class="p-name">${p.name}</div>
      <span class="p-unit">${p.cat} • ${p.unit}</span>
      <div class="p-row">
        <span class="p-price">${money(p.price)}</span>
        <button class="p-add" data-quickadd="${p.id}">+</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-quickadd]")) return;
      openProduct(Number(card.dataset.id));
    });
  });
  grid.querySelectorAll("[data-quickadd]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(Number(btn.dataset.quickadd), 1);
      pulse(btn);
    });
  });
}

function pulse(el) {
  el.style.transform = "scale(1.3)";
  setTimeout(() => (el.style.transform = ""), 150);
}

// ---------- Detalhe do produto ----------
function openProduct(id) {
  currentProduct = PRODUCTS.find(p => p.id === id);
  detailQty = 1;
  document.getElementById("product-hero").textContent = currentProduct.emoji;
  document.getElementById("product-cat").textContent = currentProduct.cat;
  document.getElementById("product-name").textContent = currentProduct.name;
  document.getElementById("product-desc").textContent = currentProduct.desc;
  document.getElementById("product-price").textContent = money(currentProduct.price);
  document.getElementById("qty-value").textContent = detailQty;
  updateAddButton();
  navigate("view-product");
}

function updateAddButton() {
  const total = currentProduct.price * detailQty;
  document.getElementById("add-to-cart-btn").textContent = `Adicionar • ${money(total)}`;
}

document.getElementById("qty-minus").addEventListener("click", () => {
  if (detailQty > 1) detailQty--;
  document.getElementById("qty-value").textContent = detailQty;
  updateAddButton();
});
document.getElementById("qty-plus").addEventListener("click", () => {
  detailQty++;
  document.getElementById("qty-value").textContent = detailQty;
  updateAddButton();
});
document.getElementById("add-to-cart-btn").addEventListener("click", () => {
  addToCart(currentProduct.id, detailQty);
  navigate("view-home");
});

// ---------- Carrinho ----------
function addToCart(id, qty) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!cart[id]) cart[id] = { product, qty: 0 };
  cart[id].qty += qty;
  updateCartBadge();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  ["cart-badge", "cart-badge-2", "cart-badge-3"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });
}

function cartSubtotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

function renderCart() {
  const list = document.getElementById("cart-list");
  const empty = document.getElementById("cart-empty");
  const bar = document.getElementById("checkout-bar");
  const items = Object.values(cart);

  if (items.length === 0) {
    list.innerHTML = "";
    empty.classList.add("show");
    bar.style.display = "none";
    return;
  }
  empty.classList.remove("show");
  bar.style.display = "block";

  list.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.product.id}">
      <div class="ci-emoji">${item.product.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.product.name}</div>
        <div class="ci-price">${money(item.product.price)} / ${item.product.unit}</div>
      </div>
      <div class="ci-stepper">
        <button data-delta="-1">−</button>
        <span>${item.qty}</span>
        <button data-delta="1">+</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".cart-item").forEach(row => {
    const id = Number(row.dataset.id);
    row.querySelectorAll("[data-delta]").forEach(btn => {
      btn.addEventListener("click", () => changeQty(id, Number(btn.dataset.delta)));
    });
  });

  const subtotal = cartSubtotal();
  const delivery = subtotal >= 99 || subtotal === 0 ? 0 : 7.9;
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-delivery").textContent = delivery === 0 ? "Grátis" : money(delivery);
  document.getElementById("cart-total").textContent = money(subtotal + delivery);
}

function renderCheckout() {
  const subtotal = cartSubtotal();
  const delivery = subtotal >= 99 ? 0 : 7.9;
  document.getElementById("ck-subtotal").textContent = money(subtotal);
  document.getElementById("ck-total").textContent = money(subtotal + delivery);
}

document.getElementById("confirm-order-btn").addEventListener("click", () => {
  cart = {};
  updateCartBadge();
  navigate("view-success");
});

// ---------- Formulários (demo, sem backend) ----------
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  navigate("view-home");
});
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  navigate("view-home");
});

// ---------- Init ----------
renderGrid("product-grid", PRODUCTS);
updateCartBadge();
