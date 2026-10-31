export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  country: "India";
};
export type CustomerErrors = Partial<Record<keyof Customer, string>>;
export function validateCustomer(input: unknown): {
  customer: Customer;
  errors: CustomerErrors;
} {
  const row =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const text = (key: string) =>
    typeof row[key] === "string" ? row[key].trim() : "";
  const customer: Customer = {
    name: text("name"),
    email: text("email"),
    phone: text("phone").replace(/[\s()-]/g, ""),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    pin: text("pin"),
    country: "India",
  };
  const errors: CustomerErrors = {};
  for (const [key, min, max] of [
    ["name", 2, 80],
    ["address", 10, 180],
    ["city", 2, 80],
    ["state", 2, 80],
  ] as const) {
    if (
      customer[key].length < min ||
      customer[key].length > max ||
      /[\x00-\x1f<>]/.test(customer[key])
    )
      errors[key] = `Enter a valid ${key === "name" ? "full name" : key}.`;
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
    customer.email.length > 120
  )
    errors.email = "Enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(customer.phone))
    errors.phone = "Enter a 10-digit Indian mobile number.";
  if (!/^[1-9]\d{5}$/.test(customer.pin))
    errors.pin = "Enter a valid 6-digit Indian PIN code.";
  if (row.country && row.country !== "India")
    errors.country = "Delivery is available within India only.";
  return { customer, errors };
}
