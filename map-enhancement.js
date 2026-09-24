/* Google Maps integration for the CityPulse dashboard. */
(() => {
  const mapElement = document.getElementById('cityMap');
  const citySelect = document.getElementById('citySelect');
  if (!mapElement || !citySelect) return;

  const GOOGLE_MAPS_API_KEY = 'AIzaSyD20kE3SUMITDot-EeRv6vxKKSLpIz4VYk';
  const cityMap = {
    delhi: { lat: 28.61, lng: 77.21 },
    mumbai: { lat: 19.07, lng: 72.88 },
    bengaluru: { lat: 12.97, lng: 77.59 },
    kolkata: { lat: 22.57, lng: 88.36 },
    hyderabad: { lat: 17.39, lng: 78.49 },
    london: { lat: 51.51, lng: -0.13 },
    newyork: { lat: 40.71, lng: -74.01 },
    toronto: { lat: 43.65, lng: -79.38 },
    singapore: { lat: 1.35, lng: 103.82 },
    sydney: { lat: -33.87, lng: 151.21 },
    dubai: { lat: 25.20, lng: 55.27 }
  };

  let map;
  let cityMarker;

  function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) return resolve();
      const callbackName = '__cityPulseGoogleMapsReady';
      window[callbackName] = resolve;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.head.appendChild(script);
    });
  }

  function selectedPosition() {
    return cityMap[citySelect.value] || cityMap.delhi;
  }

  function updateMap() {
    const position = selectedPosition();
    if (!map) {
      map = new google.maps.Map(mapElement, {
        center: position,
        zoom: 11,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: []
      });
      cityMarker = new google.maps.Marker({
        map,
        position,
        title: citySelect.options[citySelect.selectedIndex]?.text || 'Selected city'
      });
      return;
    }
    map.panTo(position);
    cityMarker.setPosition(position);
    cityMarker.setTitle(citySelect.options[citySelect.selectedIndex]?.text || 'Selected city');
  }

  // Remove the old decorative labels and markers before Google Maps takes over.
  mapElement.querySelectorAll('.map-label, .map-marker').forEach(element => element.remove());
  loadGoogleMaps().then(updateMap).catch(() => {
    mapElement.innerHTML = '<p style="padding:2rem">Google Maps could not be loaded. Check the API key, billing, and allowed websites in Google Cloud Console.</p>';
  });
  citySelect.addEventListener('change', updateMap);
})();
