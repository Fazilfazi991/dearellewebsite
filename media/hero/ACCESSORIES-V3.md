# Compact accessory film — approved production release

Owner request, 1 November 2026: replace the long mobile portrait treatment with a shorter, smaller and more creative hero. This supersedes the earlier instruction to preserve the hero. All other homepage sections and commerce remain outside scope.

## Direction

Owner selected the first new take: an upright taupe handbag on pale stone with a rose-gold rectangular watch on ivory silk. The camera slides across the composition. The later static flat-lay was explicitly rejected. No model portrait or text overlay. Existing brand mark, collection caption, accessible playback control, responsive first-frame poster and preference-aware loading stay intact. Film accessories are generated campaign styling, not a claim that they exactly represent sale inventory.

Mobile frame: full width, aspect ratio 1:1.05, maximum 56svh; no former 420px minimum. Desktop retains its 16:9 frame. Both deliveries use the same owner-selected take, separately framed. A 5.5-second silent loop replaces 8.4167 seconds. A 0.3-second tail-to-head dissolve bridges the return to the starting camera position; no CSS camera zoom or additional entrance animation.

## Motion assessment before implementation

| Location | Purpose / frequency | Decision |
| --- | --- | --- |
| Hero's decoded first frame | Prevent a jarring change, once per visit | Keep existing 200ms opacity transition and reduced-motion override. |
| Campaign footage | Show accessory texture and styling, once per visit | One restrained 5.5s film with a visible camera slide, played at 1.35x speed. Pause remains available. |
| Collection caption and header | Frequent navigation | No new animation; immediate navigation. |
| Surrounding categories and product grids | Outside requested scope | No motion or layout changes. |

## Source and budget

Flow project: https://flow.google.com/project/8fbbe62e-053e-419f-a42f-0a538a71ddf0

Selected media: https://flow.google.com/project/8fbbe62e-053e-419f-a42f-0a538a71ddf0/edit/bead9af2-895d-4fe0-b82b-902a8b380ac8

Downloaded original: `Handbag_and_watch_on_display_0804029f.mp4`, retained at `source/accessories-v3.mp4`. Veo 3.1 Fast, 16:9, original 720p, one output. Two takes at 20 credits each were authorized within the 50 existing credits. No purchase or upgrade. The first take was initially held for cropping review. The owner subsequently selected it over the static flat-lay; the mobile crop is shifted left to preserve both accessories. The original generated frame crops the very top of the handle; this remains an editorial detail crop, not a complete product packshot. The rejected flat-lay source remains in Downloads and is not referenced by the website.

Exact selected generation prompt as shown by Flow:

> Photoreal luxury accessories campaign, one continuous carefully composed shot. A small elegant taupe structured flap handbag, simple gold clasp and curved top handle, rests on a pale travertine plinth. A feminine rose-gold rectangular bracelet watch with a white dial rests naturally on an ivory silk fold in the foreground, large enough to read as a watch. Bag and watch together occupy the CENTRAL 45 percent of frame width, both completely visible inside the central square, leaving warm ivory breathing room at the sides for a responsive website crop. Rich pebble texture, precise consistent metal edges, beautiful fabric, warm neutral colours, realistic editorial photography, high detail, no haze or overly soft focus. A sheer curtain shadow drifts very slightly over the background as the camera makes a tiny gentle sideways slide, almost static. Restrained refined fashion art direction. No people, no hands, no faces, no words, no logos, no floating objects, no shape changes, no turntable, no transitions. Keep the starting and ending composition nearly identical. Silent.

Render with `node media/hero/render-accessories.mjs`. Exact delivery sizes are recorded in `accessories-v3-assets.json`. Prior v2 assets are retained, and the new v3 URLs avoid serving stale immutable cached films. The source is 720p; no claim of native 4K or recovered detail from upscaling.

## Release boundary

The owner selected the upright take and explicitly instructed “push to production” on 1 November 2026. Release the reviewed hero changes through main to the existing Dearelle V2 Vercel project and custom domains. The live COD system is not changed.
