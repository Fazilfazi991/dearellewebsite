import { createHash } from "node:crypto";
import { products, productPrice } from "./products";
import { commercePolicy } from "./config";

export class CommerceError extends Error {
  constructor(
    message: string,
    public status = 422,
  ) {
    super(message);
  }
}
export type OrderLine = {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  brand: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
export type Quote = {
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  advance: number;
  codBalance: number;
  currency: "INR";
  fingerprint: string;
  testMode: boolean;
};
export function createQuote(
  input: unknown,
  stock?: (sku: string) => number,
): Quote {
  if (!Array.isArray(input) || !input.length || input.length > 40)
    throw new CommerceError("Your bag is empty or invalid. Please review it.");
  const grouped = new Map<string, OrderLine>();
  for (const row of input) {
    const p = products.find((p) => p.id === row?.productId);
    const v = p?.variants.find((v) => v.id === row?.variantId);
    if (!p || !v || v.availability !== "available")
      throw new CommerceError(
        "A selected colour is unavailable. Please review your bag.",
      );
    if (
      !Number.isSafeInteger(row.quantity) ||
      row.quantity < 1 ||
      row.quantity > 10
    )
      throw new CommerceError("Choose a valid quantity for each piece.");
    const quantity = row.quantity + (grouped.get(v.sku)?.quantity ?? 0);
    const available = Math.min(v.stock, stock ? stock(v.sku) : v.stock);
    if (quantity > available)
      throw new CommerceError(
        `${p.name}, ${v.name}: only ${available} available.`,
        409,
      );
    const unitPrice = productPrice(p, v.id);
    grouped.set(v.sku, {
      productId: p.id,
      variantId: v.id,
      sku: v.sku,
      name: p.name,
      brand: p.brand,
      color: v.name,
      quantity,
      unitPrice,
      lineTotal: quantity * unitPrice,
    });
  }
  const lines = [...grouped.values()].sort((a, b) =>
    a.sku.localeCompare(b.sku),
  );
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = subtotal + commercePolicy.shippingCharge;
  const advance = Math.min(commercePolicy.advanceDeposit, total);
  const data = {
    lines,
    subtotal,
    shipping: commercePolicy.shippingCharge,
    total,
    advance,
    codBalance: total - advance,
    currency: "INR" as const,
  };
  return {
    ...data,
    fingerprint: createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex"),
    testMode: true,
  };
}
