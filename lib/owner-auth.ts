import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { database } from "./database";
import { CommerceError } from "./quote";
import { passwordOwnerSession } from "./owner-session";

export async function ownerAuthClient() {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new CommerceError("Owner authentication is not configured.", 503);
  if (
    ["staging", "production"].includes(process.env.DEPLOYMENT_STAGE ?? "") &&
    (process.env.COOKIE_SECURE !== "1" ||
      !process.env.APP_ORIGIN?.startsWith("https://"))
  )
    throw new CommerceError(
      "Secure staging session settings are incomplete.",
      503,
    );
  const endpoint = new URL(url);
  if (
    endpoint.protocol !== "https:" &&
    !(
      process.env.DEPLOYMENT_STAGE === "local" &&
      ["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname)
    )
  )
    throw new CommerceError(
      "A secure authentication endpoint is required.",
      503,
    );
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: {
      name: "dearelle-owner-auth",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.COOKIE_SECURE === "1" || !!process.env.VERCEL,
      path: "/",
      maxAge: 8 * 3600,
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values) {
          try {
            jar.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "strict",
              secure: process.env.COOKIE_SECURE === "1" || !!process.env.VERCEL,
              maxAge: options.maxAge === 0 ? 0 : 8 * 3600,
            });
          } catch {
            /* Server page cannot refresh: auth route performs refresh. */
          }
        }
      },
    },
  });
}
export async function ownerIdentity() {
  const client = await ownerAuthClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new CommerceError("Owner sign-in required.", 401);
  const [owner] =
    await database()`select id from commerce.owner_accounts where id=${user.id}`;
  if (!owner) throw new CommerceError("Owner access denied.", 403);
  return { client, user };
}
export async function requireOwner(register = false) {
  const { client, user } = await ownerIdentity();
  const { data, error } = await client.auth.getClaims();
  if (error) throw new CommerceError("Owner sign-in required.", 401);
  const sql = database(),
    sid = passwordOwnerSession(data?.claims, user.id);
  const [valid] =
    await sql`select commerce.auth_session_valid(${sid}::uuid,${user.id}::uuid) as ok`;
  if (!valid?.ok)
    throw new CommerceError("Owner session expired. Sign in again.", 401);
  if (register)
    await sql`insert into commerce.owner_sessions(id,owner_id) values(${sid},${user.id}) on conflict(id) do nothing`;
  const rows =
    await sql`update commerce.owner_sessions set last_seen=now() where id=${sid} and owner_id=${user.id} and revoked_at is null and created_at>now()-interval '8 hours' and last_seen>now()-interval '30 minutes' returning id`;
  if (!rows.length)
    throw new CommerceError("Owner session expired. Sign in again.", 401);
  return { client, id: user.id, sessionId: sid };
}
export async function ownerAudit(actor: string, action: string) {
  await database()`insert into commerce.owner_audit(actor,action) values(${actor},${action})`;
}
