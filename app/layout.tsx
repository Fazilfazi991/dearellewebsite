import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { assertTestCheckout } from "@/lib/products";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.dearelle.in"),
  title: {
    default: "Dearelle — Little luxuries, everyday",
    template: "%s | Dearelle",
  },
  description:
    "Explore a new world of everyday watches and handbags. Dearelle watches and bags.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Dearelle — Little Luxuries. Big Feelings.",
    description:
      "Everyday watches and handbags from Dearelle. Free delivery across India.",
    images: ["/images/hero.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  assertTestCheckout();
  return (
    <html lang="en-IN">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
