import { test } from "node:test";
import assert from "node:assert/strict";
import plan from "../staging/plan.json";
import { stagingEnvironmentErrors } from "../staging/guards";
const valid = {
  DEPLOYMENT_STAGE: "staging",
  STAGING_SYNTHETIC_ONLY: "1",
  PUBLIC_ORDER_INTAKE: "0",
  COMMERCE_TEST_ORDERS: "1",
  COOKIE_SECURE: "1",
  APP_ORIGIN: plan.appOrigin,
  SUPABASE_URL: `https://${plan.supabaseProjectRef}.supabase.co`,
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_not_a_real_key",
  RATE_LIMIT_SECRET: "synthetic-only-secret".repeat(4),
  DATABASE_URL: `postgresql://dearelle_app.${plan.supabaseProjectRef}:${"a".repeat(32)}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`,
};
test("staging preflight accepts only the pinned isolated preview configuration", () => {
  assert.deepEqual(stagingEnvironmentErrors(valid), []);
  for (const override of [
    { PUBLIC_ORDER_INTAKE: "1" },
    { STAGING_SYNTHETIC_ONLY: "0" },
    { DEPLOYMENT_STAGE: "production" },
    { VERCEL_ENV: "production" },
    { COOKIE_SECURE: "0" },
    { APP_ORIGIN: "https://dearelle.in" },
    { SUPABASE_URL: "https://unrelated.supabase.co" },
    { DATABASE_URL: "postgres://postgres:password@127.0.0.1/postgres" },
    { SERVICE_ROLE_KEY: "not-allowed" },
    { RATE_LIMIT_SECRET: "short" },
  ])
    assert.ok(stagingEnvironmentErrors({ ...valid, ...override }).length > 0);
});

test("staging accepts the approved 16-character database password minimum", () => {
  const url = new URL(valid.DATABASE_URL);
  url.password = "SyntheticTest12";
  assert.ok(stagingEnvironmentErrors({ ...valid, DATABASE_URL: url.toString() }).length > 0);
  url.password = "SyntheticTest123";
  assert.deepEqual(stagingEnvironmentErrors({ ...valid, DATABASE_URL: url.toString() }), []);
});
