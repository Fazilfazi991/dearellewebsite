import test from "node:test";
import assert from "node:assert/strict";
import {
  MARKETING_CHOICE,
  marketingAllowed,
  metaEvent,
  productEvent,
  publicStorePath,
} from "../lib/meta";

test("Meta excludes private and unknown routes", () => {
  for (const path of [
    "/admin/orders",
    "/admin/sign-in",
    "/orders/private-id",
    "/api/orders",
    "/unknown",
  ])
    assert.equal(publicStorePath(path), false);
  for (const path of ["/", "/bags", "/checkout", "/products/the-weekend-bag"])
    assert.equal(publicStorePath(path), true);
});
test("Meta requires live domain and consent, deduplicates purchase, and sends catalogue-only payloads", () => {
  const calls: unknown[][] = [];
  const store = new Map<string, string>();
  const session = new Map<string, string>();
  const mockStorage = (m: Map<string, string>) => ({
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => m.set(k, v),
  });
  const browser = { fbq: (...args: unknown[]) => calls.push(args) };
  const place = { hostname: "www.dearelle.in", pathname: "/checkout" };
  const originals = new Map(
    ["window", "location", "localStorage", "sessionStorage"].map((k) => [
      k,
      Object.getOwnPropertyDescriptor(globalThis, k),
    ]),
  );
  try {
    for (const [k, v] of Object.entries({
      window: browser,
      location: place,
      localStorage: mockStorage(store),
      sessionStorage: mockStorage(session),
    }))
      Object.defineProperty(globalThis, k, { value: v, configurable: true });
    assert.equal(marketingAllowed(), false);
    metaEvent("Purchase", {}, "request1");
    assert.equal(calls.length, 0);
    store.set(MARKETING_CHOICE, "allow");
    metaEvent("Purchase", { value: 799, currency: "INR" }, "request1");
    metaEvent("Purchase", { value: 799, currency: "INR" }, "request1");
    assert.equal(calls.filter((c) => c[1] === "Purchase").length, 1);
    place.pathname = "/orders/private";
    metaEvent("PageView");
    place.pathname = "/admin/orders";
    assert.equal(marketingAllowed(), false);
    place.pathname = "/";
    place.hostname = "localhost";
    assert.equal(marketingAllowed(), false);
    const payload = productEvent("b2");
    assert.equal(payload.value, 799);
    assert.deepEqual(
      Object.keys(payload).sort(),
      [
        "content_category",
        "content_ids",
        "content_name",
        "content_type",
        "contents",
        "currency",
        "value",
      ].sort(),
    );
  } finally {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
