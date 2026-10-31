import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Catalogue } from "@/components/catalogue";
const pages: Record<string, { title: string; text: string }> = {
  watches: {
    title: "A moment, made yours.",
    text: "Little details. Lasting impressions. Find your everyday watch.",
  },
  bags: {
    title: "Carry a little confidence.",
    text: "For wherever the day takes you. Discover your next plus-one.",
  },
  "new-arrivals": {
    title: "Your next little luxury.",
    text: "Explore the preview collection of everyday watches and bags.",
  },
  about: {
    title: "Lovely things. Everyday moments.",
    text: "Dearelle is a women’s fashion accessories brand in India, bringing a considered eye to watches and handbags. Beautiful little luxuries, made for everyday moments.",
  },
  contact: {
    title: "A little help, when you need it.",
    text: "Contact and WhatsApp assistance are not configured in this independent preview. The owner will add verified contact details before launch.",
  },
  shipping: {
    title: "Shipping, thoughtfully considered.",
    text: "Shipping destinations, delivery estimates, charges and processing times await owner confirmation. Delivery options will be confirmed before ordering.",
  },
  returns: {
    title: "The details that matter.",
    text: "The return window, eligibility, costs and process await owner confirmation. This preview cannot accept purchases or returns.",
  },
  privacy: {
    title: "Your privacy matters.",
    text: "This site stores your bag and wishlist in this browser’s local storage. Checkout details are never submitted or saved. There are no analytics or payment integrations. A reviewed privacy policy and verified data-controller contact must be added before launch.",
  },
  terms: {
    title: "A note about this preview.",
    text: "Checkout is not currently accepting orders. Product images are styled representations of the collection. Prices are supplied by Dearelle. Availability, delivery and final terms will be confirmed before ordering.",
  },
  instagram: {
    title: "Stay close to Dearelle.",
    text: "Our verified Instagram handle will be added here before launch. The homepage moodboard uses editorial stock photography and does not represent customers or endorsements.",
  },
};
export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: pages[page]?.title ?? "Page not found",
    alternates: { canonical: `/${page}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const info = pages[page];
  if (!info) notFound();
  const category =
    page === "watches" || page === "bags" || page === "new-arrivals";
  return (
    <main
      id="main"
      className={`section inner-page ${category ? "" : "prose-page"}`}
    >
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>{page.replaceAll("-", " ")}</span>
      </div>
      <div className="page-heading">
        <h1>{info.title}</h1>
        <p>{info.text}</p>
      </div>
      {category ? (
        <Catalogue category={page as "watches" | "bags" | "new-arrivals"} />
      ) : (
        <>
          <p className="notice">
            {page === "about"
              ? "Independent V2 prototype · Launch details are being prepared."
              : "Preview information · Not a final published policy or contact channel."}
          </p>
          <Link className="button" href="/new-arrivals">
            Explore the preview
          </Link>
        </>
      )}
    </main>
  );
}
