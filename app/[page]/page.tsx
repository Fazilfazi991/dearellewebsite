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
    text: "Explore our collection of everyday watches and bags.",
  },
  about: {
    title: "Lovely things. Everyday moments.",
    text: "Dearelle is a women’s fashion accessories brand in India, bringing a considered eye to watches and handbags. Beautiful little luxuries, made for everyday moments.",
  },
  contact: {
    title: "A little help, when you need it.",
    text: "For order confirmation, delivery updates or product questions, contact Dearelle on WhatsApp at +91 8086191325.",
  },
  shipping: {
    title: "Shipping, thoughtfully considered.",
    text: "Delivery is available across India with no delivery charge. We contact you before dispatch. A ₹50 advance deposit is manually confirmed and deducted from the product total; the remaining balance is payable by COD. Dispatch follows confirmation and advance verification. No delivery time is promised.",
  },
  returns: {
    title: "The details that matter.",
    text: "Returns are available for damage during delivery. Please record an unpacking video to help document delivery damage. This evidence guidance does not exclude statutory consumer rights. Contact us on WhatsApp at +91 8086191325 so we can review the damage and explain the return arrangements.",
  },
  privacy: {
    title: "Your privacy matters.",
    text: "Your bag and wishlist are saved in this browser. When you place an order, we use your contact and delivery details to confirm and fulfil it. Order details are stored privately and access is restricted to your browser and the store owner. We do not collect card or bank login details. For questions about your information, contact Dearelle on WhatsApp at +91 8086191325.",
  },
  terms: {
    title: "Ordering with Dearelle.",
    text: "Prices are in Indian rupees. Delivery across India is free. We contact you to confirm your order before dispatch and arrange a ₹50 advance, which is deducted from your total. Pay the remaining balance by cash on delivery. Advance verification is manual; no online payment gateway is used. For cancellation, damage claims or refund questions, contact Dearelle on WhatsApp at +91 8086191325.",
  },
  instagram: {
    title: "Stay close to Dearelle.",
    text: "For current product information and order assistance, contact us on WhatsApp at +91 8086191325. Our editorial inspiration images are not customer endorsements.",
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
          {["contact", "returns", "privacy", "terms", "instagram"].includes(
            page,
          ) && (
            <p>
              <a className="button" href="https://wa.me/918086191325">
                Chat on WhatsApp
              </a>
            </p>
          )}
          <Link className="button" href="/new-arrivals">
            Explore the collection
          </Link>
        </>
      )}
    </main>
  );
}
