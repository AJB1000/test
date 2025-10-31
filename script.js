// script.js — Fonctionne même hors ligne

function displayCoords() {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');

    console.log(lat)

    document.getElementById('lat').textContent = lat || '—';
    document.getElementById('lon').textContent = lon || '—';
    document.getElementById('status').textContent =
        navigator.onLine ? 'En ligne' : 'Hors ligne (affichage local)';
}

// S'exécute dès que le DOM est prêt
document.addEventListener('DOMContentLoaded', displayCoords);

// Met à jour si l'URL change (ex. : navigation sans rechargement)
window.addEventListener('popstate', displayCoords);