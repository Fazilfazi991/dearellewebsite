import { products, productPrice, type Product } from "./products";
import type { LookbookBag } from "./bag-edit-links";

const editorialOrder = [
  "b9",
  "b8",
  "b7",
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "b10",
];

// Read-only projection, not a second catalogue. Detail crops aren't new photos.
export function lookbookCollection(
  catalogue: Product[] = products,
): LookbookBag[] {
  return catalogue
    .filter((product) => product.category === "bags")
    .toSorted((a, b) => {
      const rank = (id: string) => {
        const index = editorialOrder.indexOf(id);
        return index < 0 ? editorialOrder.length : index;
      };
      return rank(a.id) - rank(b.id);
    })
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        swatch: variant.swatch,
        price: productPrice(product, variant.id),
        images: variant.images.filter(
          (image, index, images) =>
            images.findIndex((other) => other.image === image.image) === index,
        ),
      })),
    }));
}
