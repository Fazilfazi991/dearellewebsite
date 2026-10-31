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
      `owner:${body.action === "login" ? "login" : "mfa"}:${ip}`,
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
        await ownerIdentity();
      } catch (error) {
        await client.auth.signOut({ scope: "local" });
        throw error;
      }
      return json({ next: "mfa" });
    }
    const { client, user } = await ownerIdentity();
    if (body.action === "logout") {
      const { data } = await client.auth.getClaims();
      if (typeof data?.claims.session_id === "string")
        await database()`update commerce.owner_sessions set revoked_at=now() where id=${data.claims.session_id} and owner_id=${user.id}`;
      await ownerAudit(user.id, "logout");
      await client.auth.signOut({ scope: "local" });
      return json({ ok: true });
    }
    if (body.action === "factors") {
      const { data, error } = await client.auth.mfa.listFactors();
      if (error) throw new CommerceError("Could not load authenticator.", 401);
      return json({
        factors: data.totp
          .filter((f) => f.status === "verified")
          .map((f) => ({ id: f.id })),
      });
    }
    if (body.action === "enroll") {
      const { data: factors } = await client.auth.mfa.listFactors();
      if (factors?.totp.some((f) => f.status === "verified"))
        throw new CommerceError("Use the enrolled authenticator.", 409);
      // Remove incomplete enrollments before retrying setup.
      for (const f of factors?.totp ?? [])
        await client.auth.mfa.unenroll({ factorId: f.id });
      const { data, error } = await client.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Dearelle owner",
      });
      if (error)
        throw new CommerceError(
          "Could not set up authenticator. Try again.",
          409,
        );
      return json({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
    }
    if (body.action === "verify") {
      if (
        typeof body.factorId !== "string" ||
        typeof body.code !== "string" ||
        !/^\d{6}$/.test(body.code)
      )
        throw new CommerceError("Enter the six-digit authenticator code.");
      const { error } = await client.auth.mfa.challengeAndVerify({
        factorId: body.factorId,
        code: body.code,
      });
      if (error)
        throw new CommerceError(
          "Authenticator code could not be verified.",
          401,
        );
      const owner = await requireOwner(true);
      await ownerAudit(owner.id, "mfa_sign_in");
      return json({ ok: true });
    }
    throw new CommerceError("Unsupported authentication action.");
  });
}
