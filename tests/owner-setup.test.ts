import { test } from "node:test";
import assert from "node:assert/strict";
import { signSetupReceipt, checkSetupReceipt } from "../lib/owner-setup";
const secret = "synthetic-test-key-".repeat(4),
  now = Date.now(),
  receipt = {
    owner: "owner-one",
    session: "session-one",
    purpose: "invite" as const,
    expires: now + 600000,
  };
test("setup receipt binds the verified owner, session, purpose and expiry", () => {
  const token = signSetupReceipt(receipt, secret);
  assert.equal(
    checkSetupReceipt(token, "owner-one", "session-one", secret, now).purpose,
    "invite",
  );
  for (const [owner, session] of [
    ["other-owner", "session-one"],
    ["owner-one", "other-session"],
  ])
    assert.throws(() => checkSetupReceipt(token, owner, session, secret, now));
  assert.throws(() =>
    checkSetupReceipt(token, "owner-one", "session-one", secret, now + 600001),
  );
  assert.throws(() =>
    checkSetupReceipt(
      token.slice(0, -3) + "AAA",
      "owner-one",
      "session-one",
      secret,
      now,
    ),
  );
  assert.throws(() =>
    checkSetupReceipt(
      token,
      "owner-one",
      "session-one",
      "different-secret".repeat(4),
      now,
    ),
  );
});
test("missing, malformed and excessive-lifetime setup receipts fail closed", () => {
  for (const value of [undefined, "bad", "a.b.c"])
    assert.throws(() =>
      checkSetupReceipt(value, "owner-one", "session-one", secret, now),
    );
  const tooLong = signSetupReceipt(
    { ...receipt, expires: now + 900000 },
    secret,
  );
  assert.throws(() =>
    checkSetupReceipt(tooLong, "owner-one", "session-one", secret, now),
  );
  assert.throws(() => signSetupReceipt(receipt, "short"));
});
