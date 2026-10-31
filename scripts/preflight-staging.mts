import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { createHash } from "node:crypto";
import postgres from "postgres";
import plan from "../staging/plan.json";
import { stagingEnvironmentErrors } from "../staging/guards";
const args = process.argv.slice(2),
  file = args[0];
if (!file) {
  const migration = readFileSync(
    "supabase/migrations/20261031090525_commerce_foundation.sql",
  );
  console.log(
    JSON.stringify(
      {
        mode: "plan-only",
        ...plan,
        migrationSha256: createHash("sha256").update(migration).digest("hex"),
        writesPerformed: false,
        requiredSecrets: [
          "DATABASE_URL",
          "SUPABASE_PUBLISHABLE_KEY",
          "RATE_LIMIT_SECRET",
        ],
        next: "Supply a private staging env file for validation. --inspect performs read-only checks only.",
      },
      null,
      2,
    ),
  );
} else {
  const env = parseEnv(readFileSync(file, "utf8"));
  const errors = stagingEnvironmentErrors(env);
  if (errors.length) {
    errors.forEach((e) => console.error(e));
    process.exitCode = 1;
  } else {
    console.log(
      "PASS staging environment shape: isolated project/branch, public intake OFF, secure cookies and restricted credentials.",
    );
    if (args.includes("--inspect")) {
      const sql = postgres(env.DATABASE_URL, {
        ssl: { rejectUnauthorized: true },
        prepare: false,
        max: 1,
      });
      let stage = "database connection";
      try {
        await sql.begin("read only", async (tx) => {
          stage = "restricted role";
          const [role] = await tx.unsafe(
            "select current_user as name,rolsuper,rolbypassrls from pg_roles where rolname=current_user",
          );
          if (
            role.name !== "dearelle_app" ||
            role.rolsuper ||
            role.rolbypassrls
          )
            throw new Error();
          stage = "release gates";
          const [settings] = await tx.unsafe(
            "select public_intake,live_expiry_approved,retention_approved from commerce.settings",
          );
          if (
            settings.public_intake ||
            settings.live_expiry_approved ||
            settings.retention_approved
          )
            throw new Error();
          stage = "RLS and grants";
          const [security] = await tx.unsafe(
            "select (select bool_and(relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='commerce' and relkind='r') as rls,has_schema_privilege('anon','commerce','USAGE') as anon,has_schema_privilege('authenticated','commerce','USAGE') as authenticated,has_table_privilege(current_user,'commerce.owner_accounts','INSERT') as owner_insert,has_table_privilege(current_user,'commerce.settings','UPDATE') as settings_update,has_function_privilege('anon','commerce.auth_session_valid(uuid,uuid)','EXECUTE') as public_function",
          );
          if (
            !security.rls ||
            security.anon ||
            security.authenticated ||
            security.owner_insert ||
            security.settings_update ||
            security.public_function
          )
            throw new Error();
          stage = "catalogue and synthetic data";
          const [counts] = await tx.unsafe(
            "select (select count(*)::int from commerce.skus) as skus,(select count(*)::int from commerce.inventory where on_hand<reserved or reserved<0) as bad_stock,(select count(*)::int from commerce.orders where mode<>'test' or customer->>'email' not like '%@example.test') as unsafe_orders",
          );
          if (counts.skus !== 18 || counts.bad_stock || counts.unsafe_orders)
            throw new Error();
        });
        stage = "public schema exposure";
        const rest = await fetch(
          env.SUPABASE_URL + "/rest/v1/orders?select=id&limit=0",
          {
            headers: {
              apikey: env.SUPABASE_PUBLISHABLE_KEY,
              "Accept-Profile": "commerce",
            },
          },
        );
        if (rest.status !== 406) throw new Error();
        stage = "public registration";
        const auth = await fetch(env.SUPABASE_URL + "/auth/v1/settings", {
          headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY },
        });
        const settings = await auth.json();
        if (!auth.ok || settings.disable_signup !== true) throw new Error();
        stage = "preview protection";
        const preview = await fetch(plan.appOrigin, { redirect: "manual" });
        const location = preview.headers.get("location") ?? "";
        if (!(
          [301, 302, 303, 307, 308].includes(preview.status) &&
          new URL(location, plan.appOrigin).hostname === "vercel.com"
        ))
          throw new Error();
        console.log(
          "PASS read-only hosted preflight: runtime role, RLS/grants, release gates, synthetic records, hidden Data API schema, disabled signup and preview authentication.",
        );
      } catch {
        console.error(
          `FAIL ${stage}. Hosted readiness is NOT VERIFIED; no secret values are printed.`,
        );
        process.exitCode = 1;
      } finally {
        await sql.end();
      }
    }
  }
}
