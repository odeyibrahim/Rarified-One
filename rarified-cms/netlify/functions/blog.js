import { db } from './_lib/db.js';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SITE = () => (process.env.SITE_URL || '').replace(/\/$/, '');
const CSP = "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const out = (code, body, type = 'text/html; charset=utf-8') => ({ statusCode: code, body,
  headers: { 'Content-Type': type, 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=60' } });
const date = (d) => new Date(d || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const safeImg = (u) => (/^https:\/\//.test(u || '') ? esc(u) : '');
const render = (b) => {
  const html = []; let para = [];
  const flush = () => { if (para.length) html.push(`<p>${para.map(esc).join('<br>')}</p>`); para = []; };
  for (const raw of String(b || '').split('\n')) {
    const line = raw.trim();
    if (!line) flush();
    else if (line.startsWith('## ')) { flush(); html.push(`<h2>${esc(line.slice(3))}</h2>`); }
    else para.push(line);
  }
  flush(); return html.join('\n');
};

const CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Jost,system-ui,sans-serif;background:#F7F3EA;color:#14213A;line-height:1.7}
a{color:inherit}.top{background:#0A1730;padding:22px 0}.w{width:min(960px,calc(100% - 40px));margin:auto}
.top .w{display:flex;justify-content:space-between;align-items:center}.top a{color:#E4CF9C;text-decoration:none;font:500 11px/1 Jost,sans-serif;letter-spacing:.28em;text-transform:uppercase}
.top b{font:500 1.4rem/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.04em}
h1{font:500 clamp(2.2rem,5vw,3.6rem)/1.1 "Cormorant Garamond",Georgia,serif;margin:14px 0 18px}
h2{font:500 1.7rem/1.2 "Cormorant Garamond",Georgia,serif;margin:38px 0 10px}
.kick{font:500 10px/1 Jost,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#8A6B2A}
main{padding:70px 0 90px}.lead{color:#5A6579;font-size:1.05rem;max-width:640px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;margin-top:48px}
.card{display:block;text-decoration:none;background:#FBF8F1;border:1px solid #E3DAC6}.card:hover{border-color:#C6A55C}
.card img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}.card div{padding:22px 24px 26px}
.card h3{font:500 1.4rem/1.2 "Cormorant Garamond",Georgia,serif;margin:10px 0}.card p{font-size:14px;color:#5A6579}
article img.cover{width:100%;max-height:460px;object-fit:cover;margin:30px 0 10px}article p{margin:0 0 18px;font-size:1.05rem}
.meta{font-size:13px;color:#5A6579}.back{display:inline-block;margin-top:40px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#8A6B2A}
footer{background:#0A1730;color:#aab6c9;padding:34px 0;font-size:13px}`;

const page = ({ title, desc, path, body, ld, image }) => `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(SITE() + path)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">${image ? `<meta property="og:image" content="${image}">` : ''}
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Jost:wght@400;500&display=swap" rel="stylesheet"><style>${CSS}</style>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}</head><body>
<div class="top"><div class="w"><a href="/"><b>Rarified One</b></a><a href="/insights">Insights</a></div></div><main><div class="w">${body}</div></main>
<footer><div class="w">&copy; Rarified One Solutions · Victoria Island, Lagos · <a href="/">Home</a></div></footer></body></html>`;

export const handler = async (e) => {
  const q = e.queryStringParameters || {};
  try {
    const supabase = db();
    if (q.sitemap) {
      const { data } = await supabase.from('posts').select('slug,updated_at').eq('is_published', true);
      const urls = [['/', null], ['/insights', null], ...(data || []).map((p) => [`/insights/${encodeURIComponent(p.slug)}`, p.updated_at])];
      return out(200, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(([u, m]) => `<url><loc>${esc(SITE() + u)}</loc>${m ? `<lastmod>${new Date(m).toISOString()}</lastmod>` : ''}</url>`).join('')}</urlset>`, 'application/xml');
    }
    if (q.slug) {
      const { data: p } = await supabase.from('posts').select('*').eq('slug', q.slug).eq('is_published', true).maybeSingle();
      if (!p) return out(404, page({ title: 'Article not found', desc: '', path: '/insights', body: '<p class="kick">404</p><h1>Article not found</h1><a class="back" href="/insights">&larr; All insights</a>' }));
      const mins = Math.max(1, Math.round(String(p.body).split(/\s+/).length / 200));
      const img = safeImg(p.cover_url);
      return out(200, page({ title: `${p.title} — Rarified One Solutions`, desc: p.excerpt || p.title, path: `/insights/${encodeURIComponent(p.slug)}`, image: img,
        ld: { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.published_at, dateModified: p.updated_at, publisher: { '@type': 'Organization', name: 'Rarified One Solutions' } },
        body: `<article><p class="kick">Insights</p><h1>${esc(p.title)}</h1><p class="meta">${date(p.published_at)} · ${mins} min read</p>${img ? `<img class="cover" src="${img}" alt="">` : ''}${render(p.body)}</article><a class="back" href="/insights">&larr; All insights</a>` }));
    }
    const { data: list } = await supabase.from('posts').select('slug,title,excerpt,cover_url,published_at').eq('is_published', true).order('published_at', { ascending: false });
    const cards = (list || []).map((p) => `<a class="card" href="/insights/${encodeURIComponent(p.slug)}">${safeImg(p.cover_url) ? `<img src="${safeImg(p.cover_url)}" alt="" loading="lazy">` : ''}<div><span class="kick">${date(p.published_at)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div></a>`).join('');
    return out(200, page({ title: 'Insights — Rarified One Solutions', desc: 'Commentary on the Lagos property market, investment structuring and development.', path: '/insights',
      body: `<p class="kick">Insights &amp; Commentary</p><h1>Perspective for the discerning investor</h1><p class="lead">Notes from our development, advisory and agency desks.</p><div class="grid">${cards || '<p>No articles published yet.</p>'}</div>` }));
  } catch (err) { console.error(err); return out(500, '<p>Something went wrong.</p>'); }
};
