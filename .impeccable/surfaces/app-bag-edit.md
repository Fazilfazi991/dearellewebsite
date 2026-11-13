---
version: 1
slug: "app-bag-edit"
primary_target: "app/bag-edit"
related_targets: ["components/bag-edit.tsx","lib/bag-edit.ts"]
---

# The Bag Edit

Scope: /bag-edit, an Experience surface for women arriving from an existing WhatsApp conversation. Read-only catalogue; no commerce controls, authentication or tracking banner. Existing storefront and backend remain unchanged. Preview only until owner approval.

## Direction contract

THESIS: A compact accessories magazine, led by actual bag photography and a varied two-column collection. Product information stays to names and catalogue-derived INR prices.

OWN-WORLD: Inherit Dearelle's warm ivory, espresso, local Editorial/Everyday fonts and original gold logo. Burgundy accents belong to the viewer enquiry action. Straight photographic edges, fine rules and generous editorial spacing; no cards, shadows or decorative masks.

STORY: See the collection immediately, tap a bag, explore its exact colour's photographs, then ask in WhatsApp or share that bag's stable link. Single-source photos stay single; zoom never pretends to be a new angle.

FIRST VIEWPORT: A quiet centred logo, a full-width ivory-bag model photograph around 25svh, THE BAG EDIT in large serif type with the supplied supporting line, then the first pair of bags visible within the initial mobile viewport. Occasional full-width model images punctuate pairs of studio views. Full-screen viewer uses a contained photo, discrete controls and fixed product information below.

FORM: User-pinned editorial lookbook, code-led; no concept roll needed for the specified arrangement. Signature interaction: native horizontal scroll-snap photo viewer with precise count, keyboard arrows, optional enlarged view and stable bag/colour links.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion assessment

Viewer reveal: occasional, prevents a jarring change, opacity 0 to 1 over 160ms using the established --ease; reduced motion removes the transition. Photo navigation: native scroll-snap, smooth scrolling only for explicit arrow presses, instantaneous for reduced motion. Reject catalogue auto-scroll (visitor control), grid entrances (delay discovery), and animated prices/colour labels (reading clarity). No motion library.

## Photography provenance

All images reuse public/images catalogue assets, unchanged. Sources and prompts remain in media/bags/november-campaign and ASSETS.md. Model/studio views are chosen only from the selected variant. Repeated detail crops of an existing image are omitted rather than counted as angles.

## Route-specific tokens and advisory exceptions

This is an extension of the incumbent Dearelle world, not a global design-system replacement. Preserve DESIGN.md and .impeccable/design.json. The existing ivory #FCF9F6, espresso #302725, muted #76665F, gold logo and Editorial/Everyday fonts remain authoritative.

- Stone #EEE8E0: photograph loading/containment surface and selected-colour background.
- Burgundy #652633: enquiry action, emphasis and keyboard focus; hover #50202A. These are confined to this surface rather than new global primary tokens.
- Display: Editorial, clamp(42px, 11.5vw, 70px), line-height .98, tracking -.025em. Viewer title: 27px mobile / 42px wide desktop.
- Compact 9–11px metadata and photo-caption labels are deliberate editorial exceptions to general storefront typography. They remain secondary; prices are 12px on collection tiles and 15px in the viewer, with 44px control targets. Colour/type detector advisories do not authorize shrinking functional targets or spreading these sizes to general body copy.
- Straight photograph edges, 12px mobile / 26px desktop grid gap, 840px collection and 1120px introduction maxima; 700px collection and 900px wide-viewer breakpoints. Motion: 160ms opacity using existing --ease, omitted under reduced motion.

## Finish evidence

Completed collection: 10 styles, 11 colourways, four one-photo and seven two-photo colour galleries; Burgundy Tote ₹799, others ₹399, all derived from current catalogue data. No duplicate catalogue or shipping raster was created. Full handoff: BAG-EDIT.md.

Implementation validation reports 35 unit tests, lint and production build passing. functional-results.json and correction-checks.json in .impeccable/review/bag-edit record checks at 360, 375, 390, 414 and 1280px; touch swipe was specifically exercised at 375px. Collection/viewer screenshots exist at each width, plus 375/390 colour and Chocolate views and a 375px error state. Recorded checks include all bag deep links, keyboard/arrows, zoom return, correct colour/reset, copying/share fallback, refresh recovery, reduced motion, Back, invalid links, no overflow and zero commerce requests. Storefront/cart/homepage preservation is recorded in the implementation handoff.

The review's error-copy and unsettled-390px-capture findings were corrected and both marked resolved by a fresh reviewer. Final disposition: ship to protected preview for owner approval. Local initial script transfers are about 149KB; mobile introduction is approximately 49% of an 812px viewport. These are local measurements, not deployed compression or physical-device claims.

Protected preview deployment dpl_FLF2miZ5sRHpQKP34NmUFjt93rdJ for e2bc593 is READY. Anonymous access redirects to Vercel authentication (302); authenticated fetch returns 200 with ten bag entries and no commerce header/video. Project protection is all_except_custom_domains. Preview: https://dearellewebsite-a9hjp1csu-faziils-projects.vercel.app/bag-edit. Production /bag-edit remains 404. Owner approval and publication remain outstanding; no main push/public publication occurred.

Preexisting PRODUCT.md/DESIGN.md historical all-bags-₹399 and checkout-foundation statements remain unchanged. Current source pricing governs this route. No global document refresh or PRODUCT schema upgrade belongs to this scoped finish.


## V2 direction — supersedes the V1 viewer treatment

The established photo-first collection remains. Centre the real logo, use the supplied friendly introduction, 4:5 product photographs with small corner radii, readable 12–13px captions, and two full-width model features. Add blush only to the enquiry area; dusty rose carries the CTA. Preserve every product, price and asset.

The primary interaction is a nearly full-height mobile sheet with an ivory header, contained photograph, compact product/colour block and a separate pinned enquiry footer. Desktop uses a spacious centred overlay, with the catalogue visible underneath. Exact scroll restoration, focus return, native Back (including an initial WhatsApp deep link) and URL/colour synchronization are core requirements.

Motion assessment before implementation: sheet entry is occasional and explains spatial continuity (opacity + translateY 12px, 240ms established --ease). Explicit photograph arrows move over300ms with a fast ease-out; touch swipe uses native scrolling. Tile press feedback is120ms/scale.99 and hover only changes image treatment on fine pointers. Reject catalogue auto-rotation, staggered entrances and animated product text. Reduced motion removes entry/press transitions and makes arrow navigation immediate. No animation library or HyperFrames runtime belongs in this interaction.

Enquiry uses the configured official number and includes the selected name, colour, current catalogue price, SKU and absolute lookbook link. Single-photo variants show no carousel arrows or count. Distinct colourways reset the gallery; shared legacy bag IDs remain supported alongside descriptive slugs. No separate product navigation or commerce requests.

## V2 finish record — current implementation supersedes V1 evidence

Completed at commit `910a2d8ee36142603582537f4959a1accf067dca` on `codex/bag-edit-lookbook`; pushed for protected preview only. Current V2 preview: https://dearellewebsite-j2lzkt9bp-faziils-projects.vercel.app/bag-edit — deployment `dpl_4rvvn6FLKx5rJfzqZm8f2u52ee34` is READY. The coordinating agent verified anonymous HTTP 302 to Vercel authentication and authenticated HTTP 200 with the supplied new introduction, ten bags, descriptive slug links, no product href/video and noindex metadata. Production www.dearelle.in/bag-edit still returns 404 without lookbook markup. The V1 preview URL/READY record above is historical. No main push/public publication or owner approval is recorded here.

Actual scoped tokens in `app/bag-edit/bag-edit.css`: ivory `#FCF9F6`, stone `#EEE8E0`, espresso `#302725`, muted `#76665F`, dusty rose `#8E5A64` (matches global emphasis), local blush `#F8EEEE`, and CTA hover `#754651`. Existing global blush `#F3DFE2` remains the selection highlight. These extend the existing world locally; `DESIGN.md`, `.impeccable/design.json` and `PRODUCT.md` remain unchanged. The V1 burgundy CTA and straight-photo rules above are superseded for this surface.

Current collection: 4:5 photos with 8px corners; featured photos use 10px corners and ratios 1.1 mobile / 1.7 desktop. Grid gaps are 13px columns / 28px rows, becoming 26px / 36px at 700px. Collection/intro maxima remain 840px / 1120px. Product captions are 12px names / 13px prices, becoming 13px / 14px; 9–11px labels remain secondary metadata. Viewer product title is 27px mobile / 38px desktop and price is 16px / 18px. Local Editorial/Everyday font aliases and the real gold logo are preserved. Mobile sheet top corners are 18px; desktop overlay corners are 14px at 900px minimum width and 550px minimum height. CTA is 48px minimum with 7px corners; controls remain 44px minimum. These radii/type roles are user-brief exceptions, not new general storefront rules.

Motion implemented after the recorded assessment: 240ms opacity/12px sheet reveal, 120ms/.99 tile press, 140ms CTA colour transition and cancellable 300ms explicit-arrow movement using requestAnimationFrame; native swipe remains native. Reduced motion removes entry/press transitions and makes arrows immediate. No animation library. Stable gallery state and layout reset on colour changes prevent retained photographs. Single-photo variants have no arrows or counter.

Finish validation reports 37 unit tests, lint and production build passing. `.impeccable/review/bag-edit-v2/functional-results.json` covers 360×740, 375×812, 390×844, 414×896 and 1280×900: all ten styles, slug/legacy links, initial deep-link Back, close, scroll/focus restoration, Tab containment, arrows, colour reset, zoom, copying, WhatsApp message and visible CTA. Real CDP touch swipe passed at 375px. Recorded errors/commerce requests are zero; no API, commerce or separate product-navigation requests were observed in the exercised flow. `additional-checks.json` covers reduced motion, single-photo ₹799 selection, actual WhatsApp anchor popup URL/message interception (no send), Clipboard API absence, share fallback, Back/Forward, removal of closed viewer DOM, invalid colour, and preserved storefront cart/homepage hero.

Collection/viewer captures exist at all five widths, plus model captures at 375/390 and a single-photo capture at 375. A fresh finish reviewer opened the 12 required collection/viewer/model captures and read the code: no material findings; disposition “ship to protected preview”. This is not owner approval. The detector records 31 advisory off-ramps for metadata fonts/radii and local blush/hover shades; no global token repair was made. Browser checks are Chrome emulation, not physical WhatsApp-device acceptance.

The final surface remains 10 styles / 11 colourways, four genuine one-photo and seven two-photo galleries; source prices are Burgundy Tote ₹799 and others ₹399. Configured official WhatsApp destination is 918086191325; the enquiry includes full actual name, colour, catalogue price, SKU and absolute selected link, with Copy enquiry when configuration is absent. No photos, assets, provenance, backend, auth, stock, orders or homepage hero were changed. No checkout is added/enabled by this work; existing production checkout behavior is outside scope. Historical global pricing/checkout prose drift remains noted, unrepaired. Current handoff: `BAG-EDIT.md`.
