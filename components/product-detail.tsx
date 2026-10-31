"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ArrowRight, Heart } from "lucide-react";
import { type Product, money, productVisual } from "@/lib/products";
import { Photo } from "./image";
import { useStore } from "./store";
export function ProductDetail({ product: p }: { product: Product }) {
  const [color, setColor] = useState(p.colors[0].name);
  const [qty, setQty] = useState(1);
  const { add, wish, toggleWish } = useStore();
  const router = useRouter();
  const visual = productVisual(p, color);
  return (
    <div className="detail-grid">
      <div>
        <div
          className="product-gallery"
          tabIndex={0}
          aria-label="Swipe representative product photographs"
        >
          <div>
            <Photo
              key={visual.image}
              name={visual.image}
              position={visual.position}
              alt={`${p.imagery ? "AI-styled image" : "Representative photograph"} of ${p.name}, ${color}`}
              priority
            />
          </div>
          <div>
            <Photo
              key={visual.image}
              name={visual.image}
              position={visual.position}
              alt={`Detail crop of ${p.imagery ? "the same AI-styled image" : "the same representative photograph"}`}
              className="detail-crop"
            />
          </div>
        </div>
        <p className="small muted gallery-note">
          {p.imagery
            ? "Swipe to explore · AI-styled watch imagery."
            : "Swipe to explore · Representative stock photography, not final product images."}
        </p>
      </div>
      <div className="detail-copy">
        <div className="detail-title">
          <h1>{p.name}</h1>
          <button
            className="icon"
            aria-pressed={wish.includes(p.id)}
            aria-label="Save to wishlist"
            onClick={() => toggleWish(p.id)}
          >
            <Heart
              fill={wish.includes(p.id) ? "currentColor" : "none"}
              size={22}
            />
          </button>
        </div>
        <p className="detail-price">
          {money(p.price)} <span>Illustrative demo price</span>
        </p>
        <p>{p.description}</p>
        <p className="notice">
          {p.imagery
            ? "AI-styled product preview · Final pricing and availability to be confirmed. Demo checkout only."
            : "Demo product · Not available to purchase. Stock is unconfirmed."}
        </p>
        <fieldset className="color-options">
          <legend>
            Colour: <strong>{color}</strong>
          </legend>
          {p.colors.map((c) => (
            <button
              key={c.name}
              aria-label={`Select ${c.name}`}
              aria-pressed={color === c.name}
              onClick={() => setColor(c.name)}
              className={color === c.name ? "active" : ""}
            >
              <span style={{ background: c.hex }} />
              {c.name}
            </button>
          ))}
        </fieldset>
        <div className="purchase-row">
          <div className="qty">
            <button
              disabled={qty === 1}
              aria-label="Decrease quantity"
              onClick={() => setQty(qty - 1)}
            >
              <Minus size={15} />
            </button>
            <span>{qty}</span>
            <button
              disabled={qty === 10}
              aria-label="Increase quantity"
              onClick={() => setQty(qty + 1)}
            >
              <Plus size={15} />
            </button>
          </div>
          <button
            className="button"
            onClick={() => add({ productId: p.id, color, quantity: qty })}
          >
            Add to demo bag <ArrowRight size={17} />
          </button>
        </div>
        <button
          className="button secondary full buy-now"
          onClick={() => {
            add({ productId: p.id, color, quantity: qty });
            router.push("/checkout");
          }}
        >
          Buy now · Demo checkout
        </button>
        <div className="product-accordions">
          <details open>
            <summary>Product details & dimensions</summary>
            <p>
              {p.category === "watches"
                ? "Dial colour, strap material, case size, movement and water resistance"
                : "Material, dimensions, compartments, lining and strap length"}{" "}
              will be added with the verified launch catalogue.{" "}
              {p.imagery
                ? "Each colourway has its own AI-styled image, based on the collection's model references."
                : "Preview colour options are illustrative and share a representative image."}
            </p>
          </details>
          <details>
            <summary>Shipping & returns</summary>
            <p>
              Delivery charges, serviceable locations and return eligibility
              await confirmation. Read our{" "}
              <Link href="/shipping">shipping</Link> and{" "}
              <Link href="/returns">return policy placeholders</Link>.
            </p>
          </details>
          <details>
            <summary>A note on this piece</summary>
            <p>
              This sample lets you explore the interface. It is not an offer for
              sale and carries no review, quality or stock claims.
            </p>
          </details>
        </div>
        <div className="mobile-purchase">
          <button
            className="button"
            onClick={() => add({ productId: p.id, color, quantity: qty })}
          >
            Add to demo bag
          </button>
          <button
            className="button secondary"
            onClick={() => {
              add({ productId: p.id, color, quantity: qty });
              router.push("/checkout");
            }}
          >
            Buy now · Demo
          </button>
        </div>
      </div>
    </div>
  );
}
