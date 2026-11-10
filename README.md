# Rarified One Solutions — Website + CMS

Static site (`public/`) + Netlify Functions + Supabase (database and image storage).
Edit the site from the **Private Desk** at `/#dashboard`: enquiries, homepage content, and blog articles.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor → run `supabase/migrations/001_cms.sql`, then `002_seed_posts.sql` (placeholder articles — edit or delete them later).
3. Project Settings → API: copy the **Project URL** and the **service_role** key (server-only — never put it in front-end files).

## 2. Admin password
```bash
npm install
npm run hash-password -- "your-strong-password"
```
Copy the printed hash (starts with `$2a$`).

## 3. Netlify
1. Push this repo to GitHub → Netlify → *Add new site → Import from Git*. Settings are read from `netlify.toml` (publish `public`, functions `netlify/functions`).
2. Site configuration → Environment variables — add everything in `.env.example`:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`
   (optional email alerts: `RESEND_API_KEY`, `FROM_EMAIL`, `NOTIFY_EMAIL`).
3. Deploy, then open `https://your-site/#dashboard` and sign in.

## 4. Before launch
- Replace `YOUR-DOMAIN` in `public/robots.txt`, and the canonical / Open Graph URLs in `public/index.html`.
- Replace the placeholder articles and demo copy.
- Use Supabase **Pro** for a paying client (free projects pause after a week of inactivity; `keepalive.js` pings daily as a stopgap). Export the database regularly.

## Layout
```
public/                 site (index.html, js/app.js, robots.txt)
netlify/functions/      admin-operations, get-content, get-posts, submit-enquiry, blog, keepalive
supabase/migrations/    SQL (run in order)
```
Notes: admin login locks an IP for 15 minutes after 5 failed attempts; sessions last 24h; all tables are default-deny (RLS) and only reachable through the functions. `/insights` pages are rendered server-side for SEO.
