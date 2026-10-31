import { test } from "node:test";
import assert from "node:assert/strict";
import { products, productPrice, selectedVariant } from "../lib/products";
import { subtotal, validCart } from "../lib/cart";
import { autoplayAllowed } from "../lib/carousel-scheduler";

test("owner prices apply to every product and variant", () => {
  for (const p of products) {
    const expected =
      p.category === "bags" ? 399 : p.brand === "Casio" ? 599 : 799;
    assert.equal(p.price, expected);
    assert.equal(p.basePrice, expected);
    for (const v of p.variants) {
      assert.equal(productPrice(p, v.name), expected);
      assert.ok(v.id && v.sku && v.images.length);
      const bag = validCart([
        {
          productId: p.id,
          color: v.name,
          quantity: 2,
          price: 1690,
          sku: "forged",
        },
      ]);
      assert.equal(bag[0].sku, v.sku);
      assert.equal(bag[0].variantId, v.id);
      assert.equal(subtotal(bag), expected * 2);
    }
  }
  assert.equal(products.filter((p) => p.category === "bags").length, 9);
});

test("explicit variant price override takes precedence over base price", () => {
  const source = products[0];
  const variant = selectedVariant(source);
  const p = { ...source, variants: [{ ...variant, price: 699 }] };
  assert.equal(productPrice(p, variant.name), 699);
});

test("autoplay respects motion, data and page visibility preferences", () => {
  assert.equal(autoplayAllowed(false, false, false), true);
  assert.equal(autoplayAllowed(true, false, false), false);
  assert.equal(autoplayAllowed(false, true, false), false);
  assert.equal(autoplayAllowed(false, false, true), false);
});
