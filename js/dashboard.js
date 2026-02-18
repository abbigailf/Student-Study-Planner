import { requireLogin, logout, loadJSON, saveJSON, userKey } from "./utils.js";
import { fetchQuotes } from "./quotes.js";
import { getTodayHours, addSessionPrompt } from "./sessionTracker.js";

requireLogin();

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", logout);

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const saveQuoteBtn = document.getElementById("saveQuoteBtn");
const newQuoteBtn = document.getElementById("newQuoteBtn"); // ✅ NEW
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
  // Cache quotes so we don't fetch constantly
  const cacheKey = userKey("quotesCache");
  const orderKey = userKey("quotesOrder");
  const indexKey = userKey("quotesIndex");

  let quotes = loadJSON(cacheKey, []);

  try {
    // Fetch only if cache is empty
    if (!Array.isArray(quotes) || quotes.length < 5) {
      quotes = await fetchQuotes();
      if (Array.isArray(quotes) && quotes.length) {
        saveJSON(cacheKey, quotes);
      }
    }
  } catch (e) {
    console.error(e);
  }

  // If still no quotes, use fallback
  if (!Array.isArray(quotes) || quotes.length === 0) {
    const fallback = { text: "Keep going — you’ve got this!", author: "" };
    currentQuote = fallback;
    if (quoteText) quoteText.textContent = fallback.text;
    if (quoteAuthor) quoteAuthor.textContent = "";
    return;
  }

  // Build or load a shuffled order so we cycle through different quotes
  let order = loadJSON(orderKey, []);
  let idx = Number(loadJSON(indexKey, 0));

  const needsNewOrder =
    !Array.isArray(order) ||
    order.length !== quotes.length ||
    order.some((n) => typeof n !== "number");

  if (needsNewOrder) {
    order = Array.from({ length: quotes.length }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    idx = 0;
    saveJSON(orderKey, order);
    saveJSON(indexKey, idx);
  }

  // Pick next quote in the shuffled order
  const chosenIndex = order[idx] ?? 0;
  const chosen =
    quotes[chosenIndex] || { text: "Keep going — you’ve got this!", author: "" };

  // Move index forward; reshuffle once we reach the end
  idx += 1;
  if (idx >= order.length) {
    // reshuffle for next cycle
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    idx = 0;
    saveJSON(orderKey, order);
  }
  saveJSON(indexKey, idx);

  currentQuote = chosen;
  if (quoteText) quoteText.textContent = chosen.text;
  if (quoteAuthor)
    quoteAuthor.textContent = chosen.author ? `— ${chosen.author}` : "";
}

function saveFavorite() {
  if (!currentQuote) return;

  const favorites = loadJSON(userKey("favoriteQuotes"), []);
  const exists = favorites.some(
    (q) =>
      q.text === currentQuote.text &&
      (q.author || "") === (currentQuote.author || "")
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

// ✅ NEW: click to cycle quotes without refreshing
newQuoteBtn?.addEventListener("click", showRandomQuote);

startSessionBtn?.addEventListener("click", () => {
  addSessionPrompt();
  refreshTodayHours();
});

refreshTodayHours();
showRandomQuote();
