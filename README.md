# Lowtide

A small, fast Black Friday 2026 deal finder. Every deal shows its store, sale price, regular price, discount, a link to the product at the store, when its price was checked and where the price was read (the store's own page or a dated deals roundup that names the store). Each deal also gets a plain verdict: Record low, Strong, Fair or Routine.

- Search by product, brand or store; filter by category, store, minimum discount and verdict; sort by best deal, % off, dollars saved, lowest price or latest check.
- Filters live in the URL hash, so a filtered view can be shared.
- Plain static files, no build step and no network loads: `app/index.html`, `style.css`, `main.js` (state and routing), `filters.js` (search, filters, sorting), `verdict.js` (is it really a deal), `render.js` (cards and detail page), `deals.js` (the checked deals).

Prices were checked on 27 November 2026 between 12:58 and 13:08 UTC and can change at any time.

Run locally: `node serve.ts`, then open http://localhost:8080. Hand-in: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

Built for the make.fun bounty "Build the best real Black Friday deal finder". MIT licensed.
