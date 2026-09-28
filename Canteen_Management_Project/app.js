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
  en: {
    login:"Login", heroTitle:"Your campus canteen, made easier.",
    heroText:"Browse food, place orders, track your queue, and manage the canteen from one simple system.",
    getStarted:"Get Started", studentPreview:"Student Preview", portalTitle:"Select your portal",
    portalText:"Choose how you want to use the canteen system.", studentPortal:"Student Portal",
    studentDesc:"Explore the menu, add items to your cart, place orders and track them.",
    staffPortal:"Staff Portal", staffDesc:"Manage orders, menu availability, stock and daily canteen operations."
  },
  hi: {
    login:"लॉगिन", heroTitle:"आपकी कैंटीन, अब और आसान।",
    heroText:"खाना देखें, ऑर्डर करें, कतार की स्थिति देखें और कैंटीन को एक ही सिस्टम से प्रबंधित करें।",
    getStarted:"शुरू करें", studentPreview:"छात्र पोर्टल", portalTitle:"अपना पोर्टल चुनें",
    portalText:"चुनें कि आप कैंटीन सिस्टम का कैसे उपयोग करना चाहते हैं।", studentPortal:"छात्र पोर्टल",
    studentDesc:"मेनू देखें, कार्ट में आइटम जोड़ें, ऑर्डर करें और ऑर्डर ट्रैक करें।",
    staffPortal:"स्टाफ पोर्टल", staffDesc:"ऑर्डर, मेनू उपलब्धता, स्टॉक और कैंटीन संचालन प्रबंधित करें।"
  },
  gu: {
    login:"લૉગિન", heroTitle:"તમારી કેમ્પસ કેન્ટીન, હવે વધુ સરળ.",
    heroText:"ખોરાક જુઓ, ઓર્ડર કરો, કતાર ટ્રેક કરો અને કેન્ટીનને એક જ સિસ્ટમથી મેનેજ કરો.",
    getStarted:"શરૂ કરો", studentPreview:"વિદ્યાર્થી પોર્ટલ", portalTitle:"તમારું પોર્ટલ પસંદ કરો",
    portalText:"તમે કેન્ટીન સિસ્ટમનો ઉપયોગ કેવી રીતે કરવા માંગો છો તે પસંદ કરો.", studentPortal:"વિદ્યાર્થી પોર્ટલ",
    studentDesc:"મેનુ જુઓ, કાર્ટમાં વસ્તુઓ ઉમેરો, ઓર્ડર કરો અને ઓર્ડર ટ્રેક કરો.",
    staffPortal:"સ્ટાફ પોર્ટલ", staffDesc:"ઓર્ડર, મેનુ ઉપલબ્ધતા, સ્ટોક અને દૈનિક કેન્ટીન કામગીરી મેનેજ કરો."
  }
};

const languageSelect = document.getElementById("languageSelect");
function applyLanguage(lang) {
  const t = translations[lang];
  if (!t) return;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });
  localStorage.setItem("canteenLanguage", lang);
}
if (languageSelect) {
  const savedLanguage = localStorage.getItem("canteenLanguage") || "en";
  languageSelect.value = savedLanguage;
  applyLanguage(savedLanguage);
  languageSelect.addEventListener("change", e => applyLanguage(e.target.value));
}