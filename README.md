# CS Equity AI — Website

Fully static rebuild of csequityai.org. No database, no backend, no build step —
plain HTML/CSS/JS that can be hosted anywhere (GitHub Pages, Cloud Storage, Netlify, etc.).

## Structure
- `index.html` — landing page (animated neural-constellation hero, program journey, Fall 2026 coming-soon, team, FAQ)
- `about.html`, `events.html`, `support.html`, `contact.html`
- `events/*.html` — event archive detail pages (2021–2026) incl. Vibe Coding Happy Hour
- `404.html` — branded not-found page with routes back into the archive (Vercel serves it automatically)
- `sitemap.xml`, `robots.txt` — submit the sitemap in Google Search Console after deploying
- `assets/` — stylesheet, JS (canvas animation, scroll reveals, FAQ accordion), images

## Conventions worth keeping
- **Reveal animations are gated on `html.js`.** An inline script in each `<head>`
  adds the class, and a `load` failsafe removes it again if `main.js` never ran.
  Without that gate, `.reveal`/`.stagger` sit at `opacity: 0` forever and the page
  is blank to anything that doesn't execute JS. Keep new hidden-until-scrolled
  styles under `.js`.
- **Images are JPEG, sized to their display box**, with `width`/`height` (stops
  layout shift) and `loading="lazy"`. Re-export rather than dropping in a 4 MB PNG.
- Every page needs: canonical, description, og:/twitter: tags, a `.skip-link`,
  and `id="main"` on the first content section.

## TODO: real photo for Thomas Ni
`assets/img/team-thomas.jpg` is a temporary "TN" monogram placeholder in the site
palette. Drop the real portrait in at the same path to swap it in — no markup
change needed, but keep it a JPEG around 700×795 (the `.member .photo` box is
`aspect-ratio: 0.88` with `object-position: center 20%`, so a head-and-shoulders
crop lands right) and update the `width`/`height` attributes on the `<img>` in
`index.html` and `about.html` if the dimensions differ.

## Security headers
`vercel.json` sends CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Cross-Origin-Opener-Policy` and `Permissions-Policy` on every
response.

**Footgun:** the CSP allows exactly one inline script, pinned by SHA-256 hash — the
`.js`-class failsafe in each `<head>`. If you edit that snippet by so much as a
space, every page's JS silently stops running. Regenerate the hash and paste it
into the `script-src` directive:

```sh
python3 - <<'EOF'
import re, hashlib, base64, pathlib
s = re.search(r'<script>(.*?)</script>', pathlib.Path('index.html').read_text(), re.S).group(1)
print('sha256-' + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())
EOF
```

Adding a new external script, font host, or image host also means widening the
matching CSP directive. `Strict-Transport-Security` carries `includeSubDomains`
(not `preload`) — drop that token if a subdomain ever needs to serve plain HTTP.

## Structured data
Each page carries a JSON-LD `@graph`: an `NGO` + `WebSite` + `FAQPage` on the
homepage, `BreadcrumbList` everywhere below the root, an `ItemList` on the
archive, and an `EducationEvent` (free, with real dates and location) on every
event detail page. Keep the event nodes in step with the visible copy — dates,
titles and `isAccessibleForFree` are what Google reads for rich results.

## URLs
`vercel.json` sets `cleanUrls`, so pages are served extensionless (`/events`,
`/events/vibe-coding-happy-hour`). Every page carries a `<link rel="canonical">`
pointing at that form. Legacy paths from the previous site redirect (301) to their
new home; add more entries to `redirects` in `vercel.json` as stale URLs turn up in
Search Console.

## Key links baked in
- Learning platform (all sign-up CTAs): https://oil2-next-827682634474.asia-east1.run.app/
- Current course materials: https://github.com/Alwin-Lin/mle-star-Bootcamp
- Vibe Coding Happy Hour curriculum: https://github.com/samlin-ai/vibe-coding-happy-hour

To preview locally: `python3 -m http.server` in this directory.
