const cityCatalog = {
  delhi: { name: 'Delhi, India', lat: 28.61, lon: 77.21, base: { traffic: [88,72,61,79], water: [68,82,54,76], waste: [74,63,49,81] } },
  mumbai: { name: 'Mumbai, India', lat: 19.07, lon: 72.88, base: { traffic: [82,67,55,73], water: [78,69,86,61], waste: [64,76,58,70] } },
  bengaluru: { name: 'Bengaluru, India', lat: 12.97, lon: 77.59, base: { traffic: [76,84,49,68], water: [82,74,65,89], waste: [71,55,78,63] } },
  kolkata: { name: 'Kolkata, India', lat: 22.57, lon: 88.36, base: { traffic: [79,74,66,82], water: [64,71,58,69], waste: [60,73,52,77] } },
  hyderabad: { name: 'Hyderabad, India', lat: 17.39, lon: 78.49, base: { traffic: [69,81,57,64], water: [75,80,72,84], waste: [77,68,71,73] } },
  london: { name: 'London, UK', lat: 51.51, lon: -0.13, base: { traffic: [58,69,44,62], water: [91,88,84,94], waste: [86,79,73,90] } },
  newyork: { name: 'New York, USA', lat: 40.71, lon: -74.01, base: { traffic: [73,81,57,65], water: [88,79,91,84], waste: [67,75,62,71] } },
  toronto: { name: 'Toronto, Canada', lat: 43.65, lon: -79.38, base: { traffic: [62,70,51,59], water: [93,90,87,95], waste: [88,82,79,91] } },
  singapore: { name: 'Singapore', lat: 1.35, lon: 103.82, base: { traffic: [54,61,47,58], water: [95,94,92,96], waste: [91,89,84,93] } },
  sydney: { name: 'Sydney, Australia', lat: -33.87, lon: 151.21, base: { traffic: [49,57,42,53], water: [92,89,94,90], waste: [87,83,80,88] } },
  dubai: { name: 'Dubai, UAE', lat: 25.20, lon: 55.27, base: { traffic: [67,76,59,70], water: [73,78,81,76], waste: [79,74,69,82] } }
};
const areas = ['North District','Downtown Core','Market Ward','Riverside'];
const positions = [[20,22],[56,35],[35,68],[73,70]];
const config = { air:{label:'Air quality',unit:'AQI',source:'Air quality is fetched live from Open-Meteo. Other indicators use the city demo dataset.'}, traffic:{label:'Traffic',unit:'% congestion',source:'Traffic values are representative demo data.'}, water:{label:'Water quality',unit:'quality score',source:'Water values are representative demo data.'}, waste:{label:'Waste',unit:'service score',source:'Waste values are representative demo data.'} };
let selectedCity = 'delhi'; let selectedMetric = 'air'; let liveAir = null;
const $ = id => document.getElementById(id);
const citySelect = $('citySelect');
Object.entries(cityCatalog).forEach(([key, city]) => citySelect.add(new Option(city.name, key)));
citySelect.value = selectedCity;
const average = values => Math.round(values.reduce((a,b)=>a+b,0)/values.length);
const statusFor = (v,m) => m === 'air' ? (v<=50?'Good':v<=100?'Moderate':v<=150?'Poor':'Critical') : (v>=80?'Good':v>=60?'Moderate':v>=40?'Poor':'Critical');
const colorFor = s => ({Good:'#4ad298',Moderate:'#ffc857',Poor:'#ff6f7d',Critical:'#bf3eff'})[s];
const valuesFor = m => m === 'air' && liveAir ? liveAir : (m === 'air' ? [35,48,61,42] : cityCatalog[selectedCity].base[m]);
function renderDashboard() {
  const values = valuesFor(selectedMetric), avg = average(values), city = cityCatalog[selectedCity], c = config[selectedMetric];
  const attention = values.filter(v=>['Poor','Critical'].includes(statusFor(v,selectedMetric))).length;
  $('mapTitle').textContent = `${c.label} across ${city.name}`; $('mixTitle').textContent = `${c.label} mix`; $('dataNote').textContent = c.source;
  $('statOneLabel').textContent = `${c.label} score`; $('statOne').textContent = `${selectedMetric==='air'?Math.max(0,100-avg):avg}/100`; $('statTwo').textContent = attention; $('statThreeLabel').textContent = `Average ${c.label.toLowerCase()}`; $('statThree').textContent = `${avg}${selectedMetric==='air'?' AQI':''}`; $('statFour').textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  $('airValue').textContent = statusFor(avg,selectedMetric); $('airLabel').textContent = c.label; $('donutValue').textContent = `${Math.round(attention/values.length*100)}%`;
  $('donutChart').style.background = `conic-gradient(#ff6f7d 0 ${attention/values.length*100}%,#ffc857 ${attention/values.length*100}% 55%,#6d8cff 55% 78%,#4ad298 78%)`;
  $('mapLegend').innerHTML = ['Good','Moderate','Poor','Critical'].map(s=>`<span><i style="background:${colorFor(s)}"></i>${s}</span>`).join('');
  $('cityMap').querySelectorAll('.map-marker').forEach(m=>m.remove());
  values.forEach((value,i)=>{ const status=statusFor(value,selectedMetric); const marker=document.createElement('button'); marker.className=`map-marker ${status.toLowerCase()}`; marker.style.left=`${positions[i][0]}%`; marker.style.top=`${positions[i][1]}%`; marker.title=`${areas[i]}: ${value} ${c.unit}`; marker.innerHTML=`<span>${value}</span>`; $('cityMap').appendChild(marker); });
  $('categoryList').innerHTML = values.map((v,i)=>`<div class="category-row"><div><strong>${areas[i]}</strong><span class="${statusFor(v,selectedMetric).toLowerCase()}">${statusFor(v,selectedMetric)}</span></div><div class="bar"><i style="width:${selectedMetric==='air'?Math.max(0,100-v):v}%;background:${colorFor(statusFor(v,selectedMetric))}"></i></div><b>${v}</b></div>`).join('');
  const scores = {'Selected indicator':selectedMetric==='air'?Math.max(0,100-avg):avg,'Mobility':Math.round(average(city.base.traffic)),'Water safety':Math.round(average(city.base.water)),'Public services':Math.round(average(city.base.waste))};
  $('scoreList').innerHTML = Object.entries(scores).map(([name,v])=>`<div class="score-row"><div><strong>${name}</strong><span>${v}/100</span></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join('');
  $('hotspotList').innerHTML = values.map((v,i)=>`<div><span class="dot" style="background:${colorFor(statusFor(v,selectedMetric))}"></span><b>${areas[i]}</b><small>${v} ${c.unit}</small></div>`).sort((a,b)=>b.textContent.localeCompare(a.textContent)).join('');
  $('heroScore').textContent = Math.max(0,100-avg);
}
async function fetchAir() { $('dataStatus').textContent='Refreshing…'; try { const city=cityCatalog[selectedCity]; const r=await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi&timezone=auto`); if(!r.ok) throw Error(); const a=Number((await r.json()).current?.us_aqi); if(!Number.isFinite(a)) throw Error(); liveAir=[Math.max(0,a-18),Math.max(0,a-5),a+12,a-9].map(Math.round); $('dataStatus').textContent='Live air data'; } catch(e) { liveAir=null; $('dataStatus').textContent='Demo fallback'; } renderDashboard(); }
$('metricTabs').addEventListener('click',e=>{const b=e.target.closest('.metric-tab');if(!b)return;selectedMetric=b.dataset.metric;document.querySelectorAll('.metric-tab').forEach(x=>x.classList.toggle('active',x===b));renderDashboard();if(selectedMetric==='air')fetchAir();});
citySelect.addEventListener('change',()=>{selectedCity=citySelect.value;liveAir=null;renderDashboard();fetchAir();}); $('jumpToMap').onclick=()=> $('live-map').scrollIntoView({behavior:'smooth'});
const modal=$('loginModal'); $('loginButton').onclick=()=>{modal.classList.remove('hidden');$('email').focus();}; $('closeLogin').onclick=()=>modal.classList.add('hidden'); modal.onclick=e=>{if(e.target===modal)modal.classList.add('hidden');};
$('loginForm').onsubmit=e=>{e.preventDefault();if($('email').value==='demo@citypulse.app'&&$('password').value==='citypulse'){localStorage.setItem('citypulseUser',$('email').value);modal.classList.add('hidden');updateAuth();}else $('loginError').textContent='Use the demo credentials shown below.';};
function updateAuth(){const user=localStorage.getItem('citypulseUser');$('signedInAs').textContent=user?`Signed in as ${user}`:'';$('loginButton').classList.toggle('hidden',!!user);$('logoutButton').classList.toggle('hidden',!user);} $('logoutButton').onclick=()=>{localStorage.removeItem('citypulseUser');updateAuth();};
renderDashboard(); updateAuth(); fetchAir(); setInterval(()=>{if(selectedMetric==='air')fetchAir();},300000);
