# Historical staging handoff — 31 October 2026

Superseded by [PRODUCTION-RELEASE.md](PRODUCTION-RELEASE.md) following the owner’s explicit public-launch and domain-move authorization on 1 November. The status below records the earlier staging milestone.

**NOT READY for live enablement.** The user approved the free Supabase installation and Auth hardening, and those database/schema changes are now applied and verified. The user completed the credential step and authorized private local reuse; the restricted hosted connection now passes the read-only preflight with TLS verification. No real account, invitation, paid upgrade, deployment or production change was made.

## Infrastructure inspected

- Existing protected preview: https://dearellewebsite-fxzspwaps-faziils-projects.vercel.app . It serves baseline `a3b3041`, has no backend environment variables, and is **not a backend-ready staging preview**. Anonymous requests redirect to Vercel authentication.
- Existing Vercel project `dearellewebsite` can isolate staging using protected Preview deployments and environment variables scoped to `codex/secure-commerce-backend`. Production remains on main/`1661027`; dearelle.in is not attached. Current functions use iad1; the prepared preview configuration requests bom1. The candidate pins the tested Node 24 runtime.
- Correct Supabase browser account: organization `dearelleonline`, project `pvdklulichacdvsjfdqz`, Free/Nano, Mumbai `ap-south-1`. After transactional installation: 13 products, 18 SKUs, three units each, 16/16 commerce tables with RLS, zero Auth users and orders. Public signup is disabled. Commerce is absent from exposed API schemas, with automatic table exposure disabled. The restricted app login is enabled and verified through an actual TLS connection. The connected Supabase plugin is a different account and must not mutate this project.
- No paid resources were created or upgraded. The existing Vercel team is Hobby; commercial eligibility requires resolution before expanding hosted use. Do not upgrade the shared team automatically. [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines), [Pro pricing from $20/month plus applicable usage/seats](https://vercel.com/pricing).

## Prepared changes

Reviewed migration/seed hashes, target-pinned preflight, restricted-role synthetic concurrency runner, Preview environment template, Mumbai deployment configuration, invitation/recovery email templates and secure initial-password setup. Password recovery for an enrolled owner still requires their existing authenticator. Setup receipts are signed, short-lived, session-bound and HttpOnly.

Staging rejects customer information outside the exact fictional fixture before an order is stored. Public order intake and live reservation expiry remain OFF in the staging plan. The source branch has an explicit Git auto-deployment hold so preparation can be pushed without deploying an unapproved candidate. No storefront, hero, imagery, catalogue, price or colour changes are included.

## Evidence and limits

- 24 unit/regression/configuration tests passed.
- 10 local PostgreSQL integration scenarios passed, including staging fixture enforcement, concurrency and privacy checks.
- 8 local HTTP owner-setup scenarios passed, including existing-MFA enforcement, token replay rejection and non-owner denial. Synthetic credentials were restored; no email was sent.
- Production build, TypeScript and ESLint passed. Local owner setup was visually inspected at 360, 375, 390 and 414px and desktop, with no mobile horizontal overflow. Evidence is ignored under `.impeccable/review/staging/`.
- Hosted schema/count/grant verification passed through the correct browser account. Advisor Center has no error/warning items and 11 informational index recommendations. Restricted-role impersonation was denied by managed Postgres; no extra membership was granted. Direct-login preflight requires the credential handoff. Concurrency tools remain plan-only. **Hosted COD UAT, hosted concurrency, actual owner activation and hosted backup/restore have not run.** Local evidence is not hosted acceptance evidence.

## Owner and recovery status

The intended owner's address is recorded privately; choosing the address did not authorize an account or invitation. No real owner exists yet. Confirm inbox ownership and protected-preview access before an explicitly authorized invitation. Custom SMTP is not configured, and the dashboard blocks editing the reviewed email templates until it is. No template changes or emails were submitted. Public signup, anonymous login and manual linking are disabled; email confirmation, TOTP, AAL1 timeout and secure password change are enabled. The minimum password policy was configured to 12 characters and email OTP lifetime to 600 seconds. Auth URLs use only the exact stable protected branch callback. The owner sets their own password and TOTP; local fixture credentials must never be reused.

Supabase Free has no automatic backups. Prepare encrypted manual exports and obtain authorization for a separate isolated restore target before a hosted recovery drill. Do not restore over active staging. MFA-loss identity verification and administrative reset require a separately approved process. See [Free-plan backups](https://supabase.com/kb/faqs/platform/free-plan-backups).

## Next approval and remaining work

The SQL-editor installation is recorded by exact hashes; Supabase CLI migration-history reconciliation remains pending administrative access, so do not blindly run db push.

The database/Auth setup and private credential handoff are complete. The restricted login is enabled and its actual read-only connection is verified. No paid upgrade, real owner invitation, public intake or live release is authorized.

Then resolve hosting eligibility, approve Preview-only configuration/deployment, owner invitation and synthetic hosted UAT/recovery at their respective boundaries. Complete the [owner policy checklist](staging/OWNER-APPROVALS.md). Exact setup, synthetic fixture, rollback/recovery and acceptance steps are in the [staging runbook](staging/README.md).

On 1 November, verification found login enabled while the visible draft still assigned the public placeholder. Login was immediately disabled through the role UI and verified OFF, with zero app connections. No password was read from the database or copied. A clearer single-assignment template was prepared; the user must replace only the assignment placeholder with a fresh random 16+ character password containing letters and numbers and submit it themselves. The result grid in the original editor is historical until the corrected script is run.

## Current connection verification — 1 November

The user corrected the password assignment and explicitly authorized reading that existing password from the SQL draft into `.data/staging.env.local` for the approved Supabase connection. No password was printed or committed. Actual restricted-login preflight passed: role, RLS/grants, release gates, synthetic-only records, 18 SKUs, hidden Data API schema, disabled signup and Vercel preview authentication. The dashboard-provided Supabase Root 2021 CA is configured as server-only `DATABASE_CA_CERT`; chain and hostname verification remain enabled. Root fingerprint SHA-256: `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`. Certificate source: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt (linked by the project Database Settings). Earlier credential-boundary notes are historical.

No Vercel credential upload/deployment, owner invitation, hosted test-order writes or paid upgrade was included in this connection check. Those remain pending.

The local production server at http://127.0.0.1:3001 now uses the hosted restricted connection through the private staging file. HTTP verification: inventory 200, all 18 variants have three units, unauthenticated owner orders 401. No order write was performed. Validation: 25 tests, TypeScript, ESLint and production build passed.
