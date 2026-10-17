# SHOMAAA — فروشگاه آنلاین پوشاک رسمی (shomaaa.ir)

Persian RTL, headless **WooCommerce** storefront for men's and women's formalwear, built with Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS 4.
Commissioned project; design and development by [Tafakor Pardazan](https://tafakorpardazan.ir).

> **Status: demo storefront.** The 30 products, prices and stock are illustrative samples and the product images are AI-generated illustrations (not photographs of real stock). No payment gateway is connected — see *Payments*.

## Architecture
```
Browser ─▶ Next.js (server components, route handlers)  ──server-side only──▶ WooCommerce Store API (WordPress + MySQL)
```
- **Storefront**: `src/` — App Router, server components for catalog pages, small client islands (cart, filters, product options, dialogs). Zustand only for cart/toast state.
- **Backend**: `wp/` — WordPress + WooCommerce image with a small mu-plugin (`wp/mu-plugins/shomaaa-headless.php`: health endpoint, SEO/spec fields in the Store API, hardening). Only the public **Store API** is used; no WooCommerce consumer key/secret exists anywhere. The Cart-Token lives in an httpOnly cookie managed by Next route handlers (`/api/cart/*`, `/api/checkout`).
- **Catalog**: `catalog/` is the single source of truth for the 30 products; `wp/seed/*.php` seeds WooCommerce idempotently (matched by SKU).
- **Images**: `scripts/generate-images.mjs` (OpenRouter, resumable, cost-capped). Model used: `google/gemini-nano-banana-2.1`.
- **Design system**: tokens in `src/app/globals.css`, components in `src/components/ui`. Inspired by Adobe Spectrum's discipline (4px grid, tiered type scale, explicit state tokens, 2px offset focus ring, accessible dialogs/forms). *Spectrum's CSS/components are not installed;* Radix UI primitives provide accessible dialogs, accordion and slider.
- **Fonts**: Vazir v16.1.0 (provided locally, bundled in `src/fonts`, loaded via `next/font/local`) + Cormorant Garamond (Latin wordmark only).

## Develop
```bash
cp .env.example .env.local            # then edit
wp/fetch-deps.sh                      # downloads WooCommerce, WP-CLI and fa_IR packs into wp/vendor (gitignored)
wp/prepare-seed.sh                    # copies catalog + images into wp/seed
docker compose up -d --build          # WordPress+MySQL on http://localhost:8089
docker compose exec -T wordpress /opt/shomaaa/bootstrap.sh   # install, configure, seed 30 products (idempotent)
npm install && npm run dev            # http://localhost:3000
```
Scripts: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e`.

## Quality gates (last run, 2026-10-17)
- `tsc --noEmit`, `eslint .` (0 errors), `next build` — pass.
- Playwright: 57 tests (desktop + 375px mobile projects) against the production build and the local WooCommerce backend — all pass. Covers navigation, search, filters/sort, variations (size, colour, validation), cart add/update/remove/persist/coupon, checkout validation and **real order creation**, 404s, empty/error states, API-failure handling, image loading, SEO (canonical, JSON-LD, sitemap, robots), RTL/Vazir, responsive overflow at 320–1920px, health endpoint, seed idempotency (30 products).
- Lighthouse (mobile, simulated throttling, production build, warm image cache): home 88–91, collection 88–92, product 91–93 performance; accessibility 96–97; best-practices 100; SEO 100. CLS 0. Scores vary ±3 between runs.

## Payments (important)
No Iranian payment gateway is installed or verified: that needs the merchant's credentials (e.g. ZarinPal merchant ID) and a maintained WooCommerce gateway plugin. Until then the checkout uses a clearly labelled **demo gateway** (WooCommerce `cod`, title «پرداخت آزمایشی (بدون برداشت وجه)») which creates a *real* WooCommerce order without charging anyone. To go live: install and configure a gateway plugin in WP admin, disable the demo gateway, set `SHOMAAA_DEMO_MODE=0` / `NEXT_PUBLIC_DEMO_MODE=0`, replace the sample products. Customer login/order history is not implemented (guest checkout only); the Store API cannot authenticate customers without an extra plugin.

## Deployment
Manual, no CI/CD: see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (k3s namespace `shomaaa`, Traefik + Let's Encrypt, node-local images). Findings about the existing infrastructure: [docs/INFRASTRUCTURE-FINDINGS.md](docs/INFRASTRUCTURE-FINDINGS.md).

## Support & attribution
Support: 09040153212 · info@tafakorpardazan.ir — طراحی و توسعه توسط [تفکر پردازان](https://tafakorpardazan.ir)

Third-party licenses: Vazir font (`src/fonts/LICENSE-Vazir.txt`), Cormorant Garamond (OFL, `src/fonts/LICENSE-CormorantGaramond.txt`).
