import { handle, json, ownerAuthorized, readBody } from "@/lib/commerce-http";
import { orderRepository } from "@/lib/order-repository";
export const runtime = "nodejs";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    ownerAuthorized(request);
    const body = await readBody(request);
    const { id } = await context.params;
    return json({ order: orderRepository().update(id, body) });
  });
}
