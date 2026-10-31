import {
  handle,
  json,
  readBody,
  guestSession,
  rateLimit,
} from "@/lib/commerce-http";
import { createQuote } from "@/lib/quote";
import { orderRepository, testOrdersEnabled } from "@/lib/order-repository";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    const guest = await guestSession(true);
    rateLimit(guest);
    const recordingEnabled = testOrdersEnabled();
    const quote = recordingEnabled
      ? orderRepository().quote(body.items)
      : createQuote(body.items);
    return json({ ...quote, recordingEnabled });
  });
}
