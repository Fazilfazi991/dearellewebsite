import { test } from "node:test";
import assert from "node:assert/strict";
import type { Order } from "../lib/order-domain";
import { orderStage, matchesOrder } from "../lib/owner-workflow";
const order = {
  id: "12345678-1234-4123-8123-123456789012",
  customer: { name: "Sample Customer", email: "owner-ui@example.test", phone: "9876543210" },
  fulfilment: "confirmed", payment: "advance_pending",
  quote: { lines: [{ name: "Burgundy Tote", sku: "B2-BURGUNDY" }] },
} as Order;
test("payment state separates waiting advances from orders ready to dispatch", () => {
  assert.equal(orderStage(order), "awaiting_advance");
  assert.equal(matchesOrder(order, "", "dispatch"), false);
  assert.equal(matchesOrder({ ...order, payment: "advance_verified" }, "", "dispatch"), true);
  assert.equal(matchesOrder({ ...order, fulfilment: "packed", payment: "advance_verified" }, "", "dispatch"), true);
  assert.equal(matchesOrder({ ...order, fulfilment: "cancelled" }, "", "dispatch"), false);
});
test("COD reconciliation includes delivered unpaid balances only; search retains stage filters", () => {
  const delivered: Order = { ...order, fulfilment: "delivered", payment: "advance_verified" };
  assert.equal(matchesOrder(delivered, "b2-burgundy", "cod"), true);
  assert.equal(matchesOrder({ ...delivered, payment: "cod_collected" }, "", "cod"), false);
  assert.equal(matchesOrder(order, "SAMPLE", "awaiting_advance"), true);
  assert.equal(matchesOrder(order, "9876543210", "awaiting_contact"), false);
  assert.equal(matchesOrder(order, "12345678", "all"), true);
});
