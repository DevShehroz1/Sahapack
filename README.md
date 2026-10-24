# Saha Pack website

Static site (HTML, CSS, vanilla JS). No build step.

- `index.html`: Home
- `products.html`: Products (category filter + search)
- `assets/css/styles.css`: styles and micro-animations
- `assets/js/main.js`: scroll reveals, header, mobile menu, filters, form states
- `vercel.json`: clean URLs (`/products`) and asset caching

Deploy: import this repo in Vercel (Framework preset: Other, no build command), or run `npx vercel` in this folder.
Run locally: `python3 -m http.server` and open http://localhost:8000.

To do: add the real logo, replace bracketed placeholders ([City], [sales@yourbrand.com] ...), and set `CONTACT_EMAIL` in `assets/js/main.js`.
