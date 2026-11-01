import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { products, productVisual } from "../lib/products";

test("watch colourways resolve to their own AI-styled asset", () => {
  for (const product of products.filter((p) => p.category === "watches")) {
    assert.equal(product.imagery, "ai-styled");
    assert.equal(
      product.testCheckoutOnly,
      true,
      "checkout remains in test mode",
    );
    assert.equal(
      new Set(product.colors.map((c) => c.name)).size,
      product.colors.length,
    );
    for (const color of product.colors) {
      assert.ok(
        color.image,
        `${product.name}: ${color.name} needs its own image`,
      );
      const visual = productVisual(product, color.name);
      assert.equal(visual.image, color.image);
      assert.ok(existsSync(`public/images/${visual.image}.jpg`));
    }
  }
});

test("owner-corrected Felix models cannot mix dial families", () => {
  const first = products.find((p) => p.id === "w1")!;
  const petite = products.find((p) => p.id === "w3")!;
  assert.deepEqual(
    first.variants.map((v) => v.name),
    ["Rose gold / Pink", "Gunmetal / White"],
  );
  assert.deepEqual(
    petite.variants.map((v) => v.name),
    ["Black / Black", "Rose gold / White"],
  );
  assert.equal(
    productVisual(petite, "Black / Black").image,
    "watch-petite-black-studio-main",
  );
  assert.equal(
    first.variants.some((v) => v.name === "Black / Black"),
    false,
  );
});
