import type { ProductImage } from "./products";

export type LookbookVariant = {
  id: string;
  sku: string;
  name: string;
  swatch: string;
  price: number;
  images: ProductImage[];
};
export type LookbookBag = {
  id: string;
  slug: string;
  name: string;
  variants: LookbookVariant[];
};

export function bagEditLink(bagId: string, variantId: string) {
  return `/bag-edit?${new URLSearchParams({ bag: bagId, colour: variantId })}`;
}

export function resolveBagLink(bags: LookbookBag[], search: string) {
  const query = new URLSearchParams(search);
  const bag = bags.find(
    (item) => item.id === query.get("bag") || item.slug === query.get("bag"),
  );
  if (!bag) return null;
  const colour = query.get("colour");
  const variant = colour
    ? bag.variants.find((item) => item.id === colour)
    : bag.variants[0];
  return variant ? { bag, variant } : null;
}

export function bagEnquiry(
  bag: LookbookBag,
  variant: LookbookVariant,
  directLink: string,
) {
  return `Hi Dearelle! ♡\n\nI found this lovely bag in your collection.\n\nBag: ${bag.name}\nColour: ${variant.name}\nPrice: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(variant.price)}\nReference: ${variant.sku}\nLink: ${directLink}\n\nIs this available?`;
}
