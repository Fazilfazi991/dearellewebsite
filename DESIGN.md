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
spacing:
  compact: '8px'
  related: '16px'
  group: '24px'
  mobile-section: '43px'
  desktop-section: '72px'
components:
  button-primary:
    backgroundColor: '{colors.espresso}'
    textColor: '{colors.white}'
    padding: '13px 25px'
---
## Overview
The user's 70% minimal luxury / 30% feminine direction governs the world: a small fashion editorial, quiet shopping mechanics, subtle rose italics and warm paper surfaces. Audience: Indian women arriving from Instagram on a phone. Domain: everyday dressing, finishing touches, shoulder bags, timepieces, wardrobe edits, little luxuries. The homepage opens with an unobstructed silent cinematic fashion film and a separate collection action below it. Recurring handwritten-feeling serif emphasis and precise straight-edged shopping photography continue elsewhere.
## Colors
Ivory is the main canvas, espresso carries content and primary actions, blush is a quiet preview accent. Dusty rose is a decorative brand token; darker #8E5A64 carries italic text. Do not use pale rose for small functional text. Campaign sand (#E7DFD2) is the cinematic hero's loading background. Its collection link uses espresso on an ivory caption strip; the hero introduces no additional pink. The supplied transparent gold logo remains an image asset, preserving its original colour.
The approved collection sections use arrivals paper behind product photography and editorial brown beneath the wristwatch lifestyle image. Translucent ivory surfaces keep demo labels and wishlist controls quiet over imagery; these are scoped surface variants, not replacements for the core palette. Category photography reuses campaign sand as its fallback.
## Typography
Locally hosted Cormorant Garamond display and DM Sans body use the CSS aliases Editorial and Everyday. WOFF2 loads first with TTF fallback and font-display swap; glyphs, horizontal metrics and font styling remain unchanged. Headings use line-height 1.05. The cinematic hero has no visible headline. Its screen-reader-only h1 reads "Dearelle watches and handbags"; the "Explore Collection" link below the footage is 12px at all sizes. The supplied gold logo replaces the typographic wordmark in header and footer. Body text uses line-height 1.6, with paragraphs at 1.75. General mobile headings remain 30–40px; general product names and prices remain 12px. The approved collection sections use the scoped roles above: category titles settle at 30px on mobile, New Arrivals at 28px, and the wristwatch editorial at 34px. Category copy is 13px desktop and 11px at widths up to 1000px, with line-height 1.5 at every size. Arrival names and prices are 13px desktop and 12px mobile. View all is 12px desktop and 10px mobile; the editorial action is 11px desktop and 9px mobile with .04em tracking. Demo labels are 8px desktop and 7px mobile; price qualifiers are 9px and 8px; the centred preview note is 10px and 9px. These labels remain supplementary to imagery, product names and prices. No heavy all-caps display. Product microcopy remains secondary to imagery, names and prices.
## Layout
The homepage hero is full-width. Its inner .campaign-film frame is full-width 16:9 with no height cap on desktop, and at widths up to 640px is 70svh, minimum 420px and maximum 740px. The containing section has no fixed height. The collection action sits in a centred ivory strip below the footage, minimum height 52px with a fine bottom border; only the playback control overlays the film. Responsive desktop and mobile posters and films fill the frame with object-fit cover. Mobile header has left menu, centred supplied gold logo and right search/bag, and is 64px high on the homepage. The approved collection area follows with 18px top padding and 16px side gutters on mobile. Watch and bag banners stack at every size in a centred grid with maximum width 1000px, zero grid gap and a -8% top margin on the bag link, creating a sloping ivory seam between flowing silhouettes. Both banners share aspect-ratio 1.75 on desktop and mobile. Copy uses translateY(-50%); desktop watches sit at top 50%, right 6%, width 34%, and bags at top 50%, left 8%, width 34%. Mobile watches sit at top 52%, right 7%, width 33%, and bags at top 48%, left 7%, width 30%. Category images request 90vw up to 1100px and 1000px above; the bag image uses object-position center 30%. New Arrivals uses four product columns desktop and two at widths up to 640px; gaps are 26px desktop, 18px at widths up to 1000px and 22px row / 14px column mobile. Category and arrivals containers have maximum width 1320px and 6% desktop side padding; arrivals mobile gutters are 20px. Arrival photos use aspect-ratio .94 desktop and .98 mobile. The wristwatch lifestyle section has maximum width 1440px and aspect-ratio 2.5 desktop, 2 at widths up to 1000px and 1.12 mobile; its left-aligned heading reads "Details make it yours." Header maximum remains 1440px. Other mobile product grids retain their existing 13px gap. Responsive breakpoints are 1000px and 640px.
## Elevation & Depth
Flat editorial surfaces, fine warm borders, no card shadows. Native modal drawer has a translucent espresso backdrop. No decorative gradients.
## Shapes
General photographic frames and buttons remain straight-edged, with small circular colour markers and arrow affordances. The approved category banners restore Option 2's organic flowing edges with custom smooth SVG clip paths, not ordinary border radii. The objectBoundingBox paths category-watch-curve and category-bag-curve shape opposing sweeps around a sloping ivory seam; exact path geometry lives in the component and sidecar preview. Images fill each clipped silhouette. Arrival photographs soften to a 5px radius; wishlist controls remain circular. Checkout fields use a 2px radius. No heavy pill containers.
## Components
Buttons: 48px desktop, at least 44px primary mobile actions. General product cards reserve aspect-ratio .78 before loading; the scoped New Arrivals ratios are specified above. Desktop image hover scales to 1.025 over 240ms with cubic-bezier(.23,1,.32,1); button press 0.98 over 140ms. Reduced motion removes transforms. No delayed content gates, auto carousels or animated navigation. Approved category banners alone acknowledge first entry with a brief, unstaggered reveal; content is visible before JavaScript and links remain available. Product sticky purchase bar appears only on mobile product pages. Native dialog provides modal focus containment and Escape dismissal.

Approved collection sections: category image hover scales to 1.025 over 280ms using shared cubic-bezier(.23,1,.32,1) easing on fine-pointer hover devices only. Each entire category card remains a single link with its Shop Watches or Shop Bags accessible label. A small static circular arrow affordance (32px diameter, 1px currentColor border and 16px icon) follows the supporting copy, with 13px top margin desktop and 10px mobile. There is no inner underlined shopping text link. Category first entry animates opacity .82 to 1 and translateY(8px) to none over 280ms when 18% visible; it runs once with no delay. Reduced motion skips or cancels the reveal and removes category hover transforms and transitions. Category links retain a 7px focus-outline offset; their unclipped reveal wrappers expose a 2px focus outline with 4px offset so keyboard focus remains visible around the clipped geometry. Arrival wishlist targets are 40px desktop and 44px mobile. The editorial Shop Watches link uses an ivory surface and espresso text, with minimum height 44px desktop and 40px mobile. Source of truth: components/collection-sections.tsx, app/collections.css and components/reveal.tsx.

Cinematic hero: a silent, muted, looping, inline film is followed by a single underlined "Explore Collection" link to /new-arrivals in the separate caption strip. Its semantic h1 is screen-reader-only; no title covers the model. A keyboard-accessible 44px circular control toggles Play/Pause with an accessible label and pressed state. Playback pauses while the hero is offscreen or the document is hidden. Reduced-motion, Save-Data and slow-2g/2g connections initially receive the responsive poster without loading a film source; explicit Play opts into loading and playback. The server-rendered picture uses matching mobile/desktop WEBP posters, media-qualified high-priority preloads and an unoptimized Next Image JPEG fallback. A parser-inline bootstrap selects one matching MP4 and starts permitted playback before React hydration; video uses preload metadata. The video stays at opacity 0 until its first decoded frame via requestVideoFrameCallback (double requestAnimationFrame fallback), then fades over 200ms var(--ease); reduced motion removes the transition. A responsive still remains underneath as the loading, blocked-autoplay and error fallback; on video error the film and playback control are hidden. Visible hero content is limited to the collection link below the footage and playback control over it. Document provenance here rather than adding a visible concept caption: the generated concept footage features fictional unbranded accessories, never actual inventory. Versioned -v2 MP4 and poster URLs use one-year immutable caching; MP4 delivery supports byte ranges. The original cinematic masters remain unchanged. Delivery films are 720x1280 mobile and 1280x720 desktop, 24fps, 202 frames / 8.4167 seconds, with no audio; mobile/desktop MP4 sizes are 1,326,224 / 1,176,598 bytes and WEBP posters 42,924 / 44,048 bytes. Source of truth: components/cinematic-hero.tsx, lib/hero-bootstrap.ts, app/campaign.css, lib/hero-policy.ts and next.config.ts.

Homepage loading: the real hero is server-rendered without a generic loading-screen flash; loading boundaries live in three non-home segments. Homepage Photo instances defer image requests until within 240px of the viewport, preserving reserved layout with a transparent placeholder, low fetch priority and a noscript real-image fallback. Catalogue and product-page Photo defaults remain unchanged.
Brand mark: use the supplied transparent gold PNG at public/brand/dearelle-logo.png, intrinsic size 550 by 170. Preserve its aspect ratio with height auto. Header width is 180px desktop and 138px mobile; footer width is 190px desktop and 155px mobile. Do not recreate the supplied mark as text.

## Watch imagery and catalogue
Use only AI-generated website watch stills across catalogue cards, colour selections, the demo bag, category photography, the editorial banner and the watch moodboard. Supplied original photos and video stills are reference-only. The published set contains seven newly generated finals and three supplied AI assets; preserve exact prompts in media/watches/PROMPTS.json, selected full-resolution sources in media/watches/sources/, and the model/provenance decisions in media/watches/MODEL-MAP.md. Delivery JPEGs live in public/images/. These rules concern watch stills; the approved cinematic film and its performance policy remain unchanged.

The four names are editorial model families, not verified manufacturer model numbers. Nine colourways each resolve to their own image through lib/products.ts and productVisual; product colour selection and demo bag imagery must stay consistent.

| Editorial model family | Colourway | Image key |
|---|---|---|
| The Contour Watch | Rose gold / Ivory | watch-category-stock |
| The Contour Watch | Black / Black | watch-contour-black |
| The Soft Square Watch | Rose gold / Black | watch-date-rose-black |
| The Soft Square Watch | Rose gold / Green | watch-date-green |
| The Soft Square Watch | Rose gold / Champagne | watch-date-champagne |
| The Soft Square Watch | Black / Black | watch-date-black |
| The Petite Square Watch | Rose gold / Pink | watch-square-pink |
| The Petite Square Watch | Gunmetal / White | watch-square-gunmetal |
| The Teal Dial Watch | Silver / Teal | watch-teal |

The three supplied AI imports are watch-date-rose-black, watch-square-pink and watch-square-gunmetal. The seven new finals include the remaining six colourway images and watch-editorial-stock. Preserve visual distinctions in MODEL-MAP.md: Contour has 12/6 numerals and no date window; Soft Square has baton markers and a small circular date window; Petite Square has a compact softened square case and baton dial; Teal Dial has its distinct layered teal dial and lower-right date window. AI styling is labelled on cards and product pages. A second gallery crop is the same selected AI image, not an independent product view. Prices, stock and checkout remain explicitly demo; dimensions, materials, movement, water resistance and authenticity remain unverified and must await the verified launch catalogue.

## Do's and Don'ts
Keep all sample items visibly demo. Never invent reviews, discounts, customer photos, operating policies or popularity. Use genuine launch photos when supplied; stock photography is representative only. Do not connect production services or repurpose this preview as a live store.
Keep the homepage film unobstructed with its single collection action below the footage. Do not restore the old text-heavy split hero, overlay a visible headline on the model or add pink decoration. Preserve the responsive poster, pause control and preference-aware source loading. Describe generated film accessories as fictional concept styling, not inventory.
Keep website watch stills AI-only and retain per-colour mapping, AI-styled labels, exact prompts and model provenance. Do not publish raw original watch photographs, video stills, packaging, collages or price posters, or infer verified specifications or real availability from generated imagery. The watch policy takes precedence over the general guidance to use genuine launch photos until the owner approves a verified launch catalogue.
