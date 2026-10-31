import { products } from "./products";
export type CartItem = { productId: string; color: string; quantity: number };
export function validCart(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (row): row is CartItem =>
        !!row &&
        typeof row === "object" &&
        products.some(
          (p) =>
            p.id === row.productId &&
            p.colors.some((c) => c.name === row.color),
        ) &&
        Number.isInteger(row.quantity) &&
        row.quantity > 0 &&
        row.quantity <= 10,
    )
    .reduce<CartItem[]>((rows, row) => {
      if (
        !rows.some(
          (r) => r.productId === row.productId && r.color === row.color,
        )
      )
        rows.push({
          productId: row.productId,
          color: row.color,
          quantity: row.quantity,
        });
      return rows;
    }, []);
}
export function subtotal(items: CartItem[]) {
  return items.reduce(
    (sum, item) =>
      sum +
      (products.find((p) => p.id === item.productId)?.price ?? 0) *
        item.quantity,
    0,
  );
}
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const found = items.find(
    (r) => r.productId === item.productId && r.color === item.color,
  );
  return validCart(
    found
      ? items.map((r) =>
          r === found
            ? { ...r, quantity: Math.min(10, r.quantity + item.quantity) }
            : r,
        )
      : [...items, item],
  );
}
