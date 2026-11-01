export type ProductColor = {
  name: string;
  hex: string;
  image?: string;
  imagePosition?: string;
  images?: ProductImage[];
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
  stock: number;
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
  testCheckoutOnly: true;
};
function bagCampaignImages(name: string): ProductImage[] {
  const image = `bag-${name}-campaign-studio`;
  return [
    { image },
    { image: `bag-${name}-campaign-model` },
    { image, detail: true },
  ];
}

const catalogue: (Omit<Product, "brand" | "basePrice" | "variants"> & {
  brand: Product["brand"];
})[] = [
  {
    id: "w5",
    brand: "Casio",
    slug: "casio-compact-digital-watch",
    name: "Casio Compact Digital Watch",
    category: "watches",
    price: 699,
    image: "watch-digital-compact-main",
    colors: [
      {
        name: "Black",
        hex: "#202122",
        image: "watch-digital-compact-main",
        images: [
          { image: "watch-digital-compact-main" },
          { image: "watch-digital-compact-wrist" },
          { image: "watch-digital-compact-detail" },
        ],
      },
    ],
    description:
      "A compact rectangular digital face, a black strap and warm gold-tone markings. A clean, understated shape for everyday styling.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "w6",
    brand: "Casio",
    slug: "casio-world-map-watch",
    name: "Casio World Map Watch",
    category: "watches",
    price: 799,
    image: "watch-digital-map-black-wrist",
    colors: [
      {
        name: "Black / Black",
        hex: "#202122",
        image: "watch-digital-map-black-wrist",
        images: [
          { image: "watch-digital-map-black-wrist" },
          { image: "watch-digital-map-black-detail" },
          { image: "watch-digital-map-black-studio" },
        ],
      },
      {
        name: "Gold / Brown",
        hex: "#8b4b36",
        image: "watch-digital-map-gold-main",
        images: [
          { image: "watch-digital-map-gold-main" },
          { image: "watch-digital-map-gold-wrist" },
          { image: "watch-digital-map-gold-detail" },
        ],
      },
    ],
    description:
      "An angular digital face with a small map motif and a contrasting stitched strap. Choose an all-black finish or a gold-tone case with brown.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "w7",
    brand: "Casio",
    slug: "casio-triple-display-watch",
    name: "Casio Triple Display Watch",
    category: "watches",
    price: 799,
    image: "watch-digital-triple-main",
    colors: [
      {
        name: "Black",
        hex: "#202122",
        image: "watch-digital-triple-main",
        images: [
          { image: "watch-digital-triple-main" },
          { image: "watch-digital-triple-wrist" },
          { image: "watch-digital-triple-detail" },
        ],
      },
    ],
    description:
      "Three circular display details sit above a digital window, framed by an angular black case and a stitched black strap. A distinct design from the map-dial model.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "b10",
    brand: "Dearelle",
    slug: "the-navy-zip-crossbody",
    name: "The Navy Zip Crossbody",
    category: "bags",
    price: 399,
    image: "bag-navy-campaign-studio",
    colors: [
      {
        name: "Navy",
        hex: "#182442",
        image: "bag-navy-campaign-studio",
        images: bagCampaignImages("navy"),
      },
    ],
    description:
      "A compact navy crossbody with a softly rounded profile, zip details and a wide matching shoulder strap.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "w1",
    brand: "Felix",
    slug: "the-everyday-watch",
    name: "The Signature Watch",
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
      "The first Felix model, with a softly squared dial. Choose rose gold with a pink face or gunmetal with a white face.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
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
    testCheckoutOnly: true,
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
    testCheckoutOnly: true,
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
    testCheckoutOnly: true,
  },
  {
    id: "w3",
    brand: "Felix",
    slug: "the-petite-square-watch",
    name: "The Petite Dial Watch",
    category: "watches",
    price: 799,
    image: "watch-petite-black-studio-main",
    colors: [
      {
        name: "Black / Black",
        hex: "#252526",
        image: "watch-petite-black-studio-main",
        images: [
          { image: "watch-petite-black-studio-main" },
          { image: "watch-petite-black-studio-side" },
          { image: "watch-petite-black-studio-bracelet" },
        ],
      },
      {
        name: "Rose gold / White",
        hex: "#bd9687",
        image: "watch-category-stock",
        imagePosition: "23% center",
      },
    ],
    description:
      "The smaller-dial Felix model, distinct from the Signature. Available in black with a black dial or rose gold with a white dial.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
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
    testCheckoutOnly: true,
  },
  {
    id: "b3",
    brand: "Dearelle",
    slug: "the-taupe-flap-bag",
    name: "The Marbled Flap Bag",
    category: "bags",
    price: 399,
    image: "bag-taupe-flap",
    colors: [
      { name: "Taupe / Ivory", hex: "#ab8b7b", image: "bag-taupe-flap" },
      {
        name: "Chocolate / Ivory",
        hex: "#693c2a",
        image: "bag-chocolate-flap-campaign-studio",
        images: bagCampaignImages("chocolate-flap"),
      },
    ],
    description: "A glossy marbled finish, ivory trim and a clean flap shape.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "b4",
    brand: "Dearelle",
    slug: "the-purple-flap-bag",
    name: "The Purple Flap Bag",
    category: "bags",
    price: 399,
    image: "bag-purple-campaign-studio",
    colors: [
      {
        name: "Purple / Ivory",
        hex: "#ad7197",
        image: "bag-purple-campaign-studio",
        images: bagCampaignImages("purple"),
      },
    ],
    description: "A soft purple finish with contrasting ivory sides and strap.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "b5",
    brand: "Dearelle",
    slug: "the-patterned-crossbody",
    name: "The Patterned Crossbody",
    category: "bags",
    price: 399,
    image: "bag-pattern-campaign-studio",
    colors: [
      {
        name: "Chocolate",
        hex: "#513122",
        image: "bag-pattern-campaign-studio",
        images: bagCampaignImages("pattern"),
      },
    ],
    description:
      "A compact chocolate silhouette with a floral geometric pattern and a slim shoulder strap.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
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
    testCheckoutOnly: true,
  },
  {
    id: "b7",
    brand: "Dearelle",
    slug: "the-olive-shoulder-bag",
    name: "The Olive Shoulder Bag",
    category: "bags",
    price: 399,
    image: "bag-olive-campaign-studio",
    colors: [
      {
        name: "Olive",
        hex: "#6b705b",
        image: "bag-olive-campaign-studio",
        images: bagCampaignImages("olive"),
      },
    ],
    description:
      "A curved shoulder silhouette with a textured olive finish and a small gold-tone accent.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "b8",
    brand: "Dearelle",
    slug: "the-ivory-shoulder-bag",
    name: "The Ivory Shoulder Bag",
    category: "bags",
    price: 399,
    image: "bag-ivory-campaign-studio",
    colors: [
      {
        name: "Ivory",
        hex: "#e7dccb",
        image: "bag-ivory-campaign-studio",
        images: bagCampaignImages("ivory"),
      },
    ],
    description:
      "A gently curved profile, ivory texture and matching shoulder strap.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
  {
    id: "b9",
    brand: "Dearelle",
    slug: "the-berry-shoulder-bag",
    name: "The Berry Shoulder Bag",
    category: "bags",
    price: 399,
    image: "bag-berry-campaign-studio",
    colors: [
      {
        name: "Berry",
        hex: "#8f2445",
        image: "bag-berry-campaign-studio",
        images: bagCampaignImages("berry"),
      },
    ],
    description:
      "A rich berry finish, softly curved body and a small gold-tone detail.",
    imagery: "ai-styled",
    testCheckoutOnly: true,
  },
];
// Normalize legacy colour data once; all buying surfaces share these variants.
export const products: Product[] = catalogue.map((p) => {
  // Owner-confirmed model pricing takes precedence over historical brand defaults.
  const basePrice = p.price;
  return {
    ...p,
    basePrice,
    price: basePrice,
    variants: p.colors.map((c) => {
      const image = c.image ?? p.image;
      const position =
        c.imagePosition ?? (c.image ? "center" : (p.imagePosition ?? "center"));
      return {
        id: `${p.id}-${c.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-$/, "")}`,
        sku: `${p.id.toUpperCase()}-${c.name
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-")
          .replace(/-$/, "")}`,
        name: c.name,
        swatch: c.hex,
        availability: "available" as const,
        stock: 3,
        images:
          c.images ??
          (image === "watch-petite-black"
            ? [
                { image, position },
                { image: "watch-petite-black-side", position: "center" },
                { image: "watch-petite-black-bracelet", position: "center" },
              ]
            : [
                { image, position },
                { image, position, detail: true },
              ]),
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
export const catalogueMode = "owner-catalogue-test-checkout" as const;
export function assertTestCheckout() {
  if (
    process.env.CATALOGUE_MODE &&
    !["test", "demo"].includes(process.env.CATALOGUE_MODE)
  )
    throw new Error(
      "Live order intake is unavailable. Configure durable storage and complete launch review before enabling commerce.",
    );
}
