import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomUUID, createHash } from "node:crypto";
import postgres from "postgres";
import { postgresTls } from "../lib/postgres-tls";
import { stagingEnvironmentErrors } from "../staging/guards";
import plan from "../staging/plan.json";
import { syntheticStagingCustomer } from "../lib/staging-safety";
import { PostgresOrderRepository } from "../lib/postgres-order-repository";
if (!process.argv.includes("--run-synthetic")) {
  console.log(
    JSON.stringify(
      {
        mode: "plan-only",
        target: plan.supabaseProjectRef,
        syntheticOnly: true,
        writesPerformed: false,
        requires:
          "Explicit hosted UAT authorization, private staging env file, completed read-only preflight and a SKU with three available",
      },
      null,
      2,
    ),
  );
} else {
  if (plan.productionDeploymentAuthorized)
    throw new Error("This database now serves production. Use a separately isolated staging project for synthetic concurrency checks.");
  const file = process.argv[process.argv.indexOf("--run-synthetic") + 1];
  if (!file) throw new Error("A private staging environment file is required.");
  const env = parseEnv(readFileSync(file, "utf8"));
  if (stagingEnvironmentErrors(env).length)
    throw new Error(
      "Staging configuration is invalid; no test writes started.",
    );
  Object.assign(process.env, env);
  const a = postgres(env.DATABASE_URL, {
      ssl: postgresTls(env),
      prepare: false,
      max: 6,
    }),
    b = postgres(env.DATABASE_URL, {
      ssl: postgresTls(env),
      prepare: false,
      max: 6,
    });
  const repositories = [
      new PostgresOrderRepository(a),
      new PostgresOrderRepository(b),
    ],
    created = new Set<string>();
  let phase = "preflight";
  async function cleanup() {
    for (const id of created) {
      await a.begin(async (transaction) => {
        const tx = transaction as unknown as typeof a;
        const [o] =
          await tx`select fulfilment,payment from commerce.orders where id=${id} for update`;
        if (
          o.fulfilment !== "awaiting_contact" ||
          o.payment !== "advance_pending"
        )
          throw new Error(
            "A UAT order changed outside this runner; manual review required.",
          );
        await tx`update commerce.orders set fulfilment='cancelled',version=version+1 where id=${id}`;
        await tx`update commerce.reservations set state='released' where order_id=${id} and state='active'`;
        await tx`insert into commerce.history(order_id,message) values(${id},'Automated synthetic staging UAT cleanup; no payment or delivery.')`;
        await tx`insert into commerce.owner_audit(action,order_id) values('staging_uat_cleanup',${id})`;
      });
    }
    created.clear();
  }
  try {
    const [gates] =
      await a`select public_intake,live_expiry_approved,retention_approved from commerce.settings`;
    if (
      gates.public_intake ||
      gates.live_expiry_approved ||
      gates.retention_approved
    )
      throw new Error();
    const [sku] =
      await a`select s.product_id,s.variant_id,s.sku from commerce.skus s join commerce.inventory i using(sku) where s.enabled and i.on_hand-i.reserved=3 order by s.sku limit 1`;
    if (!sku) throw new Error("No isolated three-unit SKU available.");
    const items = [
        { productId: sku.product_id, variantId: sku.variant_id, quantity: 1 },
      ],
      quote = await repositories[0].quote(items);
    const request = () => ({
      items,
      customer: syntheticStagingCustomer,
      quoteFingerprint: quote.fingerprint,
      idempotencyKey: randomUUID(),
      acknowledged: true,
    });
    const guest = () => createHash("sha256").update(randomUUID()).digest("hex");
    phase = "last-unit concurrency";
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) =>
        repositories[i % 2].create(request(), guest()),
      ),
    );
    for (const r of results)
      if (r.status === "fulfilled") created.add(r.value.id);
    if (created.size !== 3 || (await repositories[0].stock(sku.sku)) !== 0)
      throw new Error();
    await cleanup();
    phase = "duplicate requests across independent pools";
    const input = request(),
      session = guest();
    const retries = await Promise.allSettled(
      Array.from({ length: 8 }, (_, i) =>
        repositories[i % 2].create(input, session).then((order) => {
          created.add(order.id);
          return order;
        }),
      ),
    );
    if (retries.some((result) => result.status !== "fulfilled"))
      throw new Error();
    if (created.size !== 1 || (await repositories[0].stock(sku.sku)) !== 2)
      throw new Error();
    await cleanup();
    if ((await repositories[0].stock(sku.sku)) !== 3) throw new Error();
    writeFileSync(
      ".data/staging-concurrency-evidence.json",
      JSON.stringify(
        {
          at: new Date().toISOString(),
          projectRef: plan.supabaseProjectRef,
          syntheticOnly: true,
          independentPools: 2,
          simultaneousAttempts: 10,
          accepted: 3,
          idempotentRetries: 8,
          idempotentOrders: 1,
          stockRestored: 3,
          cleanupAudited: true,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS hosted database concurrency/idempotency across two independent pools; only runner-created test reservations cancelled and audited. This does not replace browser/MFA/deployment-instance UAT.",
    );
  } catch {
    try {
      await cleanup();
    } catch {
      console.error(
        "Synthetic cleanup needs operator review; inspect runner test orders before continuing.",
      );
    }
    console.error(
      `FAIL ${phase}; hosted UAT is not complete. No secrets or customer details printed.`,
    );
    process.exitCode = 1;
  } finally {
    await a.end();
    await b.end();
  }
}
