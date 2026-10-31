import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { OrderRepository } from "../lib/order-repository";
import { products } from "../lib/products";
import { createQuote } from "../lib/quote";
import { validateCustomer } from "../lib/checkout";

const p = products.find((p) => p.id === "w2")!;
const items = [
  {
    productId: p.id,
    variantId: p.variants[0].id,
    quantity: 1,
    unitPrice: 1,
    total: 1,
  },
];
const customer = {
  name: "Sample Customer",
  email: "sample@example.com",
  phone: "9876543210",
  address: "12 Sample Street, Test Building",
  city: "Kochi",
  state: "Kerala",
  pin: "682001",
  country: "India",
};
const request = () => ({
  items,
  customer,
  quoteFingerprint: createQuote(items).fingerprint,
  idempotencyKey: randomUUID(),
  acknowledged: true,
});

test("server ignores supplied prices and deposit never increases total", () => {
  const quote = createQuote(items);
  assert.equal(quote.total, 599);
  assert.equal(quote.shipping, 0);
  assert.equal(quote.advance, 50);
  assert.equal(quote.codBalance, 549);
  assert.equal(quote.lines[0].sku, p.variants[0].sku);
  assert.throws(() => createQuote([{ ...items[0], quantity: 4 }]), /only 3/);
  assert.throws(
    () =>
      createQuote([
        { ...items[0], quantity: 2 },
        { ...items[0], quantity: 2 },
      ]),
    /only 3/,
  );
  assert.throws(
    () => createQuote([{ ...items[0], variantId: "invalid" }]),
    /unavailable/,
  );
  assert.throws(
    () => createQuote([{ ...items[0], quantity: 1.5 }]),
    /quantity/,
  );
});
test("invalid Indian contact/address fields cannot be submitted", () => {
  assert.deepEqual(validateCustomer(customer).errors, {});
  const { errors } = validateCustomer({
    ...customer,
    pin: "123",
    phone: "123",
    email: "bad",
    address: "x",
    country: "UAE",
  });
  for (const key of ["pin", "phone", "email", "address", "country"] as const)
    assert.ok(errors[key]);
});
test("same request retries once, snapshots correct SKU, guest isolation and stock transaction", () => {
  const repo = new OrderRepository(":memory:");
  try {
    const input = request();
    const first = repo.create(input, "guest-a");
    const replay = repo.create(input, "guest-a");
    assert.equal(first.id, replay.id);
    assert.equal(repo.list().length, 1);
    assert.equal(repo.stock(p.variants[0].sku), 2);
    assert.equal(first.payment, "advance_pending");
    assert.equal(first.mode, "test");
    assert.equal(first.quote.lines[0].unitPrice, 599);
    assert.equal(repo.get(first.id, "guest-b"), null);
    assert.ok(repo.get(first.id, "guest-a"));
    assert.throws(
      () =>
        repo.create(
          { ...input, customer: { ...customer, name: "Changed Name" } },
          "guest-a",
        ),
      /already used/,
    );
    repo.create(request(), "guest-b");
    repo.create(request(), "guest-c");
    assert.throws(() => repo.create(request(), "guest-d"), /only 0/);
    assert.equal(repo.list().length, 3);
  } finally {
    repo.close();
  }
});
test("confirmation and manually verified advance gate dispatch; version prevents duplicate updates", () => {
  const repo = new OrderRepository(":memory:");
  try {
    let order = repo.create(request(), "guest-a");
    assert.throws(
      () =>
        repo.update(order.id, {
          version: 1,
          action: "fulfilment",
          fulfilment: "packed",
        }),
      /not allowed/,
    );
    order = repo.update(order.id, {
      version: order.version,
      action: "fulfilment",
      fulfilment: "confirmed",
    });
    assert.throws(
      () =>
        repo.update(order.id, {
          version: order.version,
          action: "fulfilment",
          fulfilment: "packed",
        }),
      /Verify the advance/,
    );
    order = repo.update(order.id, {
      version: order.version,
      action: "verify_advance",
    });
    assert.throws(
      () => repo.update(order.id, { version: 1, action: "verify_advance" }),
      /changed/,
    );
    order = repo.update(order.id, {
      version: order.version,
      action: "fulfilment",
      fulfilment: "packed",
    });
    assert.throws(
      () =>
        repo.update(order.id, {
          version: order.version,
          action: "fulfilment",
          fulfilment: "shipped",
        }),
      /tracking/,
    );
    order = repo.update(order.id, {
      version: order.version,
      action: "fulfilment",
      fulfilment: "shipped",
      tracking: "TEST-123",
    });
    assert.throws(
      () =>
        repo.update(order.id, {
          version: order.version,
          action: "collect_cod",
        }),
      /only after delivery/,
    );
    order = repo.update(order.id, {
      version: order.version,
      action: "fulfilment",
      fulfilment: "delivered",
    });
    order = repo.update(order.id, {
      version: order.version,
      action: "collect_cod",
    });
    assert.equal(order.payment, "cod_collected");
    assert.equal(order.tracking, "TEST-123");
    assert.equal(order.history.length, 7);
  } finally {
    repo.close();
  }
});
test("cancel restores test stock once; stale quote never creates a request", () => {
  const repo = new OrderRepository(":memory:");
  try {
    assert.throws(
      () =>
        repo.create({ ...request(), quoteFingerprint: "forged" }, "guest-a"),
      /bag changed/,
    );
    assert.equal(repo.stock(p.variants[0].sku), 3);
    assert.equal(repo.list().length, 0);
    let order = repo.create(request(), "guest-a");
    order = repo.update(order.id, {
      version: order.version,
      action: "fulfilment",
      fulfilment: "cancelled",
    });
    assert.equal(repo.stock(p.variants[0].sku), 3);
    assert.throws(
      () =>
        repo.update(order.id, {
          version: order.version,
          action: "fulfilment",
          fulfilment: "cancelled",
        }),
      /not allowed/,
    );
    assert.equal(repo.stock(p.variants[0].sku), 3);
  } finally {
    repo.close();
  }
});
