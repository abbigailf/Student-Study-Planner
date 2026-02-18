import { requireLogin, logout, loadJSON, saveJSON, userKey } from "./utils.js";

const QUOTES_API = "https://type.fit/api/quotes";

export async function fetchQuotes() {
  try {
    const res = await fetch(QUOTES_API);
    if (!res.ok) throw new Error("Quotes API request failed");
    const data = await res.json();

    return data
      .map((q) => ({
        text: String(q.text || "").trim(),
        author: q.author ? String(q.author).trim() : "",
      }))
      .filter((q) => q.text.length > 0);
  } catch (err) {
    console.error(err);
    return [{ text: "Keep going — you’ve got this!", author: "" }];
  }
}

// ----- Favorites page wiring -----
const favoritesList = document.getElementById("favoritesList");
const clearBtn = document.getElementById("clearFavoritesBtn");
const favMsg = document.getElementById("favMsg");
const logoutBtn = document.getElementById("logoutBtn");

function setMsg(text) {
  if (!favMsg) return;
  favMsg.textContent = text;
  setTimeout(() => (favMsg.textContent = ""), 2200);
}

function renderFavorites() {
  const favorites = loadJSON(userKey("favoriteQuotes"), []);

  favoritesList.innerHTML = "";

  if (!favorites.length) {
    favoritesList.innerHTML = `<li class="helper-text">No saved quotes yet.</li>`;
    return;
  }

  favorites.forEach((q, index) => {
    const li = document.createElement("li");
    li.className = "quote-item";

    const p = document.createElement("p");
    p.textContent = q.author ? `${q.text} — ${q.author}` : q.text;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "small-btn";
    btn.textContent = "Remove";
    btn.addEventListener("click", () => removeFavorite(index));

    li.append(p, btn);
    favoritesList.appendChild(li);
  });
}

function removeFavorite(index) {
  const favorites = loadJSON(userKey("favoriteQuotes"), []);
  favorites.splice(index, 1);
  saveJSON(userKey("favoriteQuotes"), favorites);
  setMsg("Removed.");
  renderFavorites();
}

function clearFavorites() {
  saveJSON(userKey("favoriteQuotes"), []);
  setMsg("Cleared.");
  renderFavorites();
}

if (favoritesList) {
  requireLogin();
  logoutBtn?.addEventListener("click", logout);
  clearBtn?.addEventListener("click", clearFavorites);
  renderFavorites();
}
