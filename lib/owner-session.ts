import { CommerceError } from "./quote";

// Only pass verified Supabase claims here, after checking the owner allowlist.
export function passwordOwnerSession(claims: unknown, ownerId: string) {
  const c = claims as Record<string, unknown> | undefined;
  if (
    !c ||
    c.sub !== ownerId ||
    typeof c.session_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      c.session_id,
    ) ||
    !Array.isArray(c.amr) ||
    !c.amr.some(
      (entry) =>
        entry && typeof entry === "object" && entry.method === "password",
    )
  )
    throw new CommerceError(
      "Sign in with your email and password to continue.",
      401,
    );
  return c.session_id;
}
