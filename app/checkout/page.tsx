"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useStore, Mounted } from "@/components/store";
import { money } from "@/lib/products";
import { validateCustomer, type CustomerErrors } from "@/lib/checkout";
import type { Quote } from "@/lib/quote";
import { commercePolicy } from "@/lib/config";

type ReviewedQuote = Quote & { recordingEnabled: boolean };
const fields = [
  ["name", "Full name", "name", "text"],
  ["email", "Email", "email", "email"],
  ["phone", "Mobile number", "tel-national", "tel"],
  ["address", "House, street and area", "street-address", "text"],
  ["city", "City", "address-level2", "text"],
  ["state", "State / union territory", "address-level1", "text"],
  ["pin", "Indian PIN code", "postal-code", "text"],
] as const;

export default function Checkout() {
  const { items, clear } = useStore();
  const router = useRouter();
  const [quote, setQuote] = useState<ReviewedQuote | null>(null);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [retry, setRetry] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const requestKey = useRef<{ payload: string; key: string } | null>(null);
  const submitting = useRef(false);
  const lines = items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
  }));
  useEffect(() => {
    if (!items.length) return;
    const abort = new AbortController();
    queueMicrotask(() => {
      setReviewing(true);
      setMessage("");
    });
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      }),
      signal: abort.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!abort.signal.aborted) setQuote(data);
      })
      .catch((error) => {
        if (!abort.signal.aborted) {
          setQuote(null);
          setMessage(
            error instanceof Error
              ? error.message
              : "Couldn't check your bag. Try again.",
          );
        }
      })
      .finally(() => {
        if (!abort.signal.aborted) setReviewing(false);
      });
    return () => abort.abort();
  }, [items, retry]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !quote || reviewing) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const checked = validateCustomer({ ...values, country: "India" });
    setErrors(checked.errors);
    if (Object.keys(checked.errors).length) {
      form.current
        ?.querySelector<HTMLInputElement>(
          `[name="${Object.keys(checked.errors)[0]}"]`,
        )
        ?.focus();
      return;
    }
    if (!acknowledged) {
      setMessage(
        "Please acknowledge this is a test request and review the ₹50 advance process.",
      );
      return;
    }
    const payload = JSON.stringify({
      items: lines,
      customer: checked.customer,
      quoteFingerprint: quote.fingerprint,
      acknowledged,
    });
    if (requestKey.current?.payload !== payload)
      requestKey.current = { payload, key: crypto.randomUUID() };
    submitting.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...JSON.parse(payload),
          idempotencyKey: requestKey.current!.key,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      clear();
      router.push(`/orders/${data.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The request could not be recorded. Retry safely; it will not create a duplicate.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <main id="main" className="section inner-page checkout-page">
      <Link href="/new-arrivals" className="text-link">
        <ArrowLeft size={16} /> Back to shopping
      </Link>
      <div className="page-heading">
        <h1>Your checkout.</h1>
        <p>Test checkout · No real order, payment or dispatch.</p>
      </div>
      <Mounted>
        {items.length ? (
          <form
            className="checkout-grid"
            ref={form}
            onSubmit={submit}
            noValidate
          >
            <div className="checkout-contact">
              <p className="notice">
                Use sample details only. This preview stores test requests for
                review.
              </p>
              <h2>Contact &amp; delivery</h2>
              <div className="checkout-fields">
                {fields.map(([name, label, autoComplete, type]) => (
                  <label
                    key={name}
                    className={
                      name === "address" || name === "name" ? "field-wide" : ""
                    }
                    htmlFor={`checkout-${name}`}
                  >
                    {label}
                    <input
                      id={`checkout-${name}`}
                      name={name}
                      type={type}
                      autoComplete={autoComplete}
                      required
                      maxLength={
                        name === "phone"
                          ? 14
                          : name === "pin"
                            ? 6
                            : name === "address"
                              ? 180
                              : 120
                      }
                      inputMode={
                        name === "pin" || name === "phone"
                          ? "numeric"
                          : undefined
                      }
                      aria-invalid={!!errors[name]}
                      aria-describedby={
                        errors[name] ? `${name}-error` : undefined
                      }
                    />
                    {errors[name] && (
                      <span className="field-error" id={`${name}-error`}>
                        {errors[name]}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <p className="small muted">Country: India</p>
              <section className="checkout-method">
                <h2>Delivery</h2>
                <p>All India · Free delivery</p>
                <p className="small muted">
                  Dispatch follows a confirmation call and manual advance
                  verification. No delivery date is promised.
                </p>
              </section>
            </div>
            <aside
              className="order-summary"
              aria-label="Server-checked order summary"
            >
              <h2>Your bag</h2>
              {quote?.lines.map((line) => (
                <div key={line.sku}>
                  <span>
                    {line.name}
                    <small>
                      {line.color} · Qty {line.quantity}
                      <br />
                      {line.sku}
                    </small>
                  </span>
                  <strong>{money(line.lineTotal)}</strong>
                </div>
              ))}
              {quote && (
                <>
                  <div>
                    <span>Products</span>
                    <strong>{money(quote.subtotal)}</strong>
                  </div>
                  <div>
                    <span>Delivery</span>
                    <strong>Free</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{money(quote.total)}</strong>
                  </div>
                  <div>
                    <span>
                      Advance after confirmation<small>Included in total</small>
                    </span>
                    <strong>{money(quote.advance)}</strong>
                  </div>
                  <div>
                    <span>Remaining COD balance</span>
                    <strong>{money(quote.codBalance)}</strong>
                  </div>
                  <p className="small muted">
                    Prices and stock checked by the server. The advance is not
                    an extra charge.
                  </p>
                </>
              )}
              {!quote && (
                <p>
                  {reviewing
                    ? "Checking current prices and stock…"
                    : "Review your bag before continuing."}
                </p>
              )}
            </aside>
            <div className="checkout-payment">
              <section className="checkout-method">
                <h2>Cash on delivery</h2>
                <p>We’ll contact you to confirm before dispatch.</p>
                <p>
                  <strong>₹50 advance</strong> is confirmed manually and
                  deducted from your total. Pay the remaining balance by COD.
                </p>
                <p className="small muted">
                  No online payment is taken here. We’ll share the advance
                  instructions when contacting you.
                </p>
              </section>
              <p className="small muted">
                {commercePolicy.returns}{" "}
                <Link href="/returns">Return information</Link>
              </p>
              <label className="checkout-consent">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />{" "}
                <span>
                  I’m submitting sample details for a test request. I understand
                  the ₹50 advance is part of the total and dispatch requires
                  confirmation.
                </span>
              </label>
              {message && (
                <div role="alert" className="notice">
                  <p>{message}</p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setRetry((n) => n + 1)}
                  >
                    Recheck bag
                  </button>
                </div>
              )}
              <button
                className="button full"
                disabled={busy || reviewing || !quote?.recordingEnabled}
              >
                {busy
                  ? "Recording request…"
                  : reviewing
                    ? "Checking your bag…"
                    : "Submit test COD request"}
              </button>
              {quote && !quote.recordingEnabled && (
                <p className="small muted">
                  Test order recording is not configured on this host. Nothing
                  can be submitted.
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="empty">
            <h2>Your bag is waiting for you.</h2>
            <p>Add a piece to continue.</p>
            <Link href="/new-arrivals" className="button">
              Explore the collection
            </Link>
          </div>
        )}
      </Mounted>
    </main>
  );
}
