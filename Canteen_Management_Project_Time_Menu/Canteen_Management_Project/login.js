const loginForm = document.getElementById("loginForm");
const showPassword = document.getElementById("showPassword");

if (showPassword) {
  showPassword.addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
    showPassword.textContent = input.type === "password" ? "Show" : "Hide";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const role = document.querySelector('input[name="role"]:checked').value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("loginMessage");

    if (!username || !password) {
      message.textContent = "Please enter username and password.";
      message.style.color = "#b42318";
      return;
    }

    localStorage.setItem("canteenUser", JSON.stringify({username, role}));
    message.textContent = "Login successful. Opening your portal...";
    message.style.color = "#16834b";

    setTimeout(() => {
      window.location.href = role === "staff" ? "staff.html" : "student.html";
    }, 450);
  });
}