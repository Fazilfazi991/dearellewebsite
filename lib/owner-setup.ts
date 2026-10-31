import { createHmac, timingSafeEqual } from "node:crypto";
import { CommerceError } from "./quote";
export type SetupReceipt = {
  owner: string;
  session: string;
  purpose: "invite" | "recovery";
  expires: number;
};
function key(secret = process.env.RATE_LIMIT_SECRET ?? "") {
  if (secret.length < 32)
    throw new CommerceError("Owner setup is not configured.", 503);
  return createHmac("sha256", secret)
    .update("dearelle-owner-setup-v1")
    .digest();
}
export function signSetupReceipt(receipt: SetupReceipt, secret?: string) {
  const data = Buffer.from(JSON.stringify(receipt)).toString("base64url");
  return (
    data +
    "." +
    createHmac("sha256", key(secret)).update(data).digest("base64url")
  );
}
export function checkSetupReceipt(
  value: string | undefined,
  owner: string,
  session: string,
  secret?: string,
  now = Date.now(),
): SetupReceipt {
  try {
    const [data, signature, ...extra] = (value ?? "").split(".");
    if (!data || !signature || extra.length) throw new Error();
    const expected = createHmac("sha256", key(secret)).update(data).digest();
    const supplied = Buffer.from(signature, "base64url");
    if (
      expected.length !== supplied.length ||
      !timingSafeEqual(expected, supplied)
    )
      throw new Error();
    const r = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    ) as SetupReceipt;
    if (
      r.owner !== owner ||
      r.session !== session ||
      !["invite", "recovery"].includes(r.purpose) ||
      !Number.isFinite(r.expires) ||
      r.expires <= now ||
      r.expires > now + 630000
    )
      throw new Error();
    return r;
  } catch {
    throw new CommerceError(
      "This setup session expired. Request a new invitation or recovery link.",
      401,
    );
  }
}
