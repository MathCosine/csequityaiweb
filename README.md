# CS Equity AI — Website

Fully static rebuild of csequityai.org. No database, no backend, no build step —
plain HTML/CSS/JS that can be hosted anywhere (GitHub Pages, Cloud Storage, Netlify, etc.).

## Structure
- `index.html` — landing page (animated neural-constellation hero, program journey, Fall 2026 coming-soon, team, FAQ)
- `about.html`, `events.html`, `support.html`, `contact.html`
- `events/*.html` — event archive detail pages (2021–2025) incl. Vibe Coding Happy Hour
- `assets/` — stylesheet, JS (canvas animation, scroll reveals, FAQ accordion), images

## Key links baked in
- Learning platform (all sign-up CTAs): https://oil2-next-827682634474.asia-east1.run.app/
- Current course materials: https://github.com/Alwin-Lin/mle-star-Bootcamp
- Vibe Coding Happy Hour curriculum: https://github.com/samlin-ai/vibe-coding-happy-hour

To preview locally: `python3 -m http.server` in this directory.
