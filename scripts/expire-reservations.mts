import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
Object.assign(process.env, parseEnv(readFileSync(".env.local", "utf8")));
if (
  process.env.DEPLOYMENT_STAGE !== "local" ||
  new URL(process.env.DATABASE_URL!).hostname !== "127.0.0.1"
)
  throw new Error("Local test worker only");
const { orderRepository } = await import("../lib/postgres-order-repository");
const repo = orderRepository();
console.log(`Expired ${await repo.expire()} eligible test reservations.`);
await repo.sql.end();
