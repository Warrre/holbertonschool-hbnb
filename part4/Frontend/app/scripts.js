const BASE_API = window.BASE_API_URL || 'http://127.0.0.1:5000/api/v1';

function setCookie(name, value, days=1){
  const d = new Date(); d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
}
function getCookie(name){
  const v = document.cookie.match('(^|;)\\s*'+name+'\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}
function parseJwt(token){
  try{
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  }catch(e){return null}
}
function authHeader(){
  const t = getCookie('token');
  return t ? { 'Authorization': `Bearer ${t}` } : {};
}

// Login
function setupLoginPage(){
  const f = document.getElementById('login-form');
  if(!f) return;
  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${BASE_API}/auth/login`,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})
    });
    const data = await res.json();
    const msg = document.getElementById('login-message');
    if(res.ok && (data.access_token || data.token)){
      const tokenVal = data.access_token || data.token;
      setCookie('token', tokenVal, 1);
      msg.textContent = 'Connecté';
      window.location.href = 'index.html';
    }else{
      msg.textContent = data.error || 'Erreur';
    }
  });
}

// Index page: list places
async function loadPlaces(){
  const el = document.getElementById('places-list');
  if(!el) return;
  const res = await fetch(`${BASE_API}/places/`);
  const places = await res.json();
  renderPlaces(places || []);
}

function renderPlaces(places){
  const el = document.getElementById('places-list');
  el.innerHTML = '';
  const priceFilterRaw = document.getElementById('price-filter')?.value || 'All';
  const priceFilter = (priceFilterRaw === 'All') ? null : parseFloat(priceFilterRaw) || null;
  const textSearch = (document.getElementById('text-search')?.value || '').trim().toLowerCase();
  let filtered = places;
  if(priceFilter !== null) filtered = filtered.filter(p=>p.price<=priceFilter);
  if(textSearch) filtered = filtered.filter(p=> ((p.title||'')+ ' ' + (p.description||'')).toLowerCase().includes(textSearch));
  filtered.forEach(p=>{
    const card = document.createElement('div'); card.className='place-card';
    card.innerHTML = `
      <div class="place-image">🖼️</div>
      <h3 class="place-title">${p.title||'Sans titre'}</h3>
      <p>${(p.description||'').slice(0,120)}</p>
      <div class="place-meta"><div class="place-price">${p.price? p.price+' €':'N/A'}</div><a class="details-button" href="place.html?id=${p.id}">View Details</a></div>`;
    el.appendChild(card);
  });
}

function setupIndexPage(){
  document.getElementById('apply-filter')?.addEventListener('click',()=>loadPlaces());
  // apply search on enter
  document.getElementById('text-search')?.addEventListener('keydown',(e)=>{ if(e.key === 'Enter'){ e.preventDefault(); loadPlaces(); }});
  const token = getCookie('token');
  if(token){
    document.querySelectorAll('.login-button').forEach(el=>{ el.style.display='none'; });
    document.getElementById('add-review-link').style.display = 'inline-block';
  } else {
    // show login button(s)
    document.querySelectorAll('.login-button').forEach(el=>{ el.style.display='inline-block'; });
    document.getElementById('add-review-link').style.display = 'none';
  }
  loadPlaces();

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.querySelector('.nav-links');
  if(menuBtn && nav){
    // show button on small screens
    const mq = window.matchMedia('(max-width:900px)');
    const update = ()=>{ if(mq.matches){ menuBtn.style.display='block'; nav.style.display='none'; } else { menuBtn.style.display='none'; nav.style.display='flex'; }};
    update(); mq.addEventListener('change', update);
    menuBtn.addEventListener('click', ()=>{ nav.style.display = (nav.style.display === 'none') ? 'flex' : 'none'; nav.style.flexDirection = 'column'; nav.style.background = 'var(--blue-night)'; nav.style.padding = '12px'; nav.style.position='absolute'; nav.style.right='12px'; nav.style.top='64px'; nav.style.borderRadius='8px'; });
  }
}

// Place details
async function loadPlaceDetails(){
  const el = document.getElementById('place-main') || document.getElementById('place-details');
  if(!el) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) { el.textContent='Aucun identifiant de place.'; return; }
  const res = await fetch(`${BASE_API}/places/${id}`);
  if(!res.ok){ el.textContent='Logement introuvable'; return; }
  const p = await res.json();
  // build place details structure
  const mainHtml = `
    <h2>${p.title||'Sans titre'}</h2>
    <div class="detail-card place-info">
      <p><strong>Host:</strong> ${p.owner || 'Unknown'}</p>
      <p><strong>Price per night:</strong> ${p.price? p.price+' €' : 'N/A'}</p>
      <p><strong>Description:</strong> ${p.description||''}</p>
      <p><strong>Amenities:</strong> ${(p.amenities||[]).map(a=>a.name||a).join(', ')}</p>
    </div>`;
  el.innerHTML = mainHtml;
  renderReviews(id);
  renderAddReviewInline(id);
}

async function renderReviews(placeId){
  const el = document.getElementById('reviews');
  el.innerHTML = '<h3>Avis</h3>';
  const res = await fetch(`${BASE_API}/reviews/places/${placeId}`);
  if(!res.ok) { el.innerHTML += '<p>Aucun avis.</p>'; return; }
  const list = await res.json();
  if(!list.length) el.innerHTML += '<p>Aucun avis.</p>';
  list.forEach(r=>{
    const d = document.createElement('div'); d.className='review-card';
    d.innerHTML = `<p><strong>${r.user_id || r.user || 'Anonymous'}:</strong></p><p>${r.text||''}</p><p>Rating: ${'★'.repeat(r.rating||0)}</p>`;
    el.appendChild(d);
  });
}

function renderAddReviewInline(placeId){
  const container = document.getElementById('add-review-inline');
  const token = getCookie('token');
  if(!container) return;
  if(!token){
    container.innerHTML = `<p>Vous devez vous <a href="login.html">connecter</a> pour ajouter un avis.</p>`;
    return;
  }
  // show button to navigate to add_review.html with place id
  container.innerHTML = `<a class="add-review" href="add_review.html?place_id=${placeId}">Add Review</a>`;
}

// Add review page
function setupAddReviewPage(){
  const token = getCookie('token');
  if(!token){ window.location.href = 'index.html'; return; }
  const f = document.getElementById('add-review-form');
  if(!f) return;
  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const place_id = document.getElementById('place-id').value || (new URLSearchParams(window.location.search)).get('place_id');
    const rating = parseInt(document.getElementById('rating').value);
    const text = document.getElementById('review-text').value;
    const claims = parseJwt(getCookie('token'));
    const user_id = claims?.user_id || claims?.sub || '';
    const res = await fetch(`${BASE_API}/reviews/`,{method:'POST',headers:{'Content-Type':'application/json',...authHeader()},body:JSON.stringify({text,rating,user_id,place_id})});
    const data = await res.json();
    const msg = document.getElementById('add-review-message');
    if(res.ok){ msg.textContent='Avis ajouté'; } else { msg.textContent = data.error || 'Erreur'; }
  });
}

function getPlaceIdFromURL(){
  const params = new URLSearchParams(window.location.search);
  return params.get('place_id') || params.get('id');
}

// Initialize pages
document.addEventListener('DOMContentLoaded', ()=>{
  setupLoginPage();
  setupIndexPage();
  loadPlaceDetails();
  setupAddReviewPage();
});
