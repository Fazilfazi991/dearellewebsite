import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomUUID, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { products } from "../lib/products";
const base = "http://127.0.0.1:3001",
  env = parseEnv(readFileSync(".env.local", "utf8")),
  owner = JSON.parse(readFileSync(".data/local-owner.json", "utf8"));
assert.equal(env.DEPLOYMENT_STAGE, "local");
assert.equal(new URL(env.DATABASE_URL).hostname, "127.0.0.1");
const admin = postgres(
  "postgres://postgres:postgres@127.0.0.1:55422/postgres",
  { max: 1 },
);
export class Browser {
  cookies = new Map<string, string>();
  async call(path: string, body?: unknown, method?: string, origin = base) {
    const response = await fetch(base + path, {
      method: method ?? (body ? "POST" : "GET"),
      redirect: "manual",
      headers: {
        ...(body ? { "Content-Type": "application/json", Origin: origin } : {}),
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0],
        index = pair.indexOf("=");
      this.cookies.set(pair.slice(0, index), pair.slice(index + 1));
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Strict/i);
    }
    const data = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : await response.text();
    return { status: response.status, data, response };
  }
}
export function totp(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.toUpperCase().replace(/=+$/, ""))
    bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(
    (bits.match(/.{8}/g) ?? []).map((x) => parseInt(x, 2)),
  );
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[19] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, "0");
}
let passed = 0;
const scenarios: string[] = [];
async function test(name: string, fn: () => Promise<void>) {
  await fn();
  passed++;
  scenarios.push(name);
  console.log("PASS " + name);
}
let secret = "",
  factorId = "";
const browser = new Browser(),
  guest = new Browser();
async function auth(body: unknown) {
  return browser.call("/api/owner/auth", body);
}
try {
  // Isolated loopback fixtures: reset only their synthetic rate buckets between test runs.
  for (const scope of [
    "owner:login:local",
    "owner:mfa:local",
    "order:ip:local",
  ]) {
    const key = createHmac("sha256", env.RATE_LIMIT_SECRET)
      .update(scope)
      .digest("hex");
    await admin`delete from commerce.rate_limits where key=${key}`;
  }
  await test("private owner page/API denied without session", async () => {
    assert.equal((await browser.call("/api/admin/orders")).status, 401);
    assert.equal((await browser.call("/admin/orders")).status, 307);
  });
  await test("wrong credentials, other user and public signup denied", async () => {
    assert.equal(
      (
        await auth({
          action: "login",
          email: owner.email,
          password: "wrong-password",
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await auth({
          action: "login",
          email: owner.intruderEmail,
          password: owner.password,
        })
      ).status,
      403,
    );
    const client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false } },
    );
    assert.ok(
      (
        await client.auth.signUp({
          email: "signup-denied@example.test",
          password: owner.password,
        })
      ).error,
    );
  });
  await test("password alone denied; TOTP required; cookies HttpOnly and Strict", async () => {
    const login = await auth({
      action: "login",
      email: owner.email,
      password: owner.password,
    });
    assert.equal(login.status, 200, JSON.stringify(login.data));
    assert.equal((await browser.call("/api/admin/orders")).status, 401);
    if (existsSync(".data/local-owner-mfa.json"))
      ({ secret, factorId } = JSON.parse(
        readFileSync(".data/local-owner-mfa.json", "utf8"),
      ));
    else {
      const enrollment = await auth({ action: "enroll" });
      assert.equal(enrollment.status, 200, JSON.stringify(enrollment.data));
      secret = enrollment.data.secret;
      factorId = enrollment.data.factorId;
      writeFileSync(
        ".data/local-owner-mfa.json",
        JSON.stringify({ factorId, secret }),
      );
    }
    assert.equal(
      (await auth({ action: "verify", factorId, code: "000000" })).status,
      401,
    );
    const verify = await auth({
      action: "verify",
      factorId,
      code: totp(secret),
    });
    assert.equal(verify.status, 200, JSON.stringify(verify.data));
    assert.equal((await browser.call("/api/admin/orders")).status, 200);
  });
  let id: string;
  await test("quote authority, CSRF/body caps, safe retry and guest isolation", async () => {
    const p = products.find((p) => p.id === "w2")!,
      items = [
        { productId: p.id, variantId: p.variants[0].id, quantity: 1, price: 1 },
      ];
    assert.equal(
      (
        await guest.call(
          "/api/checkout/quote",
          { items },
          undefined,
          "https://other.example",
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await guest.call("/api/checkout/quote", {
          items,
          large: "x".repeat(17000),
        })
      ).status,
      413,
    );
    const quoted = await guest.call("/api/checkout/quote", { items });
    assert.equal(quoted.status, 200, JSON.stringify(quoted.data));
    assert.equal(quoted.data.total, 599);
    assert.equal(quoted.data.codBalance, 549);
    const body = {
      items,
      customer: {
        name: "HTTP Synthetic Customer",
        email: "http@example.test",
        phone: "9876543210",
        address: "15 Synthetic Road",
        city: "Mumbai",
        state: "Maharashtra",
        pin: "400001",
        country: "India",
      },
      quoteFingerprint: quoted.data.fingerprint,
      idempotencyKey: randomUUID(),
      acknowledged: true,
    };
    const created = await guest.call("/api/orders", body);
    assert.equal(created.status, 201, JSON.stringify(created.data));
    id = created.data.id;
    assert.equal((await guest.call("/api/orders", body)).data.id, id);
    assert.equal((await guest.call(`/orders/${id}`)).status, 200);
    assert.equal((await new Browser().call(`/orders/${id}`)).status, 404);
  });
  await test("manual advance and COD amounts, full fulfilment and audit", async () => {
    let result = await browser.call("/api/admin/orders"),
      o = result.data.orders.find((o: { id: string }) => o.id === id);
    const patch = (body: unknown) =>
      browser.call(`/api/admin/orders/${id}`, body, "PATCH");
    assert.equal(
      (
        await patch({
          action: "verify_advance",
          version: o.version,
          amount: 50,
          reference: randomUUID(),
          note: "Synthetic reference",
        })
      ).status,
      409,
    );
    result = await patch({
      action: "fulfilment",
      fulfilment: "confirmed",
      version: o.version,
    });
    assert.equal(result.status, 200, JSON.stringify(result.data));
    o = result.data.order;
    assert.equal(
      (
        await patch({
          action: "verify_advance",
          version: o.version,
          amount: 51,
          reference: randomUUID(),
          note: "Wrong amount",
        })
      ).status,
      422,
    );
    result = await patch({
      action: "verify_advance",
      version: o.version,
      amount: 50,
      reference: randomUUID(),
      note: "Synthetic advance checked",
    });
    assert.equal(result.status, 200, JSON.stringify(result.data));
    o = result.data.order;
    for (const fulfilment of ["packed", "shipped", "delivered"]) {
      result = await patch({
        action: "fulfilment",
        fulfilment,
        version: o.version,
        tracking: "TEST-HTTP-TRACKING",
      });
      assert.equal(result.status, 200, JSON.stringify(result.data));
      o = result.data.order;
    }
    result = await patch({
      action: "collect_cod",
      version: o.version,
      amount: 549,
      reference: randomUUID(),
      note: "Synthetic courier settlement",
    });
    assert.equal(result.status, 200, JSON.stringify(result.data));
    assert.equal(result.data.order.payment, "cod_collected");
    assert.equal(result.data.order.payments.length, 2);
  });
  await test("idle session expiry enforced before data access", async () => {
    await admin`update commerce.owner_sessions set last_seen=now()-interval '31 minutes' where owner_id=${owner.id}`;
    assert.equal((await browser.call("/api/admin/orders")).status, 401);
  });
  await test("absolute session expiry enforced even after recent activity", async () => {
    await admin`update commerce.owner_sessions set last_seen=now(),created_at=now()-interval '9 hours' where owner_id=${owner.id}`;
    assert.equal((await browser.call("/api/admin/orders")).status, 401);
  });
  await test("fresh login then logout blocks replayed MFA cookies", async () => {
    assert.equal(
      (
        await auth({
          action: "login",
          email: owner.email,
          password: owner.password,
        })
      ).status,
      200,
    );
    const verified = await auth({
      action: "verify",
      factorId,
      code: totp(secret),
    });
    assert.equal(verified.status, 200, JSON.stringify(verified.data));
    const replay = new Browser();
    replay.cookies = new Map(browser.cookies);
    assert.equal((await auth({ action: "logout" })).status, 200);
    assert.equal((await replay.call("/api/admin/orders")).status, 401);
  });
  await test("durable throttling persists across requests", async () => {
    Object.assign(process.env, env);
    const { durableRateLimit } = await import("../lib/rate-limit");
    const key = randomUUID();
    await durableRateLimit(key, 1);
    await assert.rejects(durableRateLimit(key, 1));
    const { database } = await import("../lib/database");
    await database().end();
  });
  writeFileSync(
    ".data/http-verification.json",
    JSON.stringify(
      { at: new Date().toISOString(), passed, scenarios },
      null,
      2,
    ),
  );
  console.log(`${passed} HTTP/auth scenarios passed.`);
} finally {
  await admin.end();
}
