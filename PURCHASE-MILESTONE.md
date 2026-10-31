# Purchase experience milestone — 31 October 2026

Historical record of commit 1661027. Backend implementation and setup below are superseded by [BACKEND-MILESTONE.md](BACKEND-MILESTONE.md): the application now uses PostgreSQL and Supabase MFA owner access. The old bearer-token interface and SQLite application factory are retired.

## Already working

The shared catalogue, owner prices, per-colour imagery, gallery navigation, selective listing carousels, wishlist, quantity controls, modal bag and local cart persistence were present. The hero film and flowing category geometry were approved. They were preserved rather than rebuilt.

The original checkout did not validate or submit, had no server quote, order storage or owner management, and showed speculative payment options. Product pages rendered duplicate Add/Buy controls on mobile. Stock and business policies were unconfirmed.

## Owner-confirmed facts

- Casio ₹599; Felix ₹799; every bag ₹399. No newer prices were supplied.
- Three pieces per colour/SKU; delivery across India is free.
- COD with a **₹50 advance deposit included in the product total**. It is not an extra delivery fee. Example: ₹799 total, ₹50 advance, ₹749 remaining COD.
- Contact and customer confirmation precede dispatch. The owner verifies the advance manually, outside the site. No gateway, automatic payment success or payment instructions are invented.
- Returns for damage during delivery require an unpacking video. Return window, return-shipping arrangements and refund handling still need business decisions.
- Felix model 1 / Signature: Rose gold/Pink and Gunmetal/White. Felix model 2 / Petite Dial: smaller dial, Black/Black and Rose gold/White. Both ₹799. The old black colour is removed from model 1. Colour-derived IDs/SKUs prevent positional reassignment.

Images are styled AI assets from the owner's reference material, not raw real photographs or independent authenticity evidence. The owner declined supplier verification. No genuine/authentic certification claim is added. Current names are descriptive storefront names. Three user-selected black Felix AI views are retained with provenance; earlier model assignments in archived documentation are superseded.

## Implemented

- One Add to bag and one Buy now control, rendered once; fixed mobile bar, ordinary desktop actions. Buy now adds the selected variant without briefly opening the drawer.
- Three-piece client cap and server stock checks. The product page reads uncached preview inventory; cart restoration sanitizes obsolete colours and quantities.
- Guest checkout with Indian contact/address/PIN validation, labelled fields, inline errors, focus recovery and explicit test consent. Contact/delivery precede order review and COD instructions on mobile.
- `/api/checkout/quote` recalculates prices, selected SKU, grouped quantities, stock, free shipping, deposit and COD balance. Client-supplied prices/totals never determine an order. Unsupported discounts cannot reduce the server calculation.
- `/api/orders` records a **test COD request**, never a real purchase or online payment. Quote fingerprints require review when the priced bag changes. A unique guest/idempotency key prevents duplicate submissions and rejects reuse with different details.
- Local SQLite storage uses transactions, stock reservation, unique idempotency keys, immutable order-line price/SKU snapshots, status versions and history. Cancellation restores reserved test stock once.
- `/orders/[id]` is private to the submitting browser via a random HttpOnly/SameSite guest cookie; the database stores its hash. Missing or unrelated sessions get 404. The page shows current status, not a hardcoded pending label.
- `/admin/orders` provides a private test owner view: order list, customer details, products/colours/SKUs, quantities/prices, manual payment state, fulfilment, tracking and history. Every admin API checks a server-only 32+ character bearer token. It is not bundled or persisted in browser storage. Missing configuration denies access.
- Contact confirmation and manually verified advance gate packing/dispatch. Tracking is required for dispatch. COD collection can only be manually recorded after delivery. There is no automated bank/payment verification.
- Same-origin JSON mutation checks, bounded request bodies, basic local session rate limits, parameterized SQL and private no-store responses. Checkout/owner/order routes remain noindex.

## Run and review locally

Requires Node 24 on this test machine. Run the existing build/start commands. `.env.example` documents configuration; this workspace has a gitignored `.env.local` containing `COMMERCE_TEST_ORDERS=1` and a generated private `OWNER_ACCESS_TOKEN`. The token is never printed, committed or returned by an API. Open that local file to retrieve it for the owner screen. Do not share it with customers.

Test data lives in gitignored `.data/test-orders.sqlite`, outside public assets. Only sample details should be entered. The current test ledger reserves/cancels stock independently from any future production inventory. Restarting the local server preserves test requests. The test adapter is intentionally disabled when `VERCEL` is set; a SQLite file is not a durable serverless order database.

Preview: http://127.0.0.1:3001/ · Owner view: http://127.0.0.1:3001/admin/orders

## Verification

- Seventeen automated tests cover catalogue grouping/price consistency, variants/cart, server pricing and quantity/PIN rejection, idempotency, stock reservation, guest isolation, stale quotes, cancellation, status/version/advance gates, and existing hero behavior.
- `scripts/verify-commerce.mts` tests the actual running server: unauthorized owner access, cross-origin mutation, absent guest session, forged price, invalid PIN, stale quote, replay, private confirmation access and dispatch gating. It leaves a clearly marked cancelled test request and restores stock.
- Actual mobile journey: Signature Gunmetal → Buy now → server quote ₹799/₹50/₹749 → invalid-field errors → sample form submission → private confirmation → reload. Owner screen loaded the same request, packing was disabled before advance verification and enabled afterward; the sample was cancelled to restore stock.
- Petite Black and Rose gold/White gallery switch/reset, three-piece cap, one Add button, direct Buy now and cart persistence checked. Mobile 360/375/390/414 and desktop layouts inspected with zero horizontal overflow in sampled views.
- Fresh read-only finish reviewer approved the **local test foundation**, with no outstanding material source/visual findings after the cart-policy and confirmation-status corrections. No production launch approval is implied.
- Mechanical detector: no primary findings; 125 advisory token/legacy-style findings in the existing global stylesheet. New work follows the incumbent palette and typography.

Evidence: `.impeccable/review/commerce/`. Native physical-device Safari/Android, carrier PIN serviceability, public hosting durability, real money, real dispatch and production load/security testing are not claimed.

## What remains before public COD orders

1. Connect a durable production order/inventory repository with backups and transactions. The isolated repository module is the replacement boundary; the current SQLite adapter is local test infrastructure.
2. Configure production owner identity/access and secret rotation, distributed abuse controls, hosting, HTTPS cookies and retention/access procedures. The local bearer-token screen is a review foundation, not a production identity rollout.
3. Add the business contact/WhatsApp identity, manual advance instructions and operational confirmation/dispatch process. Decide return window, return shipping/refund handling and tax/receipt settings; do not infer them from the preview.
4. Verify final product specifications, image accuracy and permitted brand presentation. No independent authenticity claim has been established.
5. Run production deployment, inventory concurrency, recovery/privacy and physical-device checks, then explicitly enable public order intake. No payment gateway is needed for the currently chosen manual-advance/COD plan.

No existing dearelle.in production website, domain, database or payment service was modified. Public/live order intake is deliberately still disabled; the completed deliverable is a reviewable, persistent local test purchase flow and owner foundation.
