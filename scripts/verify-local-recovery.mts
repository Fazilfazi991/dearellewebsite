import assert from "node:assert/strict";
import postgres from "postgres";
import { writeFileSync } from "node:fs";
const databases = ["postgres", "dearelle_recovery_20261031"];
const result = [];
for (const name of databases) {
  const sql = postgres(`postgres://postgres:postgres@127.0.0.1:55422/${name}`, {
    max: 1,
  });
  try {
    const [counts] =
      await sql`select (select count(*)::int from commerce.orders) as orders,(select count(*)::int from commerce.advance_verifications) as advances,(select count(*)::int from commerce.cod_collections) as cod,(select sum(on_hand)::int from commerce.inventory) as stock,(select sum(reserved)::int from commerce.inventory) as reserved,(select count(*)::int from commerce.inventory_audit) as inventory_audit`;
    const [digest] =
      await sql`select md5(string_agg(id::text||quote::text||payment||fulfilment,',' order by id)) as digest from commerce.orders`;
    result.push({ ...counts, ...digest });
    const [rls] =
      await sql`select bool_and(relrowsecurity) as ok from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname='commerce' and c.relkind='r'`;
    assert.equal(rls.ok, true);
  } finally {
    await sql.end();
  }
}
assert.deepEqual(result[0], result[1]);
writeFileSync(
  ".data/recovery-verification.json",
  JSON.stringify(
    { at: new Date().toISOString(), matched: true, ...result[0] },
    null,
    2,
  ),
);
console.log(
  "PASS isolated full backup restore: order digest, payments, stock, reservations, audit counts and RLS match.",
);
