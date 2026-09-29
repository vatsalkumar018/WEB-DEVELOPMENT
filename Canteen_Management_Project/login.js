const loginForm = document.getElementById("loginForm");
const showPassword = document.getElementById("showPassword");
const registerToggle = document.getElementById("registerToggle");
const fullName = document.getElementById("fullName");
const fullNameLabel = document.getElementById("fullNameLabel");
const loginButton = document.getElementById("loginButton");
const loginHelp = document.getElementById("loginHelp");
let registerMode = false;

const STAFF_ACCOUNT = { username: "staff", password: "staff123", name: "Canteen Staff", role: "staff" };

if (showPassword) {
  showPassword.addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
    showPassword.textContent = input.type === "password" ? "Show" : "Hide";
  });
}

function selectedRole() {
  return document.querySelector('input[name="role"]:checked')?.value || "student";
}

function updateAuthMode() {
  const role = selectedRole();
  // Registration is only for students.
  if (role === "staff") registerMode = false;
  fullName.style.display = registerMode ? "block" : "none";
  fullNameLabel.style.display = registerMode ? "block" : "none";
  fullName.required = registerMode;
  loginButton.textContent = registerMode ? "Create Student Account" : "Login";
  registerToggle.textContent = registerMode ? "Already have an account? Login" : "New student? Create an account";
  loginHelp.innerHTML = registerMode
    ? '<strong>Student account</strong><span>Create your own identity. Your name, username and orders stay linked to your account in this browser.</span>'
    : '<strong>Account system</strong><span>Students use their own account. Staff access is separated by role.</span><span class="staff-demo">Staff demo: <b>staff</b> / <b>staff123</b></span>';
}

document.querySelectorAll('input[name="role"]').forEach(r => r.addEventListener("change", updateAuthMode));
registerToggle?.addEventListener("click", () => { registerMode = !registerMode; updateAuthMode(); });
updateAuthMode();

loginForm?.addEventListener("submit", e => {
  e.preventDefault();
  const role = selectedRole();
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const name = fullName.value.trim();
  const message = document.getElementById("loginMessage");
  message.textContent = "";

  if (!username || !password || (registerMode && !name)) {
    message.textContent = "Please fill in all required fields.";
    message.style.color = "#b42318";
    return;
  }

  if (registerMode) {
    if (role !== "student") return;
    const accounts = JSON.parse(localStorage.getItem("canteenAccounts") || "[]");
    if (username === STAFF_ACCOUNT.username || accounts.some(a => a.username === username)) {
      message.textContent = "That username is already in use.";
      message.style.color = "#b42318";
      return;
    }
    const account = { name, username, password, role: "student" };
    accounts.push(account);
    localStorage.setItem("canteenAccounts", JSON.stringify(accounts));
    localStorage.setItem("canteenUser", JSON.stringify({ name, username, role: "student" }));
    message.textContent = "Student account created. Opening your portal...";
  } else {
    let account = null;
    if (role === "staff") {
      if (username === STAFF_ACCOUNT.username && password === STAFF_ACCOUNT.password) account = STAFF_ACCOUNT;
    } else {
      const accounts = JSON.parse(localStorage.getItem("canteenAccounts") || "[]");
      account = accounts.find(a => a.username === username && a.password === password && a.role === "student");
    }
    if (!account) {
      message.textContent = role === "staff" ? "Invalid staff credentials." : "Invalid student username or password.";
      message.style.color = "#b42318";
      return;
    }
    localStorage.setItem("canteenUser", JSON.stringify({ name: account.name, username: account.username, role: account.role }));
    message.textContent = "Login successful. Opening your portal...";
  }

  message.style.color = "#16834b";
  setTimeout(() => { window.location.href = role === "staff" ? "staff.html" : "student.html"; }, 350);
});
