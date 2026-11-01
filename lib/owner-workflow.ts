import type { Order } from "./order-domain";
export type OrderStage = Order["fulfilment"] | "awaiting_advance";
export const orderStageLabels: Record<OrderStage, string> = {
  awaiting_contact: "New order",
  awaiting_advance: "Awaiting advance",
  confirmed: "Ready to pack",
  packed: "Ready to dispatch",
  shipped: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  expired: "Expired",
};
export function orderStage(order: Order): OrderStage {
  return order.fulfilment === "confirmed" && order.payment === "advance_pending"
    ? "awaiting_advance"
    : order.fulfilment;
}
export function matchesOrder(order: Order, query: string, filter: string) {
  const stage = orderStage(order);
  const inStage =
    filter === "all" ||
    (filter === "dispatch"
      ? ["confirmed", "packed"].includes(stage)
      : filter === "cod"
        ? order.fulfilment === "delivered" &&
          order.payment === "advance_verified"
        : stage === filter);
  const search = query.trim().toLowerCase();
  return (
    inStage &&
    (!search ||
      [
        order.id,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        ...order.quote.lines.flatMap((line) => [line.name, line.sku]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search))
  );
}
