# Dearelle V2
## Platform
Mobile-first web storefront for Indian women discovering affordable fashion accessories through social media.
## Stack
User specified Next.js App Router, TypeScript, Tailwind CSS and Lucide icons.
## Purpose
Beautiful little luxuries, made for everyday moments. Watches and handbags only. Build an independent design and storefront prototype.
## Constraints
No production repository, database, domain, deployment or payment changes. Demo products, representative stock photography and illustrative INR prices are labelled. No fake reviews, discounts, popularity or fulfilment claims. Checkout cannot submit an order or collect payment.
## Open facts
Final catalogue, photos, prices, stock, specifications, shipping, returns, contact information and social accounts require owner confirmation.

## Confirmed purchase milestone — 31 October 2026
Owner-confirmed catalogue: existing Casio analogue watches ₹599, Felix ₹799 and every bag ₹399. New digital models have explicit prices: Compact Digital (w5), Black, ₹699; World Map (w6), Black / Black and Gold / Brown, ₹799; Triple Display (w7), Black, ₹799. Black map and triple-display watches are separate products; gold/brown is a World Map colour variant. Hosted catalogue: 16 products, 22 SKUs. Three units is opening stock for each new SKU only; synchronization preserves existing stock. Correct Felix families: Signature = Rose gold/Pink + Gunmetal/White; Petite Dial (smaller) = Black/Black + Rose gold/White. Website stills remain AI-generated from owner product references; no independent authenticity claim is made.

Delivery is free across India. The chosen payment method is COD. A ₹50 advance deposit is manually verified and deducted from the product total, with the balance due by COD. Customer contact/confirmation and advance verification precede dispatch. An unpacking video is evidence guidance for delivery damage and does not exclude statutory consumer rights; return window, return shipping and refund process remain unspecified. These facts supersede older unconfirmed pricing, stock, shipping and payment statements above.

The backend milestone now records synthetic test requests in private Supabase PostgreSQL through a restricted server role. SQLite remains only as a legacy regression-test adapter. Public order intake stays OFF and no online payment is collected. Guest checkout validates contact/PIN and authoritative database prices/stock; transactional reservations, persistent idempotency, audit records, approval-gated expiry/retention and private guest access are implemented. Owner management uses server-authorized Supabase Auth with TOTP and HttpOnly sessions. Hosted Mumbai resources, the real owner identity, contact/advance instructions, final policies, backup/failover review and explicit launch approvals remain required before real orders. See BACKEND-MILESTONE.md for setup and verification; a payment gateway is not required for the COD plan.

## Current media and catalogue update — 1 November 2026
The owner requested a model-led replacement for the v3 static accessory campaign. The v4 hero uses three naturally moving shots (walk, wrist/cuff detail, walking turn), six seconds total at silent 24fps. Desktop delivery is 1280x720; mobile is 720x756 in the existing compact 1 / 1.05 frame capped at 56svh. Preserve preference-aware bootstrap loading, responsive posters, offscreen/hidden pause and explicit playback control. No visible heading overlays the film. The fictional model and campaign accessories do not establish inventory specifications. Source/edit provenance and exact prompts: media/hero/model-v4/README.md and PROMPTS.json.

The black Petite Dial Felix (w3) now uses three newly generated studio views with a deliberately close-cropped first image; its model, colour grouping and ₹799 price remain. Preserve Signature’s Rose gold / Pink and Gunmetal / White variants, and Petite Dial’s separate Black / Black and Rose gold / White variants. Sources: lib/products.ts, media/watches/DIGITAL-ADDITIONS.md and media/watches/felix-black-studio/README.md. New catalogue SKUs received three initial units; existing stock and old order snapshots were preserved. No unrelated backend, authentication or security changes belong to this media/catalogue update.

Scoped visual review evidence: .impeccable/review/model-v4/mobile.png, desktop.png, catalogue-375.png and felix-375.png. Implementation handoff reports 27 passing tests and a passing production build. Existing design tokens and the broader design system remain unchanged.

## Homepage arrivals and digital galleries
The homepage New Arrivals selection leads with colourful ladies watches and bags: w1 Signature (pink), b1 Oxblood Top-Handle, w4 Teal Dial and b9 Berry Shoulder. This is homepage-only curation; global catalogue ordering stays unchanged.

Each new Casio colourway has three gallery images. Compact Black (w5) and World Map Gold / Brown (w6) retain their three supplied views. World Map Black / Black (w6) uses two supplied views plus watch-digital-map-black-studio. Triple Display Black (w7) uses its supplied main view plus watch-digital-triple-wrist and watch-digital-triple-detail. The additions are AI-generated studio/wrist/detail imagery; exact prompts live in media/watches/digital-gallery-prompts.json. Model and colour groupings, prices, hero, interface styling and existing tokens remain unchanged.
