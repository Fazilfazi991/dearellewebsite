import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { CommerceError } from "./quote";
import { hash } from "./order-repository";

const headers = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers });
export async function handle(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    return json(
      {
        error:
          error instanceof CommerceError
            ? error.message
            : "We couldn't process that request. Please try again.",
      },
      error instanceof CommerceError ? error.status : 500,
    );
  }
}
export async function readBody(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "");
  let sameOrigin = false;
  try {
    const parsed = new URL(origin ?? "");
    sameOrigin = parsed.host === host && parsed.protocol === `${protocol}:`;
  } catch {}
  if (!sameOrigin)
    throw new CommerceError("This request must come from the storefront.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new CommerceError("Invalid request format.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new CommerceError("A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16384) {
      await reader.cancel();
      throw new CommerceError("Request is too large.", 413);
    }
    chunks.push(value);
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch {
    throw new CommerceError("Invalid request data.");
  }
}
export async function guestSession(create = false) {
  const jar = await cookies();
  let token = jar.get("dearelle_guest")?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) throw new CommerceError("Order not found.", 404);
    token = randomBytes(32).toString("hex");
    jar.set("dearelle_guest", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "1" || !!process.env.VERCEL,
      sameSite: "strict",
      path: "/",
      maxAge: 86400,
    });
  }
  return hash(token);
}
export function ownerAuthorized(request: Request) {
  const secret = process.env.OWNER_ACCESS_TOKEN;
  if (!secret || secret.length < 32)
    throw new CommerceError(
      "Owner access is not configured. Set a private owner access token on the server.",
      503,
    );
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (
    !timingSafeEqual(
      Buffer.from(hash(secret), "hex"),
      Buffer.from(hash(supplied), "hex"),
    )
  )
    throw new CommerceError("Owner access required.", 401);
}
const requests = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string) {
  const now = Date.now();
  for (const [id, value] of requests)
    if (value.reset <= now) requests.delete(id);
  const entry = requests.get(key) ?? { count: 0, reset: now + 60000 };
  entry.count++;
  requests.set(key, entry);
  if (entry.count > 20)
    throw new CommerceError("Please wait a minute before trying again.", 429);
}
