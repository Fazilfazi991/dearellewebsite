import type { Metadata } from "next";
import { StoreProvider } from "@/components/store";
import { assertDemoOnly } from "@/lib/products";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Dearelle — Little luxuries, everyday",
    template: "%s | Dearelle",
  },
  description:
    "Explore a new world of everyday watches and handbags. Independent Dearelle V2 demo storefront.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Dearelle — Little Luxuries. Big Feelings.",
    description: "An independent preview of everyday watches and bags.",
    images: ["/images/hero.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  assertDemoOnly();
  return (
    <html lang="en-IN">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
