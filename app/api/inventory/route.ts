import { products } from "@/lib/products";
import { orderRepository, testOrdersEnabled } from "@/lib/order-repository";
import { handle, json } from "@/lib/commerce-http";
export const runtime = "nodejs";
export async function GET() {
  return handle(async () => {
    const repository = testOrdersEnabled() ? orderRepository() : null;
    return json({
      mode: "test",
      stock: Object.fromEntries(
        products.flatMap((p) =>
          p.variants.map((v) => [
            v.id,
            repository ? repository.stock(v.sku) : v.stock,
          ]),
        ),
      ),
    });
  });
}
