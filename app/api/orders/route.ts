import {
  handle,
  json,
  readBody,
  guestSession,
  rateLimit,
} from "@/lib/commerce-http";
import { orderRepository } from "@/lib/order-repository";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    const guest = await guestSession();
    rateLimit(guest);
    const order = orderRepository().create(body, guest);
    return json({ id: order.id, mode: order.mode }, 201);
  });
}
