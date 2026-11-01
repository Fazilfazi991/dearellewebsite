# Dearelle V2

## Current production — 1 November 2026

The live storefront is https://www.dearelle.in; owner access is `/admin/orders`. This current status supersedes the historical prototype milestones below. Orders use durable Supabase storage, server-checked prices and stock, manual customer confirmation, a ₹50 advance included in the total, and COD for the remainder. No online gateway is connected.

The Burgundy Tote (B2-BURGUNDY) is ₹799; other bags remain ₹399. The homepage moodboard containing unrelated fashion imagery has been removed. Orders now open automatically in an owner workspace with priority filters, search, customer details, product photos, explicit next actions, payment records, tracking, history and searchable inventory. The list covers the most recent 100 orders.

Meta Pixel `2358200315014695` runs only on dearelle.in public storefront routes after optional marketing consent. Events: PageView, ViewContent (selected SKU), AddToWishlist, AddToCart (added quantity), Search (selected result SKU, no raw query), Contact (WhatsApp click), InitiateCheckout, and Purchase. Purchase means an accepted **live COD submission**, not a paid order; value is the full server-reviewed INR total, with the advance included. Test orders do not emit Purchase; submission event IDs are deduplicated in session storage. Browser/ad blockers and declined consent can prevent measurement. No server Conversions API is connected. Admin/private receipt/API routes are excluded, automatic configuration is disabled, and no customer form fields are passed as event data. Footer Cookie preferences changes the choice. Private receipts use full navigation to unload the storefront pixel.

Hero delivery is optimized without changing the approved film or layout: immediate responsive poster, hydration-independent startup, decoded-frame reveal, versioned cached media and deferred offscreen homepage imagery. Measurements, exact asset sizes and remaining device-testing limits are in `media/hero/PERFORMANCE.md`; raw request waterfalls are in `media/hero/performance-results.json`.

Homepage collections follow the approved Option 2 direction. Watches and Bags use alternating photographic banners with large smooth SVG curves, a flowing ivory seam and small circular arrow affordances. Each whole banner links to `/watches` or `/bags`. New Arrivals and the wristwatch editorial remain below them; the approved hero is preserved. Product imagery and prices are explicitly demo-only.

The homepage now features the cinematic hero film and the owner's supplied gold logo. Both visible hero labels were removed at the owner's request; Explore Collection sits beneath the footage. Three real Veo source clips were produced for 50 existing credits total, with no purchases. Final files: `public/videos/dearelle-hero-mobile.mp4`, `dearelle-hero-desktop.mp4`, and matching WebP posters. High-quality masters, source clips, reproducible FFmpeg editing script and production notes are in `media/hero/`. Film controls support pause/resume, reduced motion, data saving and offscreen/hidden-tab pausing.

Independent Next.js App Router / TypeScript / Tailwind CSS / Lucide storefront prototype. No connection to the existing Dearelle repository, production domain, database, customers, orders or payments.

## Run

Node.js 20.9+ and pnpm:

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:3000. To verify: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. Production preview: `pnpm start`.

## Included

- Server-rendered home, watches, bags, new arrivals, six product detail pages and informational routes.
- Client-side colour filtering, price/name sorting, searchable catalogue, saved wishlist, modal bag with native focus trapping/Escape, quantity editing and persisted variant-specific totals.
- Swipe/keyboard-scrollable representative gallery, mobile sticky purchasing controls and non-transactional guest checkout.
- Responsive optimized local imagery, fallbacks, loading/error/404 states, reduced-motion support, metadata, canonical paths and social image. The entire preview is noindex.

## Demo boundaries

Every product is marked `demo: true`. Prices, colours, names and photographs are illustrative. Gallery detail views reuse a cropped representative image. No inventory claims, reviews, discounts, live checkout or order-success screen. Checkout fields are not submitted or saved. Local bag/wishlist state is kept in the browser only. `CATALOGUE_MODE=live` deliberately fails; replacing demo data requires a code integration and launch review. There are no environment credentials.

## Before launch

Provide final products, rights-cleared product/campaign images, variant-specific images, specifications, prices and inventory. Complete verified contact/social configuration in `lib/config.ts`; publish approved shipping, returns, privacy and terms. Add a database/admin adapter, inventory and pricing checks on the server, payment/order processing, transactional messaging, security review and accessible checkout validation. Configure the approved canonical host, remove noindex only after review, and integrate the verified structured-data adapter. Measure LCP/CLS on the production preview under representative mobile throttling; no lab-performance certification is claimed.

Deploy only to a new, separate Vercel project named dearelle-v2, without adding the production domain. The updated V2 source is pushed to the user-authorized GitHub repository; the preview runs locally and the production domain is untouched.

See DESIGN.md, ASSETS.md and VERIFICATION.md. Screenshots are in `.impeccable/review/`.

## AI-only watches

The watch catalogue contains four editorial model families and nine colourways, with AI-generated stills only. Selected colours update the product gallery and bag thumbnail. Original stock photos remain reference-only. Prices and checkout are still demo. Asset provenance and exact generation prompts: `media/watches/MODEL-MAP.md` and `media/watches/PROMPTS.json`. Hero performance results and measurement limits: `media/hero/PERFORMANCE.md`.

## Product buying flow and bag catalogue — 31 October 2026

The owner's display prices are centralized: Casio ₹599, Felix ₹799, all bags ₹399. These replace earlier illustrative pricing. Four watch families (nine colourways) and nine bags have matching variant images. Visible AI/demo labels are removed at the owner's request; provenance remains in media/watches and media/bags. Checkout still does not accept orders or payments.

Product information follows gallery → title → price → colour chips → description → purchase controls → details. The selected variant resets its gallery to the first slide. Galleries currently expose a full image and a labelled crop, rather than claiming independent rear/side photos. Listing cards use ProductImageCarousel across homepage, category grids, related pieces and search. One global scheduler handles visible-card autoplay, preloading and preference-aware pauses; no large carousel library is installed. The three homepage shopping-information points use a compact parallel icon row.

## Purchase milestone

See PURCHASE-MILESTONE.md for the complete audit, confirmed COD/₹50 deposit rules, corrected Felix groups, implementation, verification and live-launch gaps. The local test flow now records private sample requests and supports owner management; it supersedes older claims that checkout never submits or stores details. Orders require server quote/stock validation. There is no online payment connection or live public order intake. `.env.example` documents local test configuration. Secrets and `.data/` are gitignored. Vercel order recording is disabled until a durable production repository is supplied.
