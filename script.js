// Récupère les paramètres d’URL et affiche lon/lat
function afficherCoordonnees() {
    const params = new URLSearchParams(location.search);
    const lon = params.get('lon') || '–';
    const lat = params.get('lat') || '–';
    document.getElementById('lon').textContent = lon;
    document.getElementById('lat').textContent = lat;
    document.getElementById('status').textContent =
        navigator.onLine ? '🟢 En ligne' : '🔴 Hors ligne';
}
afficherCoordonnees();

// Met à jour le statut online/offline
window.addEventListener('online', afficherCoordonnees);
window.addEventListener('offline', afficherCoordonnees);

// Enregistre le service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker enregistré', reg))
        .catch(err => console.error('Erreur SW', err));
}
