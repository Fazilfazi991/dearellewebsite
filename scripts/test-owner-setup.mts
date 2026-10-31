import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { createHmac, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
const env = parseEnv(readFileSync(".env.local", "utf8"));
assert.equal(env.DEPLOYMENT_STAGE, "local");
assert.equal(new URL(env.SUPABASE_URL).hostname, "127.0.0.1");
const raw = readFileSync(".data/supabase-status.env"),
  status = parseEnv(
    raw.toString(raw[0] === 255 ? "utf16le" : "utf8").replace(/^\uFEFF/, ""),
  );
const owner = JSON.parse(readFileSync(".data/local-owner.json", "utf8")),
  mfa = JSON.parse(readFileSync(".data/local-owner-mfa.json", "utf8"));
const auth = createClient(env.SUPABASE_URL, status.SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }),
  sql = postgres("postgres://postgres:postgres@127.0.0.1:55422/postgres", {
    max: 1,
  });
const jar = new Map<string, string>(),
  base = "http://127.0.0.1:3001";
let nonowner: string | undefined,
  changed = false;
let passed = 0;
async function call(body: unknown, path = "/api/owner/setup") {
  const r = await fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
    },
    body: JSON.stringify(body),
  });
  for (const value of r.headers.getSetCookie()) {
    assert.match(value, /HttpOnly/i);
    assert.match(value, /SameSite=Strict/i);
    const first = value.split(";")[0],
      at = first.indexOf("=");
    jar.set(first.slice(0, at), first.slice(at + 1));
  }
  return { status: r.status, data: await r.json() };
}
function code() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bits = [...mfa.secret]
      .map((c) => alphabet.indexOf(c).toString(2).padStart(5, "0"))
      .join(""),
    key = Buffer.from((bits.match(/.{8}/g) ?? []).map((x) => parseInt(x, 2))),
    counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest(),
    offset = digest[19] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, "0");
}
function pass(name: string) {
  passed++;
  console.log("PASS " + name);
}
try {
  const bucket = createHmac("sha256", env.RATE_LIMIT_SECRET)
    .update("owner-setup:local")
    .digest("hex");
  await sql`delete from commerce.rate_limits where key=${bucket}`;
  assert.equal(
    (await call({ action: "finish", password: "NotAnActualPassword123" }))
      .status,
    401,
  );
  assert.equal(
    (
      await call({
        action: "exchange",
        type: "invite",
        tokenHash: "0".repeat(64),
      })
    ).status,
    401,
  );
  pass("missing setup session and invalid link denied");
  const { data: link, error } = await auth.auth.admin.generateLink({
    type: "recovery",
    email: owner.email,
  });
  assert.ifError(error);
  assert.ok(link.properties.hashed_token);
  const tokenHash = link.properties.hashed_token;
  const exchange = await call({
    action: "exchange",
    type: "recovery",
    tokenHash,
  });
  assert.equal(exchange.status, 200, JSON.stringify(exchange.data));
  assert.equal(exchange.data.mfaRequired, true);
  assert.ok(jar.has("dearelle-owner-setup"));
  pass(
    "authorized recovery link creates HttpOnly owner/session-bound setup receipt",
  );
  const denied = await fetch(base + "/api/admin/orders", {
    headers: { Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
  });
  assert.equal(denied.status, 401);
  pass("email recovery alone cannot open customer orders");
  const password = randomBytes(24).toString("base64url") + "aA1!";
  assert.equal((await call({ action: "finish", password })).status, 422);
  assert.equal(
    (await call({ action: "finish", password, code: "000000" })).status,
    401,
  );
  pass("existing authenticator cannot be bypassed during password recovery");
  changed = true;
  const finish = await call({ action: "finish", password, code: code() });
  assert.equal(finish.status, 200, JSON.stringify(finish.data));
  changed = true;
  assert.equal(jar.get("dearelle-owner-setup"), "");
  pass("valid MFA saves synthetic password and clears setup receipt");
  const replay = await call({
    action: "exchange",
    type: "recovery",
    tokenHash,
  });
  assert.equal(replay.status, 401);
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  assert.ok(
    (
      await client.auth.signInWithPassword({
        email: owner.email,
        password: owner.password,
      })
    ).error,
  );
  const login = await client.auth.signInWithPassword({
    email: owner.email,
    password,
  });
  assert.ifError(login.error);
  await client.auth.signOut();
  pass("setup token is single-use and only the new synthetic password works");
  const invite = await auth.auth.admin.generateLink({
    type: "invite",
    email: "nonowner-onboarding-" + Date.now() + "@example.test",
  });
  assert.ifError(invite.error);
  nonowner = invite.data.user.id;
  const rejected = await call({
    action: "exchange",
    type: "invite",
    tokenHash: invite.data.properties.hashed_token,
  });
  assert.equal(rejected.status, 403, JSON.stringify(rejected.data));
  pass("a genuine invitation token for a non-owner grants no owner access");
  const [audit] =
    await sql`select count(*)::int as n from commerce.owner_audit where actor=${owner.id} and action='owner_password_recovered'`;
  assert.ok(audit.n > 0);
  pass("owner setup audit recorded");
  writeFileSync(
    ".data/owner-setup-verification.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        passed,
        syntheticOnly: true,
        emailsSent: false,
      },
      null,
      2,
    ),
  );
  console.log(`${passed} local owner setup scenarios passed; no emails sent.`);
} finally {
  if (changed) {
    const { error } = await auth.auth.admin.updateUserById(owner.id, {
      password: owner.password,
    });
    if (error) throw new Error("Restore of synthetic fixture password failed.");
  }
  if (nonowner) await auth.auth.admin.deleteUser(nonowner);
  await sql.end();
}
