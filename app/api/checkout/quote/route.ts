import {
  handle,
  json,
  readBody,
  guestSession,
  rateLimit,
  clientAddress,
} from "@/lib/commerce-http";
import { createQuote } from "@/lib/quote";
import {
  orderRepository,
  ordersConfigured,
} from "@/lib/postgres-order-repository";
import { orderIntakeReady } from "@/lib/database";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    const guest = await guestSession(true);
    await rateLimit(`quote:guest:${guest}`, 30);
    await rateLimit(`quote:ip:${clientAddress(request)}`, 100);
    const recordingEnabled = await orderIntakeReady();
    const quote = ordersConfigured()
      ? await orderRepository().quote(body.items)
      : createQuote(body.items);
    return json({ ...quote, recordingEnabled });
  });
}
