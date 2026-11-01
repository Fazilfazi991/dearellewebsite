import { assertSyntheticStagingCustomer } from "./staging-safety";
import { randomUUID, createHash } from "node:crypto";
import type { Sql } from "postgres";
import {
  database,
  testOrdersEnabled,
  liveOrdersConfigured,
  ordersConfigured,
} from "./database";
import { CommerceError, type Quote, type OrderLine } from "./quote";
import { validateCustomer } from "./checkout";
import type { Order, Fulfilment } from "./order-domain";

// The pinned driver omits call signatures from TransactionSql; helpers use only tagged queries and json.
type Connection = Sql;
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export type UpdateOrder = {
  version: number;
  action: string;
  fulfilment?: Fulfilment;
  tracking?: string;
  amount?: number;
  reference?: string;
  note?: string;
};
export class PostgresOrderRepository {
  constructor(public sql: Sql = database()) {}
  async stock(sku: string) {
    const [row] = await this
      .sql`select on_hand-reserved as available from commerce.inventory where sku=${sku}`;
    return Number(row?.available ?? 0);
  }
  async inventory() {
    return this
      .sql`select s.sku,s.variant_id,s.color,p.name,i.on_hand,i.reserved,i.on_hand-i.reserved as available from commerce.inventory i join commerce.skus s using(sku) join commerce.products p on p.id=s.product_id order by s.sku`;
  }
  async quote(input: unknown, sql: Connection = this.sql): Promise<Quote> {
    if (!Array.isArray(input) || !input.length || input.length > 40)
      throw new CommerceError("Review your bag before continuing.");
    const rows =
      await sql`select s.*,p.name,p.brand,i.on_hand-i.reserved as available from commerce.skus s join commerce.products p on p.id=s.product_id join commerce.inventory i using(sku) where s.enabled`;
    const grouped = new Map<string, OrderLine>();
    for (const item of input) {
      const r = rows.find(
        (r) =>
          r.product_id === item?.productId && r.variant_id === item?.variantId,
      );
      if (
        !r ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10
      )
        throw new CommerceError(
          "Choose an available colour and valid quantity.",
        );
      const quantity = item.quantity + (grouped.get(r.sku)?.quantity ?? 0);
      if (quantity > r.available)
        throw new CommerceError(
          `${r.name}, ${r.color}: only ${r.available} available.`,
          409,
        );
      grouped.set(r.sku, {
        productId: r.product_id,
        variantId: r.variant_id,
        sku: r.sku,
        name: r.name,
        brand: r.brand,
        color: r.color,
        quantity,
        unitPrice: r.price_paise / 100,
        lineTotal: (quantity * r.price_paise) / 100,
      });
    }
    const lines = [...grouped.values()].sort((a, b) =>
      a.sku.localeCompare(b.sku),
    );
    const total = lines.reduce((n, l) => n + l.lineTotal, 0),
      advance = Math.min(50, total);
    const data = {
      lines,
      subtotal: total,
      shipping: 0,
      total,
      advance,
      codBalance: total - advance,
      currency: "INR" as const,
    };
    return {
      ...data,
      fingerprint: hash(JSON.stringify(data)),
      testMode: !liveOrdersConfigured(),
    };
  }
  async get(
    id: string,
    guest?: string,
    sql: Connection = this.sql,
  ): Promise<Order | null> {
    if (!/^[a-f0-9-]{36}$/i.test(id)) return null;
    const [r] = guest
      ? await sql`select * from commerce.orders where id=${id} and guest_hash=${guest}`
      : await sql`select * from commerce.orders where id=${id}`;
    if (!r) return null;
    const history =
      await sql`select at,message from commerce.history where order_id=${id} order by id`;
    const payments =
      await sql`select amount,external_reference,internal_note,verified_at,verified_by,'advance' as kind from commerce.advance_verifications where order_id=${id} union all select amount,external_reference,internal_note,verified_at,verified_by,'cod' as kind from commerce.cod_collections where order_id=${id}`;
    return {
      id: r.id,
      createdAt: r.created_at.toISOString(),
      expiresAt: r.expires_at?.toISOString(),
      customer: r.customer,
      quote: r.quote,
      mode: r.mode,
      payment: r.payment,
      fulfilment: r.fulfilment,
      tracking: r.tracking,
      version: r.version,
      history: history.map((h) => ({
        at: h.at.toISOString(),
        message: h.message,
      })),
      ...(guest
        ? {}
        : {
            payments: payments.map((p) => ({
              amount: p.amount / 100,
              reference: p.external_reference,
              note: p.internal_note,
              at: p.verified_at.toISOString(),
              actor: p.verified_by,
              kind: p.kind,
            })),
          }),
    };
  }
  async list() {
    const ids = await this
      .sql`select id from commerce.orders order by created_at desc limit 100`;
    return Promise.all(ids.map((r) => this.get(r.id))).then((r) =>
      r.filter((o): o is Order => !!o),
    );
  }
  async create(
    input: {
      items: unknown;
      customer: unknown;
      quoteFingerprint: string;
      idempotencyKey: string;
      acknowledged: boolean;
    },
    guest: string,
  ): Promise<Order> {
    const checked = validateCustomer(input.customer);
    if (
      Object.keys(checked.errors).length ||
      !input.acknowledged ||
      !/^[-a-f0-9]{36}$/i.test(input.idempotencyKey) ||
      !/^[a-f0-9]{64}$/.test(guest)
    )
      throw new CommerceError(
        "Check your delivery details and acknowledge the order request.",
      );
    assertSyntheticStagingCustomer(checked.customer);
    const mode = liveOrdersConfigured() ? "live" : "test";
    const payload = hash(
      JSON.stringify({
        items: input.items,
        customer: checked.customer,
        fingerprint: input.quoteFingerprint,
      }),
    );
    try {
      return (await this.sql.begin(async (transaction) => {
        const tx = transaction as unknown as Sql;
        await tx`select pg_advisory_xact_lock(hashtextextended(${guest + input.idempotencyKey},0))`;
        const [old] =
          await tx`select * from commerce.idempotency where guest_hash=${guest} and key=${input.idempotencyKey}`;
        if (old) {
          if (old.payload_hash !== payload)
            throw new CommerceError(
              "This request was already used with different details.",
              409,
            );
          return (await this.get(old.order_id, guest, tx))!;
        }
        // Deterministic row lock order avoids deadlocks across multi-SKU baskets.
        await tx`select sku from commerce.inventory order by sku for update`;
        const quote = await this.quote(input.items, tx);
        if (quote.fingerprint !== input.quoteFingerprint)
          throw new CommerceError(
            "Your bag changed. Review the updated total.",
            409,
          );
        const id = randomUUID();
        const [r] =
          await tx`insert into commerce.orders(id,guest_hash,customer,quote,subtotal,total,advance,cod_balance,mode,expires_at)
    select ${id},${guest},${tx.json(checked.customer)},${tx.json(quote)},${quote.subtotal * 100},${quote.total * 100},${quote.advance * 100},${quote.codBalance * 100},${mode},case when ${mode}='live' then null else now()+reservation_hours*interval '1 hour' end from commerce.settings returning expires_at`;
        for (const l of quote.lines) {
          await tx`insert into commerce.order_lines(order_id,sku,snapshot,quantity,unit_price) values(${id},${l.sku},${tx.json(l)},${l.quantity},${l.unitPrice * 100})`;
          await tx`insert into commerce.reservations(order_id,sku,quantity,expires_at) values(${id},${l.sku},${l.quantity},${r.expires_at})`;
        }
        await tx`insert into commerce.idempotency(guest_hash,key,payload_hash,order_id) values(${guest},${input.idempotencyKey},${payload},${id})`;
        await tx`insert into commerce.history(order_id,message) values(${id},${mode === "live" ? "COD order request received. Awaiting customer contact and manual advance verification." : "Test COD request received. No payment taken; awaiting customer contact and manual advance verification."})`;
        return (await this.get(id, guest, tx))!;
      })) as Order;
    } catch (error) {
      if (error instanceof CommerceError) throw error;
      if ((error as { code?: string }).code === "P0001")
        throw new CommerceError(
          "Stock or order status changed. Please refresh.",
          409,
        );
      throw error;
    }
  }
  async update(id: string, input: UpdateOrder, actor: string): Promise<Order> {
    if (!/^[a-f0-9-]{36}$/i.test(id))
      throw new CommerceError("Order not found.", 404);
    return (await this.sql.begin(async (transaction) => {
      const tx = transaction as unknown as Sql;
      await tx`select id from commerce.orders where id=${id} for update`;
      const o = await this.get(id, undefined, tx);
      if (!o) throw new CommerceError("Order not found.", 404);
      if (o.version !== input.version)
        throw new CommerceError(
          "This order changed. Refresh before updating.",
          409,
        );
      let message: string;
      if (input.action === "verify_advance" || input.action === "collect_cod") {
        const advance = input.action === "verify_advance",
          expected = advance ? o.quote.advance : o.quote.codBalance;
        if (
          input.amount !== expected ||
          !input.reference?.trim() ||
          !input.note?.trim() ||
          input.reference.length > 120 ||
          input.note.length > 1000
        )
          throw new CommerceError(
            `Record the exact ₹${expected} amount, external reference and verification note.`,
          );
        if (
          advance
            ? o.fulfilment !== "confirmed" ||
              o.payment !== "advance_pending" ||
              new Date(o.expiresAt!).getTime() <= Date.now()
            : o.fulfilment !== "delivered" || o.payment !== "advance_verified"
        )
          throw new CommerceError(
            "This payment cannot be recorded at the current order stage.",
            409,
          );
        if (advance)
          await tx`insert into commerce.advance_verifications(order_id,amount,external_reference,internal_note,verified_by) values(${id},${expected * 100},${input.reference.trim()},${input.note.trim()},${actor})`;
        else
          await tx`insert into commerce.cod_collections(order_id,amount,external_reference,internal_note,verified_by) values(${id},${expected * 100},${input.reference.trim()},${input.note.trim()},${actor})`;
        await tx`update commerce.orders set payment=${advance ? "advance_verified" : "cod_collected"},version=version+1 where id=${id}`;
        message = advance
          ? "Owner manually verified the ₹50 advance."
          : "Owner manually reconciled the COD balance.";
      } else {
        const transitions: Record<string, string[]> = {
          awaiting_contact: ["confirmed", "cancelled"],
          confirmed: ["packed", "cancelled"],
          packed: ["shipped", "cancelled"],
          shipped: ["delivered"],
        };
        const next = input.fulfilment;
        if (
          input.action !== "fulfilment" ||
          !next ||
          !transitions[o.fulfilment]?.includes(next)
        )
          throw new CommerceError("That status change is not allowed.", 409);
        if (
          ["packed", "shipped", "delivered"].includes(next) &&
          o.payment !== "advance_verified"
        )
          throw new CommerceError(
            "Verify the advance before packing or dispatching.",
            409,
          );
        if (
          next === "shipped" &&
          (!input.tracking?.trim() || input.tracking.length > 80)
        )
          throw new CommerceError("Enter a tracking reference.");
        await tx`update commerce.orders set fulfilment=${next},tracking=${next === "shipped" ? input.tracking!.trim() : o.tracking},version=version+1 where id=${id}`;
        if (next === "cancelled" || next === "shipped")
          await tx`update commerce.reservations set state=${next === "cancelled" ? "released" : "consumed"} where order_id=${id} and state='active'`;
        message =
          next === "confirmed"
            ? "Owner recorded customer contact and confirmation."
            : `Fulfilment changed to ${next}.`;
      }
      await tx`insert into commerce.history(order_id,message) values(${id},${message})`;
      await tx`insert into commerce.owner_audit(actor,action,order_id,detail) values(${actor},${input.action},${id},${tx.json({ message, previousVersion: o.version })})`;
      return (await this.get(id, undefined, tx))!;
    })) as Order;
  }
  async expire() {
    // Live reservation expiry remains disabled; no unapproved live timeout.
    return this.sql.begin(async (transaction) => {
      const tx = transaction as unknown as Sql;
      const rows =
        await tx`select id from commerce.orders where mode='test' and expires_at<=now() and payment='advance_pending' and fulfilment in ('awaiting_contact','confirmed') order by id for update skip locked`;
      for (const r of rows) {
        await tx`update commerce.orders set fulfilment='expired',version=version+1 where id=${r.id}`;
        await tx`update commerce.reservations set state='released' where order_id=${r.id} and state='active'`;
        await tx`insert into commerce.history(order_id,message) values(${r.id},'Unfunded test reservation expired; stock released.')`;
        await tx`insert into commerce.owner_audit(action,order_id) values('reservation_expired',${r.id})`;
      }
      return rows.length;
    });
  }
}
let instance: PostgresOrderRepository | undefined;
export function orderRepository() {
  if (!ordersConfigured())
    throw new CommerceError(
      "Public ordering is closed. Local/staging test recording is not configured.",
      503,
    );
  return (instance ??= new PostgresOrderRepository());
}
export { testOrdersEnabled, ordersConfigured };
