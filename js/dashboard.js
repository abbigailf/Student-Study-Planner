import { requireLogin, logout, loadJSON, saveJSON, userKey } from "./utils.js";
import { fetchQuotes } from "./quotes.js";
import { getTodayHours, addSessionPrompt } from "./sessionTracker.js";

requireLogin();

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", logout);

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const saveQuoteBtn = document.getElementById("saveQuoteBtn");
const quoteMsg = document.getElementById("quoteMsg");

const todayHoursEl = document.getElementById("todayHours");
const startSessionBtn = document.getElementById("startSessionBtn");

let currentQuote = null;

function setStatus(msg) {
  if (!quoteMsg) return;
  quoteMsg.textContent = msg;
  setTimeout(() => (quoteMsg.textContent = ""), 2200);
}

function refreshTodayHours() {
  if (todayHoursEl) todayHoursEl.textContent = String(getTodayHours());
}

async function showRandomQuote() {
  const quotes = await fetchQuotes();
  const chosen = quotes[Math.floor(Math.random() * quotes.length)] || {
    text: "Keep going — you’ve got this!",
    author: "",
  };

  currentQuote = chosen;
  if (quoteText) quoteText.textContent = chosen.text;
  if (quoteAuthor) quoteAuthor.textContent = chosen.author ? `— ${chosen.author}` : "";
}

function saveFavorite() {
  if (!currentQuote) return;

  const favorites = loadJSON(userKey("favoriteQuotes"), []);
  const exists = favorites.some(
    (q) => q.text === currentQuote.text && (q.author || "") === (currentQuote.author || "")
  );

  if (exists) {
    setStatus("Already saved.");
    return;
  }

  favorites.push(currentQuote);
  saveJSON(userKey("favoriteQuotes"), favorites);
  setStatus("Saved!");
}

saveQuoteBtn?.addEventListener("click", saveFavorite);

startSessionBtn?.addEventListener("click", () => {
  addSessionPrompt();
  refreshTodayHours();
});

refreshTodayHours();
showRandomQuote();
