const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function () {

    const role = document.getElementById("loginRole").value;

    const username = document.getElementById("username").value;

    const password = document.getElementById("password").value;


    // Check empty fields

    if (role === "" || username === "" || password === "") {

        alert("Please fill all fields.");

        return;

    }


    // Student

    if (role === "student") {

        window.location.href = "STUDENT SECTION.html";

    }


    // Staff

    else if (role === "staff") {

        window.location.href = "CANTEEN STAFF VIEW.html";

    }

});