// === git03 ===
const CACHE_VERSION = 'pwa-git03-v1';

// --- Parse URL parameters ---
const params = new URLSearchParams(window.location.search);
const lon = params.get('lon');
const lat = params.get('lat');
const zoom = params.get('zoom');

// --- Extra parameters ---
const extras = {};
for (const [key, val] of params.entries()) {
    if (!['lon', 'lat', 'zoom'].includes(key)) extras[key] = val;
}

// --- Update static fields immediately ---
// Math.round(1000.2222*100,2)/100
document.getElementById('lon').textContent = Math.round(lon * 1000) / 1000 ?? '?';
document.getElementById('lat').textContent = Math.round(lat * 1000) / 1000 ?? '?';
document.getElementById('swVersion').textContent = CACHE_VERSION;

// --- Build links (base) ---
const linkList = document.getElementById('linkList');

const buildLinks = (locality = null, offline = false) => {
    const disable = offline ? 'disabled' : '';
    const loc = locality ? encodeURIComponent(locality) : '';
    linkList.innerHTML = `
    <p><a class="${disable}" href="https://www.meteoblue.com/fr/meteo/semaine/${lat}N${lon}E">Météo 7 jours</a></p>
    <p><a class="${disable}" href="https://www.google.com/maps/@${lat},${lon},${zoom}z">Google Maps</a></p>
    <p><a class="${disable}" href="https://fr.wikipedia.org/wiki/${loc}">Wikipedia (${locality ?? '...'})</a></p>
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
    document.getElementById('locality').textContent = 'Localité indisponible (offline)';
} else {
    status.textContent = 'En ligne';
    buildLinks();
    getLocalityGeoNames(lat, lon)
        .then(locality => {
            document.getElementById('locality').textContent = locality;
            buildLinks(locality, false);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('locality').textContent = 'Localité inconnue';
        });
}

// --- Register Service Worker ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service worker enregistré', reg.scope))
        .catch(err => console.error('Erreur SW:', err));
}

// === GeoNames (Nominatim fallback) ===
async function getLocalityGeoNames(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const resp = await fetch(url, { headers: { 'User-Agent': 'oruxmaps-pwa-demo' } });
        const data = await resp.json();
        if (data.address && (data.address.village || data.address.town || data.address.city)) {
            return data.address.village || data.address.town || data.address.city;
        } else if (data.display_name) {
            return data.display_name.split(',')[0];
        } else {
            return 'Localité inconnue';
        }
    } catch (err) {
        console.warn('Erreur avec Nominatim :', err);
        return 'Inconnue (offline ?)';
    }
}
