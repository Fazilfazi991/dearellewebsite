export type ProductColor = {
  name: string;
  hex: string;
  image?: string;
  imagePosition?: string;
};
export type ProductImage = {
  image: string;
  position?: string;
  detail?: boolean;
};
export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  swatch: string;
  price?: number;
  images: ProductImage[];
  availability: "unconfirmed" | "available" | "unavailable";
};
export const watchBrandPrices = { Casio: 599, Felix: 799 } as const;
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "watches" | "bags";
  price: number;
  basePrice: number;
  brand: "Casio" | "Felix" | "Dearelle";
  variants: ProductVariant[];
  image: string;
  imagePosition?: string;
  colors: ProductColor[];
  imagery?: "ai-styled";
  description: string;
  demo: true;
};
const catalogue: (Omit<Product, "brand" | "basePrice" | "variants"> & {
  brand: Product["brand"];
})[] = [
  {
    id: "w1",
    brand: "Felix",
    slug: "the-everyday-watch",
    name: "The Contour Watch",
    category: "watches",
    price: 799,
    image: "watch-category-stock",
    imagePosition: "23% center",
    colors: [
      {
        name: "Rose gold / Ivory",
        hex: "#bd9687",
        image: "watch-category-stock",
        imagePosition: "23% center",
      },
      { name: "Black / Black", hex: "#252526", image: "watch-contour-black" },
    ],
    description:
      "Soft cushion curves, slender markers and the distinctive 12-and-6 dial. Explore rose gold with an ivory face, or black with warm rose-gold details.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b1",
    brand: "Dearelle",
    slug: "the-city-shoulder-bag",
    name: "The Oxblood Top-Handle Bag",
    category: "bags",
    price: 399,
    image: "bag-oxblood-top-handle",
    colors: [
      { name: "Oxblood", hex: "#572830", image: "bag-oxblood-top-handle" },
    ],
    description:
      "A structured silhouette with a curved handle, textured finish and a distinctive rectangular clasp.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "w2",
    brand: "Casio",
    slug: "the-classic-watch",
    name: "The Soft Square Watch",
    category: "watches",
    price: 599,
    image: "watch-date-rose-black",
    colors: [
      {
        name: "Rose gold / Black",
        hex: "#bd9687",
        image: "watch-date-rose-black",
      },
      { name: "Rose gold / Green", hex: "#216447", image: "watch-date-green" },
      {
        name: "Rose gold / Champagne",
        hex: "#d4b599",
        image: "watch-date-champagne",
      },
      { name: "Black / Black", hex: "#252526", image: "watch-date-black" },
    ],
    description:
      "A softly rounded square face, clean baton markers and a small date-window detail. Four colourways bring a different mood to the same considered silhouette.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b2",
    brand: "Dearelle",
    slug: "the-weekend-bag",
    name: "The Burgundy Tote",
    category: "bags",
    price: 399,
    image: "bag-burgundy-tote",
    colors: [{ name: "Burgundy", hex: "#652633", image: "bag-burgundy-tote" }],
    description:
      "A roomy-looking everyday silhouette with twin handles, sculpted front pleats and a slim silver-tone detail.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "w3",
    brand: "Felix",
    slug: "the-petite-square-watch",
    name: "The Petite Square Watch",
    category: "watches",
    price: 799,
    image: "watch-square-pink",
    colors: [
      { name: "Rose gold / Pink", hex: "#c99494", image: "watch-square-pink" },
      {
        name: "Gunmetal / White",
        hex: "#44474b",
        image: "watch-square-gunmetal",
      },
    ],
    description:
      "A compact square case with gently softened corners and an understated baton dial. Choose a pink face with rose-gold details or a white face framed in gunmetal.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "w4",
    brand: "Casio",
    slug: "the-teal-dial-watch",
    name: "The Teal Dial Watch",
    category: "watches",
    price: 599,
    image: "watch-teal",
    colors: [{ name: "Silver / Teal", hex: "#16818b", image: "watch-teal" }],
    description:
      "A vivid teal face within a rounded silver case, with layered dial details and a silver link bracelet. A distinct design within the collection.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b3",
    brand: "Dearelle",
    slug: "the-taupe-flap-bag",
    name: "The Taupe Flap Bag",
    category: "bags",
    price: 399,
    image: "bag-taupe-flap",
    colors: [
      { name: "Taupe / Ivory", hex: "#ab8b7b", image: "bag-taupe-flap" },
    ],
    description: "A glossy marbled finish, ivory trim and a clean flap shape.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b4",
    brand: "Dearelle",
    slug: "the-purple-flap-bag",
    name: "The Purple Flap Bag",
    category: "bags",
    price: 399,
    image: "bag-purple-flap",
    colors: [
      { name: "Purple / Ivory", hex: "#ad7197", image: "bag-purple-flap" },
    ],
    description: "A soft purple finish with contrasting ivory sides and strap.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b5",
    brand: "Dearelle",
    slug: "the-patterned-crossbody",
    name: "The Patterned Crossbody",
    category: "bags",
    price: 399,
    image: "bag-chocolate-pattern",
    colors: [
      { name: "Chocolate", hex: "#513122", image: "bag-chocolate-pattern" },
    ],
    description:
      "A compact chocolate silhouette with a floral geometric pattern and a slim shoulder strap.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b6",
    brand: "Dearelle",
    slug: "the-monogram-flap-bag",
    name: "The Monogram Flap Bag",
    category: "bags",
    price: 399,
    image: "bag-ivory-monogram",
    colors: [
      {
        name: "Ivory / Chocolate",
        hex: "#e4ded0",
        image: "bag-ivory-monogram",
      },
    ],
    description:
      "An ivory patterned flap, chocolate trim and a sculptural gold-tone clasp.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b7",
    brand: "Dearelle",
    slug: "the-olive-shoulder-bag",
    name: "The Olive Shoulder Bag",
    category: "bags",
    price: 399,
    image: "bag-olive-shoulder",
    colors: [{ name: "Olive", hex: "#6b705b", image: "bag-olive-shoulder" }],
    description:
      "A curved shoulder silhouette with a textured olive finish and a small gold-tone accent.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b8",
    brand: "Dearelle",
    slug: "the-ivory-shoulder-bag",
    name: "The Ivory Shoulder Bag",
    category: "bags",
    price: 399,
    image: "bag-ivory-shoulder",
    colors: [{ name: "Ivory", hex: "#e7dccb", image: "bag-ivory-shoulder" }],
    description:
      "A gently curved profile, ivory texture and matching shoulder strap.",
    imagery: "ai-styled",
    demo: true,
  },
  {
    id: "b9",
    brand: "Dearelle",
    slug: "the-berry-shoulder-bag",
    name: "The Berry Shoulder Bag",
    category: "bags",
    price: 399,
    image: "bag-berry-shoulder",
    colors: [{ name: "Berry", hex: "#8f2445", image: "bag-berry-shoulder" }],
    description:
      "A rich berry finish, softly curved body and a small gold-tone detail.",
    imagery: "ai-styled",
    demo: true,
  },
];
// Normalize legacy colour data once; all buying surfaces share these variants.
export const products: Product[] = catalogue.map((p) => {
  const basePrice =
    p.category === "bags"
      ? 399
      : watchBrandPrices[p.brand as keyof typeof watchBrandPrices];
  return {
    ...p,
    basePrice,
    price: basePrice,
    variants: p.colors.map((c, index) => {
      const image = c.image ?? p.image;
      const position =
        c.imagePosition ?? (c.image ? "center" : (p.imagePosition ?? "center"));
      return {
        id: `${p.id}-${index + 1}`,
        sku: `${p.id.toUpperCase()}-${index + 1}`,
        name: c.name,
        swatch: c.hex,
        availability: "unconfirmed" as const,
        images: [
          { image, position },
          { image, position, detail: true },
        ],
      };
    }),
  };
});
export function selectedVariant(product: Product, color?: string) {
  return (
    product.variants.find((v) => v.name === color || v.id === color) ??
    product.variants[0]
  );
}
export function productPrice(product: Product, color?: string) {
  return selectedVariant(product, color).price ?? product.basePrice;
}
export function productVisual(product: Product, color?: string) {
  const image = selectedVariant(product, color).images[0];
  return { image: image.image, position: image.position ?? "center" };
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const catalogueMode = "demo" as const;
export function assertDemoOnly() {
  if (process.env.CATALOGUE_MODE && process.env.CATALOGUE_MODE !== "demo")
    throw new Error(
      "Live catalogue is unavailable. Replace demo data and complete launch review before enabling commerce.",
    );
}
