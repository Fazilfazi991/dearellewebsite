import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { products, productPrice } from "../lib/products";
import { resolveBagLink, bagEditLink, bagEnquiry } from "../lib/bag-edit-links";
import { lookbookCollection } from "../lib/bag-edit";

test("lookbook includes every bag and colour once, with authoritative prices and existing photos", () => {
  const bags = lookbookCollection();
  const catalogue = products.filter((product) => product.category === "bags");
  assert.deepEqual(
    bags.map((bag) => bag.id).toSorted(),
    catalogue.map((bag) => bag.id).toSorted(),
  );
  for (const bag of bags) {
    const product = catalogue.find((product) => product.id === bag.id)!;
    assert.equal(bag.variants.length, product.variants.length);
    for (const variant of bag.variants) {
      const source = product.variants.find(
        (source) => source.id === variant.id,
      )!;
      assert.equal(variant.price, productPrice(product, source.id));
      assert.equal(variant.sku, source.sku);
      assert.ok(variant.images.length > 0);
      assert.equal(
        new Set(variant.images.map((image) => image.image)).size,
        variant.images.length,
      );
      for (const image of variant.images) {
        assert.ok(
          source.images.some((original) => original.image === image.image),
        );
        assert.ok(existsSync(`public/images/${image.image}.jpg`));
      }
      const resolved = resolveBagLink(
        bags,
        bagEditLink(bag.id, variant.id).split("?")[1],
      );
      assert.equal(resolved?.bag.id, bag.id);
      assert.equal(resolved?.variant.id, variant.id);
      const directLink = `https://www.dearelle.in${bagEditLink(bag.slug, variant.id)}`;
      const enquiry = bagEnquiry(bag, variant, directLink);
      assert.ok(
        enquiry.includes(bag.name) &&
          enquiry.includes(source.sku) &&
          enquiry.includes(source.name),
      );
      assert.ok(enquiry.includes(`Link: ${directLink}`));
      assert.ok(enquiry.startsWith("Hi Dearelle! ♡"));
    }
  }
  assert.equal(bags.find((bag) => bag.id === "b2")?.variants[0].price, 799);
});

test("descriptive lookbook links and legacy IDs resolve to the same selected colour", () => {
  const bags = lookbookCollection();
  for (const bag of bags) {
    for (const colour of bag.variants) {
      const modern = resolveBagLink(
        bags,
        bagEditLink(bag.slug, colour.id).split("?")[1],
      );
      const legacy = resolveBagLink(
        bags,
        bagEditLink(bag.id, colour.id).split("?")[1],
      );
      assert.equal(modern?.variant.id, legacy?.variant.id);
      assert.equal(modern?.bag.slug, bag.slug);
    }
  }
  assert.equal(
    resolveBagLink(bags, "?bag=the-olive-shoulder-bag")?.bag.id,
    "b7",
  );
});

test("catalogue price updates and overrides flow through without mutating source records", () => {
  const catalogue = structuredClone(products);
  const source = catalogue.find((product) => product.id === "b3")!;
  source.basePrice = 459;
  source.variants[1].price = 549;
  const before = JSON.stringify(catalogue);
  const bag = lookbookCollection(catalogue).find((bag) => bag.id === "b3")!;
  assert.equal(bag.variants[0].price, 459);
  assert.equal(bag.variants[1].price, 549);
  assert.equal(JSON.stringify(catalogue), before);
});

test("one source photo stays one, not two fake angles; invalid bag/colour links never select a different bag", () => {
  const bags = lookbookCollection();
  const single = bags.find((bag) => bag.id === "b1")!;
  assert.equal(single.variants[0].images.length, 1);
  assert.equal(resolveBagLink(bags, "?bag=missing"), null);
  assert.equal(resolveBagLink(bags, "?bag=b3&colour=b9-berry"), null);
  assert.equal(resolveBagLink(bags, "?bag=b3")?.bag.id, "b3");
  const marbled = bags.find((bag) => bag.id === "b3")!;
  assert.equal(marbled.variants[0].images.length, 1);
  assert.equal(marbled.variants[1].images.length, 2);
  assert.ok(
    marbled.variants[1].images.every((image) =>
      image.image.includes("chocolate-flap"),
    ),
  );
});
