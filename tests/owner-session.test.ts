import { test } from "node:test";
import assert from "node:assert/strict";
import { passwordOwnerSession } from "../lib/owner-session";
const owner = "11111111-1111-4111-8111-111111111111",
  session = "22222222-2222-4222-8222-222222222222";
test("owner password sessions work without an authenticator, including existing upgraded sessions", () => {
  for (const aal of ["aal1", "aal2"])
    assert.equal(
      passwordOwnerSession(
        { sub: owner, session_id: session, aal, amr: [{ method: "password" }] },
        owner,
      ),
      session,
    );
});
test("recovery, anonymous, malformed and mismatched sessions cannot authorize owner orders", () => {
  for (const claims of [
    undefined,
    {},
    { sub: owner, session_id: session, amr: [{ method: "otp" }] },
    {
      sub: "another-owner",
      session_id: session,
      amr: [{ method: "password" }],
    },
    { sub: owner, session_id: "bad", amr: [{ method: "password" }] },
  ])
    assert.throws(() => passwordOwnerSession(claims, owner));
});
