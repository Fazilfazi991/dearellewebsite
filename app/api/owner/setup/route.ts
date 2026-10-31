import { cookies } from "next/headers";
import { handle, json, readBody, clientAddress } from "@/lib/commerce-http";
import { ownerAuthClient, ownerIdentity, ownerAudit } from "@/lib/owner-auth";
import { signSetupReceipt, checkSetupReceipt } from "@/lib/owner-setup";
import { durableRateLimit } from "@/lib/rate-limit";
import { database } from "@/lib/database";
import { CommerceError } from "@/lib/quote";
export const runtime = "nodejs";
const cookie = "dearelle-owner-setup";
const options = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.COOKIE_SECURE === "1" || !!process.env.VERCEL,
  path: "/api/owner/setup",
  maxAge: 600,
};
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readBody(request);
    await durableRateLimit(`owner-setup:${clientAddress(request)}`, 10);
    const jar = await cookies();
    if (body.action === "exchange") {
      if (
        !["invite", "recovery"].includes(body.type) ||
        typeof body.tokenHash !== "string" ||
        !/^[a-zA-Z0-9_-]{32,512}$/.test(body.tokenHash)
      )
        throw new CommerceError("This invitation or recovery link is invalid.");
      const client = await ownerAuthClient();
      const { error } = await client.auth.verifyOtp({
        token_hash: body.tokenHash,
        type: body.type,
      });
      if (error)
        throw new CommerceError(
          "This link expired or has already been used. Request a new link.",
          401,
        );
      try {
        const { user } = await ownerIdentity();
        const { data } = await client.auth.getClaims();
        const session = data?.claims.session_id;
        if (typeof session !== "string")
          throw new CommerceError("Setup session could not be verified.", 401);
        const { data: factors, error: factorError } =
          await client.auth.mfa.listFactors();
        if (factorError)
          throw new CommerceError("Authenticator could not be checked.", 503);
        jar.set(
          cookie,
          signSetupReceipt({
            owner: user.id,
            session,
            purpose: body.type,
            expires: Date.now() + 600000,
          }),
          options,
        );
        await ownerAudit(user.id, "owner_setup_link_verified");
        return json({
          mfaRequired: !!factors.totp.some((f) => f.status === "verified"),
        });
      } catch (error) {
        await client.auth.signOut({ scope: "local" });
        throw error;
      }
    }
    if (body.action === "finish") {
      const { client, user } = await ownerIdentity();
      const { data } = await client.auth.getClaims();
      const session = data?.claims.session_id;
      if (typeof session !== "string")
        throw new CommerceError("Setup session expired.", 401);
      const receipt = checkSetupReceipt(
        jar.get(cookie)?.value,
        user.id,
        session,
      );
      if (
        typeof body.password !== "string" ||
        body.password.length < 12 ||
        body.password.length > 128
      )
        throw new CommerceError("Choose a password of 12–128 characters.");
      const { data: factors, error } = await client.auth.mfa.listFactors();
      if (error)
        throw new CommerceError("Authenticator could not be checked.", 503);
      const verified = factors.totp.find((f) => f.status === "verified");
      if (verified) {
        if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code))
          throw new CommerceError(
            "Enter the code from your existing authenticator.",
          );
        const { error } = await client.auth.mfa.challengeAndVerify({
          factorId: verified.id,
          code: body.code,
        });
        if (error)
          throw new CommerceError(
            "Authenticator code could not be verified.",
            401,
          );
      }
      const { error: passwordError } = await client.auth.updateUser({
        password: body.password,
      });
      if (passwordError)
        throw new CommerceError(
          "Password could not be saved. Choose a different strong password.",
          422,
        );
      await database()`update commerce.owner_sessions set revoked_at=now() where owner_id=${user.id}`;
      await ownerAudit(
        user.id,
        receipt.purpose === "invite"
          ? "owner_invitation_completed"
          : "owner_password_recovered",
      );
      await client.auth.signOut({ scope: "global" });
      jar.set(cookie, "", { ...options, maxAge: 0 });
      return json({ ok: true, next: "/admin/sign-in" });
    }
    throw new CommerceError("Unsupported setup action.");
  });
}
