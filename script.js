const issueDistribution = [
  { label: 'Traffic congestion', value: 32, color: '#ff6f7d' },
  { label: 'Air pollution', value: 24, color: '#ffc857' },
  { label: 'Waste management', value: 18, color: '#6d8cff' },
  { label: 'Healthcare access', value: 16, color: '#4ad298' },
  { label: 'Water quality', value: 10, color: '#9e7cff' }
];

const issueCategories = [
  { name: 'Traffic & mobility', value: 92, color: 'color-red' },
  { name: 'Air quality', value: 81, color: 'color-amber' },
  { name: 'Waste services', value: 68, color: 'color-blue' },
  { name: 'Healthcare access', value: 62, color: 'color-purple' },
  { name: 'Water safety', value: 54, color: 'color-green' }
];

const hotspots = [
  { area: 'Downtown Core', risk: 'High', value: '82%', color: 'dot-red' },
  { area: 'North Industrial', risk: 'High', value: '76%', color: 'dot-amber' },
  { area: 'Market Ward', risk: 'Medium', value: '64%', color: 'dot-purple' },
  { area: 'Riverside', risk: 'Medium', value: '58%', color: 'dot-blue' }
];

const issues = [
  {
    title: 'Traffic congestion',
    severity: 'High',
    severityClass: 'sev-high',
    description: 'Commuter delays are increasing around the transit corridor during weekday rush hours.',
    impact: 'Affects 18,400 commuters daily'
  },
  {
    title: 'Air pollution',
    severity: 'Medium',
    severityClass: 'sev-medium',
    description: 'Fine particulate levels remain elevated near industrial and commercial route junctions.',
    impact: 'Children and seniors at higher risk'
  },
  {
    title: 'Waste collection',
    severity: 'Medium',
    severityClass: 'sev-medium',
    description: 'Overflowing bins and delayed pickups are concentrated in informal settlement clusters.',
    impact: '9 collection zones need reinforcement'
  },
  {
    title: 'Healthcare capacity',
    severity: 'Low',
    severityClass: 'sev-low',
    description: 'Primary care delays persist in underserved neighborhoods but are trending downward.',
    impact: 'Wait times down by 11% this month'
  }
];

const healthFactors = [
  { name: 'Mobility', value: 82 },
  { name: 'Air quality', value: 75 },
  { name: 'Water safety', value: 88 },
  { name: 'Healthcare', value: 71 },
  { name: 'Public safety', value: 80 }
];

const issueLegend = document.getElementById('issueLegend');
const categoryList = document.getElementById('categoryList');
const hotspotList = document.getElementById('hotspotList');
const issueCards = document.getElementById('issueCards');
const scoreList = document.getElementById('scoreList');

function renderIssueLegend() {
  issueLegend.innerHTML = issueDistribution
    .map(
      (item) => `
        <li class="legend-item">
          <div class="legend-label">
            <span class="legend-swatch" style="background:${item.color};"></span>
            <span>${item.label}</span>
          </div>
          <strong>${item.value}%</strong>
        </li>
      `
    )
    .join('');
}

function renderCategoryList() {
  categoryList.innerHTML = issueCategories
    .map(
      (item) => `
        <div class="category-row">
          <div>
            <div class="category-meta">
              <strong>${item.name}</strong>
              <span>${item.value}%</span>
            </div>
            <div class="progress"><span class="progress-bar ${item.color}" style="width:${item.value}%"></span></div>
          </div>
        </div>
      `
    )
    .join('');
}

function renderHotspots() {
  hotspotList.innerHTML = hotspots
    .map(
      (item) => `
        <div class="hotspot-row">
          <div class="hotspot-meta">
            <strong>${item.area}</strong>
            <span>${item.risk}</span>
          </div>
          <div class="hotspot-indicator">
            <span class="dot ${item.color}"></span>
            ${item.value}
          </div>
        </div>
      `
    )
    .join('');
}

function renderIssueCards() {
  issueCards.innerHTML = issues
    .map(
      (item) => `
        <article class="issue-card">
          <div class="issue-card-head">
            <h4>${item.title}</h4>
            <span class="severity ${item.severityClass}">${item.severity}</span>
          </div>
          <p>${item.description}</p>
          <div class="impact">
            <span class="dot dot-amber"></span>
            ${item.impact}
          </div>
        </article>
      `
    )
    .join('');
}

function renderScoreList() {
  scoreList.innerHTML = healthFactors
    .map(
      (item, index) => `
        <div class="score-row">
          <div class="score-meta">
            <strong>${item.name}</strong>
            <span class="score-rank">#${index + 1}</span>
          </div>
          <span class="score-value">${item.value}</span>
        </div>
      `
    )
    .join('');
}

renderIssueLegend();
renderCategoryList();
renderHotspots();
renderIssueCards();
renderScoreList();
