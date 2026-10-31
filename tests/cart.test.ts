import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, subtotal, validCart } from "../lib/cart";
test("same variant merges while distinct variants remain separate", () => {
  let bag = addItem([], {
    productId: "w1",
    color: "Rose gold / Pink",
    quantity: 1,
  });
  bag = addItem(bag, {
    productId: "w1",
    color: "Rose gold / Pink",
    quantity: 2,
  });
  bag = addItem(bag, {
    productId: "w1",
    color: "Gunmetal / White",
    quantity: 1,
  });
  assert.equal(bag.length, 2);
  assert.equal(bag[0].quantity, 3);
  assert.equal(subtotal(bag), 3196);
});
test("corrupted, unavailable or unsafe persisted lines are discarded", () => {
  assert.deepEqual(
    validCart([
      { productId: "w1", color: "Rose gold / Pink", quantity: -1 },
      { productId: "w1", color: "Invalid", quantity: 1 },
      { productId: "gone", color: "Rose gold / Pink", quantity: 1 },
      null,
    ]),
    [],
  );
  assert.deepEqual(validCart({}), []);
});
test("quantity is capped and zero removes an item", () => {
  assert.equal(
    addItem([{ productId: "w1", color: "Rose gold / Pink", quantity: 2 }], {
      productId: "w1",
      color: "Rose gold / Pink",
      quantity: 3,
    })[0].quantity,
    3,
  );
  assert.deepEqual(
    validCart([{ productId: "w1", color: "Rose gold / Pink", quantity: 0 }]),
    [],
  );
  assert.equal(subtotal([]), 0);
});
