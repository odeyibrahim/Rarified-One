/* ================================================================
   RARIFIED ONE SOLUTIONS — application
================================================================ */
(function(){
"use strict";
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- storage ---------- */
const store = {
  get(k,f){ try{ const v = JSON.parse(localStorage.getItem(k)); return v===null||v===undefined ? f : v; }catch(e){ return f; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
const K = { req:'r1_requests', content:'r1_content', pub:'r1_published', auth:'r1_auth', seen:'r1_seen', ban:'r1_banner' };

/* ---------- content model (editable from the Private Desk) ---------- */
const DEF = {
  banner:{ on:false, text:'' },
  hero:{ title:'Discerning counsel for the', sub:'Rarified One Solutions unites development, agency brokerage, investment advisory, asset & property management and strategic procurement under a single point of accountability — protecting capital and maximising yield at every stage.' },
  contact:{ phone:'+234 (0) 814 380 7444', email:'rarifiedonesolutions@gmail.com', addr:'2nd Floor, Trulease Building, 290A Ajose Adeogun Street, Victoria Island, Lagos, Nigeria' },
  hidden:{}
};
const saved = {};
let CONTENT = {
  banner:  Object.assign({}, DEF.banner,  saved.banner  || {}),
  hero:    Object.assign({}, DEF.hero,    saved.hero    || {}),
  contact: Object.assign({}, DEF.contact, saved.contact || {}),
  hidden:  Object.assign({}, DEF.hidden,  saved.hidden  || {})
};

/* seed sample requests on first visit so the desk is demonstrable */

/* ---------- toasts ---------- */
function toast(title, msg){
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div><b>${esc(title)}</b><p>${esc(msg)}</p></div>
    <button class="t-x" aria-label="Dismiss"><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 1l12 12M13 1L1 13"/></svg></button>`;
  $('#toasts').appendChild(el);
  requestAnimationFrame(()=> el.classList.add('on'));
  const kill = () => { el.classList.remove('on'); setTimeout(()=> el.remove(), 450); };
  el.querySelector('.t-x').addEventListener('click', kill);
  setTimeout(kill, 4600);
}

/* ---------- apply editable content to the live page ---------- */
function applyContent(){
  const b = CONTENT.banner;
  if(b.on && b.text && !sessionStorage.getItem(K.ban)){
    $('#bannerText').textContent = b.text;
    $('#banner').hidden = false;
  } else { $('#banner').hidden = true; }

  $('#cHeroTitle').textContent = CONTENT.hero.title || DEF.hero.title;
  $('#cHeroSub').textContent   = CONTENT.hero.sub   || DEF.hero.sub;

  const c = CONTENT.contact, tel = (c.phone||'').replace(/[^+\d]/g,'');
  $('#cPhone').textContent = c.phone;  $('#cPhone').href = 'tel:'+tel;
  $('#fPhone').textContent = c.phone;  $('#fPhone').href = 'tel:'+tel;
  $('#cEmail').textContent = c.email;  $('#cEmail').href = 'mailto:'+c.email;
  $('#fEmail').textContent = c.email;  $('#fEmail').href = 'mailto:'+c.email;
  $('#cAddr').textContent  = c.addr;

  $$('.prj').forEach(p => { p.hidden = !!CONTENT.hidden[p.dataset.project]; });
}
 $('#bannerClose').addEventListener('click', () => {
  sessionStorage.setItem(K.ban,'1'); $('#banner').hidden = true;
});
applyContent();
/* ---------- server API (Netlify Functions + Supabase) ---------- */
const API = '/.netlify/functions/';
let PUBLISHED = null;
async function api(fn, body){
  const t = sessionStorage.getItem(K.auth);
  const r = await fetch(API+fn, { method: body ? 'POST' : 'GET',
    headers: Object.assign({'Content-Type':'application/json'}, t ? {'X-Admin-Token': t} : {}),
    body: body ? JSON.stringify(body) : undefined });
  let d = {}; try{ d = await r.json(); }catch(e){}
  if(r.status === 401 && t){ sessionStorage.removeItem(K.auth); if(location.hash === '#dashboard') showLogin(); }
  if(!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}
const adm = (operation, data) => api('admin-operations', { operation, data: data || {} });
api('get-content').then(d => {
  if(!d || !d.content) return;
  for(const k of ['banner','hero','contact','hidden']) CONTENT[k] = Object.assign({}, DEF[k], d.content[k] || {});
  PUBLISHED = d.updated_at; applyContent();
}).catch(() => {});

/* ---------- hero facade — generated window detail ---------- */
(function buildFacade(){
  const g = $('#facadeWin'); if(!g) return;
  const NS = 'http://www.w3.org/2000/svg';
  const rnd = (a,b) => (a + Math.random()*(b-a)).toFixed(2)+'s';
  const line = d => { const p = document.createElementNS(NS,'path');
    p.setAttribute('d',d); p.setAttribute('pathLength','1'); p.setAttribute('class','st');
    p.style.setProperty('--dd', rnd(1.35,1.75)); g.appendChild(p); };
  const rect = (x,y,w,h,dim) => { const r = document.createElementNS(NS,'rect');
    r.setAttribute('x',x); r.setAttribute('y',y); r.setAttribute('width',w); r.setAttribute('height',h);
    r.setAttribute('pathLength','1'); r.setAttribute('class','st'+(dim?' dim':''));
    r.style.setProperty('--dd', rnd(1.5,2.7)); g.appendChild(r); };
  // pergola railing ticks
  for(let x=124; x<=260; x+=17) line(`M${x} 296v12`);
  // ground-floor storefront mullions
  [296,330,364,398,432].forEach(x => line(`M${x} 468v32`));
  // tower window panes
  [132,180,228,276,324,372,420].forEach(y => [284,322,360,398].forEach(x => rect(x, y+10, 26, 28, true)));
  // left wing panes
  [308,356].forEach(y => [130,164,198,232].forEach(x => rect(x, y+10, 26, 28, true)));
  rect(230, 414, 26, 28, true);
})();

/* ---------- loader ---------- */
let countersDone = false;
function startCounters(){
  if(countersDone) return; countersDone = true;
  $$('.stat-n').forEach(el => {
    const target = +el.dataset.count, suf = el.dataset.suf || '';
    if(reduced){ el.textContent = target + suf; return; }
    const t0 = performance.now(), dur = 1500;
    (function tick(t){
      const p = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-p,3);
      el.textContent = Math.round(target*e) + suf;
      if(p<1) requestAnimationFrame(tick);
    })(t0);
  });
}
function finishLoad(){
  const L = $('#loader');
  document.body.classList.add('loaded');
  if(L){ L.classList.add('done'); setTimeout(()=> L.remove(), 700); }
  document.body.classList.remove('locked');
  $('#heroArt').classList.add('go');
  startCounters();
  sessionStorage.setItem(K.seen,'1');
}
document.body.classList.add('locked');
if(sessionStorage.getItem(K.seen) || reduced){ finishLoad(); }
else { setTimeout(finishLoad, 1500); }

/* ---------- header, mobile menu ---------- */
const topbar = $('#topbar');
addEventListener('scroll', () => topbar.classList.toggle('scrolled', scrollY > 30), {passive:true});
const menuBtn = $('#menuBtn');
function closeMenu(){ document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded','false'); }
menuBtn.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', open);
});
 $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));
addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });

/* ---------- active nav ---------- */
const navMap = {};
 $$('.nav a').forEach(a => { const h = a.getAttribute('href'); if(h.startsWith('#') && h !== '#dashboard') navMap[h] = a; });
const secIO = new IntersectionObserver(es => es.forEach(en => {
  if(en.isIntersecting){
    $$('.nav a').forEach(a => a.classList.remove('on'));
    const a = navMap['#'+en.target.id]; if(a) a.classList.add('on');
  }
}), {rootMargin:'-42% 0px -52% 0px'});
 $$('main section[id]').forEach(s => secIO.observe(s));

/* ---------- scroll reveal + rail ---------- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
}), {threshold:.12});
 $$('.rv').forEach(el => io.observe(el));
const rail = $('#rail');
new IntersectionObserver((es,o) => es.forEach(en => {
  if(en.isIntersecting){ rail.classList.add('in'); o.disconnect(); }
}), {threshold:.3}).observe(rail);

/* ---------- accordions (values + portfolio) ---------- */
function wireAccordion(root, headSel, itemSel){
  $(root).addEventListener('click', e => {
    const h = e.target.closest(headSel); if(!h) return;
    const item = h.closest(itemSel), open = item.classList.toggle('open');
    h.setAttribute('aria-expanded', open);
  });
}
wireAccordion('#valsAcc', '.acc-h', '.acc-item');
 $('#prjList').addEventListener('click', e => {
  const h = e.target.closest('.prj-head'); if(!h) return;
  const item = h.closest('.prj'), open = item.classList.toggle('open');
  h.setAttribute('aria-expanded', open);
});

/* ---------- hero parallax ---------- */
if(!reduced && matchMedia('(pointer:fine)').matches){
  const art = $('#heroArt');
  $('#hero').addEventListener('mousemove', e => {
    const r = art.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) / r.width;
    const dy = (e.clientY - (r.top + r.height/2)) / r.height;
    art.style.transform = `translate(${dx*14}px, ${dy*10}px)`;
  });
  $('#hero').addEventListener('mouseleave', () => { art.style.transform = ''; });
}

/* ---------- custom cursor ---------- */
(function cursor(){
  if(!matchMedia('(pointer:fine) and (min-width:1025px)').matches || reduced) return;
  document.body.classList.add('has-cursor');
  const cur = $('#cur'), dot = cur.querySelector('.cur-dot'), ring = cur.querySelector('.cur-ring');
  let x = innerWidth/2, y = innerHeight/2, rx = x, ry = y;
  addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px,${y}px)`;
    cur.classList.remove('off');
  });
  (function loop(){ rx += (x-rx)*.16; ry += (y-ry)*.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => {
    if(e.target.closest('input,textarea,select')) { cur.classList.add('off'); cur.classList.remove('big'); return; }
    cur.classList.remove('off');
    cur.classList.toggle('big', !!e.target.closest('a,button,.prj-head,.acc-h,label,.rq-h,.sw'));
  });
  document.documentElement.addEventListener('mouseleave', () => cur.classList.add('off'));
})();

/* ---------- contact form → request inbox + Netlify ---------- */
const reqForm = $('#reqForm');
reqForm.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(reqForm);
  if(String(fd.get('bot-field')||'').trim()) return; // honeypot
  const req = {
    id: 'r'+Date.now(),
    name: String(fd.get('name')||'').trim(),
    email: String(fd.get('email')||'').trim(),
    phone: String(fd.get('phone')||'').trim(),
    interest: String(fd.get('interest')||'General Enquiry'),
    message: String(fd.get('message')||'').trim(),
    date: Date.now(), status: 'new'
  };
  if(!req.name || !req.email || !req.message) return;
  try{ await api('submit-enquiry', { name:req.name, email:req.email, phone:req.phone, interest:req.interest, message:req.message }); }
  catch(err){ toast('Not sent', err.message === 'Failed to fetch' ? 'Network error — please try again.' : err.message); return; }
  // forward to Netlify Forms (succeeds when deployed on Netlify; silent locally)
  try{
    const body = new URLSearchParams();
    for(const [k,v] of fd.entries()) body.append(k, v);
    body.set('form-name','client-request');
    fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: body.toString() });
  }catch(err){}
  reqForm.reset();
  reqForm.hidden = true; $('#frmOk').hidden = false;
  toast('Request received', 'Thank you — our team will respond within one business day.');
  refreshDashBadge(); if(dashOpen) renderRequests();
});
 $('#frmAgain').addEventListener('click', e => {
  e.preventDefault();
  $('#frmOk').hidden = true; reqForm.hidden = false; reqForm.querySelector('input').focus();
});

/* ================================================================
   THE PRIVATE DESK
================================================================ */
/* Authentication is server-side (admin-operations function, bcrypt + hashed session tokens). */

let dashOpen = false, curView = 'overview', curFilter = 'all';
const dash = $('#dash'), dashLogin = $('#dashLogin'), dashShell = $('#dashShell');

const fmtDate = t => new Date(t).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
const fmtFull = t => fmtDate(t) + ' · ' + new Date(t).toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});
const ago = t => { const m = Math.max(1, Math.round((Date.now()-t)/60000));
  if(m < 60) return m+'m ago'; const h = Math.round(m/60);
  if(h < 24) return h+'h ago'; return Math.round(h/24)+'d ago'; };

let REQS = [];
function getReqs(){ return REQS; }
function setReqs(a){ REQS = a; }
async function loadReqs(){
  try{
    const rows = await adm('get_enquiries');
    REQS = rows.map(x => ({ id:x.id, name:x.name, email:x.email, phone:x.phone||'', interest:x.interest||'General Enquiry',
      message:x.message, date:new Date(x.created_at).getTime(), status:x.status }));
  }catch(e){}
  refreshDashBadge(); if(curView === 'requests') renderRequests(); if(curView === 'overview') renderOverview();
}

function refreshDashBadge(){
  const n = getReqs().filter(r => r.status === 'new').length;
  const b = $('#dBadge');
  b.hidden = n === 0; b.textContent = n;
  $('#ovNew').textContent = n;
  $('#ovTotal').textContent = getReqs().length;
}

function showLogin(){
  dashLogin.hidden = false; dashShell.hidden = true;
  $('#loginErr').textContent = '';
}
function showShell(){
  dashLogin.hidden = true; dashShell.hidden = false;
  $('#dDate').textContent = new Date().toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  refreshDashBadge(); setView(curView); loadReqs();
}

 $('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('#lUser').value.trim(), p = $('#lPass').value;
  try{
    const r = await api('admin-operations', { operation:'login', data:{ username:u, password:p } });
    sessionStorage.setItem(K.auth, r.token);
    $('#lPass').value = '';
    showShell();
    toast('Welcome back', 'You are signed in to the Private Desk.');
  }catch(err){
    $('#loginErr').textContent = err.message === 'Failed to fetch' ? 'Network error. Please try again.' : err.message;
    const card = $('#loginCard'); card.classList.remove('shake');
    void card.offsetWidth; card.classList.add('shake');
  }
});
 $('#logoutForm').addEventListener('submit', e => {
  e.preventDefault();
  adm('logout').catch(() => {}); sessionStorage.removeItem(K.auth); REQS = [];
  location.hash = '';
  toast('Signed out', 'You have left the Private Desk.');
});

/* routing */
function route(){
  dashOpen = location.hash === '#dashboard';
  dash.hidden = !dashOpen;
  document.body.classList.toggle('in-dash', dashOpen);
  if(dashOpen){
    if(sessionStorage.getItem(K.auth)) showShell(); else showLogin();
  } else {
    curView = 'overview';
  }
}
addEventListener('hashchange', route);
route();

/* view switching */
const TITLES = { overview:'Overview', requests:'Requests', content:'Content', posts:'Articles' };
function setView(v){
  curView = v;
  ['overview','requests','content','posts'].forEach(k =>
    $('#dView'+k[0].toUpperCase()+k.slice(1)).hidden = (k !== v));
  $('#dTitle').textContent = TITLES[v];
  $$('.d-nav').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  if(v === 'requests') renderRequests();
  if(v === 'content')  populateContentForm();
  if(v === 'posts')    loadPosts();
  if(v === 'overview') renderOverview();
}
 $$('.d-nav').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if(g) setView(g.dataset.goto);
  const ex = e.target.closest('[data-exit]');
  if(ex){ e.preventDefault(); location.hash = ''; $('#hero').scrollIntoView({behavior: reduced ? 'auto' : 'smooth'}); }
});

/* overview */
function renderOverview(){
  refreshDashBadge();
  const reqs = getReqs();
  $('#ovProj').textContent = $$('.prj').filter(p => !p.hidden).length;
  const pub = PUBLISHED;
  $('#ovPub').textContent = pub ? fmtDate(pub) : '—';
  const host = $('#ovRecent');
  const recent = reqs.slice(0,4);
  host.innerHTML = recent.length ? recent.map(r => `
    <div class="cli-row" style="padding:15px 24px">
      <span class="rq-dot" style="background:${r.status==='new' ? 'var(--gold-500)' : '#B9C2CC'}"></span>
      <div><h3 style="font:500 1.05rem/1.2 var(--serif)">${esc(r.name)}</h3>
      <p style="font-size:12.5px;color:var(--ink-soft);margin-top:3px">${esc(r.interest)} · ${ago(r.date)}</p></div>
    </div>`).join('')
  : '<p style="padding:26px 24px;font-size:13.5px;color:var(--ink-soft)">No requests yet — the desk is quiet.</p>';
}

/* requests */
function renderRequests(){
  const list = $('#rqList');
  const reqs = getReqs().filter(r => curFilter === 'all' || r.status === curFilter);
  if(!reqs.length){
    list.innerHTML = `<div class="rq-empty">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
      <h4>The desk is quiet.</h4><p>New enquiries submitted through the site will appear here.</p></div>`;
    return;
  }
  list.innerHTML = reqs.map(r => `
    <article class="rq ${r.status}" data-id="${r.id}">
      <button class="rq-h" aria-expanded="false">
        <span class="rq-dot"></span>
        <span class="rq-name">${esc(r.name)}</span>
        <span class="rq-int">${esc(r.interest)}</span>
        <span class="rq-date">${ago(r.date)}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="rq-b"><div class="rq-bi"><div class="rq-detail">
        <div class="rq-meta">
          <div>Email — <a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>
          ${r.phone ? `<div>Phone — ${esc(r.phone)}</div>` : ''}
          <div>Received — ${fmtFull(r.date)}</div>
          <div>Status — ${r.status === 'new' ? 'Awaiting reply' : 'Handled'}</div>
        </div>
        <blockquote class="rq-msg">“${esc(r.message)}”</blockquote>
        <div class="rq-acts">
          <a class="d-btn" href="mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent('Rarified One Solutions — Re: your enquiry')}&body=${encodeURIComponent('Dear '+r.name+',\n\n\n\nKind regards,\nRarified One Solutions\n+234 (0) 814 380 7444')}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
            Reply by Email</a>
          <button class="d-btn" data-act="toggle">${r.status === 'new' ? 'Mark Handled' : 'Reopen'}</button>
          <button class="d-btn danger" data-act="del">Delete</button>
        </div>
      </div></div></div>
    </article>`).join('');
}
 $$('.rq-f').forEach(b => b.addEventListener('click', () => {
  $$('.rq-f').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); curFilter = b.dataset.filter; renderRequests();
}));
 $('#rqList').addEventListener('click', e => {
  const head = e.target.closest('.rq-h');
  if(head){ const it = head.closest('.rq');
    const open = it.classList.toggle('open');
    head.setAttribute('aria-expanded', open); return; }
  const btn = e.target.closest('[data-act]'); if(!btn) return;
  const id = btn.closest('.rq').dataset.id;
  const arr = getReqs(); const r = arr.find(x => x.id === id); if(!r) return;
  if(btn.dataset.act === 'toggle'){
    const prev = r.status; r.status = r.status === 'new' ? 'handled' : 'new';
    adm('update_enquiry', { id, status: r.status }).catch(err => { r.status = prev; renderRequests(); refreshDashBadge(); toast('Not saved', err.message); });
    setReqs(arr); renderRequests(); refreshDashBadge(); renderOverview();
    toast('Request updated', `${r.name} — marked ${r.status}.`);
  }
  if(btn.dataset.act === 'del'){
    if(btn.dataset.armed){
      adm('delete_enquiry', { id }).catch(err => { loadReqs(); toast('Not deleted', err.message); });
      setReqs(arr.filter(x => x.id !== id));
      renderRequests(); refreshDashBadge(); renderOverview();
      toast('Request deleted', 'The enquiry has been removed from the desk.');
    } else {
      btn.dataset.armed = '1'; btn.classList.add('armed'); const t = btn.textContent;
      btn.textContent = 'Confirm delete?';
      setTimeout(() => { if(btn.isConnected){ btn.dataset.armed=''; btn.classList.remove('armed'); btn.textContent = t; } }, 2800);
    }
  }
});

/* content editor */
const PRJ_LABELS = {
  riviera:'Riviera Vista Residences', mekunwen:'Mekunwen Road Apartments', beaufort:'Beaufort Residences',
  knox:'Knox Residences', baines:'Baines Credit MFB', primewater:'Primewater View Gardens', mojisola:'Mojisola Onikoyi Estate'
};
function populateContentForm(){
  $('#cfBannerOn').checked  = !!CONTENT.banner.on;
  $('#cfBannerText').value  = CONTENT.banner.text || '';
  $('#cfHeroTitle').value   = CONTENT.hero.title;
  $('#cfHeroSub').value     = CONTENT.hero.sub;
  $('#cfPhone').value       = CONTENT.contact.phone;
  $('#cfEmail').value       = CONTENT.contact.email;
  $('#cfAddr').value        = CONTENT.contact.addr;
  $('#cfProjects').innerHTML = Object.keys(PRJ_LABELS).map(id => `
    <div class="cf-prj">
      <div><b>${PRJ_LABELS[id]}</b><span>${CONTENT.hidden[id] ? 'Hidden from public site' : 'Shown on public site'}</span></div>
      <span class="sw"><input type="checkbox" data-pid="${id}" ${CONTENT.hidden[id] ? '' : 'checked'} aria-label="Show ${PRJ_LABELS[id]} on the site"><i></i></span>
    </div>`).join('');
}
 $('#cfProjects').addEventListener('change', e => {
  const inp = e.target.closest('input[data-pid]'); if(!inp) return;
  inp.closest('.cf-prj').querySelector('span').textContent =
    inp.checked ? 'Shown on public site' : 'Hidden from public site';
});
 $('#contentForm').addEventListener('submit', async e => {
  e.preventDefault();
  CONTENT.banner = { on: $('#cfBannerOn').checked, text: $('#cfBannerText').value.trim() };
  CONTENT.hero   = { title: $('#cfHeroTitle').value.trim() || DEF.hero.title, sub: $('#cfHeroSub').value.trim() || DEF.hero.sub };
  CONTENT.contact = { phone: $('#cfPhone').value.trim() || DEF.contact.phone,
                      email: $('#cfEmail').value.trim() || DEF.contact.email,
                      addr:  $('#cfAddr').value.trim()  || DEF.contact.addr };
  CONTENT.hidden = {};
  $$('#cfProjects input[data-pid]').forEach(i => { if(!i.checked) CONTENT.hidden[i.dataset.pid] = true; });
  try{ const r = await adm('update_content', { content: CONTENT }); PUBLISHED = r.updated_at; }
  catch(err){ toast('Not published', err.message); return; }
  sessionStorage.removeItem(K.ban); // allow the (new) banner to show again
  applyContent(); renderOverview();
  toast('Changes published', 'Your edits are now live on the public page.');
});
 $('#cfReset').addEventListener('click', async () => {
  CONTENT = JSON.parse(JSON.stringify(DEF));
  try{ const r = await adm('update_content', { content: CONTENT }); PUBLISHED = r.updated_at; }
  catch(err){ toast('Not reset', err.message); return; }
  sessionStorage.removeItem(K.ban);
  applyContent(); populateContentForm(); renderOverview();
  toast('Content reset', 'The site has been restored to its defaults.');
});

/* ---------- articles (blog) ---------- */
let POSTS = [], editingPost = null;
const pForm = $('#postForm'), pPanel = $('#postsPanel');
const showPostList = () => { pForm.hidden = true; pPanel.hidden = false; };
async function loadPosts(){
  try{ POSTS = await adm('get_posts'); }catch(e){ toast('Could not load articles', e.message); return; }
  showPostList();
  $('#postsList').innerHTML = POSTS.length ? POSTS.map(p => `
    <div class="ps-row"><div><h4>${esc(p.title)}</h4>
      <p>${p.is_published ? 'Published ' + fmtDate(new Date(p.published_at).getTime()) : 'Draft'} · /insights/${esc(p.slug)}</p></div>
      <button class="d-btn" data-pedit="${esc(p.id)}">Edit</button></div>`).join('')
    : '<p style="padding:26px 24px;font-size:13.5px;color:var(--ink-soft)">No articles yet — write your first one.</p>';
}
function openPost(p){
  editingPost = p || null;
  $('#pfTitle').value = p ? p.title : ''; $('#pfSlug').value = p ? p.slug : '';
  $('#pfExcerpt').value = p ? (p.excerpt || '') : ''; $('#pfBody').value = p ? p.body : '';
  $('#pfCover').value = p ? (p.cover_url || '') : ''; $('#pfPub').checked = p ? !!p.is_published : false;
  $('#pfDelete').hidden = !p; pPanel.hidden = true; pForm.hidden = false; $('#pfTitle').focus();
}
$('#pNew').addEventListener('click', () => openPost(null));
$('#pfCancel').addEventListener('click', showPostList);
$('#postsList').addEventListener('click', e => {
  const b = e.target.closest('[data-pedit]'); if(!b) return;
  openPost(POSTS.find(x => x.id === b.dataset.pedit));
});
pForm.addEventListener('submit', async e => {
  e.preventDefault();
  const row = { id: editingPost ? editingPost.id : undefined, title: $('#pfTitle').value.trim(), slug: $('#pfSlug').value.trim(),
    excerpt: $('#pfExcerpt').value.trim(), body: $('#pfBody').value, cover_url: $('#pfCover').value.trim(),
    is_published: $('#pfPub').checked, published_at: editingPost ? editingPost.published_at : undefined };
  try{
    await adm('save_post', row);
    toast('Article saved', row.is_published ? 'Published on the public site.' : 'Saved as a draft.');
    await loadPosts();
  }catch(err){ toast('Not saved', err.message); }
});
$('#pfDelete').addEventListener('click', async e => {
  const btn = e.currentTarget;
  if(!btn.dataset.armed){
    btn.dataset.armed = '1'; btn.classList.add('armed'); btn.textContent = 'Confirm delete?';
    setTimeout(() => { btn.dataset.armed = ''; btn.classList.remove('armed'); btn.textContent = 'Delete'; }, 2800); return;
  }
  try{ await adm('delete_post', { id: editingPost.id }); toast('Article deleted', 'It has been removed from the site.'); await loadPosts(); }
  catch(err){ toast('Not deleted', err.message); }
});
/* upload: resize in the browser (max 1600px) and send as JPEG; the server re-checks the file type */
$('#pfFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if(!f) return;
  try{
    const img = await createImageBitmap(f);
    const k = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const r = await adm('upload_image', { data: c.toDataURL('image/jpeg', .85).split(',')[1] });
    $('#pfCover').value = r.url; toast('Image uploaded', 'Cover image set — remember to save the article.');
  }catch(err){ toast('Upload failed', err.message || 'Could not read that image.'); }
  e.target.value = '';
});

/* ---------- homepage: latest insights ---------- */
fetch(API + 'get-posts').then(r => r.json()).then(list => {
  if(!Array.isArray(list) || !list.length) return;
  const host = $('#insGrid');
  list.slice(0,3).forEach(p => {
    const a = document.createElement('a'); a.className = 'ins-card'; a.href = '/insights/' + encodeURIComponent(p.slug);
    if(/^https:\/\//.test(p.cover_url || '')){ const i = document.createElement('img'); i.src = p.cover_url; i.alt = ''; i.loading = 'lazy'; a.appendChild(i); }
    const d = document.createElement('div'), t = document.createElement('time'), h = document.createElement('h3'), x = document.createElement('p');
    t.textContent = fmtDate(new Date(p.published_at).getTime()); h.textContent = p.title; x.textContent = p.excerpt || '';
    d.append(t, h, x); a.appendChild(d); host.appendChild(a);
  });
  $('#insights').hidden = false;
}).catch(() => {});

refreshDashBadge();
})();
