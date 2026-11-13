# The Bag Edit

`/bag-edit` is a standalone, read-only Dearelle lookbook for WhatsApp customers. It contains every existing bag, an immersive photograph viewer, enquiries and direct sharing. It adds no cart, checkout, payment, quantity, account, delivery form, inventory mutation, marketing banner or homepage video.

## Implementation

`app/bag-edit/page.tsx` supplies route metadata and data; `app/bag-edit/bag-edit.css` owns scoped presentation. `components/bag-edit.tsx` implements the collection, native dialog viewer and sharing. `components/site-shell.tsx` isolates the lookbook from shopping state; the root layout uses this wrapper and retains the storefront provider elsewhere.

`lib/bag-edit.ts` projects existing products without duplicating catalogue records and calls `productPrice` per colour. All 10 styles and 11 colourways appear once. Burgundy Tote (`b2`) is ₹799; other bags are ₹399. Four colourways have one distinct photograph: Oxblood Top-Handle, Burgundy Tote, Marbled Flap Taupe / Ivory and Ivory Monogram. Seven have two: Berry, Ivory, Olive, Chocolate / Ivory Marbled Flap, Purple, Pattern and Navy. Repeated detail-crop image paths are omitted before counts are calculated. Crops never become extra angles.

The compact introduction uses the original gold logo and existing ivory bag model photograph. A two-column collection has occasional full-width Olive and Pattern model photographs. Each viewer uses photographs belonging to the exact selected bag and colour; one-photo galleries show `1 / 1` without navigation arrows.

## Interaction

`lib/bag-edit-links.ts` builds `/bag-edit?bag=<id>&colour=<variant-id>`. Valid links open the exact selection; absent colour selects the first variant. Invalid bag/colour combinations show an unavailable-link message rather than different merchandise.

The native dialog supports touch swipe, arrows, keyboard arrows, a live count, a 200% enlarged view, close/Escape and focus restoration. Colour changes reset to photograph one; zoom return preserves the current slide. Browser Back closes a viewer entered from the collection. Labelled controls have 44px targets and the enquiry action is at least 48px high. Safe areas, visible keyboard focus and reduced motion are respected. Only a 160ms opacity reveal and explicit-arrow smooth scroll add motion; reduced motion removes them. There is no automatic rotation or motion library.

The enquiry uses configured WhatsApp number `918086191325` and includes name, stable bag ID/SKU, colour and current price. Without a configured number it becomes Copy bag details. Copy link preserves the current origin and selected colour; native sharing falls back to copying. Image failure text tells visitors to refresh to retry; refresh recovery was verified.

## Preservation and provenance

The route preserves `DESIGN.md`'s ivory `#FCF9F6`, espresso `#302725`, muted `#76665F`, original gold logo and local Editorial/Cormorant Garamond and Everyday/DM Sans fonts. Route-specific stone, burgundy, hover colour and compact caption typography are documented in `.impeccable/surfaces/app-bag-edit.md`. Neither `DESIGN.md` nor `.impeccable/design.json` is rewritten for this extension.

All photographs reuse existing `public/images` assets unchanged. Preserve `ASSETS.md`, `media/bags/MODEL-MAP.md`, `media/bags/PROMPTS.json`, `media/bags/sources/` and `media/bags/november-campaign/`. Existing studio/model imagery includes AI-generated photographs derived from owner references; reuse does not verify materials, dimensions, designer authenticity or inventory specifications. This extension creates no new shipping raster.

Preexisting documentation drift is preserved: older `PRODUCT.md` and `DESIGN.md` passages say every bag is ₹399, while later design guidance and current catalogue price Burgundy Tote at ₹799. Historical product constraints describe older checkout foundations alongside later hosted test-backend milestones. The lookbook follows current catalogue data and changes no backend or launch policy. `PRODUCT.md` retains its older prose structure; no schema upgrade is included.

## Validation and review

The implementation handoff reports 35 passing unit tests, passing lint and a passing production build. `tests/bag-edit.test.ts` verifies complete catalogue/colour coverage, authoritative prices, SKU/image ownership, available files, unique photograph paths, deep links, enquiry content and single-photo/invalid-link behavior.

Local production-browser evidence at `http://127.0.0.1:3195` covers 360, 375, 390, 414 and 1280px: all 10 bags/deep links, arrows, keyboard, zoom, colour reset, copying, no horizontal overflow, no recorded runtime errors and zero commerce requests. True touch swipe was tested at 375px. Additional checks cover colour mapping, refresh recovery, zoom return, reduced motion, share fallback, browser Back and invalid links. The handoff also records preserved storefront bag/cart behavior and homepage hero.

Evidence: `.impeccable/review/bag-edit/functional-results.json`, `correction-checks.json`, `collection-{360,375,390,414,1280}.png`, `viewer-{360,375,390,414,1280}.png`, `colour-{375,390}.png`, `chocolate-{375,390}.png` and `image-error-375.png`. The first review's error-copy and unsettled-390px-capture findings were corrected; a fresh reviewer marked both resolved with disposition “ship to protected preview for owner approval.” This is not owner approval.

Local initial JavaScript transfers measured about 149KB; this is localhost chunk-transfer evidence, not a compressed deployment budget or a physical Android benchmark. At 812px viewport height the mobile introduction ends around 397–402px, approximately 49%. Responsive image sizes, eager initial imagery and lazy below-fold loading are implemented. Real WhatsApp in-app-browser/device acceptance remains part of owner review.

## Protected preview

Preview: https://dearellewebsite-a9hjp1csu-faziils-projects.vercel.app/bag-edit — Vercel account sign-in required. Branch `codex/bag-edit-lookbook`, implementation commit `e2bc593`, deployment `dpl_FLF2miZ5sRHpQKP34NmUFjt93rdJ` is READY.

Coordinating-agent verification: anonymous `/bag-edit` receives HTTP 302 to Vercel authentication; authenticated Vercel fetch receives HTTP 200 with 10 bag entries, lookbook markup and no commerce header/video. Project protection is `all_except_custom_domains`. Route metadata is `noindex`; this is discovery guidance, not access control. The eventual approved public lookbook requires no customer authentication; preview protection is the approval boundary.

Production `https://www.dearelle.in/bag-edit` still returns HTTP 404 without lookbook markup. No main-branch push or public publication occurred. Owner approval of the protected preview is required before publishing; this work adds or enables no checkout.

