import { products, productPrice, selectedVariant } from "./products";
export type CartItem = {
  productId: string;
  color: string;
  quantity: number;
  variantId?: string;
  sku?: string;
};
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
            p.variants.some(
              (v) => v.name === row.color && v.availability !== "unavailable",
            ),
        ) &&
        Number.isInteger(row.quantity) &&
        row.quantity > 0 &&
        row.quantity <= 100,
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
          quantity: Math.min(
            row.quantity,
            selectedVariant(
              products.find((p) => p.id === row.productId)!,
              row.color,
            ).stock,
          ),
          variantId: selectedVariant(
            products.find((p) => p.id === row.productId)!,
            row.color,
          ).id,
          sku: selectedVariant(
            products.find((p) => p.id === row.productId)!,
            row.color,
          ).sku,
        });
      return rows;
    }, []);
}
export function subtotal(items: CartItem[]) {
  return items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return (
      sum + (product ? productPrice(product, item.color) : 0) * item.quantity
    );
  }, 0);
}
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const found = items.find(
    (r) => r.productId === item.productId && r.color === item.color,
  );
  return validCart(
    found
      ? items.map((r) =>
          r === found
            ? {
                ...r,
                quantity: Math.min(
                  selectedVariant(
                    products.find((p) => p.id === item.productId)!,
                    item.color,
                  ).stock,
                  r.quantity + item.quantity,
                ),
              }
            : r,
        )
      : [...items, item],
  );
}
