import { createHmac } from "node:crypto";
import { database } from "./database";
import { CommerceError } from "./quote";
export async function durableRateLimit(key: string, limit = 20) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32)
    throw new CommerceError("Request protection is not configured.", 503);
  const digest = createHmac("sha256", secret).update(key).digest("hex");
  const window = Math.floor(Date.now() / 60000);
  const [row] =
    await database()`insert into commerce.rate_limits(key,bucket,count) values(${digest},${window},1) on conflict(key,bucket) do update set count=commerce.rate_limits.count+1 returning count`;
  if (row.count > limit)
    throw new CommerceError("Please wait a minute before trying again.", 429);
}
