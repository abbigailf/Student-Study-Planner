import { requireLogin, logout, getCurrentUser, loadJSON, userKey } from "./utils.js";
import { getTotalHours } from "./sessionTracker.js";

requireLogin();

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", logout);

const usernameEl = document.getElementById("profileUsername");
const quotesEl = document.getElementById("profileQuotes");
const hoursEl = document.getElementById("profileHours");

const username = getCurrentUser();
const favorites = loadJSON(userKey("favoriteQuotes"), []);
const totalHours = getTotalHours();

if (usernameEl) usernameEl.textContent = username || "—";
if (quotesEl) quotesEl.textContent = String(favorites.length);
if (hoursEl) hoursEl.textContent = String(totalHours);
