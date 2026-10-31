# Hosted staging handoff — 31 October 2026

**NOT READY for live enablement.** Local preparation is complete; the hosted installation, owner invitation and hosted acceptance tests await explicit authorization. No hosted migration, real account, invitation, paid upgrade or production change was made.

## Infrastructure inspected

- Existing protected preview: https://dearellewebsite-fxzspwaps-faziils-projects.vercel.app . It serves baseline `a3b3041`, has no backend environment variables, and is **not a backend-ready staging preview**. Anonymous requests redirect to Vercel authentication.
- Existing Vercel project `dearellewebsite` can isolate staging using protected Preview deployments and environment variables scoped to `codex/secure-commerce-backend`. Production remains on main/`1661027`; dearelle.in is not attached. Current functions use iad1; the prepared preview configuration requests bom1. The candidate pins the tested Node 24 runtime.
- Correct Supabase browser account: organization `dearelleonline`, project `pvdklulichacdvsjfdqz`, Free/Nano, Mumbai `ap-south-1`. A read-only aggregate query found zero Auth users, zero public tables, no commerce schema and no runtime role. Public signup is currently enabled and must be disabled before onboarding. The connected Supabase plugin is a different account and must not mutate this project.
- No paid resources were created or upgraded. The existing Vercel team is Hobby; commercial eligibility requires resolution before expanding hosted use. Do not upgrade the shared team automatically. [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines), [Pro pricing from $20/month plus applicable usage/seats](https://vercel.com/pricing).

## Prepared changes

Reviewed migration/seed hashes, target-pinned preflight, restricted-role synthetic concurrency runner, Preview environment template, Mumbai deployment configuration, invitation/recovery email templates and secure initial-password setup. Password recovery for an enrolled owner still requires their existing authenticator. Setup receipts are signed, short-lived, session-bound and HttpOnly.

Staging rejects customer information outside the exact fictional fixture before an order is stored. Public order intake and live reservation expiry remain OFF in the staging plan. The source branch has an explicit Git auto-deployment hold so preparation can be pushed without deploying an unapproved candidate. No storefront, hero, imagery, catalogue, price or colour changes are included.

## Evidence and limits

- 24 unit/regression/configuration tests passed.
- 10 local PostgreSQL integration scenarios passed, including staging fixture enforcement, concurrency and privacy checks.
- 8 local HTTP owner-setup scenarios passed, including existing-MFA enforcement, token replay rejection and non-owner denial. Synthetic credentials were restored; no email was sent.
- Production build, TypeScript and ESLint passed. Local owner setup was visually inspected at 360, 375, 390 and 414px and desktop, with no mobile horizontal overflow. Evidence is ignored under `.impeccable/review/staging/`.
- Hosted preflight and concurrency tools were exercised in plan-only mode. **Hosted COD UAT, hosted concurrency, actual owner activation and hosted backup/restore have not run.** Local evidence is not hosted acceptance evidence.

## Owner and recovery status

The intended owner's address is recorded privately; choosing the address did not authorize an account or invitation. No real owner exists yet. Confirm inbox ownership, protected-preview access and SMTP delivery readiness before an explicitly authorized invitation. The owner sets their own password and TOTP; local fixture credentials must never be reused.

Supabase Free has no automatic backups. Prepare encrypted manual exports and obtain authorization for a separate isolated restore target before a hosted recovery drill. Do not restore over active staging. MFA-loss identity verification and administrative reset require a separately approved process. See [Free-plan backups](https://supabase.com/kb/faqs/platform/free-plan-backups).

## Next approval and remaining work

First authorize the reviewed migration and synthetic catalogue seed in the existing free Mumbai project, restricted runtime access and Auth hardening. No paid upgrade, real owner invitation, public intake or live release is included in that request.

Then resolve hosting eligibility, approve Preview-only configuration/deployment, owner invitation and synthetic hosted UAT/recovery at their respective boundaries. Complete the [owner policy checklist](staging/OWNER-APPROVALS.md). Exact setup, synthetic fixture, rollback/recovery and acceptance steps are in the [staging runbook](staging/README.md).
