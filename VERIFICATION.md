# Verification — 31 October 2026

## Hero delivery optimization

Production build, lint and all seven cart/hero tests pass. Independent performance-preservation review: ship, no material fixes. Measured cold Fast 4G LCP 1.076→0.300s / first decoded frame 2.870→1.000s; Slow 4G LCP 2.604→2.088s / first frame 8.680→4.737s under the explicitly documented local network simulation. Final CLS was below 0.001; the root homepage loading boundary was responsible for earlier placeholder-to-hero shifts.

Single responsive source/poster, pause/resume, 360/375/390/414px, desktop, failed-video poster, policy preference emulation and startup with external hydration bundles blocked were verified. Native iPhone Safari, physical Android and public CDN conditions remain untested. Full evidence, conditions, source sizes and limitations: `media/hero/PERFORMANCE.md` and `media/hero/performance-results.json`. Original cinema masters and the visual category geometry are preserved; hero delivery code and derivatives changed with explicit user authorization.

## Original Option 2 curve restoration

Restored the user-approved organic category identity with smooth object-bounding-box SVG clipping paths, complementary sloping edges and overlapping banner boxes that create the ivory seam. Small 32px circular arrows replace underlined links; the entire category anchors retain their accessible names and destinations. Existing photography is preserved, with the bag crop positioned to give its handle clearance.

Inspected real browser screenshots at 360, 375, 390 and 414px, with no horizontal overflow. A side-by-side comparison of the original Option 2 category region and the actual 375px browser capture is saved locally at `.impeccable/review/flowing-reference-comparison.jpg`. Desktop full-page evidence is also saved there. Both category links were clicked successfully. Production build and category-component lint passed; all four hero SHA256 hashes remain unchanged. Only category rendering and its documentation changed.

## Prior category refinement (superseded by curve restoration above)

Only category-card rendering changed: equally sized stacked banners, smaller opposing asymmetric corners, unclipped existing photography, vertically balanced text and subtle editorial shopping links. Hero component, hero stylesheet and both video files match their protected SHA256 baselines. New Arrivals and editorial section source blocks were preserved.

Real browser captures inspected at 375px, 360px and 1440px: matching mobile banner heights, no horizontal overflow, clear watch/title separation and unchanged imagery. Both category links were clicked and reached `/watches` and `/bags`. Production build, lint and all five existing tests passed. The finish reviewer found all requested visual changes matched; its sole correction was updating the category design documentation.

## Cinematic hero update

- Three actual Google Flow source MP4s exported: portrait arrival, landscape watch detail, landscape signature. Net credit use 50 (40 first account +10 user-selected account); no purchases. One audio failure was refunded before retry.
- Website exports are H.264/yuv420p,24fps,8.416667 seconds with no audio streams: mobile720x1280 (1,517,509 bytes), desktop1280x720 (1,352,554 bytes). First-frame WebP posters are about41KB each. MP4 fast-start metadata precedes media; automated payload tests pass.
- Final production build and strict TypeScript passed; lint passed; all5 automated tests passed, including motion/network policy and media integrity/payload checks.
- Browser tested final layout at360/375/390/414/768/1440px. No overflow; mobile film is591px at844px viewport height (70svh); CTA is below the video at every tested width. Correct native portrait/landscape sources load, muted,8.4167 seconds. Pause/resume works; leaving the viewport pauses playback. Reduced motion/data-saving policy covered by unit tests; browser preference emulation was not performed.
- Per owner corrections: removed visible concept label and campaign title; moved collection link below footage. No `.campaign-overlay` or `.campaign-disclosure` elements remain. H1 is available to screen readers. User-supplied transparent gold PNG appears in header/footer and was verified loaded.
- Final screenshots: `.impeccable/review/cinematic-mobile.jpg`, `cinematic-desktop.jpg`, `cinematic-desktop-full.jpg`. Saved captures opened and inspected. Final video sampled at2fps in `media/hero/review/mobile-contact.jpg` and `desktop-contact.jpg`; all three source contact sheets inspected.
- Independent cinematic finish reviewer: **ship this prototype**, no blocking visual defects; no further overlay or generation recommended. Documentation updated to final implementation.
- Remaining limits: source quality is720p; mobile closing is cropped from landscape. Tiny dial/bracelet/hardware details vary between generated takes. This is concept footage, not verified product inventory. Desktop opening/closing reuse different moments of the landscape signature take. Loop is an editorial dissolve, not a physically seamless camera move. No mobile-network LCP/CLS certification or physical-device Safari test was performed. Production remains untouched.

## Automated

- Next.js 16.4.3 production build passed; 19 static/generated pages including metadata icon and not-found handling.
- TypeScript strict check passed.
- ESLint passed with zero warnings/errors after fixes.
- Three automated cart tests passed: same-variant merging and distinct variants; subtotal arithmetic; corrupt/unavailable persisted data rejection; quantity cap; removal and empty totals.
- Impeccable detector on app/components returned no findings (`[]`).

## Browser

Tested the actual running application in the in-app Chromium browser, including production build on http://127.0.0.1:3001.

- Homepage widths 360, 375, 390, 414, 768 and 1440: no horizontal overflow. Desktop and mobile screenshots visually inspected.
- All homepage photographs loaded; local source assets and image fallback implemented.
- Search “gold” returns the two watch samples.
- New arrivals sort high-to-low puts ₹2,190 first. Filtering Gold shows two watches at ₹1,690 and ₹1,490.
- Mobile navigation opens a modal and navigates to Bags, showing two demo products.
- Silver watch variant, quantity two, opens bag at ₹2,980.
- Escape dismisses the modal and returns focus to the originating action.
- Refresh preserves bag; increasing quantity to three shows ₹4,470 at checkout.
- Buy Now on the bag adds it and navigates to checkout: combined subtotal ₹6,360.
- Checkout has a disabled payment action and no order submission/success. No payment/production services configured.
- Removing both lines yields the empty-bag state.

## Visual review

Independent finish reviewer disposition: **ship the prototype**, no material visual defect blocking review. Reviewed desktop and mobile homepage and mobile Bags screenshots against the user-pinned design. The decorative italic note above the hero is a documented craft-floor exception. Design-system documentation is included.

## Limits

This is a prototype review, not launch approval. No physical-device Safari run, screen-reader audit, production-network LCP/CLS measurement, payment test or real inventory/order test. Product gallery reuses a representative image for its detail crop; variant photos, final specs and policies are intentionally unconfirmed. Stock photography must be replaced before launch.

Screenshots: `.impeccable/review/desktop.jpg`, `mobile.jpg`, `mobile-viewport.jpg`, `bags-mobile.jpg`, `product-mobile.jpg`, `checkout-mobile.jpg`.
