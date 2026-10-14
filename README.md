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
- **Bump the `?v=` on `style.css` / `main.js` whenever you change them.** Both
  are cached for an hour plus a day of stale-while-revalidate. If the URL stays
  the same, returning visitors get new HTML with the old stylesheet, and
  anything new renders unstyled. The version is the first 8 characters of the
  file's sha256. To update it on every page:
  `CV=$(sha256sum assets/css/style.css | cut -c1-8); sed -i -E "s#style\.css\?v=[0-9a-f]+#style.css?v=$CV#" *.html events/*.html`
  (same for `main.js`).
- **Diagrams are inline SVG inside `<figure class="dg dg-name">`**, wrapped in
  `<!-- dg:name -->` markers. The markup stays inline, not in an `<img>`, so the
  labels use the site fonts and can be read and translated as text. Colours and
  type come from the `.dg` classes in `style.css`. Do not hard-code fills on
  `<text>`. Each figure has a wide SVG (`.dg-wide`) and a stacked one
  (`.dg-tall`) that swap at 720px. Change the labels in both, and give each SVG
  a `<title>`/`<desc>` with page-unique ids for screen readers.
- **Event recaps open with an `<aside class="glance">`.** It holds the program's
  facts (dates, format, who it was for) and key links. It sits pinned beside the
  article on wide screens and as a compact grid above it on narrow ones. Use only
  facts that are already in the recap text.
- Give tall portrait posters `class="figure portrait"` so they're capped at 460px
  wide instead of filling a whole screen.
- Page-head illustrations (`assets/img/art-*.svg`) and course covers are
  decorative, so they get `alt=""` and contain no text of their own.
- Every page needs: canonical, description, og:/twitter: tags, the two font
  preloads, the icon/manifest links, a `.skip-link`, and `id="main"` on the first
  content section.

## Fonts
Fraunces and Inter are **self-hosted** from `assets/fonts/v5.3.0/` (variable woff2,
latin + latin-ext subsets from Fontsource, SIL OFL — see `assets/fonts/OFL.txt`). No
request goes to Google, which is why the CSP has no font hosts.

- Fraunces uses `font-display: optional`. When the headline font swapped in late, the
  mobile hero gained a line and the page jumped (CLS 0.19). Now a slow first visit
  keeps the fallback serif for that page view, and every later page uses the cached
  font. Fast connections get Fraunces immediately via the `<link rel="preload">`s.
- The directory is versioned so the files can be cached as `immutable`. To upgrade,
  add a new `v<version>/` directory and update the `url()`s and preloads.

## Dates that expire
Put deadlines in `<time datetime="YYYY-MM-DD">` inside a `[data-deadlines]` block.
`main.js` compares them with the visitor's clock, and past dates get a "Passed" pill.
Once every date in the block has passed, the cards fold into a single line ("The last
intake closed in <month year>…"). Put the next cycle's dates into the same markup and
the cards come back. A stale cycle stops reading as upcoming without a redeploy, but
the surrounding copy still needs a human to update it. Keep that copy free of
season/year promises ("the next course", not "Fall 2026") unless the dates are set.

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
