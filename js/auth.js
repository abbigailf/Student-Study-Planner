import { loadJSON, saveJSON } from "./utils.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const registerMsg = document.getElementById("registerMsg");
const loginMsg = document.getElementById("loginMsg");

function setMsg(el, text) {
  if (!el) return;
  el.textContent = text;
  setTimeout(() => (el.textContent = ""), 2500);
}

function getUsers() {
  return loadJSON("users", {}); // { username: { password } }
}

function saveUsers(users) {
  saveJSON("users", users);
}

function setLoggedIn(username) {
  localStorage.setItem("currentUser", username);
}

registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;

  if (username.length < 3) return setMsg(registerMsg, "Username must be at least 3 characters.");
  if (password.length < 6) return setMsg(registerMsg, "Password must be at least 6 characters.");

  const users = getUsers();
  if (users[username]) return setMsg(registerMsg, "That username is already taken.");

  users[username] = { password };
  saveUsers(users);

  setLoggedIn(username);
  setMsg(registerMsg, "Account created! Redirecting…");
  setTimeout(() => (window.location.href = "index.html"), 700);
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  const users = getUsers();
  if (!users[username]) return setMsg(loginMsg, "User not found. Register first.");
  if (users[username].password !== password) return setMsg(loginMsg, "Incorrect password.");

  setLoggedIn(username);
  setMsg(loginMsg, "Login successful! Redirecting…");
  setTimeout(() => (window.location.href = "index.html"), 700);
});
