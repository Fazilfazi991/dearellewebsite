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
    text: "Delivery is available across India with no delivery charge. We contact you before dispatch. A ₹50 advance deposit is manually confirmed and deducted from the product total; the remaining balance is payable by COD. Dispatch follows confirmation and advance verification. No delivery time is promised.",
  },
  returns: {
    title: "The details that matter.",
    text: "Returns are available for damage during delivery. Please record an unpacking video to help document delivery damage. This evidence guidance does not exclude statutory consumer rights. A return time window, return shipping arrangements and refund process have not yet been specified.",
  },
  privacy: {
    title: "Your privacy matters.",
    text: "This site stores your bag and wishlist in this browser’s local storage. When enabled locally, test checkout stores the sample contact and delivery details you submit in a private test order database for owner review. Use sample details only. Order access is restricted to the submitting browser and the owner. No payment details are collected. A reviewed privacy policy and verified data-controller contact must be added before launch.",
  },
  terms: {
    title: "A note about this preview.",
    text: "This preview records test COD requests only and does not create real deliveries or take payment. Prices, three pieces per colour/SKU, free delivery across India and a ₹50 advance deposit deducted from the total are supplied by Dearelle. Customer contact and manual advance verification are required before dispatch in the intended COD process. Product images are styled representations; no independent authenticity claim is made.",
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
