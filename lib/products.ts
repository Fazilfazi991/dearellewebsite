export type ProductColor = {
  name: string;
  hex: string;
  image?: string;
  imagePosition?: string;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "watches" | "bags";
  price: number;
  image: string;
  imagePosition?: string;
  colors: ProductColor[];
  imagery?: "ai-styled";
  description: string;
  demo: true;
};
export const products: Product[] = [
  {
    id: "w1",
    slug: "the-everyday-watch",
    name: "The Contour Watch",
    category: "watches",
    price: 1490,
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
    slug: "the-city-shoulder-bag",
    name: "The City Shoulder Bag",
    category: "bags",
    price: 1890,
    image: "option2-bag",
    imagePosition: "76% center",
    colors: [
      { name: "Tan", hex: "#966647" },
      { name: "Espresso", hex: "#45342b" },
    ],
    description:
      "From coffee runs to evening plans, a little inspiration for what you carry. This is a representative sample, not a live product.",
    demo: true,
  },
  {
    id: "w2",
    slug: "the-classic-watch",
    name: "The Soft Square Watch",
    category: "watches",
    price: 1690,
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
    slug: "the-weekend-bag",
    name: "The Weekend Bag",
    category: "bags",
    price: 2190,
    image: "bag-tan",
    colors: [
      { name: "Blush", hex: "#d6b6b0" },
      { name: "Ivory", hex: "#e9e1d6" },
    ],
    description:
      "A softer approach to everyday dressing. This representative handbag shows the future shopping experience.",
    demo: true,
  },
  {
    id: "w3",
    slug: "the-petite-square-watch",
    name: "The Petite Square Watch",
    category: "watches",
    price: 1690,
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
    slug: "the-teal-dial-watch",
    name: "The Teal Dial Watch",
    category: "watches",
    price: 1690,
    image: "watch-teal",
    colors: [{ name: "Silver / Teal", hex: "#16818b", image: "watch-teal" }],
    description:
      "A vivid teal face within a rounded silver case, with layered dial details and a silver link bracelet. A distinct design within the collection.",
    imagery: "ai-styled",
    demo: true,
  },
];
export function productVisual(product: Product, color?: string) {
  const variant = product.colors.find((c) => c.name === color);
  return variant?.image
    ? { image: variant.image, position: variant.imagePosition ?? "center" }
    : { image: product.image, position: product.imagePosition ?? "center" };
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
