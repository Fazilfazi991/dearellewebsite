# Public Vercel release — 1 November 2026

The owner explicitly authorized public production deployment, creation of the selected owner login, and moving `dearelle.in` / `www.dearelle.in` from project `dearelle` to `dearellewebsite`. No paid upgrade or payment gateway is authorized. Customer WhatsApp is +91 8086191325.

The public storefront is deployed on https://dearellewebsite.vercel.app . The following release adds live COD support and the customer contact details. Homepage design, hero, photography, prices and colour groups are preserved.

- Casio ₹599, Felix ₹799, bags ₹399; free delivery across India.
- ₹50 advance is deducted from the total; remaining amount is COD. Owner contact and manual advance verification still gate dispatch.
- Live orders have no automatic reservation expiry; the proposed 24-hour live timeout remains unapproved and disabled.
- Production configuration is server-side and isolated from Preview variables. Restricted database access uses verified TLS with the provider root CA. Administrative Auth credentials are never deployed.
- The live migration and selected owner allowlist are installed. Public database intake is still OFF pending owner password/authenticator setup.
- A private owner activation link is generated through Supabase Admin without sending email. It is not committed, logged or included in screenshots. Owner chooses their own password and TOTP.
- Before domain reassignment, retain the old mapping for rollback: both custom names belong to `prj_kotNsfxtCiUDLewsaJH3DEprTBdH`; apex redirects to www with HTTP 308. Target project is `prj_BrLZcJDr9gxf6Rll0jGYI6xI3Zhh`.

Validation: 26 unit/configuration tests and 11 isolated PostgreSQL integration scenarios passed, including closed-intake rejection, real mode, idempotency, ₹50 accounting, live expiry protection and stock release. TypeScript, ESLint and production build passed. No real payment or shipment was initiated.

Remaining release steps: verify new production deployment and mobile checkout, move both custom domains preserving the redirect, complete owner password and TOTP, then verify owner access before opening database intake. Do not describe real ordering as active before that final check.
