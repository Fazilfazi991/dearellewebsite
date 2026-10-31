import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { products, productPrice } from "../lib/products";
// LOCAL ONLY: migrations and owner bootstrap never use a hosted URL.
const url =
  process.env.LOCAL_DATABASE_URL ??
  "postgres://postgres:postgres@127.0.0.1:55422/postgres";
if (new URL(url).hostname !== "127.0.0.1")
  throw new Error("Local database only");
const sql = postgres(url, { max: 1 });
try {
  const [exists] = await sql`select to_regclass('commerce.settings') as name`;
  if (!exists.name)
    await sql.unsafe(
      readFileSync(
        "supabase/migrations/20261031090525_commerce_foundation.sql",
        "utf8",
      ),
    );
  for (const p of products) {
    await sql`insert into commerce.products(id,name,brand,category) values(${p.id},${p.name},${p.brand},${p.category}) on conflict(id) do nothing`;
    for (const v of p.variants) {
      await sql`insert into commerce.skus(sku,variant_id,product_id,color,price_paise,images,enabled) values(${v.sku},${v.id},${p.id},${v.name},${productPrice(p, v.id) * 100},${sql.json(v.images)},${v.availability === "available"}) on conflict(sku) do nothing`;
      await sql`insert into commerce.inventory(sku,on_hand) values(${v.sku},${v.stock}) on conflict(sku) do nothing`;
    }
  }
  const password = randomBytes(32).toString("hex");
  await sql.unsafe(`alter role dearelle_app login password '${password}'`);
  mkdirSync(".data", { recursive: true });
  let env = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
  const values = {
    DATABASE_URL: `postgres://dearelle_app:${password}@127.0.0.1:55422/postgres`,
    DEPLOYMENT_STAGE: "local",
    PUBLIC_ORDER_INTAKE: "0",
    COMMERCE_TEST_ORDERS: "1",
    RATE_LIMIT_SECRET: randomBytes(32).toString("hex"),
    APP_ORIGIN: "http://127.0.0.1:3001",
  };
  for (const [key, value] of Object.entries(values)) {
    env = env.replace(new RegExp(`^${key}=.*\\r?\\n?`, "m"), "");
    env += `\n${key}=${value}\n`;
  }
  env = env.replace(/^OWNER_ACCESS_TOKEN=.*\r?\n?/m, "");
  writeFileSync(".env.local", env);
  console.log(
    "Local migration and catalogue seed complete; runtime credentials saved privately.",
  );
} finally {
  await sql.end();
}
