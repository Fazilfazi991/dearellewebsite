import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { CommerceError } from "./quote";
import { hash } from "./order-domain";

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
    sameOrigin = process.env.APP_ORIGIN
      ? parsed.origin === process.env.APP_ORIGIN
      : parsed.host === host && parsed.protocol === `${protocol}:`;
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
export { durableRateLimit as rateLimit } from "./rate-limit";

// Deployment proxy must replace, rather than append arbitrary incoming forwarding headers.
export function clientAddress(request: Request) {
  return process.env.VERCEL
    ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown")
    : "local";
}
