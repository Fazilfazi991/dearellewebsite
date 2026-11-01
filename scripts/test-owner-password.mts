import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import postgres from "postgres";
const raw = readFileSync(".data/supabase-status.env");
const local = parseEnv(
  raw.toString(raw[0] === 255 ? "utf16le" : "utf8").replace(/^\uFEFF/, ""),
);
assert.equal(new URL(local.API_URL).hostname, "127.0.0.1");
const owner = JSON.parse(readFileSync(".data/local-owner.json", "utf8"));
assert.ok(owner.email.endsWith("@example.test"));
const admin = postgres(
  "postgres://postgres:postgres@127.0.0.1:55422/postgres",
  { max: 1 },
);
const base = "http://127.0.0.1:3190",
  password = randomBytes(32).toString("hex");
// This password belongs only to the existing LOCAL fixture database role.
await admin.unsafe(`alter role dearelle_app login password '${password}'`);
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3190",
  ],
  {
    env: {
      ...process.env,
      DATABASE_URL: `postgres://dearelle_app:${password}@127.0.0.1:55422/postgres`,
      SUPABASE_URL: local.API_URL,
      SUPABASE_PUBLISHABLE_KEY: local.ANON_KEY,
      DEPLOYMENT_STAGE: "local",
      VERCEL_ENV: "development",
      VERCEL: "",
      COOKIE_SECURE: "0",
      PUBLIC_ORDER_INTAKE: "0",
      COMMERCE_LIVE_ORDERS: "0",
      COMMERCE_TEST_ORDERS: "1",
      APP_ORIGIN: base,
      RATE_LIMIT_SECRET: randomBytes(32).toString("hex"),
    },
    windowsHide: true,
    stdio: "ignore",
  },
);
const jar = new Map<string, string>();
async function call(path: string, body?: unknown, cookies = jar) {
  const response = await fetch(base + path, {
    method: body ? "POST" : "GET",
    redirect: "manual",
    headers: {
      ...(body ? { "Content-Type": "application/json", Origin: base } : {}),
      Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  for (const value of response.headers.getSetCookie()) {
    assert.match(value, /HttpOnly/i);
    assert.match(value, /SameSite=Strict/i);
    const pair = value.split(";")[0],
      at = pair.indexOf("=");
    jar.set(pair.slice(0, at), pair.slice(at + 1));
  }
  return {
    status: response.status,
    data: response.headers.get("content-type")?.includes("json")
      ? await response.json()
      : null,
  };
}
try {
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(base + "/admin/sign-in")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.equal((await call("/api/admin/orders")).status, 401);
  const login = (email = owner.email, password = owner.password) =>
    call("/api/owner/auth", { action: "login", email, password });
  assert.equal((await login(owner.email, "incorrect-password")).status, 401);
  assert.equal((await login(owner.intruderEmail)).status, 403);
  const success = await login();
  assert.equal(success.status, 200, JSON.stringify(success.data));
  assert.equal(success.data.next, "/admin/orders");
  assert.equal((await call("/api/admin/orders")).status, 200);
  assert.equal(
    (await call("/api/owner/auth", { action: "enroll" })).status,
    422,
  );
  const replay = new Map(jar);
  assert.equal(
    (await call("/api/owner/auth", { action: "logout" })).status,
    200,
  );
  assert.equal(
    (await call("/api/admin/orders", undefined, replay)).status,
    401,
  );
  assert.equal((await login()).status, 200);
  let [session] =
    await admin`select id from commerce.owner_sessions where owner_id=${owner.id} order by created_at desc limit 1`;
  await admin`update commerce.owner_sessions set revoked_at=now() where id=${session.id}`;
  assert.equal((await call("/api/admin/orders")).status, 401);
  assert.equal((await login()).status, 200);
  [session] =
    await admin`select id from commerce.owner_sessions where owner_id=${owner.id} order by created_at desc limit 1`;
  await admin`update commerce.owner_sessions set last_seen=now()-interval '31 minutes' where id=${session.id}`;
  assert.equal((await call("/api/admin/orders")).status, 401);
  await admin`update commerce.owner_sessions set last_seen=now(),created_at=now()-interval '9 hours' where id=${session.id}`;
  assert.equal((await call("/api/admin/orders")).status, 401);
  console.log(
    JSON.stringify({
      localOnly: true,
      passwordLoginWithoutTotp: true,
      wrongPasswordDenied: true,
      nonOwnerDenied: true,
      logoutReplayDenied: true,
      revokedSessionDenied: true,
      idleAndAbsoluteExpiryEnforced: true,
      httpOnlyStrictCookies: true,
    }),
  );
} finally {
  server.kill();
  await admin.end();
}
