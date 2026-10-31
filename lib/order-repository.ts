import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { products } from "./products";
import { createQuote, CommerceError, type Quote } from "./quote";
import { validateCustomer, type Customer } from "./checkout";

export type Fulfilment =
  | "awaiting_contact"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type Order = {
  id: string;
  createdAt: string;
  customer: Customer;
  quote: Quote;
  mode: "test";
  payment: "advance_pending" | "advance_verified" | "cod_collected";
  fulfilment: Fulfilment;
  tracking: string;
  version: number;
  history: { at: string; message: string }[];
};
const transitions: Record<Fulfilment, Fulfilment[]> = {
  awaiting_contact: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");

// SQLite is a local test repository. A durable hosted adapter is required for public orders.
export class OrderRepository {
  private db: DatabaseSync;
  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS inventory (sku TEXT PRIMARY KEY, remaining INTEGER NOT NULL CHECK(remaining >= 0));
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, guest TEXT NOT NULL, idem TEXT NOT NULL, payload TEXT NOT NULL, document TEXT NOT NULL, created TEXT NOT NULL, UNIQUE(guest,idem));`);
    const insert = this.db.prepare(
      "INSERT OR IGNORE INTO inventory(sku, remaining) VALUES (?,?)",
    );
    for (const p of products)
      for (const v of p.variants) insert.run(v.sku, v.stock);
  }
  close() {
    this.db.close();
  }
  stock = (sku: string) =>
    Number(
      (
        this.db
          .prepare("SELECT remaining FROM inventory WHERE sku=?")
          .get(sku) as { remaining: number } | undefined
      )?.remaining ?? 0,
    );
  quote(input: unknown) {
    return createQuote(input, this.stock);
  }
  list() {
    return (
      this.db
        .prepare("SELECT document FROM orders ORDER BY created DESC LIMIT 100")
        .all() as { document: string }[]
    ).map((r) => JSON.parse(r.document) as Order);
  }
  get(id: string, guest?: string): Order | null {
    const row = this.db
      .prepare(
        guest
          ? "SELECT document FROM orders WHERE id=? AND guest=?"
          : "SELECT document FROM orders WHERE id=?",
      )
      .get(...(guest ? [id, guest] : [id])) as { document: string } | undefined;
    return row ? JSON.parse(row.document) : null;
  }
  create(
    input: {
      items: unknown;
      customer: unknown;
      quoteFingerprint: string;
      idempotencyKey: string;
      acknowledged: boolean;
    },
    guest: string,
  ): Order {
    const checked = validateCustomer(input.customer);
    if (Object.keys(checked.errors).length)
      throw new CommerceError("Check your contact and delivery details.");
    if (input.acknowledged !== true)
      throw new CommerceError(
        "Please acknowledge the test order and advance process.",
      );
    if (!/^[a-f0-9-]{36}$/i.test(input.idempotencyKey))
      throw new CommerceError(
        "The order request is invalid. Please reload checkout.",
      );
    const payload = hash(
      JSON.stringify({
        items: input.items,
        customer: checked.customer,
        fingerprint: input.quoteFingerprint,
      }),
    );
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.db
        .prepare("SELECT payload,document FROM orders WHERE guest=? AND idem=?")
        .get(guest, input.idempotencyKey) as
        { payload: string; document: string } | undefined;
      if (existing) {
        if (existing.payload !== payload)
          throw new CommerceError(
            "This request was already used. Review checkout and try again.",
            409,
          );
        this.db.exec("COMMIT");
        return JSON.parse(existing.document);
      }
      const quote = this.quote(input.items);
      if (quote.fingerprint !== input.quoteFingerprint)
        throw new CommerceError(
          "Your bag changed. Review the updated total before submitting.",
          409,
        );
      for (const line of quote.lines) {
        const changed = this.db
          .prepare(
            "UPDATE inventory SET remaining=remaining-? WHERE sku=? AND remaining>=?",
          )
          .run(line.quantity, line.sku, line.quantity);
        if (!changed.changes)
          throw new CommerceError(
            "A piece has just become unavailable. Review your bag.",
            409,
          );
      }
      const createdAt = new Date().toISOString();
      const order: Order = {
        id: randomUUID(),
        createdAt,
        customer: checked.customer,
        quote,
        mode: "test",
        payment: "advance_pending",
        fulfilment: "awaiting_contact",
        tracking: "",
        version: 1,
        history: [
          {
            at: createdAt,
            message:
              "Test COD request received. No payment taken; awaiting customer contact and manual advance verification.",
          },
        ],
      };
      this.db
        .prepare(
          "INSERT INTO orders(id,guest,idem,payload,document,created) VALUES(?,?,?,?,?,?)",
        )
        .run(
          order.id,
          guest,
          input.idempotencyKey,
          payload,
          JSON.stringify(order),
          createdAt,
        );
      this.db.exec("COMMIT");
      return order;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  update(
    id: string,
    input: {
      version: number;
      action: string;
      fulfilment?: Fulfilment;
      tracking?: string;
    },
  ): Order {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const order = this.get(id);
      if (!order) throw new CommerceError("Order not found.", 404);
      if (order.version !== input.version)
        throw new CommerceError(
          "This order changed. Reload before updating.",
          409,
        );
      let message: string;
      if (input.action === "verify_advance") {
        if (
          order.payment !== "advance_pending" ||
          order.fulfilment === "cancelled"
        )
          throw new CommerceError(
            "Advance cannot be verified for this order.",
            409,
          );
        order.payment = "advance_verified";
        message =
          "Owner manually verified the ₹50 advance. This is not a gateway payment.";
      } else if (input.action === "collect_cod") {
        if (
          order.fulfilment !== "delivered" ||
          order.payment !== "advance_verified"
        )
          throw new CommerceError(
            "COD can be recorded only after delivery and advance verification.",
            409,
          );
        order.payment = "cod_collected";
        message = "Owner manually recorded collection of the COD balance.";
      } else if (
        input.action === "fulfilment" &&
        input.fulfilment &&
        transitions[order.fulfilment].includes(input.fulfilment)
      ) {
        if (
          ["packed", "shipped", "delivered"].includes(input.fulfilment) &&
          order.payment !== "advance_verified"
        )
          throw new CommerceError(
            "Verify the advance before packing or dispatching.",
            409,
          );
        if (
          input.fulfilment === "shipped" &&
          (typeof input.tracking !== "string" ||
            !input.tracking.trim() ||
            input.tracking.length > 80)
        )
          throw new CommerceError(
            "Enter a tracking number before dispatching.",
          );
        if (input.fulfilment === "cancelled")
          for (const line of order.quote.lines)
            this.db
              .prepare("UPDATE inventory SET remaining=remaining+? WHERE sku=?")
              .run(line.quantity, line.sku);
        order.fulfilment = input.fulfilment;
        if (input.fulfilment === "shipped")
          order.tracking = input.tracking!.trim();
        message =
          input.fulfilment === "confirmed"
            ? "Owner recorded customer contact and confirmation."
            : `Fulfilment changed to ${input.fulfilment}.`;
      } else throw new CommerceError("That status change is not allowed.", 409);
      order.version++;
      order.history.push({ at: new Date().toISOString(), message });
      this.db
        .prepare("UPDATE orders SET document=? WHERE id=?")
        .run(JSON.stringify(order), id);
      this.db.exec("COMMIT");
      return order;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}
let instance: OrderRepository | undefined;
export function testOrdersEnabled() {
  return (
    process.env.COMMERCE_TEST_ORDERS === "1" &&
    !process.env.VERCEL &&
    (process.env.OWNER_ACCESS_TOKEN?.length ?? 0) >= 32
  );
}
export function orderRepository() {
  if (!testOrdersEnabled())
    throw new CommerceError(
      "Order recording is not configured on this preview. No order or payment has been created.",
      503,
    );
  return (instance ??= new OrderRepository(
    process.env.TEST_ORDER_DB_PATH ??
      join(process.cwd(), ".data", "test-orders.sqlite"),
  ));
}
