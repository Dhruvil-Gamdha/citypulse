(() => {
  const mapElement = document.getElementById('cityMap');
  const citySelect = document.getElementById('citySelect');
  if (!mapElement || !citySelect) return;

  const leafletCss = document.createElement('link');
  leafletCss.rel = 'stylesheet';
  leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(leafletCss);

  const cities = {
    delhi: [28.61, 77.21], mumbai: [19.07, 72.88], bengaluru: [12.97, 77.59],
    kolkata: [22.57, 88.36], hyderabad: [17.39, 78.49], london: [51.51, -0.13],
    newyork: [40.71, -74.01], toronto: [43.65, -79.38], singapore: [1.35, 103.82],
    sydney: [-33.87, 151.21], dubai: [25.20, 55.27]
  };
  const areas = [
    ['North District', 0.045, -0.04], ['Downtown Core', 0.005, 0.02],
    ['Market Ward', -0.035, 0.035], ['Riverside', -0.02, -0.045]
  ];
  const readings = [35, 48, 61, 42];
  let map;
  let markers = [];

  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      if (window.L) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function status(value) {
    return value <= 50 ? 'Good' : value <= 100 ? 'Moderate' : value <= 150 ? 'Poor' : 'Critical';
  }

  function color(value) {
    return { Good: '#4ad298', Moderate: '#ffc857', Poor: '#ff6f7d', Critical: '#bf3eff' }[status(value)];
  }

  function drawCity() {
    const center = cities[citySelect.value] || cities.delhi;
    if (!map) {
      map = L.map(mapElement, { zoomControl: true, scrollWheelZoom: false }).setView(center, 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
      }).addTo(map);
    } else {
      map.setView(center, 11);
    }
    markers.forEach(marker => marker.remove());
    markers = areas.map(([name, latOffset, lonOffset], index) => {
      const value = readings[index];
      const marker = L.circleMarker([center[0] + latOffset, center[1] + lonOffset], {
        radius: 13, color: '#fff', weight: 2, fillColor: color(value), fillOpacity: 0.92
      }).addTo(map);
      marker.bindPopup(`<strong>${name}</strong><br>Air quality: ${value} AQI`);
      marker.bindTooltip(name, { direction: 'top', offset: [0, -10] });
      return marker;
    });
    setTimeout(() => map.invalidateSize(), 50);
  }

  loadLeaflet().then(drawCity).catch(() => {
    mapElement.innerHTML = '<p style="padding:2rem">The interactive map could not be loaded. Check your internet connection.</p>';
  });
  citySelect.addEventListener('change', drawCity);
})();
