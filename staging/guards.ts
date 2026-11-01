import plan from "./plan.json";
export function stagingEnvironmentErrors(
  env: Record<string, string | undefined>,
): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries({
    DEPLOYMENT_STAGE: "staging",
    STAGING_SYNTHETIC_ONLY: "1",
    PUBLIC_ORDER_INTAKE: "0",
    COMMERCE_TEST_ORDERS: "1",
    COOKIE_SECURE: "1",
    APP_ORIGIN: plan.appOrigin,
    SUPABASE_URL: `https://${plan.supabaseProjectRef}.supabase.co`,
  }))
    if (env[key] !== value)
      errors.push(`${key} must match the approved staging plan.`);
  if ((env.RATE_LIMIT_SECRET?.length ?? 0) < 32)
    errors.push("A fresh server-only RATE_LIMIT_SECRET is required.");
  if (!env.SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_"))
    errors.push("A project publishable key is required.");
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "preview")
    errors.push("Only the Vercel Preview environment is permitted.");
  for (const key of [
    "OWNER_ACCESS_TOKEN",
    "SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
  ])
    if (env[key])
      errors.push(
        `${key} must not be present in application runtime configuration.`,
      );
  try {
    const db = new URL(env.DATABASE_URL ?? "");
    const pooler =
      db.hostname.endsWith(".pooler.supabase.com") &&
      db.username === `dearelle_app.${plan.supabaseProjectRef}` &&
      db.port === "6543";
    const direct =
      db.hostname === `db.${plan.supabaseProjectRef}.supabase.co` &&
      db.username === "dearelle_app" &&
      (!db.port || db.port === "5432");
    if (
      !["postgres:", "postgresql:"].includes(db.protocol) ||
      !(pooler || direct) ||
      db.pathname !== "/postgres" ||
      decodeURIComponent(db.password).length < 16 ||
      db.searchParams.get("sslmode") === "disable"
    )
      errors.push(
        "DATABASE_URL must use the approved project, restricted role and TLS.",
      );
  } catch {
    errors.push("A valid restricted DATABASE_URL is required.");
  }
  return errors;
}
