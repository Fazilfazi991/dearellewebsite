import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
const raw = readFileSync(".data/supabase-status.env");
const status = parseEnv(
  raw.toString(raw[0] === 255 ? "utf16le" : "utf8").replace(/^\uFEFF/, ""),
);
if (new URL(status.API_URL).hostname !== "127.0.0.1")
  throw new Error("Local fixture only");
const auth = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const sql = postgres("postgres://postgres:postgres@127.0.0.1:55422/postgres", {
  max: 1,
});
try {
  const email = "owner-local@example.test",
    password = randomBytes(24).toString("base64url") + "aA1!";
  const [existing] =
    await sql`select a.id,u.email from commerce.owner_accounts a join auth.users u on u.id=a.id`;
  let id: string;
  if (existing) {
    if (!existing.email?.endsWith("@example.test"))
      throw new Error("Refusing to change a non-fixture owner");
    // Earlier local database integration fixture has no login identity. Normalize that synthetic record only.
    await sql`update auth.users set created_at=coalesce(created_at,now()),updated_at=now(),instance_id='00000000-0000-0000-0000-000000000000',aud='authenticated',role='authenticated',confirmation_token='',recovery_token='',email_change_token_new='',email_change='',email_change_token_current='',reauthentication_token='',raw_app_meta_data='{"provider":"email","providers":["email"]}',raw_user_meta_data='{}' where id=${existing.id}`;
    const { data, error } = await auth.auth.admin.updateUserById(existing.id, {
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    id = data.user.id;
  } else {
    const { data, error } = await auth.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    id = data.user.id;
    await sql`insert into commerce.owner_accounts(id) values(${id})`;
  }
  const intruderEmail = "intruder-local@example.test";
  const { data: users } = await auth.auth.admin.listUsers();
  const old = users?.users.find((u) => u.email === intruderEmail);
  if (old) await auth.auth.admin.updateUserById(old.id, { password });
  else {
    const { error } = await auth.auth.admin.createUser({
      email: intruderEmail,
      password,
      email_confirm: true,
    });
    if (error) throw error;
  }
  writeFileSync(
    ".data/local-owner.json",
    JSON.stringify({ email, password, id, intruderEmail }),
  );
  let env = readFileSync(".env.local", "utf8");
  for (const [key, value] of Object.entries({
    SUPABASE_URL: status.API_URL,
    SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY ?? status.ANON_KEY,
  })) {
    env = env.replace(new RegExp(`^${key}=.*\\r?\\n?`, "m"), "");
    env += `\n${key}=${value}\n`;
  }
  writeFileSync(".env.local", env);
  console.log(
    "Synthetic local owner configured. Credentials remain in ignored .data/local-owner.json. No real account changed.",
  );
} finally {
  await sql.end();
}
