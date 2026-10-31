"use client";
import Link from "next/link";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { useStore, Mounted } from "@/components/store";
import { products, money, productPrice } from "@/lib/products";
import { subtotal } from "@/lib/cart";
export default function Checkout() {
  const { items } = useStore();
  return (
    <main id="main" className="section inner-page">
      <Link href="/new-arrivals" className="text-link">
        <ArrowLeft size={16} /> Back to shopping
      </Link>
      <div className="page-heading">
        <h1>Your checkout.</h1>
        <p>Checkout is not currently accepting orders.</p>
      </div>
      <Mounted>
        {items.length ? (
          <div className="checkout-grid">
            <form onSubmit={(e) => e.preventDefault()}>
              <h2>Your details</h2>
              <p className="notice">
                Use sample details only. This form does not submit or save
                information.
              </p>
              <label>
                Email
                <input
                  autoComplete="off"
                  type="email"
                  placeholder="you@example.com"
                />
              </label>
              <h2>Delivery address</h2>
              <div className="form-row">
                <label>
                  First name
                  <input autoComplete="off" placeholder="First name" />
                </label>
                <label>
                  Last name
                  <input autoComplete="off" placeholder="Last name" />
                </label>
              </div>
              <label>
                Address
                <input
                  autoComplete="off"
                  placeholder="House, street and area"
                />
              </label>
              <div className="form-row">
                <label>
                  City
                  <input autoComplete="off" placeholder="City" />
                </label>
                <label>
                  PIN code
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="6-digit PIN"
                  />
                </label>
              </div>
              <label>
                State or union territory
                <input placeholder="State / union territory" />
              </label>
              <div className="form-row">
                <label>
                  Phone number
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </label>
                <label>
                  Country
                  <input value="India" readOnly />
                </label>
              </div>
              <h2>Payment options</h2>
              <div className="payment-preview">
                <span>UPI</span>
                <span>Debit / credit card</span>
                <span>COD, if approved</span>
              </div>
              <p className="small muted">
                Planned options only. Availability will be confirmed at launch.
              </p>
              <button className="button full" disabled>
                <LockKeyhole size={16} /> Orders are not open yet
              </button>
              <p className="small muted">
                No order can be placed. There is no payment connection.
              </p>
            </form>
            <aside className="order-summary">
              <h2>Your bag</h2>
              {items.map((item) => {
                const p = products.find((p) => p.id === item.productId)!;
                return (
                  <div key={p.id + item.color}>
                    <span>
                      {p.name}
                      <small>
                        {item.color} · Qty {item.quantity}
                      </small>
                    </span>
                    <strong>
                      {money(productPrice(p, item.color) * item.quantity)}
                    </strong>
                  </div>
                );
              })}
              <div>
                <span>Subtotal</span>
                <strong>{money(subtotal(items))}</strong>
              </div>
              <p className="small muted">
                Taxes and shipping will be confirmed before ordering.
              </p>
            </aside>
          </div>
        ) : (
          <div className="empty">
            <h2>Your bag is waiting for you.</h2>
            <p>Add a piece to your bag.</p>
            <Link className="button" href="/new-arrivals">
              Explore the collection
            </Link>
          </div>
        )}
      </Mounted>
    </main>
  );
}
