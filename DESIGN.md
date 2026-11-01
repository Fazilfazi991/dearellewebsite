---
name: Dearelle V2
description: Beautiful little luxuries, made for everyday moments.
colors:
  ivory: '#FCF9F6'
  blush: '#F3DFE2'
  rose: '#B97986'
  espresso: '#302725'
  white: '#FFFFFF'
  border: '#E9E2DE'
  muted: '#76665F'
  emphasis: '#8E5A64'
  focus: '#965C68'
  campaign-sand: '#E7DFD2'
  arrivals-paper: '#EEE5DC'
  editorial-brown: '#514033'
  arrivals-demo-ivory: '#FCF9F6E8'
  arrivals-wish-ivory: '#FCF9F6B8'
  arrivals-wish-mobile-ivory: '#FCF9F680'
  gallery-dot-neutral: '#BAADA5'
typography:
  display:
    fontFamily: 'Editorial, Georgia, serif'
    fontSize: 'clamp(42px, 5.4vw, 76px)'
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'Everyday, Arial, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.6
  collection-category:
    fontFamily: 'Editorial, Georgia, serif'
    fontSize: 'clamp(30px, 3.6vw, 48px)'
    fontWeight: 400
    lineHeight: 1.1
  collection-category-copy:
    fontFamily: 'Everyday, Arial, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
  arrivals-heading:
    fontFamily: 'Editorial, Georgia, serif'
    fontSize: '36px'
    fontWeight: 400
    lineHeight: 1.15
  arrivals-heading-mobile:
    fontFamily: 'Editorial, Georgia, serif'
    fontSize: '28px'
    fontWeight: 400
    lineHeight: 1.15
  arrivals-product:
    fontFamily: 'Everyday, Arial, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
  arrivals-product-mobile:
    fontFamily: 'Everyday, Arial, sans-serif'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: 1.45
  collection-editorial:
    fontFamily: 'Editorial, Georgia, serif'
    fontSize: 'clamp(34px, 4.2vw, 58px)'
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: '-0.02em'
  collection-editorial-mobile:
    fontFamily: 'Editorial, Georgia, serif'
    fontSize: '34px'
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: '-0.02em'
rounded:
  arrivals-photo: '5px'
  gallery-indicator: '8px'
spacing:
  compact: '8px'
  related: '16px'
  group: '24px'
  mobile-section: '43px'
  desktop-section: '72px'
components:
  gallery-control:
    width: '44px'
    height: '44px'
  button-primary:
    backgroundColor: '{colors.espresso}'
    textColor: '{colors.white}'
    padding: '13px 25px'
---
## Overview
The user's 70% minimal luxury / 30% feminine direction governs the world: a small fashion editorial, quiet shopping mechanics, subtle rose italics and warm paper surfaces. Audience: Indian women arriving from Instagram on a phone. Domain: everyday dressing, finishing touches, shoulder bags, timepieces, wardrobe edits, little luxuries. The homepage opens with an unobstructed silent cinematic fashion film and a separate collection action below it. Recurring handwritten-feeling serif emphasis and precise straight-edged shopping photography continue elsewhere.
## Colors
Ivory is the main canvas, espresso carries content and primary actions, blush is a quiet preview accent. Dusty rose is a decorative brand token; darker #8E5A64 carries italic text. Do not use pale rose for small functional text. Campaign sand (#E7DFD2) is the cinematic hero's loading background. Its collection link uses espresso on an ivory caption strip; the hero introduces no additional pink. The supplied transparent gold logo remains an image asset, preserving its original colour.
The approved collection sections use arrivals paper behind product photography and editorial brown beneath the wristwatch lifestyle image. Translucent ivory surfaces keep wishlist controls quiet over imagery; the legacy demo-label surface remains reserved but unused; these are scoped surface variants, not replacements for the core palette. Category photography reuses campaign sand as its fallback.
## Typography
Locally hosted Cormorant Garamond display and DM Sans body use the CSS aliases Editorial and Everyday. WOFF2 loads first with TTF fallback and font-display swap; glyphs, horizontal metrics and font styling remain unchanged. Headings use line-height 1.05. The cinematic hero has no visible headline. Its screen-reader-only h1 reads "Dearelle watches and handbags"; the "Explore Collection" link below the footage is 12px at all sizes. The supplied gold logo replaces the typographic wordmark in header and footer. Body text uses line-height 1.6, with paragraphs at 1.75. General mobile headings remain 30–40px; general product names and prices remain 12px. The approved collection sections use the scoped roles above: category titles settle at 30px on mobile, New Arrivals at 28px, and the wristwatch editorial at 34px. Category copy is 13px desktop and 11px at widths up to 1000px, with line-height 1.5 at every size. Arrival names and prices are 13px desktop and 12px mobile. View all is 12px desktop and 10px mobile; the editorial action is 11px desktop and 9px mobile with .04em tracking. Legacy demo-label, price-qualifier and preview-note typography is reserved but no longer rendered, following the owner’s removal of visible AI-styled/demo labels. No heavy all-caps display. Product microcopy remains secondary to imagery, names and prices.
## Layout
The homepage hero is full-width. Its inner .campaign-film frame is full-width 16:9 with no height cap on desktop, and at widths up to 640px uses aspect-ratio 1 / 1.05 with maximum height 56svh and no minimum height. The containing section has no fixed height. The collection action sits in a centred ivory strip below the footage, minimum height 52px with a fine bottom border; only the playback control overlays the film. Responsive desktop and mobile posters and films fill the frame with object-fit cover. Mobile header has left menu, centred supplied gold logo and right search/bag, and is 64px high on the homepage. The approved collection area follows with 18px top padding and 16px side gutters on mobile. Watch and bag banners stack at every size in a centred grid with maximum width 1000px, zero grid gap and a -8% top margin on the bag link, creating a sloping ivory seam between flowing silhouettes. Both banners share aspect-ratio 1.75 on desktop and mobile. Copy uses translateY(-50%); desktop watches sit at top 50%, right 6%, width 34%, and bags at top 50%, left 8%, width 34%. Mobile watches sit at top 52%, right 7%, width 33%, and bags at top 48%, left 7%, width 30%. Category images request 90vw up to 1100px and 1000px above; the bag image uses object-position center 30%. New Arrivals uses four product columns desktop and two at widths up to 640px; gaps are 26px desktop, 18px at widths up to 1000px and 22px row / 14px column mobile. Category and arrivals containers have maximum width 1320px and 6% desktop side padding; arrivals mobile gutters are 20px. Arrival photos use aspect-ratio .94 desktop and .98 mobile. The wristwatch lifestyle section has maximum width 1440px and aspect-ratio 2.5 desktop, 2 at widths up to 1000px and 1.12 mobile; its left-aligned heading reads "Details make it yours." Header maximum remains 1440px. Other mobile product grids retain their existing 13px gap. Responsive breakpoints are 1000px and 640px.
## Elevation & Depth
Flat editorial surfaces, fine warm borders, no card shadows. Native modal drawer has a translucent espresso backdrop. No decorative gradients.
## Shapes
General photographic frames and buttons remain straight-edged, with small circular colour markers and arrow affordances. The approved category banners restore Option 2's organic flowing edges with custom smooth SVG clip paths, not ordinary border radii. The objectBoundingBox paths category-watch-curve and category-bag-curve shape opposing sweeps around a sloping ivory seam; exact path geometry lives in the component and sidecar preview. Images fill each clipped silhouette. Arrival photographs soften to a 5px radius; wishlist controls remain circular. Checkout fields use a 2px radius. No heavy pill containers.
## Components
Buttons: 48px desktop, at least 44px primary mobile actions. General product cards reserve aspect-ratio .78 before loading; the scoped New Arrivals ratios are specified above. Desktop image hover scales to 1.025 over 240ms with cubic-bezier(.23,1,.32,1); button press 0.98 over 140ms. Reduced motion removes transforms. No delayed content gates or animated navigation. The approved listing-image carousel below is the scoped exception for automatic image changes. Approved category banners alone acknowledge first entry with a brief, unstaggered reveal; content is visible before JavaScript and links remain available. Product sticky purchase bar appears only on mobile product pages. Native dialog provides modal focus containment and Escape dismissal.

Approved collection sections: category image hover scales to 1.025 over 280ms using shared cubic-bezier(.23,1,.32,1) easing on fine-pointer hover devices only. Each entire category card remains a single link with its Shop Watches or Shop Bags accessible label. A small static circular arrow affordance (32px diameter, 1px currentColor border and 16px icon) follows the supporting copy, with 13px top margin desktop and 10px mobile. There is no inner underlined shopping text link. Category first entry animates opacity .82 to 1 and translateY(8px) to none over 280ms when 18% visible; it runs once with no delay. Reduced motion skips or cancels the reveal and removes category hover transforms and transitions. Category links retain a 7px focus-outline offset; their unclipped reveal wrappers expose a 2px focus outline with 4px offset so keyboard focus remains visible around the clipped geometry. Arrival wishlist targets are 40px desktop and 44px mobile. The editorial Shop Watches link uses an ivory surface and espresso text, with minimum height 44px desktop and 40px mobile. Source of truth: components/collection-sections.tsx, app/collections.css and components/reveal.tsx.

Cinematic hero: a silent, muted, looping, inline film is followed by a single underlined "Explore Collection" link to /new-arrivals in the separate caption strip. Its semantic h1 is screen-reader-only; no title covers the accessories. The owner requested the current v4 model-led replacement for the prior v3 static accessory display. A fictional adult model in cream tailoring and sunglasses walks with a burgundy bag, adjusts her watch cuff and turns while walking. No visible heading overlays the film. A keyboard-accessible 44px circular control toggles Play/Pause with an accessible label and pressed state. Playback pauses while the hero is offscreen or the document is hidden. Reduced-motion, Save-Data and slow-2g/2g connections initially receive the responsive poster without loading a film source; explicit Play opts into loading and playback. The server-rendered picture uses matching mobile/desktop WEBP posters, media-qualified high-priority preloads and an unoptimized Next Image JPEG fallback. A parser-inline bootstrap selects one matching MP4 and starts permitted playback before React hydration; video uses preload metadata. The video stays at opacity 0 until its first decoded frame via requestVideoFrameCallback (double requestAnimationFrame fallback), then fades over 200ms var(--ease); reduced motion removes the transition. A responsive still remains underneath as the loading, blocked-autoplay and error fallback; on video error the film and playback control are hidden. Visible hero content is limited to the collection link below the footage and playback control over it. Document provenance here rather than adding a visible concept caption: the generated footage features fictional campaign accessories, not an exact representation of sale inventory. Versioned -v4 MP4, WEBP and JPEG URLs use one-year immutable caching; MP4 delivery supports byte ranges. Earlier v3/v2 assets and original masters remain retained as history. Delivery films are 720x756 mobile and 1280x720 desktop, silent 24fps, 144 frames / six seconds. Three two-second selections use clean cuts and natural-speed action without retiming: WALK 0.3–2.3s, WATCH 0.2–2.2s and TURN 4.5–6.5s. The existing compact mobile frame remains aspect-ratio 1 / 1.05 capped at 56svh; desktop remains 16:9. Source clips and edit provenance live in media/hero/model-v4/README.md; exact prompts live in media/hero/model-v4/PROMPTS.json. The prior v3 publication approval is historical and does not approve v4 publication. Scoped visual-review evidence is .impeccable/review/model-v4/mobile.png, desktop.png, catalogue-375.png and felix-375.png; the implementation handoff reports 27 tests passing and a passing production build. Source of truth: components/cinematic-hero.tsx, lib/hero-bootstrap.ts, app/campaign.css, lib/hero-policy.ts and next.config.ts.

Homepage loading: the real hero is server-rendered without a generic loading-screen flash; loading boundaries live in three non-home segments. Homepage Photo instances defer image requests until within 240px of the viewport, preserving reserved layout with a transparent placeholder, low fetch priority and a noscript real-image fallback. Catalogue and product-page Photo defaults remain unchanged.
Brand mark: use the supplied transparent gold PNG at public/brand/dearelle-logo.png, intrinsic size 550 by 170. Preserve its aspect ratio with height auto. Header width is 180px desktop and 138px mobile; footer width is 190px desktop and 155px mobile. Do not recreate the supplied mark as text.

## Watch imagery and catalogue
Use only AI-generated website watch stills across catalogue cards, colour selections, the demo bag, category photography, the editorial banner and the watch moodboard. Supplied original photos and video stills are reference-only. The published set includes generated finals and supplied AI assets, including three refreshed Petite Dial Black studio views; preserve exact prompts in media/watches/PROMPTS.json, selected full-resolution sources in media/watches/sources/, and the model/provenance decisions in media/watches/MODEL-MAP.md. Delivery JPEGs live in public/images/. These rules concern watch stills; the approved cinematic film and its performance policy remain unchanged.

The four analogue names are editorial model families, not verified manufacturer model numbers. These nine analogue colourways and the four digital colourways each resolve to their own image through lib/products.ts and productVisual; product colour selection and demo bag imagery must stay consistent.

| Editorial model family | Colourway | Image key |
|---|---|---|
| The Petite Dial Watch (Felix, w3) | Rose gold / White | watch-category-stock |
| The Petite Dial Watch (Felix, w3) | Black / Black | watch-petite-black-studio-main |
| The Soft Square Watch | Rose gold / Black | watch-date-rose-black |
| The Soft Square Watch | Rose gold / Green | watch-date-green |
| The Soft Square Watch | Rose gold / Champagne | watch-date-champagne |
| The Soft Square Watch | Black / Black | watch-date-black |
| The Signature Watch (Felix, w1) | Rose gold / Pink | watch-square-pink |
| The Signature Watch (Felix, w1) | Gunmetal / White | watch-square-gunmetal |
| The Teal Dial Watch | Silver / Teal | watch-teal |

The Signature Watch (Felix w1) is the Rose gold / Pink and Gunmetal / White model. The Petite Dial Watch (Felix w3) is the separate smaller-dial model in Black / Black and Rose gold / White. Both cost ₹799; existing Casio analogue watches cost ₹599. Digital prices are explicit: Compact Digital (w5), Black, ₹699; World Map (w6), Black / Black and Gold / Brown, ₹799; Triple Display (w7), Black, ₹799. Black map and triple-display dials are separate products; gold/brown belongs to the map model. Petite Dial Black now uses three newly generated AI studio views: main, side and clasp/bracelet. The close-cropped first view keeps the complete dial, case and crown visible on warm ivory studio materials; the prior outdoor views remain archived. Delivery keys are watch-petite-black-studio-main, watch-petite-black-studio-side and watch-petite-black-studio-bracelet. Provenance lives in media/watches/felix-black-studio/README.md and PROMPTS.json. Digital mappings live in media/watches/DIGITAL-ADDITIONS.md; preserve supplied designs and do not mix galleries across models. Petite Dial White uses a full image and a detail crop of the same image; other colourways retain full images and matching crops. Preserve exact prompts and per-image provenance in media/watches/. The older Contour/Petite Square grouping is superseded by these owner-confirmed families. Visible AI-styled/demo labels remain removed at the owner's request. The hosted catalogue contains 16 products and 22 SKUs. Three units is initial stock for each newly inserted SKU only; catalogue synchronization never resets existing stock. Dimensions, materials, movement, water resistance and authenticity remain unverified; owner-supplied brands and prices establish no genuine-product claim.

## Approved product browsing and bag catalogue
PDP order is gallery, title, price and colour chips before description. ProductGallery is keyed by variant ID: changing colour selects its matching image set and resets the index. Subtle 44px arrows, a current/total count, native horizontal swipe and keyboard arrows make exploration explicit. Most galleries contain a full image plus a matching detail crop; Petite Dial Black instead uses its three new AI studio views; Triple Display retains its single supplied view. One Add to bag and one Buy now use shared purchase actions fixed at the mobile viewport bottom. Quantity is capped to current preview stock. Buy now goes directly to checkout without opening the cart drawer.

ProductImageCarousel serves listing cards, search and related products with native horizontal scrolling, small dots and desktop hover arrows that also appear for keyboard focus. Its scheduler uses one global timer and visibility observer for automatic rotation: every 3.5 seconds, preload 650ms before attempting to advance one visible card selected fairly from those nearest the viewport centre. Only decoded images advance. Interaction holds that card and pauses it for eight seconds after release. Reduced motion, Save-Data, slow-2g/2g and hidden documents stop automatic rotation. Gallery arrows use 44px targets; the ivory indicator surface has an 8px radius, 4px neutral #BAADA5 dots and espresso active dots. Cards stay within the default variant, never rotating colourways. Source: components/product-image-carousel.tsx, lib/carousel-scheduler.ts, components/product-gallery.tsx and components/product-detail.tsx.

Nine generated bag designs replace the two fictional products. References come from the owner’s Dearelle - Nayans/Images folder; every bag is ₹399 as supplied by the owner. Preserve media/bags/MODEL-MAP.md, PROMPTS.json and sources/, alongside watch provenance. Descriptive names and generated images make no authenticity, material or dimension claims. Owner-confirmed opening stock is three per new colour/SKU; existing stock is preserved. Checkout uses the local COD test foundation below without an online payment connection.

Shopping information is a compact horizontal row of three equal points at desktop and mobile sizes, each an icon with a short label; omit the former small explanatory paragraphs. Preserve existing hero delivery, layout and category curve geometry.

## Local COD test foundation
The approved milestone is a local test foundation, not a public launch. Keep explicit test warnings and require fictional customer details. Local SQLite persists test orders and inventory; real public orders remain disabled. No online gateway, automatic paid state or simulated payment success is connected.

Owner-confirmed policies: free shipping across India; damage-on-delivery returns require an unpacking video. COD requires a ₹50 advance deposit deducted from the order total, not an extra fee. The remaining balance is due on delivery. The owner contacts the customer to confirm and manually verifies the advance before packing or dispatch. Advance verification remains an explicit owner action.

Checkout is contact-first on mobile, then order summary before COD consent; desktop retains two columns. Input text is 16px. Private guest confirmation uses an HttpOnly cookie. Secret Bearer access gates owner order lists, status/history and tracking updates; keep secrets server-side. Sources: lib/checkout.ts, lib/order-repository.ts, lib/commerce-http.ts, app/checkout/page.tsx and components/owner-orders.tsx. Commerce review screenshots live in the commerce folder. Preserve hero CSS, category curve geometry, brand palette and existing tokens throughout this milestone.

## Do's and Don'ts
Respect the owner’s removal of visible AI-styled/demo and demo-price labels; retain provenance in media/bags/ and media/watches/ and clear local-test checkout warnings. Never invent reviews, discounts, customer photos, operating policies or popularity; use only the owner-confirmed policies above. Use genuine launch photos when supplied; stock photography is representative only. Do not connect production services or repurpose this preview as a live store.
Keep the homepage film unobstructed with its single collection action below the footage. Do not restore the old text-heavy split hero, overlay a visible headline on the accessories or add pink decoration. Preserve the responsive poster, pause control and preference-aware source loading. Describe generated film accessories as fictional concept styling, not inventory.
Keep website watch stills AI-only and retain per-colour mapping, exact prompts and model provenance. Do not publish raw original watch photographs, video stills, packaging, collages or price posters, or infer verified specifications or real availability from generated imagery. The watch policy takes precedence over the general guidance to use genuine launch photos until the owner approves a verified launch catalogue.

## Private owner workflow
The owner screens reuse ivory, espresso, warm borders, Editorial headings and Everyday body text. Use the next operational action as the main focus: contact confirmation, exact advance verification, packing, tracking or COD reconciliation. Keep native labelled controls, 16px input text, 44px touch targets and tabular amounts. Inventory stays in a compact disclosure; stage filtering stays above the order list. At mobile widths, selecting a request replaces the list with its details and a Back to requests control; desktop keeps both columns. Authentication is password followed by TOTP, with no bearer-token field or credentials in browser storage. This private workflow adds no animation or changes to the public campaign sections.
