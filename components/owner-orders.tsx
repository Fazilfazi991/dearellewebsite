"use client";
import { useState } from "react";
import type { Order, Fulfilment } from "@/lib/order-repository";
import { money } from "@/lib/products";
export function OwnerOrders() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");
  const order = orders?.find((o) => o.id === selected);
  async function load(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load orders.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function update(action: string, fulfilment?: Fulfilment) {
    if (!order) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          fulfilment,
          tracking,
          version: order.version,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrders((current) =>
        current!.map((o) => (o.id === order.id ? data.order : o)),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Update failed. Reload this order before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!orders)
    return (
      <form className="owner-login" onSubmit={load}>
        <label htmlFor="owner-token">Private owner access token</label>
        <input
          id="owner-token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="off"
          minLength={32}
          required
        />
        <p className="small muted">
          Configured on the server. Kept in memory for this session; never saved
          in this browser.
        </p>
        <button className="button" disabled={busy}>
          {busy ? "Opening…" : "Open orders"}
        </button>
        {message && <p role="alert">{message}</p>}
      </form>
    );
  return (
    <>
      <div className="owner-toolbar">
        <button
          className="text-link"
          disabled={busy}
          onClick={() => void load()}
        >
          Refresh orders
        </button>
        <button
          className="text-link"
          onClick={() => {
            setOrders(null);
            setToken("");
            setSelected(null);
          }}
        >
          Lock owner view
        </button>
      </div>
      {message && (
        <p role="alert" className="notice">
          {message}
        </p>
      )}
      {!orders.length ? (
        <div className="empty">
          <h2>No test requests yet.</h2>
          <p>Requests appear here after the test checkout is submitted.</p>
        </div>
      ) : (
        <div className="owner-grid">
          <div className="owner-list">
            {orders.map((o) => (
              <button
                key={o.id}
                className={selected === o.id ? "selected" : ""}
                onClick={() => {
                  setSelected(o.id);
                  setTracking(o.tracking);
                }}
              >
                <strong>{o.customer.name}</strong>
                <span>
                  {money(o.quote.total)} · {o.fulfilment.replaceAll("_", " ")}
                </span>
                <small>
                  {o.createdAt.slice(0, 10)} · {o.id.slice(0, 8)}
                </small>
              </button>
            ))}
          </div>
          {order ? (
            <section className="owner-detail">
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
                {order.fulfilment.replaceAll("_", " ")}
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
                    disabled={busy}
                    className="button secondary"
                    onClick={() => void update("fulfilment", "confirmed")}
                  >
                    Record customer confirmation
                  </button>
                )}
                {order.payment === "advance_pending" &&
                  order.fulfilment !== "cancelled" && (
                    <button
                      disabled={busy}
                      className="button secondary"
                      onClick={() => void update("verify_advance")}
                    >
                      Mark ₹50 advance manually verified
                    </button>
                  )}
                {order.fulfilment === "confirmed" && (
                  <button
                    disabled={busy || order.payment !== "advance_verified"}
                    className="button"
                    onClick={() => void update("fulfilment", "packed")}
                  >
                    Mark packed
                  </button>
                )}
                {order.fulfilment === "packed" && (
                  <>
                    <label>
                      Tracking number
                      <input
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        maxLength={80}
                      />
                    </label>
                    <button
                      disabled={busy || !tracking.trim()}
                      className="button"
                      onClick={() => void update("fulfilment", "shipped")}
                    >
                      Mark dispatched
                    </button>
                  </>
                )}
                {order.fulfilment === "shipped" && (
                  <button
                    disabled={busy}
                    className="button"
                    onClick={() => void update("fulfilment", "delivered")}
                  >
                    Mark delivered
                  </button>
                )}
                {order.fulfilment === "delivered" &&
                  order.payment === "advance_verified" && (
                    <button
                      disabled={busy}
                      className="button secondary"
                      onClick={() => void update("collect_cod")}
                    >
                      Record COD balance collected
                    </button>
                  )}
                {["awaiting_contact", "confirmed", "packed"].includes(
                  order.fulfilment,
                ) && (
                  <button
                    disabled={busy}
                    className="text-link"
                    onClick={() => void update("fulfilment", "cancelled")}
                  >
                    Cancel test request &amp; restore stock
                  </button>
                )}
              </div>
              {order.tracking && <p>Tracking: {order.tracking}</p>}
              <h3>Order history</h3>
              <ol className="order-history">
                {order.history.map((event, i) => (
                  <li key={i}>
                    <small>
                      {new Date(event.at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}{" "}
                      IST
                    </small>
                    <p>{event.message}</p>
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
  );
}
