import postgres from "postgres";
import { CommerceError } from "./quote";

let connection: ReturnType<typeof postgres> | undefined;
export function database() {
  if (!process.env.DATABASE_URL)
    throw new CommerceError("The order database is not configured.", 503);
  const target = new URL(process.env.DATABASE_URL);
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(target.hostname);
  if (
    target.username !== "dearelle_app" &&
    !target.username.startsWith("dearelle_app.")
  )
    throw new CommerceError(
      "A restricted commerce database role is required.",
      503,
    );
  return (connection ??= postgres(process.env.DATABASE_URL, {
    max: 8,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: local ? false : { rejectUnauthorized: true },
  }));
}
export function testOrdersEnabled() {
  return (
    process.env.COMMERCE_TEST_ORDERS === "1" &&
    ["local", "staging"].includes(process.env.DEPLOYMENT_STAGE ?? "") &&
    process.env.VERCEL_ENV !== "production" &&
    !!process.env.DATABASE_URL &&
    process.env.PUBLIC_ORDER_INTAKE !== "1"
  );
}
