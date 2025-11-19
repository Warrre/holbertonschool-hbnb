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
  const t = getCookie('access_token');
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
    if(res.ok && data.access_token){
      setCookie('access_token', data.access_token, 1);
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
  const priceFilter = parseFloat(document.getElementById('price-filter')?.value || '0') || 0;
  const textSearch = (document.getElementById('text-search')?.value || '').trim().toLowerCase();
  let filtered = places;
  if(priceFilter>0) filtered = filtered.filter(p=>p.price<=priceFilter);
  if(textSearch) filtered = filtered.filter(p=> ((p.title||'')+ ' ' + (p.description||'')).toLowerCase().includes(textSearch));
  filtered.forEach(p=>{
    const card = document.createElement('div'); card.className='place-card';
    card.innerHTML = `
      <div class="place-image">🖼️</div>
      <h3 class="place-title">${p.title||'Sans titre'}</h3>
      <p>${(p.description||'').slice(0,120)}</p>
      <div class="place-meta"><div class="place-price">${p.price? p.price+' €':'N/A'}</div><a class="btn" href="place.html?id=${p.id}">Voir</a></div>`;
    el.appendChild(card);
  });
}

function setupIndexPage(){
  document.getElementById('apply-filter')?.addEventListener('click',()=>loadPlaces());
  // apply search on enter
  document.getElementById('text-search')?.addEventListener('keydown',(e)=>{ if(e.key === 'Enter'){ e.preventDefault(); loadPlaces(); }});
  const token = getCookie('access_token');
  if(token){
    document.getElementById('login-link')?.setAttribute('href','#');
    document.getElementById('login-link').textContent = 'Profil';
    document.getElementById('add-review-link').style.display = 'inline-block';
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
  const el = document.getElementById('place-details');
  if(!el) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) { el.textContent='Aucun identifiant de place.'; return; }
  const res = await fetch(`${BASE_API}/places/${id}`);
  if(!res.ok){ el.textContent='Logement introuvable'; return; }
  const p = await res.json();
  el.innerHTML = `<h2>${p.title||'Sans titre'}</h2><p>${p.description||''}</p>
    <p class="place-price">Prix: ${p.price? p.price+' €' : 'N/A'}</p>`;
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
    const d = document.createElement('div'); d.className='place-card';
    d.innerHTML = `<strong>Note: ${r.rating||'N/A'}</strong><p>${r.text||''}</p>`;
    el.appendChild(d);
  });
}

function renderAddReviewInline(placeId){
  const container = document.getElementById('add-review-inline');
  container.innerHTML = `<h3>Laisser un avis</h3>
    <form id="inline-review-form">
      <label>Note: <input id="inline-rating" type="number" min="1" max="5" required></label>
      <label>Texte: <textarea id="inline-text" required></textarea></label>
      <button type="submit">Envoyer</button>
    </form>
    <div id="inline-message"></div>`;
  const f = document.getElementById('inline-review-form');
  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const token = getCookie('access_token');
    if(!token){ document.getElementById('inline-message').textContent='Veuillez vous connecter.'; return; }
    const rating = parseInt(document.getElementById('inline-rating').value);
    const text = document.getElementById('inline-text').value;
    // decode user id from token
    const claims = parseJwt(token);
    const user_id = claims?.user_id || claims?.sub || claims?.user || '';
    const body = { text, rating, user_id, place_id: placeId };
    const res = await fetch(`${BASE_API}/reviews/`,{method:'POST',headers:{'Content-Type':'application/json',...authHeader()},body:JSON.stringify(body)});
    const data = await res.json();
    const msg = document.getElementById('inline-message');
    if(res.ok){ msg.textContent='Avis ajouté'; renderReviews(placeId); } else { msg.textContent = data.error || 'Erreur'; }
  });
}

// Add review page
function setupAddReviewPage(){
  const f = document.getElementById('add-review-form');
  if(!f) return;
  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const place_id = document.getElementById('place-id').value;
    const rating = parseInt(document.getElementById('rating').value);
    const text = document.getElementById('review-text').value;
    const token = getCookie('access_token');
    if(!token){ document.getElementById('add-review-message').textContent='Veuillez vous connecter.'; return; }
    const claims = parseJwt(token);
    const user_id = claims?.user_id || claims?.sub || '';
    const res = await fetch(`${BASE_API}/reviews/`,{method:'POST',headers:{'Content-Type':'application/json',...authHeader()},body:JSON.stringify({text,rating,user_id,place_id})});
    const data = await res.json();
    const msg = document.getElementById('add-review-message');
    if(res.ok){ msg.textContent='Avis ajouté'; } else { msg.textContent = data.error || 'Erreur'; }
  });
}

// Initialize pages
document.addEventListener('DOMContentLoaded', ()=>{
  setupLoginPage();
  setupIndexPage();
  loadPlaceDetails();
  setupAddReviewPage();
});
