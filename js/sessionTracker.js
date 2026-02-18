import { loadJSON, saveJSON, userKey } from "./utils.js";

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getStore() {
  return loadJSON(userKey("studySessionsByDay"), {}); // { "YYYY-MM-DD": hours }
}

function setStore(store) {
  saveJSON(userKey("studySessionsByDay"), store);
}

export function getTodayHours() {
  const store = getStore();
  return Number((store[todayKey()] ?? 0).toFixed(2));
}

export function getTotalHours() {
  const store = getStore();
  const total = Object.values(store).reduce((sum, v) => sum + Number(v || 0), 0);
  return Number(total.toFixed(2));
}

export function addSessionPrompt() {
  const input = prompt("Enter hours studied (example: 1.5):");
  if (input === null) return; // user cancelled

  const hours = Number(input);
  if (!Number.isFinite(hours) || hours <= 0) {
    alert("Please enter a valid number greater than 0.");
    return;
  }

  const store = getStore();
  const key = todayKey();
  store[key] = Number(((store[key] ?? 0) + hours).toFixed(2));
  setStore(store);
}
