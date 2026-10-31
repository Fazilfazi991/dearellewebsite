"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ArrowRight, Heart, Check } from "lucide-react";
import {
  type Product,
  money,
  productPrice,
  selectedVariant,
} from "@/lib/products";
import { ProductGallery } from "./product-gallery";
import { useStore } from "./store";
export function ProductDetail({ product: p }: { product: Product }) {
  const [color, setColor] = useState(p.colors[0].name);
  const [qty, setQty] = useState(1);
  const { add, wish, toggleWish } = useStore();
  const router = useRouter();
  const variant = selectedVariant(p, color);
  const price = productPrice(p, color);
  return (
    <div className="detail-grid">
      <ProductGallery key={variant.id} product={p} variant={variant} />
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
          {money(price)} <span>{p.category === "watches" ? p.brand : ""}</span>
        </p>
        <fieldset className="color-options">
          <legend>
            Colour: <strong>{color}</strong>
          </legend>
          <div className="variant-grid">
            {p.variants.map((c) => (
              <button
                key={c.id}
                aria-label={`Select ${c.name}`}
                aria-pressed={color === c.name}
                disabled={c.availability === "unavailable"}
                onClick={() => setColor(c.name)}
                className={color === c.name ? "active" : ""}
              >
                <span style={{ background: c.swatch }} />
                <span className="variant-name">{c.name}</span>
                {color === c.name && <Check size={13} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </fieldset>
        <p>{p.description}</p>

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
            Add to bag <ArrowRight size={17} />
          </button>
        </div>
        <button
          className="button secondary full buy-now"
          onClick={() => {
            add({ productId: p.id, color, quantity: qty });
            router.push("/checkout");
          }}
        >
          Buy now
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
                ? "Choose a colour to explore its matching images."
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
              This checkout is not currently accepting orders. It is not an
              offer for sale. Availability will be confirmed before ordering.
            </p>
          </details>
        </div>
        <div className="mobile-purchase">
          <button
            className="button"
            onClick={() => add({ productId: p.id, color, quantity: qty })}
          >
            Add to bag
          </button>
          <button
            className="button secondary"
            onClick={() => {
              add({ productId: p.id, color, quantity: qty });
              router.push("/checkout");
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
