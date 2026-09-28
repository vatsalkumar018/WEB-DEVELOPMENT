let cart = JSON.parse(localStorage.getItem("canteenCart") || "[]");

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  if (countEl) countEl.textContent = `${count} item${count === 1 ? "" : "s"}`;
  if (totalEl) totalEl.textContent = `Cart total: ₹${total}`;
  localStorage.setItem("canteenCart", JSON.stringify(cart));
}

document.querySelectorAll(".add-cart").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.dataset.item;
    const price = Number(button.dataset.price);
    const existing = cart.find(x => x.item === item);
    if (existing) existing.qty += 1;
    else cart.push({item, price, qty:1});
    updateCartUI();
    button.textContent = "Added ✓";
    setTimeout(() => button.textContent = "Add", 700);
  });
});

const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
      alert("Your cart is empty. Add something from the menu first.");
      return;
    }
    const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
    if (confirm(`Place order for ₹${total}?`)) {
      alert("Order placed successfully! Your demo order is now being prepared.");
      cart = [];
      updateCartUI();
    }
  });
}

const search = document.getElementById("menuSearch");
const cards = [...document.querySelectorAll(".food-card")];
const categoryButtons = [...document.querySelectorAll(".category")];

function filterMenu() {
  const term = (search?.value || "").toLowerCase();
  const category = document.querySelector(".category.active")?.dataset.category || "all";
  cards.forEach(card => {
    const matchName = card.dataset.name.includes(term);
    const matchCategory = category === "all" || card.dataset.category === category;
    card.style.display = matchName && matchCategory ? "" : "none";
  });
}
search?.addEventListener("input", filterMenu);
categoryButtons.forEach(btn => btn.addEventListener("click", () => {
  categoryButtons.forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  filterMenu();
}));
updateCartUI();