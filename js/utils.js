// utils.js
export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getCurrentUser() {
  return localStorage.getItem("currentUser") || "";
}

export function requireLogin() {
  if (!getCurrentUser()) window.location.href = "login.html";
}

export function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// Per-user storage keys
export function userKey(base) {
  const u = getCurrentUser();
  return u ? `${base}:${u}` : base;
}
