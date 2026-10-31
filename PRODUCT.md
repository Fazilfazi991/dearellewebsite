# Dearelle V2
## Platform
Mobile-first web storefront for Indian women discovering affordable fashion accessories through social media.
## Stack
User specified Next.js App Router, TypeScript, Tailwind CSS and Lucide icons.
## Purpose
Beautiful little luxuries, made for everyday moments. Watches and handbags only. Build an independent design and storefront prototype.
## Constraints
No production repository, database, domain, deployment or payment changes. Demo products, representative stock photography and illustrative INR prices are labelled. No fake reviews, discounts, popularity or fulfilment claims. Checkout cannot submit an order or collect payment.
## Open facts
Final catalogue, photos, prices, stock, specifications, shipping, returns, contact information and social accounts require owner confirmation.

## Confirmed purchase milestone — 31 October 2026
Owner-confirmed catalogue: Casio ₹599, Felix ₹799, every bag ₹399, three pieces per colour/SKU. Correct Felix families: Signature = Rose gold/Pink + Gunmetal/White; Petite Dial (smaller) = Black/Black + Rose gold/White. Website stills remain AI-generated from owner product references; no independent authenticity claim is made.

Delivery is free across India. The chosen payment method is COD. A ₹50 advance deposit is manually verified and deducted from the product total, with the balance due by COD. Customer contact/confirmation and advance verification precede dispatch. An unpacking video is evidence guidance for delivery damage and does not exclude statutory consumer rights; return window, return shipping and refund process remain unspecified. These facts supersede older unconfirmed pricing, stock, shipping and payment statements above.

The backend milestone now records synthetic test requests in private Supabase PostgreSQL through a restricted server role. SQLite remains only as a legacy regression-test adapter. Public order intake stays OFF and no online payment is collected. Guest checkout validates contact/PIN and authoritative database prices/stock; transactional reservations, persistent idempotency, audit records, approval-gated expiry/retention and private guest access are implemented. Owner management uses server-authorized Supabase Auth with TOTP and HttpOnly sessions. Hosted Mumbai resources, the real owner identity, contact/advance instructions, final policies, backup/failover review and explicit launch approvals remain required before real orders. See BACKEND-MILESTONE.md for setup and verification; a payment gateway is not required for the COD plan.
