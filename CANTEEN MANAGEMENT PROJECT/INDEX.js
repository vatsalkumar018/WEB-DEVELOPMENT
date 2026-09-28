// ===============================
// PORTAL SELECTION
// ===============================

const continueBtn = document.getElementById("continueBtn");

continueBtn.addEventListener("click", function () {

    const selectedRole = document.querySelector(
        'input[name="role"]:checked'
    );

    if (!selectedRole) {

        alert("Please select Student or Canteen Staff.");

        return;
    }


    // Student

    if (selectedRole.value === "student") {

        window.location.href = "STUDENT SECTION.html";

    }


    // Staff

    else if (selectedRole.value === "staff") {

        window.location.href = "CANTEEN STAFF VIEW.html";

    }

});


// ===============================
// DARK MODE
// ===============================

const darkModeBtn = document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");


    if (document.body.classList.contains("dark-mode")) {

        darkModeBtn.innerHTML = "☀️ Light Mode";

    }

    else {

        darkModeBtn.innerHTML = "🌙 Dark Mode";

    }

});


// ===============================
// LANGUAGE
// ===============================

const languageSelect = document.getElementById("languageSelect");

languageSelect.addEventListener("change", function () {

    const language = languageSelect.value;


    // English

    if (language === "en") {

        document.getElementById("selectPortal").innerText =
            "SELECT YOUR PORTAL";

        document.getElementById("roleText").innerText =
            "Please select your role:";

        document.getElementById("studentText").innerText =
            "🎓 STUDENT";

        document.getElementById("staffText").innerText =
            "👨‍🍳 CANTEEN STAFF";

        document.getElementById("continueBtn").innerText =
            "CONTINUE";

        document.getElementById("footerText").innerText =
            "© 2026 Canteen Management System";

    }


    // Hindi

    else if (language === "hi") {

        document.getElementById("selectPortal").innerText =
            "अपना पोर्टल चुनें";

        document.getElementById("roleText").innerText =
            "कृपया अपनी भूमिका चुनें:";

        document.getElementById("studentText").innerText =
            "🎓 छात्र";

        document.getElementById("staffText").innerText =
            "👨‍🍳 कैंटीन स्टाफ";

        document.getElementById("continueBtn").innerText =
            "आगे बढ़ें";

        document.getElementById("footerText").innerText =
            "© 2026 कैंटीन प्रबंधन प्रणाली";

    }


    // Gujarati

    else if (language === "gu") {

        document.getElementById("selectPortal").innerText =
            "તમારું પોર્ટલ પસંદ કરો";

        document.getElementById("roleText").innerText =
            "કૃપા કરીને તમારી ભૂમિકા પસંદ કરો:";

        document.getElementById("studentText").innerText =
            "🎓 વિદ્યાર્થી";

        document.getElementById("staffText").innerText =
            "👨‍🍳 કેન્ટીન સ્ટાફ";

        document.getElementById("continueBtn").innerText =
            "આગળ વધો";

        document.getElementById("footerText").innerText =
            "© 2026 કેન્ટીન મેનેજમેન્ટ સિસ્ટમ";

    }

});