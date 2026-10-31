import { requireOwner } from "@/lib/owner-auth";
import { handle, json, readBody } from "@/lib/commerce-http";
import { orderRepository } from "@/lib/postgres-order-repository";
export const runtime = "nodejs";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const owner = await requireOwner();
    const body = await readBody(request);
    const { id } = await context.params;
    return json({ order: await orderRepository().update(id, body, owner.id) });
  });
}
