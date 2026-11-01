import { handle, json, readBody, clientAddress } from "@/lib/commerce-http";
import {
  ownerIdentity,
  ownerAuthClient,
  requireOwner,
  ownerAudit,
} from "@/lib/owner-auth";
import { durableRateLimit } from "@/lib/rate-limit";
import { CommerceError } from "@/lib/quote";
import { database } from "@/lib/database";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    const ip = clientAddress(request);
    await durableRateLimit(
      `owner:${body.action === "login" ? "login" : "auth"}:${ip}`,
      body.action === "login" ? 5 : 20,
    );
    if (body.action === "login") {
      const client = await ownerAuthClient();
      if (typeof body.email !== "string" || typeof body.password !== "string")
        throw new CommerceError("Enter your email and password.");
      const { error } = await client.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
      if (error) throw new CommerceError("Sign-in failed.", 401);
      try {
        const owner = await requireOwner(true);
        await ownerAudit(owner.id, "password_sign_in");
      } catch (error) {
        await client.auth.signOut({ scope: "local" });
        throw error;
      }
      return json({ next: "/admin/orders" });
    }
    if (body.action === "logout") {
      const { client, user } = await ownerIdentity();
      const { data } = await client.auth.getClaims();
      if (typeof data?.claims.session_id === "string")
        await database()`update commerce.owner_sessions set revoked_at=now() where id=${data.claims.session_id} and owner_id=${user.id}`;
      await ownerAudit(user.id, "logout");
      await client.auth.signOut({ scope: "local" });
      return json({ ok: true });
    }
    throw new CommerceError("Unsupported authentication action.");
  });
}
