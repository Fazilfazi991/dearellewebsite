import { writeFileSync } from "node:fs";
import { products, productPrice } from "../lib/products";
const q = (value: unknown) => `'${String(value).replaceAll("'", "''")}'`;
const lines = [
  "-- Reviewed catalogue snapshot. Conflict handling never replenishes existing stock.",
];
for (const p of products) {
  lines.push(
    `insert into commerce.products(id,name,brand,category) values(${[p.id, p.name, p.brand, p.category].map(q).join(",")}) on conflict(id) do nothing;`,
  );
  for (const v of p.variants) {
    lines.push(
      `insert into commerce.skus(sku,variant_id,product_id,color,price_paise,images,enabled) values(${[v.sku, v.id, p.id, v.name].map(q).join(",")},${productPrice(p, v.id) * 100},${q(JSON.stringify(v.images))}::jsonb,${v.availability === "available"}) on conflict(sku) do nothing;`,
    );
    lines.push(
      `insert into commerce.inventory(sku,on_hand) values(${q(v.sku)},${v.stock}) on conflict(sku) do nothing;`,
    );
  }
}
writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log("Catalogue seed generated.");
