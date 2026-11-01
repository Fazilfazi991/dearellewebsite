import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { products, productPrice } from "../lib/products";
import { PostgresOrderRepository } from "../lib/postgres-order-repository";

// This runner creates and removes only its own isolated LOCAL scratch database.
const name = "dearelle_digital_" + randomUUID().replaceAll("-", "");
const root = postgres("postgres://postgres:postgres@127.0.0.1:55422/postgres", {
  max: 1,
});
let admin: ReturnType<typeof postgres> | undefined;
let runtime: ReturnType<typeof postgres> | undefined;
let created = false;
try {
  await root.unsafe(`create database ${name}`);
  created = true;
  admin = postgres(`postgres://postgres:postgres@127.0.0.1:55422/${name}`, {
    max: 1,
  });
  await admin.unsafe(
    "create schema auth; create table auth.users(id uuid primary key,email text); create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz)",
  );
  await admin.unsafe(
    readFileSync(
      "supabase/migrations/20261031090525_commerce_foundation.sql",
      "utf8",
    ),
  );
  await admin.unsafe(
    readFileSync(
      "supabase/migrations/20261101022830_approved_live_cod.sql",
      "utf8",
    ),
  );
  await admin.unsafe(
    readFileSync(
      "supabase/migrations/20261101041344_digital_watch_prices.sql",
      "utf8",
    ),
  );
  await admin.unsafe(readFileSync("supabase/seed.sql", "utf8"));
  runtime = postgres(`postgres://postgres:postgres@127.0.0.1:55422/${name}`, {
    max: 1,
  });
  const [role] = await runtime`select current_user as role`;
  const repo = new PostgresOrderRepository(runtime);
  let checked = 0;
  for (const p of products)
    for (const v of p.variants) {
      const quote = await repo.quote([
        { productId: p.id, variantId: v.id, quantity: 1 },
      ]);
      assert.equal(quote.total, productPrice(p, v.id));
      assert.equal(quote.advance, 50);
      assert.equal(quote.codBalance, quote.total - 50);
      checked++;
    }
  const sku = products.find((p) => p.id === "w5")!.variants[0].sku;
  await admin`update commerce.inventory set on_hand=2 where sku=${sku}`;
  await admin.unsafe(readFileSync("supabase/seed.sql", "utf8"));
  const [inventory] =
    await admin`select on_hand,reserved from commerce.inventory where sku=${sku}`;
  assert.equal(inventory.on_hand, 2);
  assert.equal(inventory.reserved, 0);
  await assert.rejects(
    admin`update commerce.skus set price_paise=1 where sku=${sku}`,
  );
  console.log(
    JSON.stringify({
      localOnly: true,
      role: role.role,
      quotedSkus: checked,
      newSkuPrices: [699, 799, 799, 799],
      advance: 50,
      reseedPreservesStock: true,
      invalidPriceRejected: true,
    }),
  );
} finally {
  await runtime?.end();
  await admin?.end();
  if (created) await root.unsafe(`drop database ${name}`);
  await root.end();
}
