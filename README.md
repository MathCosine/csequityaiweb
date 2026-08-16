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
