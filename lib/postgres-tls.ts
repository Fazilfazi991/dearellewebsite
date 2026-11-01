/** Trust the provider's configured CA while still verifying chain and hostname. */
export function postgresTls(env: Record<string, string | undefined> = process.env) {
  return {
    rejectUnauthorized: true,
    ...(env.DATABASE_CA_CERT ? { ca: env.DATABASE_CA_CERT } : {}),
  };
}
