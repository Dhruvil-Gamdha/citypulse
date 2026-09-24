const cityCatalog = {
  delhi: { name: 'Delhi, India', lat: 28.61, lon: 77.21, base: { traffic: [88, 72, 61, 79], water: [68, 82, 54, 76], waste: [74, 63, 49, 81] } },
  mumbai: { name: 'Mumbai, India', lat: 19.07, lon: 72.88, base: { traffic: [82, 67, 55, 73], water: [78, 69, 86, 61], waste: [64, 76, 58, 70] } },
  bengaluru: { name: 'Bengaluru, India', lat: 12.97, lon: 77.59, base: { traffic: [76, 84, 49, 68], water: [82, 74, 65, 89], waste: [71, 55, 78, 63] } },
  london: { name: 'London, UK', lat: 51.51, lon: -0.13, base: { traffic: [58, 69, 44, 62], water: [91, 88, 84, 94], waste: [86, 79, 73, 90] } },
  newyork: { name: 'New York, USA', lat: 40.71, lon: -74.01, base: { traffic: [73, 81, 57, 65], water: [88, 79, 91, 84], waste: [67, 75, 62, 71] } }
};

const areaNames = ['North District', 'Downtown Core', 'Market Ward', 'Riverside'];
const markerPositions = [[20, 22], [56, 35], [35, 68], [73, 70]];
const metricConfig = {
  air: { label: 'Air quality', title: 'Air quality across selected city', unit: 'AQI', source: 'Air quality is fetched live from Open-Meteo. Other indicators use the built-in city demo dataset until a civic data API is connected.' },
  traffic: { label: 'Traffic', title: 'Traffic congestion across selected city', unit: '% congestion', source: 'Traffic values are a representative demo layer. Connect a traffic provider such as HERE, TomTom, or Google for live road speeds.' },
  water: { label: 'Water quality', title: 'Water quality across selected city', unit: 'quality score', source: 'Water values are a representative demo layer. Connect your municipal water sensor API for live readings.' },
  waste: { label: 'Waste', title: 'Waste service coverage across selected city', unit: 'service score', source: 'Waste values are a representative demo layer. Connect a city sanitation API for live collection status.' }
};

let selectedCity = 'delhi';
let selectedMetric = 'air';
let liveAirQuality = null;

const $ = (id) => document.getElementById(id);
const citySelect = $('citySelect');

Object.entries(cityCatalog).forEach(([key, city]) => { citySelect.add(new Option(city.name, key)); });
citySelect.value = selectedCity;

function statusFor(value, metric) {
  if (metric === 'air') return value <= 50 ? 'Good' : value <= 100 ? 'Moderate' : value <= 150 ? 'Poor' : 'Critical';
  return value >= 80 ? 'Good' : value >= 60 ? 'Moderate' : value >= 40 ? 'Poor' : 'Critical';
}
function statusClass(status) { return `marker-${status.toLowerCase()}`; }
function colorFor(status) { return ({ Good: '#4ad298', Moderate: '#ffc857', Poor: '#ff6f7d', Critical: '#bf3eff' })[status]; }
function valuesFor(metric) {
  if (metric === 'air' && liveAirQuality) return liveAirQuality;
  return cityCatalog[selectedCity].base[metric];
}
function average(values) { return Math.round(values.reduce((a, b) => a + b, 0) / values.length); }

async function fetchLiveAirQuality() {
  const city = cityCatalog[selectedCity];
  $('dataStatus').textContent = 'Refreshing…';
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Air quality request failed');
    const result = await response.json();
    const current = Number(result.current?.us_aqi);
    if (!Number.isFinite(current)) throw new Error('No AQI value');
    liveAirQuality = [Math.max(0, current - 18), Math.max(0, current - 5), current + 12, current - 9].map(Math.round);
    $('dataStatus').textContent = 'Live air data';
  } catch (error) {
    liveAirQuality = null;
    $('dataStatus').textContent = 'Demo fallback';
  }
  renderDashboard();
}

function renderMap(values) {
  const map = $('cityMap');
  map.querySelectorAll('.map-marker').forEach((marker) => marker.remove());
  values.forEach((value, index) => {
    const status = statusFor(value, selectedMetric);
    const marker = document.createElement('button');
    marker.className = `map-marker ${statusClass(status)}`;
    marker.style.left = `${markerPositions[index][0]}%`;
    marker.style.top = `${markerPositions[index][1]}%`;
    marker.setAttribute('aria-label', `${areaNames[index]}: ${status}`);
    marker.innerHTML = `<span class="marker-tooltip"><strong>${areaNames[index]}</strong><br>${metricConfig[selectedMetric].label}: ${value}${selectedMetric === 'air' ? ' AQI' : ''}<br>Status: ${status}</span>`;
    map.appendChild(marker);
  });
}
function renderLegend() {
  $('mapLegend').innerHTML = ['Good', 'Moderate', 'Poor', 'Critical'].map((status) => `<div class="legend-entry"><span class="dot" style="background:${colorFor(status)}"></span>${status}</div>`).join('');
}
function renderCategories(values) {
  $('categoryList').innerHTML = values.map((value, index) => { const status = statusFor(value, selectedMetric); const score = selectedMetric === 'air' ? Math.max(0, 100 - value) : value; return `<div class="category-row"><div><div class="category-meta"><strong>${areaNames[index]}</strong><span>${status}</span></div><div class="progress"><span class="progress-bar" style="width:${Math.min(100, score)}%;background:${colorFor(status)}"></span></div></div><strong>${value}${selectedMetric === 'air' ? ' AQI' : ''}</strong></div>`; }).join('');
}
function renderHotspots(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => selectedMetric === 'air' ? b.value - a.value : a.value - b.value);
  $('hotspotList').innerHTML = sorted.map(({ value, index }) => { const status = statusFor(value, selectedMetric); return `<div class="hotspot-row"><div class="hotspot-meta"><strong>${areaNames[index]}</strong><span>${status}</span></div><div class="hotspot-indicator"><span class="dot" style="background:${colorFor(status)}"></span>${value}</div></div>`; }).join('');
}
function renderIssues(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => selectedMetric === 'air' ? b.value - a.value : a.value - b.value).slice(0, 4);
  $('issueCards').innerHTML = sorted.map(({ value, index }) => { const status = statusFor(value, selectedMetric); const severity = status === 'Critical' || status === 'Poor' ? 'High' : status === 'Moderate' ? 'Medium' : 'Low'; return `<article class="issue-card"><div class="issue-card-head"><h4>${areaNames[index]}</h4><span class="severity sev-${severity.toLowerCase()}">${severity}</span></div><p>${metricConfig[selectedMetric].label} is currently ${status.toLowerCase()} in this mapped zone.</p><div class="impact"><span class="dot" style="background:${colorFor(status)}"></span>Reading: ${value} ${metricConfig[selectedMetric].unit}</div></article>`; }).join('');
}
function renderScores(values) {
  const city = cityCatalog[selectedCity];
  const scores = selectedMetric === 'air' ? { 'Selected indicator': Math.max(0, 100 - average(values)), 'Mobility': 82, 'Water safety': average(city.base.water), 'Public safety': 80 } : { [metricConfig[selectedMetric].label]: average(values), 'Mobility': Math.max(0, 100 - average(city.base.traffic)), 'Air quality': Math.max(0, 100 - (liveAirQuality ? average(liveAirQuality) : 70)), 'Water safety': average(city.base.water) };
  $('scoreList').innerHTML = Object.entries(scores).map(([name, value], index) => `<div class="score-row"><div class="score-meta"><strong>${name}</strong><span>#${index + 1}</span></div><span class="score-value">${Math.round(value)}</span></div>`).join('');
}
function renderDashboard() {
  const config = metricConfig[selectedMetric];
  const values = valuesFor(selectedMetric);
  const avg = average(values);
  $('mapTitle').textContent = `${config.label} across ${cityCatalog[selectedCity].name}`;
  $('mixTitle').textContent = `${config.label} mix`;
  $('categoryTitle').textContent = `${config.label} by area`;
  $('issuesTitle').textContent = `${config.label} issues`;
  $('scoreTitle').textContent = `${config.label} health factors`;
  $('trendTitle').textContent = `${config.label} trend over 6 months`;
  $('dataNote').textContent = config.source;
  $('statOne').textContent = selectedMetric === 'air' ? `${Math.max(0, 100 - avg)}/100` : `${avg}/100`;
  $('statOneLabel').textContent = `${config.label} score`;
  $('statTwo').textContent = values.filter((value) => ['Poor', 'Critical'].includes(statusFor(value, selectedMetric))).length;
  $('statTwoLabel').textContent = 'Areas needing attention';
  $('statThree').textContent = `${avg}${selectedMetric === 'air' ? ' AQI' : ''}`;
  $('statThreeLabel').textContent = 'Average reading';
  $('statFour').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  $('airValue').textContent = selectedMetric === 'air' ? statusFor(avg, 'air') : statusFor(average(values), selectedMetric);
  $('airLabel').textContent = config.label;
  $('donutValue').textContent = `${Math.round(values.filter((v) => ['Poor', 'Critical'].includes(statusFor(v, selectedMetric))).length / values.length * 100)}%`;
  $('donutLabel').textContent = 'Needs attention';
  $('donutChart').style.background = `conic-gradient(var(--red) 0 25%,var(--amber) 25% 52%,var(--blue) 52% 76%,var(--green) 76%)`;
  $('issueLegend').innerHTML = values.map((value, index) => `<li class="legend-item"><div class="legend-label"><span class="legend-swatch" style="background:${colorFor(statusFor(value, selectedMetric))}"></span><span>${areaNames[index]}</span></div><strong>${value}${selectedMetric === 'air' ? ' AQI' : ''}</strong></li>`).join('');
  renderMap(values); renderLegend(); renderCategories(values); renderHotspots(values); renderIssues(values); renderScores(values);
}

$('metricTabs').addEventListener('click', (event) => { const button = event.target.closest('.metric-tab'); if (!button) return; document.querySelectorAll('.metric-tab').forEach((tab) => tab.classList.remove('active')); button.classList.add('active'); selectedMetric = button.dataset.metric; renderDashboard(); if (selectedMetric === 'air') fetchLiveAirQuality(); });
citySelect.addEventListener('change', () => { selectedCity = citySelect.value; liveAirQuality = null; renderDashboard(); fetchLiveAirQuality(); });
$('jumpToMap').addEventListener('click', () => $('live-map').scrollIntoView({ behavior: 'smooth' }));
$('reportButton').addEventListener('click', () => alert(`CityPulse report ready for ${cityCatalog[selectedCity].name}.`));
$('downloadButton').addEventListener('click', () => alert('Connect a backend export endpoint to download verified city data.'));
renderDashboard();
fetchLiveAirQuality();
setInterval(() => { if (selectedMetric === 'air') fetchLiveAirQuality(); }, 300000);
