import { syntheticStagingCustomer } from "../lib/staging-safety";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import postgres from "postgres";
import { PostgresOrderRepository } from "../lib/postgres-order-repository";
import { products } from "../lib/products";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
Object.assign(process.env, env);
const root = postgres("postgres://postgres:postgres@127.0.0.1:55422/postgres", {
  max: 1,
});
const dbName = "dearelle_test_" + randomUUID().replaceAll("-", "");
await root.unsafe(`create database ${dbName}`);
const admin = postgres(
  `postgres://postgres:postgres@127.0.0.1:55422/${dbName}`,
  { max: 1 },
);
await admin.unsafe(
  "create schema auth; create table auth.users(id uuid primary key,email text); create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz)",
);
await admin.unsafe(
  readFileSync(
    "supabase/migrations/20261031090525_commerce_foundation.sql",
    "utf8",
  ),
);
await admin.unsafe(readFileSync("supabase/seed.sql", "utf8"));
const runtimeUrl = new URL(env.DATABASE_URL);
runtimeUrl.pathname = "/" + dbName;
const sql = postgres(runtimeUrl.toString(), { max: 10 });
const repo = new PostgresOrderRepository(sql);
const customer = {
  name: "Synthetic Database Test",
  email: "synthetic@example.test",
  phone: "9876543210",
  address: "12 Test Street",
  city: "Mumbai",
  state: "Maharashtra",
  pin: "400001",
  country: "India",
};
const guest = () => createHash("sha256").update(randomUUID()).digest("hex");
const item = (quantity = 1) => [
  {
    productId: products[0].id,
    variantId: products[0].variants[0].id,
    quantity,
  },
];
let owner: string;
async function make(qty = 1) {
  const g = guest(),
    items = item(qty),
    quote = await repo.quote(items);
  return {
    g,
    input: {
      items,
      customer,
      quoteFingerprint: quote.fingerprint,
      idempotencyKey: randomUUID(),
      acknowledged: true,
    },
  };
}
let passed = 0;
async function test(name: string, fn: () => Promise<void>) {
  await fn();
  passed++;
  console.log(`PASS ${name}`);
}
try {
  const [user] =
    await admin`insert into auth.users(id,email) values(${randomUUID()},'db-fixture@example.test') returning id`;
  owner = user.id;
  await admin`insert into commerce.owner_accounts(id) values(${owner}) on conflict(singleton) do nothing`;
  const [o] = await admin`select id from commerce.owner_accounts`;
  owner = o.id;
  await test("18 real SKUs, prices and exact variant groups preserved", async () => {
    const inventory = await repo.inventory();
    assert.equal(
      inventory.length,
      products.reduce((n, p) => n + p.variants.length, 0),
    );
    for (const p of products)
      for (const v of p.variants) {
        const q = await repo.quote([
          { productId: p.id, variantId: v.id, quantity: 1 },
        ]);
        assert.equal(
          q.total,
          p.brand === "Felix" ? 799 : p.brand === "Casio" ? 599 : 399,
        );
        assert.equal(q.codBalance, q.total - 50);
      }
  });
  let lastOrders: Awaited<ReturnType<typeof repo.create>>[] = [];
  await test("10 simultaneous purchases reserve exactly three units", async () => {
    const requests = await Promise.all(
      Array.from({ length: 10 }, () => make()),
    );
    const results = await Promise.allSettled(
      requests.map((r) => repo.create(r.input, r.g)),
    );
    lastOrders = results
      .filter(
        (
          r,
        ): r is PromiseFulfilledResult<
          Awaited<ReturnType<typeof repo.create>>
        > => r.status === "fulfilled",
      )
      .map((r) => r.value);
    assert.equal(lastOrders.length, 3);
    assert.equal(await repo.stock(products[0].variants[0].sku), 0);
  });
  await test("cancellation releases once, stale retry fails, snapshot immutable", async () => {
    for (const o of lastOrders)
      await repo.update(
        o.id,
        { action: "fulfilment", fulfilment: "cancelled", version: 1 },
        owner,
      );
    await assert.rejects(
      repo.update(
        lastOrders[0].id,
        { action: "fulfilment", fulfilment: "cancelled", version: 1 },
        owner,
      ),
    );
    assert.equal(await repo.stock(products[0].variants[0].sku), 3);
    await assert.rejects(
      sql`update commerce.order_lines set quantity=2 where order_id=${lastOrders[0].id}`,
    );
  });
  await test("concurrent idempotent retries return one order and reserve once", async () => {
    const r = await make();
    const results = await Promise.all(
      Array.from({ length: 8 }, () => repo.create(r.input, r.g)),
    );
    assert.equal(new Set(results.map((o) => o.id)).size, 1);
    assert.equal(await repo.stock(products[0].variants[0].sku), 2);
    await assert.rejects(
      repo.create(
        { ...r.input, customer: { ...customer, name: "Changed Test" } },
        r.g,
      ),
    );
    assert.equal(await repo.get(results[0].id, guest()), null);
    await repo.update(
      results[0].id,
      { action: "fulfilment", fulfilment: "cancelled", version: 1 },
      owner,
    );
  });
  await test("manual deposit, audit, fulfilment and COD reconciliation", async () => {
    const r = await make();
    let o = await repo.create(r.input, r.g);
    await assert.rejects(
      repo.update(
        o.id,
        {
          action: "verify_advance",
          version: o.version,
          amount: 50,
          reference: randomUUID(),
          note: "Synthetic receipt",
        },
        owner,
      ),
    );
    o = await repo.update(
      o.id,
      { action: "fulfilment", fulfilment: "confirmed", version: o.version },
      owner,
    );
    await assert.rejects(
      repo.update(
        o.id,
        {
          action: "verify_advance",
          version: o.version,
          amount: 49,
          reference: randomUUID(),
          note: "Wrong amount",
        },
        owner,
      ),
    );
    o = await repo.update(
      o.id,
      {
        action: "verify_advance",
        version: o.version,
        amount: 50,
        reference: randomUUID(),
        note: "Synthetic receipt checked",
      },
      owner,
    );
    assert.equal(o.payments?.[0].amount, 50);
    assert.equal(o.payments?.[0].actor, owner);
    await assert.rejects(
      sql`update commerce.advance_verifications set amount=5000 where order_id=${o.id}`,
    );
    for (const fulfilment of ["packed", "shipped", "delivered"] as const)
      o = await repo.update(
        o.id,
        {
          action: "fulfilment",
          fulfilment,
          tracking: "SYNTHETIC-ONLY",
          version: o.version,
        },
        owner,
      );
    o = await repo.update(
      o.id,
      {
        action: "collect_cod",
        version: o.version,
        amount: o.quote.codBalance,
        reference: randomUUID(),
        note: "Synthetic courier settlement",
      },
      owner,
    );
    assert.equal(o.payment, "cod_collected");
    assert.equal(o.payments?.length, 2);
    const [count] =
      await sql`select count(*)::int as n from commerce.owner_audit where order_id=${o.id}`;
    assert.equal(count.n, 6);
  });
  await test("expiry versus payment verification is serialized and releases once", async () => {
    // Setting reservation timeout in the past is fixture-only admin setup; production snapshots cannot be edited.
    const r = await make();
    let o = await repo.create(r.input, r.g);
    o = await repo.update(
      o.id,
      { action: "fulfilment", fulfilment: "confirmed", version: 1 },
      owner,
    );
    await admin`alter table commerce.orders disable trigger guard_order`;
    await admin`update commerce.orders set expires_at=now()-interval '1 second' where id=${o.id}`;
    await admin`alter table commerce.orders enable trigger guard_order`;
    await Promise.allSettled([
      repo.expire(),
      repo.update(
        o.id,
        {
          action: "verify_advance",
          version: o.version,
          amount: 50,
          reference: randomUUID(),
          note: "Race fixture",
        },
        owner,
      ),
    ]);
    const result = await repo.get(o.id);
    assert.equal(result?.fulfilment, "expired");
    assert.equal(result?.payment, "advance_pending");
    assert.equal(await repo.expire(), 0);
    const [res] =
      await sql`select state from commerce.reservations where order_id=${o.id}`;
    assert.equal(res.state, "released");
  });
  await test("verified reservation is never expired", async () => {
    const r = await make();
    let o = await repo.create(r.input, r.g);
    o = await repo.update(
      o.id,
      { action: "fulfilment", fulfilment: "confirmed", version: 1 },
      owner,
    );
    o = await repo.update(
      o.id,
      {
        action: "verify_advance",
        version: 2,
        amount: 50,
        reference: randomUUID(),
        note: "Verified protection",
      },
      owner,
    );
    await admin`alter table commerce.orders disable trigger guard_order`;
    await admin`update commerce.orders set expires_at=now()-interval '1 second' where id=${o.id}`;
    await admin`alter table commerce.orders enable trigger guard_order`;
    await repo.expire();
    assert.equal((await repo.get(o.id))?.payment, "advance_verified");
    assert.equal((await repo.get(o.id))?.fulfilment, "confirmed");
    await repo.update(
      o.id,
      { action: "fulfilment", fulfilment: "cancelled", version: 3 },
      owner,
    );
  });
  await test("anonymous/authenticated cannot access private data; all tables use RLS", async () => {
    for (const role of ["anon", "authenticated"])
      await assert.rejects(
        admin.begin(async (tx) => {
          await tx.unsafe(`set local role ${role}`);
          await tx.unsafe("select * from commerce.orders");
        }),
      );
    const tables =
      await admin`select relname,relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='commerce' and relkind='r'`;
    assert.ok(tables.every((t) => t.relrowsecurity));
    const [grant] =
      await admin`select has_table_privilege('dearelle_app','commerce.owner_accounts','INSERT') as allowed`;
    assert.equal(grant.allowed, false);
    const [negative] =
      await sql`select count(*)::int as n from commerce.inventory where reserved<0 or on_hand<reserved`;
    assert.equal(negative.n, 0);
  });
  await test("staging rejects real customer fields before any database write", async () => {
    const beforeStage = process.env.DEPLOYMENT_STAGE,
      beforeFlag = process.env.STAGING_SYNTHETIC_ONLY;
    try {
      const r = await make(),
        [before] = await sql`select count(*)::int as n from commerce.orders`;
      process.env.DEPLOYMENT_STAGE = "staging";
      process.env.STAGING_SYNTHETIC_ONLY = "1";
      await assert.rejects(
        repo.create(
          {
            ...r.input,
            customer: {
              ...syntheticStagingCustomer,
              email: "realperson@gmail.com",
            },
          },
          r.g,
        ),
      );
      const [after] = await sql`select count(*)::int as n from commerce.orders`;
      assert.equal(after.n, before.n);
      const order = await repo.create(
        { ...r.input, customer: syntheticStagingCustomer },
        r.g,
      );
      assert.equal(order.customer.email, "uat@example.test");
      await repo.update(
        order.id,
        { action: "fulfilment", fulfilment: "cancelled", version: 1 },
        owner,
      );
    } finally {
      if (beforeStage === undefined) delete process.env.DEPLOYMENT_STAGE;
      else process.env.DEPLOYMENT_STAGE = beforeStage;
      if (beforeFlag === undefined) delete process.env.STAGING_SYNTHETIC_ONLY;
      else process.env.STAGING_SYNTHETIC_ONLY = beforeFlag;
    }
  });
  await test("retention requires approval and preserves financial records", async () => {
    await assert.rejects(
      admin.unsafe("select commerce.anonymize_closed_orders()"),
    );
    await assert.rejects(
      sql.unsafe("select commerce.anonymize_closed_orders()"),
    );
    const [before] =
      await admin`select count(*)::int as n,sum(line_total)::int as total from commerce.order_lines`;
    await admin`alter table commerce.orders disable trigger guard_order`;
    await admin`update commerce.orders set created_at=now()-interval '40 days'`;
    await admin`alter table commerce.orders enable trigger guard_order`;
    await admin`update commerce.settings set retention_days=30,retention_approved=true`;
    const [result] = await admin.unsafe(
      "select commerce.anonymize_closed_orders() as n",
    );
    assert.ok(result.n > 0);
    const [after] =
      await admin`select count(*)::int as n,sum(line_total)::int as total from commerce.order_lines`;
    assert.deepEqual(before, after);
    const [retained] =
      await admin`select count(*)::int as n from commerce.orders where fulfilment='cancelled' and payment='advance_verified' and customer->>'name'<>'Customer details removed'`;
    assert.ok(retained.n > 0);
    const [again] = await admin.unsafe(
      "select commerce.anonymize_closed_orders() as n",
    );
    assert.equal(again.n, 0);
    const [audit] =
      await admin`select count(*)::int as n from commerce.owner_audit where action='pii_anonymized'`;
    assert.equal(audit.n, result.n);
  });
  console.log(
    `${passed} database integration scenarios passed; synthetic records only.`,
  );
} finally {
  await sql.end();
  await admin.end();
  await root.unsafe(`drop database ${dbName}`);
  await root.end();
}
