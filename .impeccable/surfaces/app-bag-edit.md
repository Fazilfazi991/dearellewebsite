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
