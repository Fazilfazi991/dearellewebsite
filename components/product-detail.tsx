"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ArrowRight, Heart, Check } from "lucide-react";
import {
  type Product,
  money,
  productPrice,
  selectedVariant,
} from "@/lib/products";
import { commercePolicy } from "@/lib/config";
import { ProductGallery } from "./product-gallery";
import { useStore } from "./store";
export function ProductDetail({ product: p }: { product: Product }) {
  const [color, setColor] = useState(p.colors[0].name);
  const [qty, setQty] = useState(1);
  const { add, wish, toggleWish } = useStore();
  const router = useRouter();
  const variant = selectedVariant(p, color);
  const price = productPrice(p, color);
  const lastBuy = useRef(0);
  const [stock, setStock] = useState<Record<string, number>>({});
  const available = stock[variant.id] ?? variant.stock;
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/inventory", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (!controller.signal.aborted) setStock(data.stock);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [p.id]);
  function buyNow() {
    if (qty > available || available < 1 || Date.now() - lastBuy.current < 1000)
      return;
    lastBuy.current = Date.now();
    add({ productId: p.id, color, quantity: qty }, { openCart: false });
    router.push("/checkout");
  }
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
                disabled={c.availability === "unavailable" || stock[c.id] === 0}
                onClick={() => {
                  setColor(c.name);
                  setQty(1);
                }}
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
              disabled={qty >= available}
              aria-label="Increase quantity"
              onClick={() => setQty(qty + 1)}
            >
              <Plus size={15} />
            </button>
          </div>
          <span className="small muted">
            {available} available · SKU {variant.sku}
          </span>
        </div>
        <div className="purchase-actions">
          <button
            className="button"
            disabled={available < 1 || qty > available}
            onClick={() => add({ productId: p.id, color, quantity: qty })}
          >
            Add to bag <ArrowRight size={17} />
          </button>
          <button
            className="button secondary"
            disabled={available < 1 || qty > available}
            onClick={buyNow}
          >
            Buy now
          </button>
        </div>
        <p className="purchase-policy">
          Free delivery across India · COD
          <br />
          We’ll contact you before dispatch. ₹50 advance is deducted from your
          total.
        </p>
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
              {commercePolicy.returns}{" "}
              <Link href="/returns">Return information</Link>.
            </p>
          </details>
          <details>
            <summary>A note on this piece</summary>
            <p>
              This preview records test requests only. No payment is taken and
              no real dispatch is created.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
