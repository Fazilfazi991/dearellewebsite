import { test } from "node:test";
import assert from "node:assert/strict";
import { database, testOrdersEnabled } from "../lib/database";
function restore(snapshot: NodeJS.ProcessEnv) {
  for (const key of [
    "DATABASE_URL",
    "DEPLOYMENT_STAGE",
    "PUBLIC_ORDER_INTAKE",
    "COMMERCE_TEST_ORDERS",
    "VERCEL_ENV",
  ]) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
}
test("test recording is closed under production, public-intake flags or missing configuration", () => {
  const saved = { ...process.env };
  try {
    Object.assign(process.env, {
      DATABASE_URL: "postgres://dearelle_app:unused@127.0.0.1/local",
      DEPLOYMENT_STAGE: "local",
      PUBLIC_ORDER_INTAKE: "0",
      COMMERCE_TEST_ORDERS: "1",
      VERCEL_ENV: "development",
    });
    assert.equal(testOrdersEnabled(), true);
    process.env.PUBLIC_ORDER_INTAKE = "1";
    assert.equal(testOrdersEnabled(), false);
    process.env.PUBLIC_ORDER_INTAKE = "0";
    process.env.VERCEL_ENV = "production";
    assert.equal(testOrdersEnabled(), false);
    process.env.VERCEL_ENV = "preview";
    process.env.DEPLOYMENT_STAGE = "production";
    assert.equal(testOrdersEnabled(), false);
    process.env.DEPLOYMENT_STAGE = "staging";
    delete process.env.DATABASE_URL;
    assert.equal(testOrdersEnabled(), false);
  } finally {
    restore(saved);
  }
});
test("runtime refuses missing credentials and an administrative database login", () => {
  const saved = { ...process.env };
  try {
    delete process.env.DATABASE_URL;
    assert.throws(() => database(), /not configured/);
    process.env.DATABASE_URL = "postgres://postgres:unused@127.0.0.1/local";
    assert.throws(() => database(), /restricted commerce database role/);
  } finally {
    restore(saved);
  }
});
