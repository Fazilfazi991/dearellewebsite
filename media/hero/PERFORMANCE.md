# Hero delivery optimization — 31 October 2026

The approved footage, framing, grading, duration and layout are preserved. These changes optimize delivery and initial rendering only.

## Diagnosis

Both original exports already used H.264, 24 FPS, silent audio-free encoding and front-loaded `moov` metadata. They were not oversized. The main delays were the hydration-only assignment of the video source, an always-visible video layer before decoded playback, and a generic root loading boundary that briefly displayed a short loading page in place of the homepage. The latter moved the footer into and out of the viewport, contributing about 0.244 CLS in affected runs. Native lazy-loading also allowed offscreen homepage images to compete with critical resources.

Before delivery supported HTTP 206 byte ranges, but static video cache headers were `public, max-age=0`. Posters existed at about 41 KB; no responsive poster preload was present. The original poster was rendered by the server, but initially hidden inside the loading boundary's streamed segment on affected loads.

## Assets

| Asset | Before | Optimized |
|---|---:|---:|
| Mobile MP4 | 1,517,509 B | 1,326,224 B |
| Desktop MP4 | 1,352,554 B | 1,176,598 B |
| Mobile WebP poster | 40,762 B | 42,924 B |
| Desktop WebP poster | 41,378 B | 44,048 B |
| Mobile / desktop JPEG fallback | — | 58,499 / 53,485 B |
| Existing fonts combined | 338,516 B TTF | 82,780 B WOFF2 |

Mobile remains 720×1280; desktop remains 1280×720. Both are H.264 High / yuv420p, 24 FPS, 8.416667 seconds, 202 frames, with no audio. Re-encoded from the approved masters with CRF 25 / slow preset, two-second maximum GOP and fast-start metadata. No trim, crop, model regeneration, colour filter or creative edit. FFmpeg SSIM against the masters: 0.985765 mobile, 0.985958 desktop. Posters are the exact opening frame of each new export. WOFF2 conversion preserves glyph order and horizontal metrics.

Reproduce video/poster derivatives with `node media/hero/optimize.mjs` from the project root. Original masters and original exports remain available. Versioned `-v2` files are used by the page; change the filename when replacing immutable assets.

## Loading strategy

- Matching-media high-priority image preloads reference the same WebP URLs selected by the server-rendered picture. Next Image uses unoptimized pre-encoded sources to avoid a competing optimized desktop request; JPEG fallbacks are supplied.
- A small parser-time script selects one video URL using viewport and user preferences, then starts muted inline playback without waiting for React hydration. No desktop/mobile source pair is downloaded on a fixed viewport.
- The poster remains behind the film. Video opacity starts at zero and is revealed only after `requestVideoFrameCallback`, with a 200ms opacity transition. Browsers without that callback use `playing`, decoded-data readiness and two animation frames. Reduced motion removes the transition. Failed playback leaves the poster and shopping link intact.
- `preload="metadata"` provides a conservative native fallback; autoplay/explicit play initiates streaming. Warm-browser comparisons of none / metadata / auto produced first-frame times 470 / 475 / 478ms. This small difference is not evidence of a cold-network advantage; source discovery and autoplay dominate the hint. Reduced-motion, Save-Data and 2G policies omit the source until explicit Play.
- User pause, offscreen pause, hidden-tab pause and preference changes remain supported.
- Homepage offscreen photos use an opt-in 240px IntersectionObserver margin, reserved geometry and low fetch priority. No-script image fallbacks are retained; normal catalogue/product photo behavior is unchanged.
- The generic loading UI is now scoped to catalogue, product and checkout route segments. Homepage HTML directly contains the hero, with no hidden streamed loading replacement.
- Versioned media and WOFF2 responses use one-year immutable cache headers. HTTP 206 / `Accept-Ranges: bytes` was verified locally. No public CDN has been deployed or measured.

## Measured production results

Single observed cold runs in Chromium on Windows, requested viewport 390×844, unthrottled CPU. Fast 4G simulation: aggregate 9 Mbps with 60ms added latency. Slow 4G: 1.6 Mbps / 150ms. A fair bandwidth-limiting HTTP/1.1 proxy uses identity encoding. These are local lab conditions, not native DevTools presets, Lighthouse scores or physical-phone guarantees. Baseline is an isolated production build of commit `1f27c47`.

| Cold metric | Fast 4G before → after | Slow 4G before → after |
|---|---:|---:|
| Poster image ready | 0.704 → 0.252s | 2.553 → 2.073s |
| LCP | 1.076 → 0.300s | 2.604 → 2.088s |
| Video request start | 2.295 → 0.282s | 7.349 → 2.061s |
| First decoded video frame | 2.870 → 1.000s | 8.680 → 4.737s |
| CLS | 0.25076 → 0.00039 | 0.00006 → 0.00039 |

Warm optimized runs: Fast 4G poster 0.327s / LCP 0.436s / first frame 0.402s / CLS 0; Slow 4G poster 0.423s / LCP 0.544s / first frame 0.558s / CLS 0. Both video/poster resources reported cache delivery and zero transferred bytes. Completed cold-resource transfer totals were approximately 2.53 MB before and 2.06–2.12 MB after, including below-fold resources fetched during the sample. Resource Timing is not a packet capture, especially for cached video range requests.

Raw request waterfalls, timing values and conditions are in `performance-results.json`. The reproducible local test proxy is `scripts/hero-performance-lab.mjs` (arguments: first port, upstream production port, optional `fail-video`). It adds read-only PerformanceObserver instrumentation only to the test response; production pages contain no analytics probe. Early diagnostic runs with a less fair scheduler are excluded from the final report.

## Validation and limits

Production build and lint passed; seven cart/hero tests passed. Tests cover user preferences, one matching video source, waiting for a decoded frame, failed playback and fast-start/payload budgets. Browser checks cover 360/375/390/414px, desktop source selection, muted inline autoplay, loop flag, pause/resume, HTTP 503 video fallback, and no duplicate variant/poster requests. With external hydration bundles blocked, the real poster remained visible and the video still played. JavaScript preference overrides exercised reduced-motion and Save-Data branches with no video source. Category curves and typography remain visually intact after scrolling deferred images into view.

iPhone Safari and physical Android Chrome were unavailable. The fallback callback path is covered by design but requires device validation; native reduced-motion CSS and real Data Saver need final device checks. Internet/CDN delivery, TLS overhead, congested radios, CPU throttling and field Core Web Vitals remain unmeasured. Slow-network video starts as bandwidth permits; its poster is the immediate visual fallback. No guaranteed load time is claimed.
