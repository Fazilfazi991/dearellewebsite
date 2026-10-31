import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { products, productVisual } from "../lib/products";

test("watch colourways resolve to their own AI-styled asset", () => {
  for (const product of products.filter((p) => p.category === "watches")) {
    assert.equal(product.imagery, "ai-styled");
    assert.equal(
      product.demo,
      true,
      "pricing and checkout remain a labelled preview",
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

test("identically named black finishes do not substitute a different watch model", () => {
  const contour = products.find((p) => p.id === "w1")!;
  const square = products.find((p) => p.id === "w2")!;
  assert.equal(
    productVisual(contour, "Black / Black").image,
    "watch-contour-black",
  );
  assert.equal(
    productVisual(square, "Black / Black").image,
    "watch-date-black",
  );
  assert.notEqual(
    productVisual(contour, "Black / Black").image,
    productVisual(square, "Black / Black").image,
  );
  assert.equal(
    productVisual(contour, "Rose gold / Ivory").position,
    "23% center",
  );
});
