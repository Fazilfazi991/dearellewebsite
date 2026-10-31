# Backend verification — 31 October 2026

Local implementation is verified. Public order intake remains OFF. This is not a production launch approval.

| Check | Result |
| --- | --- |
| Next.js production build and TypeScript | Passed |
| ESLint | Passed, no warnings |
| Regression/configuration tests | 19 passed |
| Real PostgreSQL integration scenarios | 9 passed |
| Next.js HTTP + Supabase Auth scenarios | 9 passed |
| Supabase local schema lint | No schema errors |
| Full database backup/isolated restore | Orders, payment counts, inventory, reservations, audit counts and RLS matched |
| Database restart | Persistent data matched; Auth dependency restart was needed to clear stale pooled connections |
| Mobile owner workflow | 360/375/390/414px captured and inspected; no horizontal overflow |
| Desktop owner workflow | 1440px inspected |
| Browser credential scan | No local database URL/password, rate-limit secret or owner fixture password in 19 JavaScript chunks |
| SQLite isolation | Application APIs no longer load the native SQLite adapter |

The database suite replays the migration and catalogue seed into a newly created isolated local database, then drops only that scratch database. It tests ten simultaneous attempts buying three units, eight duplicate requests creating one order, stale retries, exactly-once cancellation, immutable records, correct manual advance/COD/audit, expiry/payment serialization, verified-order protection, private-schema grants/RLS, and approval-gated anonymization preserving financial records. It does not run against a hosted database.

HTTP tests verify missing authentication, wrong password, a non-owner account, disabled public signup, AAL1 denial, TOTP enrollment/verification, HttpOnly Strict cookies, same-origin/body-size controls, authoritative prices, guest isolation, idempotent retry, the full manual fulfilment/payment sequence, 30-minute idle expiry, 8-hour absolute expiry, logout cookie replay denial and durable throttling.

The browser run separately confirmed the mobile form rejects ₹49, records an explicitly synthetic ₹50 advance, enables packing, requires tracking, records delivery, automatically switches the payment form to the correct ₹349 COD balance for a ₹399 bag, and records the synthetic settlement. Filtering clears the selected detail; mobile Back to requests restores the list; sign-out returns to sign-in. No money, customer message or real delivery was involved.

Screenshots are retained locally in the ignored `.impeccable/review/backend/` folder: `owner-payment-final-360.jpg`, `owner-payment-final-375.jpg`, `owner-payment-final-390.jpg`, `owner-payment-final-414.jpg`, `owner-responsive-contact-sheet.jpg`, `owner-mobile-preview.jpg`, `owner-desktop-final.jpg`, and `owner-sign-in-final-375.jpg`. The final auth-cookie namespace/HTTPS hardening was then rebuilt and the complete HTTP/auth suite passed again.

Confirmed catalogue, variant photos, prices, hero, curved category banners, cart and shopping navigation were preserved. Public return copy was corrected as requested so unpacking-video guidance does not exclude statutory consumer rights. Test inventory was restored to three per SKU after verification with an append-only audit adjustment. Synthetic financial/order history remains intact.

No hosted resource, production migration, payment gateway, real owner identity or dearelle.in deployment was created or modified. Local PostgreSQL and Auth are the only running backend services for this preview. Local fixture credentials and TOTP setup are in ignored `.data/local-owner.json` / `.data/local-owner-mfa.json`; they must never be reused for a real owner.

Before real orders: obtain approval for an isolated protected Mumbai Supabase/Vercel staging environment and costs; provision the real owner with TOTP; apply reviewed migrations/seed using administrative credentials and provision the restricted runtime role; configure HTTPS/origin/deployment protection and server secrets; approve contact/advance instructions, return window, cancellation/refund handling, invoice requirements and retention; approve the proposed 24-hour live reservation timeout; verify hosted backup/failover and owner recovery; review abuse monitoring and courier operating details. Public intake requires a separate reviewed live-enablement release because this schema and catalogue deliberately permit test orders only.
