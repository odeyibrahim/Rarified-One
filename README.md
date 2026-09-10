# Rarified One Solutions — Luxury Real Estate Single-File Site

A high-end, white-glove **single-file vanilla HTML/CSS/JS** website for **Rarified One Solutions**, a multi-disciplinary Lagos real estate firm. Built in the "drafting ledger" aesthetic — architectural line-drawing hero, accordion portfolio, animated timeline rail, custom cursor — with an in-page **Private Desk** (client dashboard) whose edits mutate the live homepage in real time.

## ✨ Highlights

- **Single file** — `index.html` is the entire site (132KB, no build step, no dependencies). Drop it anywhere.
- **Drafting-ledger aesthetic** — Cormorant Garamond + Jost, navy / gold / ivory palette, hairline rules, diamond markers, 11px letter-spaced kickers.
- **Signature hero** — procedurally drawn SVG architectural elevation of a luxury residence, animated stroke-by-stroke on load.
- **Motion craft** — letter-by-letter loader, hero parallax, custom cursor (dot + lerped ring, disabled on touch/reduced-motion), count-up stats, infinite ticker, animated timeline rail.
- **Accordion portfolio** — click any project to expand the brief inline (no separate page).
- **SEO-ready** — meta tags, Open Graph, Twitter cards, Schema.org `RealEstateAgent` with `makesOffer` array of 7 services + `founder` + `areaServed` + `openingHours`, `sitemap.xml`, `robots.txt`, `manifest.json`.
- **Accessible** — skip link, `:focus-visible` outlines, ARIA `aria-expanded` on every accordion, `aria-hidden` on decorative SVG, full `prefers-reduced-motion` respect, honeypot anti-spam.
- **Netlify Forms integration** — contact form posts to Netlify Forms the moment it's deployed (silent locally).
- **The Private Desk** (in-page dashboard at `#dashboard`):
  - Secure login (demo credentials provided)
  - Service request tracker — list, expand, filter, mark handled, reply, delete (with confirm)
  - Direct messaging system with reply
  - **Live Content editor** — edits to the announcement banner, hero title/subtitle, contact details, and project visibility publish to the live homepage in real time (no deploy required, persisted to localStorage)
  - Profile management
  - Settings — security & notification preferences
  - Toast notifications & modal system
  - Ledger stats — new requests, total, unread messages, projects live

## 📁 Files

```
rarified-one-v2/
├── index.html          # The entire site — 132KB, single file
├── manifest.json       # PWA manifest
├── robots.txt          # SEO
├── sitemap.xml         # SEO
├── netlify.toml       # Netlify config (security headers, caching)
└── README.md          # This file
```

## 🚀 Deploy to Netlify

### Option A — Drag & Drop (fastest)
1. Zip this entire folder.
2. Go to <https://app.netlify.com/drop>
3. Drag the zip file there. Done.

### Option B — Git + Netlify (recommended for production)
1. Create a new GitHub repository (e.g. `rarified-one-solutions`).
2. Push the contents of this folder to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Rarified One Solutions website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rarified-one-solutions.git
   git push -u origin main
   ```
3. Go to <https://app.netlify.com> → "Add new site" → "Import from Git"
4. Pick your repository. Netlify auto-detects `netlify.toml`. Click **Deploy**.
5. Optional: set a custom domain (e.g. `rarifiedone.com`) in Site Settings.

### Build settings (if configuring manually)
- **Build command:** *(leave empty)*
- **Publish directory:** `.` (root)
- **No environment variables required.**

## 🔐 Private Desk Access (Demo)

Open the site and click **Private Desk** in the nav, or navigate to `#dashboard`:

- **Username:** `admin`
- **Password:** `raro2026`

> All dashboard data is stored in the browser via `localStorage`. To reset, clear site data in your browser settings. For production, replace the localStorage layer with API calls to your backend (e.g. Netlify Identity, Netlify Functions, Supabase).

### The killer feature — Live Content editor
Open the Private Desk → **Live Content**. Edit the announcement banner, hero title, hero subtitle, contact details, or hide/show any of the 7 projects. Click **Publish Changes**. The live homepage updates instantly — no deploy, no refresh required. Changes persist in localStorage across sessions on the same browser.

## 🎨 Brand Guidelines

| Token            | Value      | Usage                              |
|------------------|------------|------------------------------------|
| `--navy-950`     | `#060D19`  | Loader, deepest backgrounds        |
| `--navy-900`     | `#0A1730`  | Body background, dark sections     |
| `--navy-800`     | `#12233F`  | Login card, dashboard rail         |
| `--gold-500`     | `#C6A55C`  | Primary accent, buttons, hairlines |
| `--gold-300`     | `#E4CF9C`  | Light gold (on dark backgrounds)   |
| `--gold-700/800` | `#9A7B42` / `#7E6230` | Kickers, hover states  |
| `--ivory`        | `#F5F2EA`  | Light section backgrounds          |
| `--paper`        | `#FBF9F3`  | Form fields, dashboard panels      |
| Headings font    | Cormorant Garamond (serif) |
| Body font        | Jost (sans-serif)           |

## 🛠 Customisation Pointers

- **Replace Unsplash/Picsum imagery** — project images use `https://picsum.photos/seed/...` placeholders. Swap with your own branded photography by editing the `<img src>` attributes in the portfolio section (lines ~880–950 of `index.html`).
- **Update contact details** — either edit the HTML directly in the contact section, or use the **Live Content** editor in the Private Desk (edits persist in localStorage).
- **Replace demo dashboard data** — clear localStorage (`ros_requests_v2`, `ros_messages_v2`, `ros_content_v2`) and the seed data will re-initialise on next load.
- **Add a real backend** for the dashboard — replace the `store.get` / `store.set` helpers in the JS with fetch calls to your API.
- **Connect a real form backend** — the contact form already integrates with Netlify Forms out of the box. For non-Netlify hosting, point the form `action` to Formspree or your own endpoint.

## 📋 Browser Support

Tested in latest Chrome, Safari, Firefox, and Edge. Mobile responsive from 320px up. Custom cursor and parallax auto-disable on touch devices and when `prefers-reduced-motion` is set.

## 📄 License

© 2026 Rarified One Solutions. All rights reserved. This codebase is proprietary and intended for the exclusive use of Rarified One Solutions.
