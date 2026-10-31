import { test } from "node:test";
import assert from "node:assert/strict";
import {
  syntheticStagingCustomer,
  assertSyntheticStagingCustomer,
} from "../lib/staging-safety";
test("hosted staging accepts only the supplied fictional customer fixture", () => {
  assert.doesNotThrow(() =>
    assertSyntheticStagingCustomer(syntheticStagingCustomer, "staging", "1"),
  );
  for (const altered of [
    { email: "someone@gmail.com" },
    { phone: "9876543210" },
    { name: "Another Person" },
    { address: "A genuine address, 123" },
  ])
    assert.throws(() =>
      assertSyntheticStagingCustomer(
        { ...syntheticStagingCustomer, ...altered },
        "staging",
        "1",
      ),
    );
  assert.throws(() =>
    assertSyntheticStagingCustomer(syntheticStagingCustomer, "staging", "0"),
  );
});
test("synthetic staging enforcement does not rewrite local purchase-flow data", () => {
  assert.doesNotThrow(() =>
    assertSyntheticStagingCustomer(
      { ...syntheticStagingCustomer, name: "Local Synthetic Test" },
      "local",
      "0",
    ),
  );
});
