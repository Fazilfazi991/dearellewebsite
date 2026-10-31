import { products } from "@/lib/products";
import {
  orderRepository,
  testOrdersEnabled,
} from "@/lib/postgres-order-repository";
import { handle, json } from "@/lib/commerce-http";
export const runtime = "nodejs";
export async function GET() {
  return handle(async () => {
    const repository = testOrdersEnabled() ? orderRepository() : null;
    const inventory = repository ? await repository.inventory() : null;
    return json({
      mode: "test",
      stock: inventory
        ? Object.fromEntries(inventory.map((r) => [r.variant_id, r.available]))
        : Object.fromEntries(
            products.flatMap((p) => p.variants.map((v) => [v.id, v.stock])),
          ),
    });
  });
}
