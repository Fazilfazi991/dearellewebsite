import { test } from "node:test";
import assert from "node:assert/strict";
import { products, productPrice, selectedVariant } from "../lib/products";
import { subtotal, validCart } from "../lib/cart";
import { autoplayAllowed } from "../lib/carousel-scheduler";

test("owner prices apply to every product and variant", () => {
  for (const p of products) {
    const expected =
      p.id === "w5"
        ? 699
        : ["w6", "w7", "b2"].includes(p.id)
          ? 799
          : p.category === "bags"
            ? 399
            : p.brand === "Casio"
              ? 599
              : 799;
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
  assert.equal(products.filter((p) => p.category === "bags").length, 10);
});

test("digital models keep their confirmed price and matching gallery views", () => {
  const compact = products.find((p) => p.id === "w5")!;
  const map = products.find((p) => p.id === "w6")!;
  const triple = products.find((p) => p.id === "w7")!;
  assert.equal(productPrice(compact), 699);
  assert.equal(productPrice(map, "Black / Black"), 799);
  assert.equal(productPrice(map, "Gold / Brown"), 799);
  assert.equal(productPrice(triple), 799);
  assert.equal(compact.variants[0].images.length, 3);
  assert.equal(map.variants[0].images.length, 3);
  assert.equal(map.variants[1].images.length, 3);
  assert.equal(triple.variants[0].images.length, 3);
  assert.ok(map.variants[0].images.every((i) => i.image.includes("map-black")));
  assert.ok(map.variants[1].images.every((i) => i.image.includes("map-gold")));
});

test("explicit variant price override takes precedence over base price", () => {
  const source = products.find((p) => p.id === "w1")!;
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
