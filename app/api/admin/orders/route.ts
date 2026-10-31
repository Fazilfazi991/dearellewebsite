import { handle, json, ownerAuthorized } from "@/lib/commerce-http";
import { orderRepository } from "@/lib/order-repository";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return handle(async () => {
    ownerAuthorized(request);
    return json({ orders: orderRepository().list() });
  });
}
