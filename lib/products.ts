export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "watches" | "bags";
  price: number;
  image: string;
  imagePosition?: string;
  colors: { name: string; hex: string }[];
  description: string;
  demo: true;
};
export const products: Product[] = [
  {
    id: "w1",
    slug: "the-everyday-watch",
    name: "The Everyday Watch",
    category: "watches",
    price: 1490,
    image: "option2-watch",
    imagePosition: "23% center",
    colors: [
      { name: "Gold", hex: "#c5a365" },
      { name: "Silver", hex: "#b9b9b5" },
    ],
    description:
      "A considered finishing touch for your everyday wardrobe. Explore the watch shopping experience with this representative sample.",
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
    name: "The Classic Watch",
    category: "watches",
    price: 1690,
    image: "watch-rose",
    colors: [
      { name: "Rose gold", hex: "#bd9687" },
      { name: "Gold", hex: "#c5a365" },
    ],
    description:
      "An understated accent, styled your way. A demo watch to help you explore colours, your bag and checkout.",
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
];
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
