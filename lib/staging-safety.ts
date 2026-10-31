import type { Customer } from "./checkout";
import { CommerceError } from "./quote";
export const syntheticStagingCustomer: Customer = {
  name: "UAT Test Customer",
  email: "uat@example.test",
  phone: "9000000000",
  address: "12 Synthetic Road",
  city: "Mumbai",
  state: "Maharashtra",
  pin: "400001",
  country: "India",
};
export function assertSyntheticStagingCustomer(
  customer: Customer,
  stage = process.env.DEPLOYMENT_STAGE,
  enabled = process.env.STAGING_SYNTHETIC_ONLY,
) {
  if (stage !== "staging") return;
  if (enabled !== "1")
    throw new CommerceError(
      "Synthetic staging protection is not configured.",
      503,
    );
  if (
    Object.entries(syntheticStagingCustomer).some(
      ([key, value]) => customer[key as keyof Customer] !== value,
    )
  )
    throw new CommerceError(
      "This protected staging preview accepts only the provided fictional UAT customer details. No real order has been created.",
    );
}
