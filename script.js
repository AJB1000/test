// === git02 ===
const CACHE_VERSION = 'pwa-git02-v1';

// --- Parse URL parameters ---
const params = new URLSearchParams(window.location.search);
const lon = params.get('lon');
const lat = params.get('lat');
const zoom = params.get('zoom');

// Reste des paramètres
const extras = {};
for (const [key, val] of params.entries()) {
    if (!['lon', 'lat', 'zoom'].includes(key)) extras[key] = val;
}

// --- Update static fields immediately ---
document.getElementById('lon').textContent = lon ?? '?';
document.getElementById('lat').textContent = lat ?? '?';
document.getElementById('swVersion').textContent = CACHE_VERSION;

// --- Build links (static part first) ---
const linkList = document.getElementById('linkList');

const buildLinks = (locality = null, offline = false) => {
    const disable = offline ? 'disabled' : '';
    const loc = locality ? encodeURIComponent(locality) : '';

    linkList.innerHTML = `
    <p><a class="${disable}" href="https://www.meteoblue.com/fr/meteo/semaine/${lat}N${lon}E">Météo 7 jours</a></p>
    <p><a class="${disable}" href="https://www.google.com/maps/@${lat},${lon},${zoom}z">Google Maps</a></p>
    <p><a class="${disable}" href="https://fr.wikipedia.org/wiki/${loc}">Wikipedia (${locality ?? '...'} )</a></p>
  `;
};

// --- Build parameter table ---
const table = document.getElementById('paramTable');
if (Object.keys(extras).length === 0) {
    table.innerHTML = '<tr><td>Aucun paramètre additionnel</td></tr>';
} else {
    table.innerHTML = `
    <tr><th>Nom</th><th>Valeur</th></tr>
    ${Object.entries(extras)
            .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
            .join('')}
  `;
}

// --- Detect offline mode ---
const offline = !navigator.onLine;
const status = document.getElementById('status');
if (offline) {
    status.textContent = 'Site offline';
    buildLinks(null, true);
} else {
    status.textContent = 'En ligne';
    buildLinks();
    // --- Reverse Geocoding Google Maps ---
    getLocality(lat, lon)
        .then(locality => {
            document.getElementById('locality').textContent = locality;
            buildLinks(locality, false);
        })
        .catch(err => {
            document.getElementById('locality').textContent = 'Localité inconnue';
            console.error(err);
        });
}

// --- Register Service Worker ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service worker enregistré', reg.scope))
        .catch(err => console.error('Erreur SW:', err));
}

// === Reverse geocode ===
async function getLocality(lat, lon) {
    const API_KEY = "AIzaSyB3ZwSWOCIBYut9dpzEy6Jeuo-S5v_wPzE"
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}&language=fr`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur Google Maps API');
    const data = await response.json();

    const locality = data.results[0]?.address_components.find(c =>
        c.types.includes('locality')
    )?.long_name;

    return locality || 'Localité inconnue';
}


// Récupère les paramètres d’URL et affiche lon/lat
// function afficherCoordonnees() {
//     const params = new URLSearchParams(location.search);
//     const lon = params.get('lon') || '–';
//     const lat = params.get('lat') || '–';
//     document.getElementById('lon').textContent = lon;
//     document.getElementById('lat').textContent = lat;
//     document.getElementById('status').textContent =
//         navigator.onLine ? '🟢 En ligne' : '🔴 Hors ligne';
// }
// afficherCoordonnees();

// // Met à jour le statut online/offline
// window.addEventListener('online', afficherCoordonnees);
// window.addEventListener('offline', afficherCoordonnees);

// // Enregistre le service worker
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./sw.js')
//         .then(reg => console.log('Service Worker enregistré', reg))
//         .catch(err => console.error('Erreur SW', err));
// }

// document.getElementById('status').textContent += ` | Version cache: ${CACHE_NAME}`
