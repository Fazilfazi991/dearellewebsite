# The Bag Edit — V2

`/bag-edit` is Dearelle's standalone, read-only lookbook for customers arriving from WhatsApp. Tapping a bag opens an immersive viewer over the collection, with enquiry and direct sharing on the same route. This work adds or enables no checkout, order, stock mutation, authentication or separate product navigation. The existing storefront, backend and homepage hero are preserved.

## Current presentation

The centred original gold logo leads a compact editorial photograph and the supplied introduction: “THE BAG EDIT”, “A little collection of lovely things.” and “Curated by Dearelle”. The two-column mobile collection uses 4:5 product photographs, small rounded corners, readable names and prices, and two full-width model features. Warm ivory and espresso continue the existing world; dusty rose and a restrained blush enquiry area supply the requested boutique treatment.

The native dialog is a nearly full-height mobile sheet with a contained photograph, product/colour information and a separate pinned enquiry footer. At wide desktop sizes it becomes a centred overlay with the collection visible underneath. Safe-area padding keeps the enquiry action reachable. The footer reads “Found your favourite? ♡” and “Ask about this bag ♡”.

The scoped values and their relationship to the existing design system are recorded in `.impeccable/surfaces/app-bag-edit.md`. `DESIGN.md`, `.impeccable/design.json` and `PRODUCT.md` are preserved; this extension does not redefine the global world.

## Catalogue and photographs

`lib/bag-edit.ts` projects the existing bag catalogue and calls `productPrice` for each colour. There are 10 styles and 11 colourways. Burgundy Tote is ₹799; the others are ₹399. Prices remain catalogue-derived rather than a second maintained price list.

Four colourways have one genuine photograph: Oxblood Top-Handle, Burgundy Tote, Marbled Flap Taupe / Ivory and Ivory Monogram. Seven have two: Berry, Ivory, Olive, Chocolate / Ivory Marbled Flap, Purple, Pattern and Navy. Repeated image paths are deduplicated before gallery counts are calculated. Single-photo variants show neither arrows nor a counter; zoom and duplicate crops never become additional angles.

Every photo belongs to the selected bag and colour. All existing `public/images` assets remain unchanged. Preserve `ASSETS.md`, `media/bags/MODEL-MAP.md`, `media/bags/PROMPTS.json`, `media/bags/sources/` and `media/bags/november-campaign/`. Existing studio/model imagery includes AI-generated photographs derived from owner references; its reuse does not verify material, dimensions, designer authenticity or inventory. V2 creates no new shipping raster or provenance record.

## Interaction and implementation

- `app/bag-edit/page.tsx` supplies route data and metadata; `app/bag-edit/bag-edit.css` scopes presentation. `components/bag-edit.tsx` supplies the collection, native dialog, gallery and enquiry. `components/site-shell.tsx` retains route isolation from shopping state.
- `components/use-bag-lookbook.ts` synchronizes selection with native browser history while preserving Next's history state. New links use descriptive catalogue slugs and selected colour IDs; legacy bag-ID links remain valid. An initial valid WhatsApp deep link receives a collection history entry underneath it, so Back closes the overlay. Close uses the same history path; colour changes replace the current selection. Invalid selections display an unavailable-link message.
- The native horizontal scroll-snap gallery supports touch swipe, arrows, keyboard arrows and optional 200% zoom. Explicit arrows use a cancellable 300ms `requestAnimationFrame` movement; a user gesture cancels it. Reduced motion makes arrow movement immediate. The first photo loads eagerly and neighbouring photos are prepared as browsing advances. Stable gallery state plus a layout reset on colour change prevents the previous colour's photograph from lingering.
- The mobile sheet reveals over 240ms with opacity and 12px vertical movement. Tile press feedback lasts 120ms at scale .99. Reduced motion removes these transforms/transitions. There is no auto-rotation or motion library.
- Fixed-body scroll locking restores the exact prior position and inline styles. Native dialog containment, an explicit Tab trap, Escape, labelled controls and focus return support keyboard use. Controls retain 44px targets; the enquiry action is at least 48px high.

`lib/bag-edit-links.ts` builds selected links and enquiry text. The WhatsApp action reads official business number `918086191325` from existing configuration and includes the actual full bag name, selected colour, catalogue price, SKU and absolute selected lookbook link. Missing configuration produces a working “Copy enquiry” fallback. Copy link uses the current origin and selected colour; native sharing falls back to copying, including a fallback when the Clipboard API is unavailable. Clicking enquiry creates no checkout or order.

## Verification and review

Implementation validation reports 37 unit tests, lint and production build passing. `tests/bag-edit.test.ts` covers catalogue/colour coverage, source pricing, SKU and image ownership, available files, unique photo paths, descriptive and legacy links, enquiry content and single-photo/invalid-link behavior.

Evidence lives in `.impeccable/review/bag-edit-v2/`:

- `functional-results.json`: Chrome browser checks at 360×740, 375×812, 390×844, 414×896 and 1280×900. Coverage includes all ten bags, initial deep-link Back, close, exact scroll/focus return, Tab containment, arrows, colour reset, zoom, clipboard, correct WhatsApp message and visible CTA. Recorded errors and commerce requests are zero; no API, commerce or separate product-navigation requests were observed in the exercised flow. Real CDP touch swipe was exercised at 375px.
- `additional-checks.json`: reduced motion, single-photo controls and ₹799 pricing, actual WhatsApp anchor popup URL/message interception, copy without Clipboard API, share fallback, Back/Forward, no retained viewer DOM after close, invalid colour and preserved storefront cart/homepage hero. No WhatsApp message was sent.
- `collection-{360,375,390,414,1280}.png` and `viewer-{360,375,390,414,1280}.png`: collection/viewer captures at all five widths. `model-{375,390}.png` and `single-375.png` cover featured photography and a single-photo selection.

A fresh finish reviewer opened the 12 required collection/viewer/model captures and read the implementation. Disposition: **ship to protected preview**, with no material findings. This is a reviewer verdict, not owner approval. The detector's 31 advisories concern off-ramp metadata for fonts/radii and local blush/hover shades; these are intentional brief-specific exceptions documented in the surface record, not authorization to change global tokens.

The checks use desktop Chrome with mobile emulation, including touch input. They do not establish physical Android/iPhone or WhatsApp in-app-browser acceptance. No deployed compression or physical-device performance claim is made.

## Handoff and publication boundary

V2 protected preview: [Open The Bag Edit](https://dearellewebsite-j2lzkt9bp-faziils-projects.vercel.app/bag-edit). Deployment `dpl_4rvvn6FLKx5rJfzqZm8f2u52ee34` is READY for commit `910a2d8ee36142603582537f4959a1accf067dca` on `codex/bag-edit-lookbook`. The coordinating agent verified anonymous HTTP 302 to Vercel authentication and authenticated HTTP 200 with the new introduction, ten bags, descriptive slug links, no separate product href/video and noindex metadata. This is the current V2 preview; the V1 preview is historical. Production `https://www.dearelle.in/bag-edit` still returns 404 without lookbook markup.

No main-branch push or public production publication is included. Owner approval of the current protected V2 preview remains outstanding before publication. Existing production checkout behavior, including COD, is outside this change; this work adds or enables none.

Historical drift remains deliberately untouched: older `PRODUCT.md`/`DESIGN.md` passages describe all bags at ₹399 alongside later catalogue/design guidance for the ₹799 Burgundy Tote, and older checkout foundations alongside later hosted test-backend milestones. Current catalogue pricing governs this route. No global documentation repair, schema upgrade or backend policy change is included.
