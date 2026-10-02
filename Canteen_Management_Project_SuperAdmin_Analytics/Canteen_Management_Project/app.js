// Shared theme
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("canteenTheme");
if (savedTheme === "dark") document.body.classList.add("dark");

function updateThemeIcon() {
  if (!themeToggle) return;
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}
updateThemeIcon();
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("canteenTheme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
  });
}

// Simple language support for the homepage
const translations = {
  en: {login:"Login", heroTitle:"Your campus canteen, made easier.", heroText:"Browse food, place orders, track your queue, and manage the canteen from one simple system.", getStarted:"Get Started", studentPreview:"Student Preview", portalTitle:"Select your portal", portalText:"Choose how you want to use the canteen system.", studentPortal:"Student Portal", studentDesc:"Explore the menu, add items to your cart, place orders and track them.", staffPortal:"Staff Portal", staffDesc:"Manage orders, menu availability, stock and daily canteen operations."},
  hi: {login:"लॉगिन", heroTitle:"आपकी कैंटीन, अब और आसान।", heroText:"खाना देखें, ऑर्डर करें, कतार की स्थिति देखें और कैंटीन को एक ही सिस्टम से प्रबंधित करें।", getStarted:"शुरू करें", studentPreview:"छात्र पोर्टल", portalTitle:"अपना पोर्टल चुनें", portalText:"चुनें कि आप कैंटीन सिस्टम का कैसे उपयोग करना चाहते हैं।", studentPortal:"छात्र पोर्टल", studentDesc:"मेनू देखें, कार्ट में आइटम जोड़ें, ऑर्डर करें और ऑर्डर ट्रैक करें।", staffPortal:"स्टाफ पोर्टल", staffDesc:"ऑर्डर, मेनू उपलब्धता, स्टॉक और कैंटीन संचालन प्रबंधित करें।"},
  gu: {login:"લૉગિન", heroTitle:"તમારી કેમ્પસ કેન્ટીન, હવે વધુ સરળ.", heroText:"ખોરાક જુઓ, ઓર્ડર કરો, કતાર ટ્રેક કરો અને કેન્ટીનને એક જ સિસ્ટમથી મેનેજ કરો.", getStarted:"શરૂ કરો", studentPreview:"વિદ્યાર્થી પોર્ટલ", portalTitle:"તમારું પોર્ટલ પસંદ કરો", portalText:"તમે કેન્ટીન સિસ્ટમનો ઉપયોગ કેવી રીતે કરવા માંગો છો તે પસંદ કરો.", studentPortal:"વિદ્યાર્થી પોર્ટલ", studentDesc:"મેનુ જુઓ, કાર્ટમાં વસ્તુઓ ઉમેરો, ઓર્ડર કરો અને ઓર્ડર ટ્રેક કરો.", staffPortal:"સ્ટાફ પોર્ટલ", staffDesc:"ઓર્ડર, મેનુ ઉપલબ્ધતા, સ્ટોક અને દૈનિક કેન્ટીન કામગીરી મેનેજ કરો."}
};
const languageSelect = document.getElementById("languageSelect");
function applyLanguage(lang) {
  const t = translations[lang];
  if (!t) return;
  document.querySelectorAll("[data-i18n]").forEach(el => { const key = el.dataset.i18n; if (t[key]) el.textContent = t[key]; });
  localStorage.setItem("canteenLanguage", lang);
}
if (languageSelect) {
  const savedLanguage = localStorage.getItem("canteenLanguage") || "en";
  languageSelect.value = savedLanguage;
  applyLanguage(savedLanguage);
  languageSelect.addEventListener("change", e => applyLanguage(e.target.value));
}

// Authentication + role protection (frontend/localStorage prototype)
(function authGuard(){
  const page = document.body?.dataset?.page || '';
  const publicPages = ['home','login'];
  const user = JSON.parse(localStorage.getItem('canteenUser') || 'null');
  if (!publicPages.includes(page)) {
    if (!user || !user.role) { window.location.replace('login.html'); return; }
    if (page === 'student' && user.role !== 'student') { window.location.replace(user.role === 'admin' ? 'super-admin.html' : 'staff.html'); return; }
    if (page === 'staff' && user.role !== 'staff') { window.location.replace(user.role === 'admin' ? 'super-admin.html' : 'student.html'); return; }
    if (page === 'admin' && user.role !== 'admin') { window.location.replace(user.role === 'staff' ? 'staff.html' : 'student.html'); return; }
  }
  if (user?.role === 'student') document.querySelectorAll('a[href="staff.html"],a[href="staff-orders.html"],a[href="staff-menu.html"],a[href="staff-stock.html"],a[href="super-admin.html"]').forEach(el => el.remove());
  if (user?.role === 'staff') document.querySelectorAll('a[href="super-admin.html"]').forEach(el => el.remove());
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); localStorage.removeItem('canteenUser'); localStorage.removeItem('canteenCart'); window.location.href='login.html'; });
  });
})();

// Identity UI
(function identityUI(){
  const user = JSON.parse(localStorage.getItem('canteenUser') || 'null');
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name || user.username);
  document.querySelectorAll('[data-user-username]').forEach(el => el.textContent = user.username || '');
  const initials = (user.name || user.username || 'U').split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = initials);
})();

/* -------------------- Notifications -------------------- */
function getCurrentUser() { return JSON.parse(localStorage.getItem('canteenUser') || 'null'); }
function getNotifications() { return JSON.parse(localStorage.getItem('canteenNotifications') || '[]'); }
function saveNotifications(list) { localStorage.setItem('canteenNotifications', JSON.stringify(list.slice(-200))); }

function addNotification({role, username=null, type='info', title, message, token=null}) {
  const list = getNotifications();
  const item = { id: `N-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, role, username, type, title, message, token, read:false, createdAt:Date.now() };
  list.push(item);
  saveNotifications(list);
  renderNotifications();
  showToast(item);
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, {body: message, tag: item.id}); } catch (_) {}
  }
  return item;
}

function notificationsForUser() {
  const user = getCurrentUser();
  if (!user) return [];
  return getNotifications().filter(n => n.role === user.role && (!n.username || n.username === user.username));
}

function showToast(n) {
  if (!document.body) return;
  let host = document.getElementById('notificationToastHost');
  if (!host) { host = document.createElement('div'); host.id='notificationToastHost'; host.className='notification-toast-host'; document.body.appendChild(host); }
  const toast = document.createElement('div');
  toast.className = `notification-toast ${n.type || 'info'}`;
  toast.innerHTML = `<div class="toast-icon">${n.type==='ready'?'✅':n.type==='new-order'?'🔔':'🔔'}</div><div><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.message)}</p></div><button aria-label="Close">×</button>`;
  toast.querySelector('button').onclick = () => toast.remove();
  host.appendChild(toast);
  setTimeout(() => toast.remove(), 6500);
}
function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function renderNotifications() {
  const user = getCurrentUser();
  const bell = document.getElementById('notificationBell');
  const panel = document.getElementById('notificationPanel');
  if (!user || !bell) return;
  const notes = notificationsForUser().sort((a,b)=>b.createdAt-a.createdAt);
  const unread = notes.filter(n=>!n.read).length;
  bell.innerHTML = `🔔<span class="notification-badge" ${unread?'':'hidden'}>${unread>9?'9+':unread}</span>`;
  if (panel) {
    panel.innerHTML = notes.length ? notes.slice(0,10).map(n => `<div class="notification-item ${n.read?'':'unread'}"><div class="notification-item-icon">${n.type==='ready'?'✅':n.type==='new-order'?'🍽️':'🔔'}</div><div><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.message)}</p><small>${new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div></div>`).join('') : '<div class="notification-empty">No notifications yet.</div>';
  }
}

function markNotificationsRead() {
  const user = getCurrentUser();
  if (!user) return;
  const list = getNotifications().map(n => n.role===user.role && (!n.username || n.username===user.username) ? {...n, read:true} : n);
  saveNotifications(list); renderNotifications();
}

(function setupNotificationUI(){
  const user = getCurrentUser();
  if (!user || document.body?.dataset?.page==='login' || document.body?.dataset?.page==='home') return;
  const actions = document.querySelector('.top-actions');
  if (!actions) return;
  const wrap = document.createElement('div'); wrap.className='notification-wrap';
  wrap.innerHTML = `<button class="icon-btn notification-bell" id="notificationBell" title="Notifications">🔔</button><div class="notification-panel" id="notificationPanel"></div>`;
  actions.insertBefore(wrap, actions.firstChild);
  const bell = document.getElementById('notificationBell');
  bell.addEventListener('click', e => { e.stopPropagation(); const p=document.getElementById('notificationPanel'); p.classList.toggle('show'); if(p.classList.contains('show')) markNotificationsRead(); });
  document.addEventListener('click', e => { if(!wrap.contains(e.target)) document.getElementById('notificationPanel')?.classList.remove('show'); });
  renderNotifications();
})();

// Keep different tabs/windows synchronized.
window.addEventListener('storage', e => {
  if (e.key === 'canteenNotifications') renderNotifications();
  if (e.key === 'canteenOrders' && typeof window.refreshOrderUI === 'function') window.refreshOrderUI();
});
