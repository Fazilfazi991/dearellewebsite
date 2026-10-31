import { requireOwner } from "@/lib/owner-auth";
import { handle, json } from "@/lib/commerce-http";
import { orderRepository } from "@/lib/postgres-order-repository";
export const runtime = "nodejs";
export async function GET() {
  return handle(async () => {
    await requireOwner();
    return json({
      orders: await orderRepository().list(),
      inventory: await orderRepository().inventory(),
    });
  });
}
