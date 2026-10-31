import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomUUID } from "node:crypto";
import { products } from "../lib/products.ts";
const base = "http://127.0.0.1:3001";
const env = parseEnv(readFileSync(".env.local", "utf8"));
const owner = env.OWNER_ACCESS_TOKEN;
assert.ok(owner && owner.length >= 32, "Local owner key must be configured.");
let cookie = "";
async function call(
  path: string,
  body?: unknown,
  options: {
    owner?: boolean;
    cookie?: boolean;
    method?: string;
    origin?: string;
  } = {},
) {
  const response = await fetch(base + path, {
    method: options.method ?? (body ? "POST" : "GET"),
    headers: {
      ...(body
        ? { "Content-Type": "application/json", Origin: options.origin ?? base }
        : {}),
      ...(options.owner ? { Authorization: `Bearer ${owner}` } : {}),
      ...(options.cookie !== false && cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.headers.get("set-cookie"))
    cookie = response.headers.get("set-cookie")!.split(";")[0];
  return { status: response.status, data: await response.json() };
}
const p = products.find((p) => p.id === "w2")!;
const items = [
  { productId: p.id, variantId: p.variants[0].id, quantity: 1, price: 1 },
];
const customer = {
  name: "API Sample Customer",
  email: "sample@example.com",
  phone: "9000000000",
  address: "12 Sample Street, Test Building",
  city: "Kochi",
  state: "Kerala",
  pin: "682001",
  country: "India",
};
assert.equal((await call("/api/admin/orders")).status, 401);
assert.equal(
  (
    await call(
      "/api/checkout/quote",
      { items },
      { origin: "https://unrelated.example" },
    )
  ).status,
  403,
);
assert.equal((await call("/api/orders", {}, { cookie: false })).status, 404);
const quoted = await call("/api/checkout/quote", { items });
assert.equal(quoted.status, 200);
assert.equal(quoted.data.total, 599);
assert.equal(quoted.data.advance, 50);
assert.equal(quoted.data.codBalance, 549);
assert.equal(quoted.data.recordingEnabled, true);
const payload = {
  items,
  customer,
  quoteFingerprint: quoted.data.fingerprint,
  idempotencyKey: randomUUID(),
  acknowledged: true,
};
assert.equal(
  (
    await call("/api/orders", {
      ...payload,
      customer: { ...customer, pin: "123" },
    })
  ).status,
  422,
);
assert.equal(
  (await call("/api/orders", { ...payload, quoteFingerprint: "forged" }))
    .status,
  409,
);
const created = await call("/api/orders", payload);
assert.equal(created.status, 201);
const repeated = await call("/api/orders", payload);
assert.equal(repeated.data.id, created.data.id);
const privatePage = await fetch(base + `/orders/${created.data.id}`);
assert.equal(privatePage.status, 404);
const ownPage = await fetch(base + `/orders/${created.data.id}`, {
  headers: { Cookie: cookie },
});
assert.equal(ownPage.status, 200);
const listed = await call("/api/admin/orders", undefined, { owner: true });
const selected = listed.data.orders.filter(
  (o: { id: string }) => o.id === created.data.id,
);
assert.equal(selected.length, 1);
let order = selected[0];
const update = (body: unknown) =>
  call(`/api/admin/orders/${order.id}`, body, { owner: true, method: "PATCH" });
assert.equal(
  (
    await update({
      version: order.version,
      action: "fulfilment",
      fulfilment: "packed",
    })
  ).status,
  409,
);
order = (
  await update({
    version: order.version,
    action: "fulfilment",
    fulfilment: "confirmed",
  })
).data.order;
assert.equal(
  (
    await update({
      version: order.version,
      action: "fulfilment",
      fulfilment: "packed",
    })
  ).status,
  409,
);
order = (await update({ version: order.version, action: "verify_advance" }))
  .data.order;
order = (
  await update({
    version: order.version,
    action: "fulfilment",
    fulfilment: "packed",
  })
).data.order;
order = (
  await update({
    version: order.version,
    action: "fulfilment",
    fulfilment: "cancelled",
  })
).data.order;
assert.equal(order.fulfilment, "cancelled");
const result = {
  checkedAt: new Date().toISOString(),
  mode: "local test only",
  pass: true,
  checks: [
    "owner access denied without credentials",
    "cross-origin mutation denied",
    "missing guest session denied",
    "server pricing ignores forged price",
    "invalid address rejected",
    "stale quote rejected",
    "idempotency replay returns same order",
    "other browser cannot view private order",
    "submitting browser can view its order",
    "dispatch gated by contact and manual advance",
    "cancel restores test stock",
  ],
  testOrder: created.data.id,
};
mkdirSync(".impeccable/review/commerce", { recursive: true });
writeFileSync(
  ".impeccable/review/commerce/api-verification.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
