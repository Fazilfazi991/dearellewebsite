import type { Metadata } from "next";
import { BagEdit } from "@/components/bag-edit";
import { lookbookCollection } from "@/lib/bag-edit";
import { launchConfig } from "@/lib/config";
import "./bag-edit.css";

export const metadata: Metadata = {
  title: "The Bag Edit",
  description:
    "A curated collection by Dearelle. Explore the bags, discover the details and find your favourite.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "The Bag Edit — by Dearelle",
    description: "A curated collection by Dearelle.",
    images: [
      {
        url: "/images/bag-ivory-campaign-model.jpg",
        width: 1000,
        height: 1250,
      },
    ],
  },
};

export default function BagEditPage() {
  return (
    <BagEdit
      bags={lookbookCollection()}
      whatsappNumber={launchConfig.whatsappNumber}
    />
  );
}
