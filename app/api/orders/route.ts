import {
  handle,
  json,
  readBody,
  guestSession,
  rateLimit,
  clientAddress,
} from "@/lib/commerce-http";
import { orderRepository } from "@/lib/postgres-order-repository";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    const guest = await guestSession();
    await rateLimit(`order:guest:${guest}`, 6);
    await rateLimit(`order:ip:${clientAddress(request)}`, 12);
    const order = await orderRepository().create(body, guest);
    return json({ id: order.id, mode: order.mode }, 201);
  });
}
