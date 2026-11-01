# Public Vercel release — 1 November 2026

The owner explicitly authorized public production deployment, creation of the selected owner login, and moving `dearelle.in` / `www.dearelle.in` from project `dearelle` to `dearellewebsite`. No paid upgrade or payment gateway is authorized. Customer WhatsApp is +91 8086191325.

The public store is live at https://www.dearelle.in and https://dearellewebsite.vercel.app . https://dearelle.in redirects to www with HTTP 308. Live COD ordering and customer contact details are enabled. Homepage design, hero, photography, prices and colour groups are preserved.

- Casio ₹599, Felix ₹799, bags ₹399; free delivery across India.
- ₹50 advance is deducted from the total; remaining amount is COD. Owner contact and manual advance verification still gate dispatch.
- Live orders have no automatic reservation expiry; the proposed 24-hour live timeout remains unapproved and disabled.
- Production configuration is server-side and isolated from Preview variables. Restricted database access uses verified TLS with the provider root CA. Administrative Auth credentials are never deployed.
- The live migration and selected owner allowlist are installed. Public database intake is ON after verifying the owner’s confirmed Auth account, verified TOTP factor and active server-side owner session.
- A private owner activation link is generated through Supabase Admin without sending email. It is not committed, logged or included in screenshots. Owner chooses their own password and TOTP.
- Before domain reassignment, retain the old mapping for rollback: both custom names belong to `prj_kotNsfxtCiUDLewsaJH3DEprTBdH`; apex redirects to www with HTTP 308. Target project is `prj_BrLZcJDr9gxf6Rll0jGYI6xI3Zhh`.

Validation: 26 unit/configuration tests and 11 isolated PostgreSQL integration scenarios passed, including closed-intake rejection, real mode, idempotency, ₹50 accounting, live expiry protection and stock release. TypeScript, ESLint and production build passed. No real payment or shipment was initiated.

Completed: production deployment in bom1; both custom domains moved and HTTPS/redirect checked; owner password and TOTP completed by the owner; database intake enabled with an audit record. The old project remains available at its Vercel address; no DNS nameservers or mail records were changed.

Live smoke check: bag quote ₹399 / ₹50 advance / ₹349 COD; order API 201; private confirmation 200; another browser without its cookie received 404. The clearly labelled launch check was immediately cancelled and audited, restoring bag stock to three with zero reserved. No payment or delivery was initiated. One cancelled launch-check record remains for audit integrity.

An AES-256-GCM encrypted commerce backup is stored privately under `.data/backups/`. Decryption and restoration into a separate local Postgres database verified all 16 tables by counts and semantic checksums, with 16 RLS-enabled tables. Supabase Auth/MFA restoration and a separate hosted recovery drill are NOT verified. This is a local manual backup, not an automatic hosted backup service. Keys and data remain out of Git.

Owner dashboard: https://www.dearelle.in/admin/orders . Temporary administrative provisioning credentials and consumed activation links were removed locally after setup. No paid plan change was made; the owner is handling the Vercel plan separately.

For recovery, force database intake OFF before connecting a restored database to an app, then re-verify Auth/MFA and owner access before reopening. Keep the backup encryption key in owner-controlled secure storage. The former staging database is now production; the staging concurrency runner is blocked from writing to it.
