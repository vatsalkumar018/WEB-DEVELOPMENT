let cart = JSON.parse(localStorage.getItem("canteenCart") || "[]");

const MENU_SESSIONS = {
  breakfast: { start: 7, end: 11, title: "Breakfast Menu", icon: "🌅", message: "Good morning! Breakfast items are available now." },
  lunch: { start: 11, end: 16, title: "Lunch Menu", icon: "☀️", message: "Lunch is being served now. Lunch Thali is available." },
  snacks: { start: 16, end: 19, title: "Snacks Menu", icon: "🍿", message: "Snack time! Grab something quick and tasty." },
  dinner: { start: 19, end: 21, title: "Dinner Menu", icon: "🌙", message: "Dinner is being served now. Dinner Thali is available." }
};

function getCurrentSession(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60;
  for (const [key, session] of Object.entries(MENU_SESSIONS)) {
    if (hour >= session.start && hour < session.end) return key;
  }
  return null;
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateLiveClock() {
  const now = new Date();
  const clock = document.getElementById("liveClock");
  const date = document.getElementById("liveDate");
  if (clock) clock.textContent = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"});
  if (date) date.textContent = now.toLocaleDateString([], {weekday: "long", day: "numeric", month: "short", year: "numeric"});

  const session = getCurrentSession(now);
  const dashboardStatus = document.getElementById("dashboardCanteenStatus");
  const dashboardSession = document.getElementById("dashboardSession");
  if (dashboardStatus) {
    dashboardStatus.textContent = session ? "● OPEN" : "● CLOSED";
    dashboardStatus.className = session ? "open-text" : "closed-text";
  }
  if (dashboardSession) {
    dashboardSession.textContent = session
      ? `${MENU_SESSIONS[session].title} · ${formatHour(MENU_SESSIONS[session].start)} – ${formatHour(MENU_SESSIONS[session].end)}`
      : "Service closed · Next opening starts at 7:00 AM";
  }
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

function updateMenuByTime() {
  const now = new Date();
  const session = getCurrentSession(now);
  const config = session ? MENU_SESSIONS[session] : null;
  const card = document.getElementById("menuSessionCard");
  const title = document.getElementById("sessionTitle");
  const message = document.getElementById("sessionMessage");
  const icon = document.getElementById("sessionIcon");
  const status = document.getElementById("sessionStatus");
  const time = document.getElementById("sessionTime");
  const noMenu = document.getElementById("noMenu");

  if (time) time.textContent = `Current time: ${formatTime(now)}`;
  if (!card || !title || !message || !icon || !status) return;

  card.classList.toggle("closed", !session);
  if (session) {
    title.textContent = config.title;
    message.textContent = config.message;
    icon.textContent = config.icon;
    status.textContent = "● OPEN";
    status.className = "session-status open";
    if (noMenu) noMenu.hidden = true;
  } else {
    title.textContent = "Canteen Closed";
    message.textContent = "The canteen is closed right now. Service runs from 7:00 AM to 9:00 PM.";
    icon.textContent = "🌙";
    status.textContent = "● CLOSED";
    status.className = "session-status closed-status";
    if (noMenu) noMenu.hidden = false;
  }

  applySessionFilter(session);
}

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
    if (!getCurrentSession()) {
      alert("The canteen is currently closed.");
      return;
    }
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

function applySessionFilter(session = getCurrentSession()) {
  cards.forEach(card => {
    const sessions = (card.dataset.session || "").split(",");
    const available = Boolean(session && sessions.includes(session));
    card.dataset.timeAvailable = available ? "true" : "false";
  });
  filterMenu();
}

function filterMenu() {
  const term = (search?.value || "").toLowerCase();
  const category = document.querySelector(".category.active")?.dataset.category || "all";
  const session = getCurrentSession();
  let visible = 0;

  cards.forEach(card => {
    const sessions = (card.dataset.session || "").split(",");
    const timeAvailable = Boolean(session && sessions.includes(session));
    const matchName = card.dataset.name.includes(term);
    const matchCategory = category === "all" || card.dataset.category === category;
    const show = timeAvailable && matchName && matchCategory;
    card.style.display = show ? "" : "none";
    if (show) visible += 1;
  });

  const noResults = document.getElementById("noResults");
  if (noResults) noResults.hidden = !session || visible > 0;
}

search?.addEventListener("input", filterMenu);
categoryButtons.forEach(btn => btn.addEventListener("click", () => {
  categoryButtons.forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  filterMenu();
}));

updateCartUI();
updateLiveClock();
updateMenuByTime();
setInterval(() => { updateLiveClock(); updateMenuByTime(); }, 1000);
