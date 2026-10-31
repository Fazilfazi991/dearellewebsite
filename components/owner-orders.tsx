"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order, Fulfilment } from "@/lib/order-domain";
import { money } from "@/lib/products";
type Inventory = {
  sku: string;
  name: string;
  color: string;
  available: number;
  reserved: number;
};
export function OwnerOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]),
    [inventory, setInventory] = useState<Inventory[]>([]),
    [loaded, setLoaded] = useState(false),
    [selected, setSelected] = useState(""),
    [filter, setFilter] = useState("all"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [tracking, setTracking] = useState(""),
    [amount, setAmount] = useState("50"),
    [reference, setReference] = useState(""),
    [note, setNote] = useState("");
  const order = orders.find((o) => o.id === selected);
  async function request(url: string, body?: unknown) {
    const r = await fetch(
      url,
      body
        ? {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : { cache: "no-store" },
    );
    const d = await r.json();
    if (!r.ok) {
      if ([401, 403].includes(r.status)) {
        setOrders([]);
        setInventory([]);
        setLoaded(false);
        setSelected("");
        router.replace("/admin/sign-in");
      }
      throw new Error(d.error);
    }
    return d;
  }
  async function load() {
    setBusy(true);
    setMessage("");
    try {
      const d = await request("/api/admin/orders");
      setOrders(d.orders);
      setInventory(d.inventory);
      setLoaded(true);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load orders.");
    } finally {
      setBusy(false);
    }
  }
  async function update(action: string, fulfilment?: Fulfilment) {
    if (!order) return;
    setBusy(true);
    setMessage("");
    try {
      const d = await request(`/api/admin/orders/${order.id}`, {
        action,
        fulfilment,
        version: order.version,
        tracking,
        amount: Number(amount),
        reference,
        note,
      });
      setOrders((current) =>
        current.map((o) => (o.id === order.id ? d.order : o)),
      );
      const data = await request("/api/admin/orders");
      setInventory(data.inventory);
      setAmount(
        String(
          d.order.fulfilment === "delivered"
            ? d.order.quote.codBalance
            : d.order.quote.advance,
        ),
      );
      setReference("");
      setNote("");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Update failed. Refresh before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/owner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (!response.ok && ![401, 403].includes(response.status))
        throw new Error("Sign-out could not be completed. Please retry.");
      setOrders([]);
      setInventory([]);
      setSelected("");
      router.replace("/admin/sign-in");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Please retry sign-out.",
      );
    } finally {
      setBusy(false);
    }
  }
  const stage = (o: Order) =>
    o.fulfilment === "confirmed" && o.payment === "advance_pending"
      ? "awaiting_advance"
      : o.fulfilment;
  return (
    <>
      <div className="owner-toolbar">
        <button
          className="text-link"
          disabled={busy}
          onClick={() => void load()}
        >
          {busy
            ? "Loading…"
            : loaded
              ? "Refresh orders"
              : "Load private orders"}
        </button>
        <button
          className="text-link"
          disabled={busy}
          onClick={() => void logout()}
        >
          Sign out
        </button>
      </div>
      {message && (
        <p className="notice" role="alert">
          {message}
        </p>
      )}
      {loaded && (
        <>
          <label className="owner-filter">
            Order stage
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setSelected("");
                setMessage("");
              }}
            >
              {[
                "all",
                "awaiting_contact",
                "awaiting_advance",
                "confirmed",
                "packed",
                "shipped",
                "delivered",
                "cancelled",
                "expired",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <details className="owner-inventory">
            <summary>
              Inventory · {inventory.reduce((n, r) => n + r.available, 0)}{" "}
              available
            </summary>
            {inventory.map((r) => (
              <p key={r.sku}>
                {r.name} · {r.color}
                <br />
                <small>
                  {r.available} available · {r.reserved} reserved · {r.sku}
                </small>
              </p>
            ))}
          </details>
          {!orders.length ? (
            <p>No test requests yet.</p>
          ) : (
            <div className={`owner-grid${order ? " has-selection" : ""}`}>
              <div className="owner-list">
                {orders
                  .filter((o) => filter === "all" || stage(o) === filter)
                  .map((o) => (
                    <button
                      key={o.id}
                      className={selected === o.id ? "selected" : ""}
                      aria-pressed={selected === o.id}
                      onClick={() => {
                        setSelected(o.id);
                        setTracking(o.tracking);
                        setAmount(
                          String(
                            o.fulfilment === "delivered"
                              ? o.quote.codBalance
                              : o.quote.advance,
                          ),
                        );
                        setReference("");
                        setNote("");
                      }}
                    >
                      <strong>{o.customer.name}</strong>
                      <span>
                        {money(o.quote.total)} · {stage(o).replaceAll("_", " ")}
                      </span>
                      <small>
                        {o.createdAt.slice(0, 10)} · {o.id.slice(0, 8)}
                      </small>
                    </button>
                  ))}
              </div>
              {order ? (
                <section className="owner-detail">
                  <button
                    className="text-link owner-back"
                    onClick={() => setSelected("")}
                  >
                    ← Back to requests
                  </button>
                  <h2>{order.customer.name}</h2>
                  <p>
                    {order.customer.email}
                    <br />
                    {order.customer.phone}
                    <br />
                    {order.customer.address}, {order.customer.city},{" "}
                    {order.customer.state} {order.customer.pin}
                  </p>
                  <p>
                    <strong>Test request</strong> ·{" "}
                    {stage(order).replaceAll("_", " ")}
                    <br />
                    Payment: {order.payment.replaceAll("_", " ")}
                  </p>
                  {order.quote.lines.map((l) => (
                    <p key={l.sku}>
                      {l.name} · {l.color}
                      <br />
                      <small>
                        {l.sku} · {l.quantity} × {money(l.unitPrice)} ={" "}
                        {money(l.lineTotal)}
                      </small>
                    </p>
                  ))}
                  <p>
                    Total {money(order.quote.total)} · Advance{" "}
                    {money(order.quote.advance)} · COD{" "}
                    {money(order.quote.codBalance)}
                  </p>
                  <div className="owner-actions">
                    {order.fulfilment === "awaiting_contact" && (
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() => void update("fulfilment", "confirmed")}
                      >
                        Record customer confirmation
                      </button>
                    )}
                    {((order.fulfilment === "confirmed" &&
                      order.payment === "advance_pending") ||
                      (order.fulfilment === "delivered" &&
                        order.payment === "advance_verified")) && (
                      <fieldset>
                        <legend>Manual payment verification</legend>
                        <label>
                          Amount (₹)
                          <input
                            type="number"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </label>
                        <label>
                          External payment reference
                          <input
                            value={reference}
                            maxLength={120}
                            onChange={(e) => setReference(e.target.value)}
                          />
                        </label>
                        <label>
                          Internal verification note
                          <textarea
                            value={note}
                            maxLength={1000}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </label>
                        <p className="small muted">
                          Check the external payment before recording it here.
                        </p>
                        <button
                          className="button secondary"
                          disabled={busy || !reference.trim() || !note.trim()}
                          onClick={() =>
                            void update(
                              order.payment === "advance_pending"
                                ? "verify_advance"
                                : "collect_cod",
                            )
                          }
                        >
                          {order.payment === "advance_pending"
                            ? "Verify ₹50 advance"
                            : "Record COD balance collected"}
                        </button>
                      </fieldset>
                    )}
                    {order.fulfilment === "confirmed" &&
                      order.payment === "advance_verified" && (
                        <button
                          className="button"
                          disabled={busy}
                          onClick={() => void update("fulfilment", "packed")}
                        >
                          Mark packed
                        </button>
                      )}
                    {order.fulfilment === "packed" && (
                      <>
                        <label>
                          Tracking reference
                          <input
                            value={tracking}
                            maxLength={80}
                            onChange={(e) => setTracking(e.target.value)}
                          />
                        </label>
                        <button
                          className="button"
                          disabled={busy || !tracking.trim()}
                          onClick={() => void update("fulfilment", "shipped")}
                        >
                          Mark dispatched
                        </button>
                      </>
                    )}
                    {order.fulfilment === "shipped" && (
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => void update("fulfilment", "delivered")}
                      >
                        Mark delivered
                      </button>
                    )}
                    {["awaiting_contact", "confirmed", "packed"].includes(
                      order.fulfilment,
                    ) && (
                      <button
                        className="text-link"
                        disabled={busy}
                        onClick={() => void update("fulfilment", "cancelled")}
                      >
                        Cancel request & restore reservation
                      </button>
                    )}
                  </div>
                  {order.tracking && <p>Tracking: {order.tracking}</p>}
                  {!!order.payments?.length && (
                    <>
                      <h3>Payment records</h3>
                      {order.payments.map((p) => (
                        <p key={p.reference}>
                          {p.kind}: {money(p.amount)} · {p.reference}
                          <br />
                          <small>
                            {p.note}
                            <br />
                            {p.at}
                          </small>
                        </p>
                      ))}
                    </>
                  )}
                  <h3>Order history</h3>
                  <ol className="order-history">
                    {order.history.map((e, i) => (
                      <li key={i}>
                        <small>
                          {new Date(e.at).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                          })}{" "}
                          IST
                        </small>
                        <p>{e.message}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : (
                <p>Select a request to view its details.</p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
