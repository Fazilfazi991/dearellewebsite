"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import type { Order, Fulfilment } from "@/lib/order-domain";
import { money, products, selectedVariant } from "@/lib/products";
import {
  orderStage,
  orderStageLabels,
  matchesOrder,
} from "@/lib/owner-workflow";
import { Photo } from "./image";

type Inventory = {
  sku: string;
  name: string;
  color: string;
  available: number;
  reserved: number;
};
type OwnerData = { orders: Order[]; inventory: Inventory[] };
type Update = {
  action: string;
  fulfilment?: Fulfilment;
  tracking?: string;
  amount?: number;
  reference?: string;
  note?: string;
};
class OwnerRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function ownerRequest<T>(
  url: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(
    url,
    body
      ? {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        }
      : { cache: "no-store", signal },
  );
  const data = await response.json();
  if (!response.ok)
    throw new OwnerRequestError(
      data.error || "Could not load orders. Please retry.",
      response.status,
    );
  return data;
}
function dateLabel(value: string, time = false) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Dubai",
    day: "numeric",
    month: "short",
    ...(time ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
function Status({ order }: { order: Order }) {
  return (
    <span className={"ops-status ops-status-" + orderStage(order)}>
      {orderStageLabels[orderStage(order)]}
    </span>
  );
}
function OrderItems({ order }: { order: Order }) {
  return (
    <ul className="ops-items">
      {order.quote.lines.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        const visual = product
          ? selectedVariant(product, line.variantId).images[0]
          : undefined;
        return (
          <li key={line.sku}>
            <div className="ops-product-image">
              {visual ? (
                <Photo
                  name={visual.image}
                  alt={line.name + ", " + line.color}
                  sizes="56px"
                  position={visual.position}
                />
              ) : (
                <ShoppingBag size={20} aria-hidden="true" />
              )}
            </div>
            <div className="ops-item-copy">
              <strong>{line.name}</strong>
              <span>
                {line.color} · Qty {line.quantity}
              </span>
              <small>{line.sku}</small>
            </div>
            <strong>{money(line.lineTotal)}</strong>
          </li>
        );
      })}
    </ul>
  );
}
function OrderProgress({ order }: { order: Order }) {
  if (["cancelled", "expired"].includes(order.fulfilment)) return null;
  const current =
    order.fulfilment === "awaiting_contact"
      ? 0
      : order.fulfilment === "confirmed"
        ? order.payment === "advance_pending"
          ? 1
          : 2
        : order.fulfilment === "packed"
          ? 3
          : order.fulfilment === "shipped"
            ? 4
            : 5;
  return (
    <ol className="ops-progress" aria-label="Order progress">
      {["Contact", "Advance", "Pack", "Dispatch", "Delivery"].map(
        (label, index) => (
          <li
            key={label}
            data-state={
              index < current
                ? "done"
                : index === current
                  ? "current"
                  : "pending"
            }
          >
            <span className="ops-progress-mark" aria-hidden="true">
              {index < current && <Check size={11} strokeWidth={2} />}
            </span>
            <span>
              {label}
              <span className="sr-only">
                :{" "}
                {index < current
                  ? "complete"
                  : index === current
                    ? "current step"
                    : "pending"}
              </span>
            </span>
          </li>
        ),
      )}
    </ol>
  );
}
function OrderDetail({
  order,
  busy,
  onUpdate,
  onBack,
}: {
  order: Order;
  busy: boolean;
  onUpdate: (input: Update) => Promise<boolean>;
  onBack: () => void;
}) {
  const [tracking, setTracking] = useState(order.tracking),
    [reference, setReference] = useState(""),
    [note, setNote] = useState(""),
    [cancelling, setCancelling] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 640px)").matches)
      heading.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, []);
  const stage = orderStage(order);
  const paymentAction =
    stage === "awaiting_advance"
      ? "verify_advance"
      : order.fulfilment === "delivered" && order.payment === "advance_verified"
        ? "collect_cod"
        : null;
  const expectedAmount =
    paymentAction === "collect_cod"
      ? order.quote.codBalance
      : order.quote.advance;
  async function savePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentAction) return;
    if (
      await onUpdate({
        action: paymentAction,
        amount: expectedAmount,
        reference,
        note,
      })
    ) {
      setReference("");
      setNote("");
    }
  }
  const phone = order.customer.phone.replace(/\D/g, "");
  const whatsapp = phone.length === 10 ? "91" + phone : phone;
  const terminal = ["cancelled", "expired"].includes(order.fulfilment);
  return (
    <section
      className="ops-detail"
      aria-label={"Order " + order.id.slice(0, 8)}
    >
      <button className="ops-back" onClick={onBack}>
        <ArrowLeft size={15} /> Back to orders
      </button>
      <div className="ops-detail-heading">
        <div>
          <h2 ref={heading} tabIndex={-1}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p>
            {dateLabel(order.createdAt, true)} · Dubai time
            {order.mode === "test" && " · Test order"}
          </p>
        </div>
        <Status order={order} />
      </div>
      <OrderProgress order={order} />
      <div className="ops-customer">
        <div>
          <h3>Customer</h3>
          <strong>{order.customer.name}</strong>
          <a href={"tel:" + order.customer.phone}>{order.customer.phone}</a>
          <a href={"mailto:" + order.customer.email}>{order.customer.email}</a>
        </div>
        <div>
          <h3>Delivery address</h3>
          <address>
            {order.customer.address}
            <br />
            {order.customer.city}, {order.customer.state}
            <br />
            {order.customer.pin}, India
          </address>
        </div>
        <a
          className="ops-contact"
          href={"https://wa.me/" + whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> WhatsApp customer <ArrowRight size={14} />
        </a>
      </div>
      <h3 className="ops-section-title">
        Items ·{" "}
        {order.quote.lines.reduce((sum, line) => sum + line.quantity, 0)}
      </h3>
      <OrderItems order={order} />
      <dl className="ops-totals">
        <div>
          <dt>Order total</dt>
          <dd>{money(order.quote.total)}</dd>
        </div>
        <div>
          <dt>
            Advance{" "}
            {order.payment === "advance_pending" ? "pending" : "verified"}
          </dt>
          <dd>{money(order.quote.advance)}</dd>
        </div>
        <div>
          <dt>
            COD {order.payment === "cod_collected" ? "collected" : "balance"}
          </dt>
          <dd>{money(order.quote.codBalance)}</dd>
        </div>
      </dl>
      {!terminal && (
        <div className="ops-next-action">
          {stage === "awaiting_contact" && (
            <>
              <h3>Confirm with the customer</h3>
              <p>
                Confirm the items and delivery address, then request the ₹50
                advance.
              </p>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  void onUpdate({
                    action: "fulfilment",
                    fulfilment: "confirmed",
                  })
                }
              >
                Record customer confirmation <ChevronRight size={16} />
              </button>
            </>
          )}
          {paymentAction && (
            <form onSubmit={savePayment}>
              <h3>
                {paymentAction === "verify_advance"
                  ? "Verify the ₹50 advance"
                  : "Record the COD collection"}
              </h3>
              <p>
                Check the payment outside Dearelle before recording it here.
              </p>
              <div className="ops-payment-fields">
                <label>
                  Amount (₹)
                  <input type="number" value={expectedAmount} readOnly />
                </label>
                <label>
                  Payment reference
                  <input
                    required
                    value={reference}
                    maxLength={120}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Transaction or receipt reference"
                  />
                </label>
              </div>
              <label>
                Verification note
                <textarea
                  required
                  value={note}
                  maxLength={1000}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How you checked this payment"
                />
              </label>
              <button
                className="button"
                disabled={busy || !reference.trim() || !note.trim()}
              >
                {paymentAction === "verify_advance"
                  ? "Confirm advance received"
                  : "Confirm COD collected"}{" "}
                <Check size={16} />
              </button>
            </form>
          )}
          {stage === "confirmed" && (
            <>
              <h3>Ready to pack</h3>
              <p>The customer is confirmed and the advance is verified.</p>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  void onUpdate({ action: "fulfilment", fulfilment: "packed" })
                }
              >
                Mark as packed <Package size={16} />
              </button>
            </>
          )}
          {stage === "packed" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void onUpdate({
                  action: "fulfilment",
                  fulfilment: "shipped",
                  tracking,
                });
              }}
            >
              <h3>Dispatch this order</h3>
              <p>Add the courier or tracking reference before dispatch.</p>
              <label>
                Tracking reference
                <input
                  required
                  value={tracking}
                  maxLength={80}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Courier tracking number"
                />
              </label>
              <button className="button" disabled={busy || !tracking.trim()}>
                Mark as dispatched <ArrowRight size={16} />
              </button>
            </form>
          )}
          {stage === "shipped" && (
            <>
              <h3>On the way</h3>
              <p>
                Tracking: <strong>{order.tracking}</strong>
              </p>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  void onUpdate({
                    action: "fulfilment",
                    fulfilment: "delivered",
                  })
                }
              >
                Mark as delivered <Check size={16} />
              </button>
            </>
          )}
          {order.fulfilment === "delivered" &&
            order.payment === "cod_collected" && (
              <>
                <h3>Order complete</h3>
                <p>Delivery and both payment records are complete.</p>
              </>
            )}
        </div>
      )}
      {["awaiting_contact", "confirmed", "packed"].includes(
        order.fulfilment,
      ) && (
        <div className="ops-cancel">
          {cancelling ? (
            <>
              <p>Cancel this order and release its reserved stock?</p>
              <div>
                <button
                  className="ops-quiet-button"
                  disabled={busy}
                  onClick={() => setCancelling(false)}
                >
                  Keep order
                </button>
                <button
                  className="ops-danger-button"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await onUpdate({
                        action: "fulfilment",
                        fulfilment: "cancelled",
                      })
                    )
                      setCancelling(false);
                  }}
                >
                  Confirm cancellation
                </button>
              </div>
            </>
          ) : (
            <button
              className="ops-text-button"
              disabled={busy}
              onClick={() => setCancelling(true)}
            >
              Cancel order
            </button>
          )}
        </div>
      )}
      {terminal && (
        <p className="ops-terminal-note">
          This order is {order.fulfilment}. It is no longer awaiting fulfilment.
          {order.payment !== "advance_pending" &&
            " An advance is recorded; review its payment record."}
        </p>
      )}
      {!!order.payments?.length && (
        <details className="ops-records">
          <summary>
            Payment records <span>{order.payments.length}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          {order.payments.map((payment, index) => (
            <div className="ops-payment-record" key={payment.reference + index}>
              <strong>
                {payment.kind === "advance" ? "Advance" : "COD"} ·{" "}
                {money(payment.amount)}
              </strong>
              <p>{payment.reference}</p>
              <p>{payment.note}</p>
              <small>{dateLabel(payment.at, true)} · Dubai time</small>
            </div>
          ))}
        </details>
      )}
      <details className="ops-records" open>
        <summary>
          Order history <span>{order.history.length}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <ol className="ops-history">
          {[...order.history].reverse().map((event, index) => (
            <li key={event.at + index}>
              <p>{event.message}</p>
              <time dateTime={event.at}>
                {dateLabel(event.at, true)} · Dubai time
              </time>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
export function OwnerOrders() {
  const router = useRouter();
  const selectedRow = useRef<HTMLButtonElement | null>(null);
  const [orders, setOrders] = useState<Order[]>([]),
    [inventory, setInventory] = useState<Inventory[]>([]),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(true),
    [selected, setSelected] = useState(""),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [stockQuery, setStockQuery] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [refreshed, setRefreshed] = useState("");
  const order = orders.find((item) => item.id === selected);
  const applyData = useCallback((data: OwnerData) => {
    setOrders(data.orders);
    setInventory(data.inventory);
    setLoaded(true);
    setRefreshed(new Date().toISOString());
    setSelected((id) => (data.orders.some((item) => item.id === id) ? id : ""));
  }, []);
  const handleError = useCallback(
    (failure: unknown) => {
      if (
        failure instanceof OwnerRequestError &&
        [401, 403].includes(failure.status)
      ) {
        setOrders([]);
        setInventory([]);
        setSelected("");
        setLoaded(false);
        router.replace("/admin/sign-in");
        return;
      }
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not load orders. Please retry.",
      );
    },
    [router],
  );
  useEffect(() => {
    const controller = new AbortController();
    ownerRequest<OwnerData>("/api/admin/orders", undefined, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) applyData(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) handleError(failure);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [applyData, handleError]);
  async function refresh() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      applyData(await ownerRequest<OwnerData>("/api/admin/orders"));
    } catch (failure) {
      handleError(failure);
    } finally {
      setBusy(false);
    }
  }
  async function update(input: Update) {
    if (!order) return false;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await ownerRequest<{ order: Order }>(
        "/api/admin/orders/" + order.id,
        { ...input, version: order.version },
      );
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? result.order : item)),
      );
      setSuccess("Order updated.");
      try {
        applyData(await ownerRequest<OwnerData>("/api/admin/orders"));
      } catch (failure) {
        handleError(failure);
      }
      return true;
    } catch (failure) {
      handleError(failure);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/owner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (!response.ok && ![401, 403].includes(response.status))
        throw new Error("Sign-out failed. Please retry.");
      setOrders([]);
      setInventory([]);
      setSelected("");
      router.replace("/admin/sign-in");
      router.refresh();
    } catch (failure) {
      handleError(failure);
      setBusy(false);
    }
  }
  function chooseFilter(value: string) {
    setFilter(value);
    setSelected("");
    setSuccess("");
  }
  const visible = orders.filter((item) => matchesOrder(item, query, filter));
  const summaries = [
    { label: "New orders", filter: "awaiting_contact" },
    { label: "Awaiting advance", filter: "awaiting_advance" },
    { label: "To dispatch", filter: "dispatch" },
    { label: "COD to record", filter: "cod" },
  ];
  const visibleInventory = inventory.filter((item) =>
    (item.name + " " + item.color + " " + item.sku)
      .toLowerCase()
      .includes(stockQuery.trim().toLowerCase()),
  );
  return (
    <div className="owner-workspace" aria-busy={busy}>
      <header className="ops-header">
        <div>
          <h1>Orders</h1>
          <p>Confirm customers. Verify advances. Keep dispatch moving.</p>
        </div>
        <div className="ops-toolbar">
          <button
            className="ops-quiet-button"
            disabled={busy}
            onClick={() => void refresh()}
          >
            <RefreshCw size={15} /> {busy ? "Loading…" : "Refresh"}
          </button>
          <button
            className="ops-text-button"
            disabled={busy}
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
      </header>
      {error && (
        <div className="ops-notice ops-error" role="alert">
          <span>{error}</span>
          <button disabled={busy} onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}
      {success && (
        <p className="ops-notice ops-success" role="status">
          {success}
        </p>
      )}
      <div className="ops-summary" aria-label="Order priorities">
        {summaries.map((item) => (
          <button
            key={item.filter}
            aria-pressed={filter === item.filter}
            onClick={() => chooseFilter(item.filter)}
            disabled={!loaded || busy}
          >
            <span>{item.label}</span>
            <strong>
              {loaded
                ? orders.filter((order) => matchesOrder(order, "", item.filter))
                    .length
                : "—"}
            </strong>
          </button>
        ))}
      </div>
      <div className="ops-controls">
        <label>
          <span>Search orders</span>
          <div className="ops-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Name, phone, item or order ID"
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected("");
              }}
            />
          </div>
        </label>
        <label>
          <span>Order stage</span>
          <select value={filter} onChange={(e) => chooseFilter(e.target.value)}>
            <option value="all">All recent orders</option>
            {Object.entries(orderStageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
            <option value="dispatch">Packing & dispatch</option>
            <option value="cod">COD to record</option>
          </select>
        </label>
      </div>
      <div className="ops-list-caption">
        <span>
          {loaded
            ? visible.length + " of " + orders.length + " recent orders"
            : "Loading private orders…"}
        </span>
        <span>
          {refreshed
            ? "Updated " + dateLabel(refreshed, true) + " · Dubai time"
            : ""}
        </span>
      </div>
      {orders.length === 100 && (
        <p className="ops-scope-note">
          Showing the latest 100 orders. Search and counts cover these orders.
        </p>
      )}
      <div className={"ops-workbench" + (order ? " ops-has-selection" : "")}>
        <section className="ops-list" aria-label="Orders">
          {busy && !loaded ? (
            <div className="ops-empty" role="status">
              <RefreshCw size={22} />
              <h2>Loading your orders</h2>
              <p>Checking the latest requests and stock.</p>
            </div>
          ) : !visible.length ? (
            <div className="ops-empty">
              <ShoppingBag size={24} />
              <h2>
                {!loaded && error
                  ? "Orders could not be loaded"
                  : orders.length
                    ? "No matching orders"
                    : "No orders yet"}
              </h2>
              <p>
                {orders.length
                  ? "Try another search or order stage."
                  : "New customer orders will appear here."}
              </p>
              {orders.length > 0 && (
                <button
                  className="ops-text-button"
                  onClick={() => {
                    setQuery("");
                    chooseFilter("all");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            visible.map((item) => (
              <button
                key={item.id}
                className={
                  "ops-order-row" +
                  (selected === item.id ? " ops-selected" : "")
                }
                aria-pressed={selected === item.id}
                disabled={busy}
                onClick={(event) => {
                  selectedRow.current = event.currentTarget;
                  setSelected(item.id);
                  setError("");
                  setSuccess("");
                }}
              >
                <span className="ops-row-top">
                  <span>#{item.id.slice(0, 8).toUpperCase()}</span>
                  <time dateTime={item.createdAt}>
                    {dateLabel(item.createdAt)}
                  </time>
                </span>
                <span className="ops-row-main">
                  <strong>{item.customer.name}</strong>
                  <strong>{money(item.quote.total)}</strong>
                </span>
                <span className="ops-row-items">
                  {item.quote.lines.map((line) => line.name).join(", ")}
                </span>
                <span className="ops-row-bottom">
                  <Status order={item} />
                  <span>
                    {item.quote.lines.reduce(
                      (sum, line) => sum + line.quantity,
                      0,
                    )}{" "}
                    {item.quote.lines.reduce((n, l) => n + l.quantity, 0) === 1
                      ? "item"
                      : "items"}
                    {item.mode === "test" && " · Test"}
                  </span>
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              </button>
            ))
          )}
        </section>
        {order ? (
          <OrderDetail
            key={order.id}
            order={order}
            busy={busy}
            onUpdate={update}
            onBack={() => {
              setSelected("");
              requestAnimationFrame(() => selectedRow.current?.focus());
            }}
          />
        ) : (
          <div className="ops-selection-empty">
            <Package size={28} strokeWidth={1.2} />
            <h2>Your next order, in focus.</h2>
            <p>Select an order to see its items, customer and next step.</p>
          </div>
        )}
      </div>
      {loaded && (
        <details className="ops-inventory">
          <summary>
            <span>
              Inventory{" "}
              <small>
                {inventory.reduce((sum, item) => sum + item.available, 0)}{" "}
                available ·{" "}
                {inventory.reduce((sum, item) => sum + item.reserved, 0)}{" "}
                reserved
              </small>
            </span>
          </summary>
          <label className="ops-stock-search">
            Find a product or SKU
            <input
              type="search"
              value={stockQuery}
              onChange={(e) => setStockQuery(e.target.value)}
              placeholder="Search inventory"
            />
          </label>
          <div className="ops-stock-table">
            <table>
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>Available</th>
                  <th>Reserved</th>
                </tr>
              </thead>
              <tbody>
                {visibleInventory.map((item) => (
                  <tr key={item.sku}>
                    <th scope="row">
                      {item.name}
                      <span>
                        {item.color} · {item.sku}
                      </span>
                    </th>
                    <td
                      className={item.available === 0 ? "ops-out-of-stock" : ""}
                    >
                      {item.available}
                    </td>
                    <td>{item.reserved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visibleInventory.length && (
              <p className="ops-scope-note">No matching products.</p>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
