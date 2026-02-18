import { requireLogin, logout } from "./utils.js";

requireLogin();

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", logout);

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const mapMsg = document.getElementById("mapMsg");
const useMyLocationBtn = document.getElementById("useMyLocationBtn");
const searchBtn = document.getElementById("searchBtn");
const placeType = document.getElementById("placeType");

let userCenter = [-98, 38]; // default US center
let markers = [];

function setMsg(text) {
  if (mapMsg) mapMsg.textContent = text;
}

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: userCenter,
  zoom: 3,
});

function clearMarkers() {
  markers.forEach((m) => m.remove());
  markers = [];
}

function addMarker(lng, lat, title) {
  const marker = new mapboxgl.Marker()
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup({ offset: 24 }).setText(title))
    .addTo(map);
  markers.push(marker);
}

async function searchNearby() {
  clearMarkers();

  const type = placeType?.value || "library";
  const [lng, lat] = userCenter;

  setMsg("Searching nearby…");

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(type)}.json` +
    `?proximity=${lng},${lat}` +
    `&limit=8` +
    `&access_token=${mapboxgl.accessToken}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();

    if (!data.features?.length) {
      setMsg("No results found. Try a different type.");
      return;
    }

    data.features.forEach((f) => {
      const [flng, flat] = f.center;
      addMarker(flng, flat, f.place_name);
    });

    map.flyTo({ center: userCenter, zoom: 12 });
    setMsg(`Showing ${data.features.length} results near you.`);
  } catch (e) {
    console.error(e);
    setMsg("Error loading locations. Check your token and try again.");
  }
}

useMyLocationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setMsg("Geolocation not supported in this browser.");
    return;
  }

  setMsg("Getting your location…");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCenter = [pos.coords.longitude, pos.coords.latitude];
      map.flyTo({ center: userCenter, zoom: 12 });
      setMsg("Location set. Click “Search Nearby”.");
    },
    () => setMsg("Could not get location. Allow permission and try again."),
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

searchBtn?.addEventListener("click", searchNearby);
