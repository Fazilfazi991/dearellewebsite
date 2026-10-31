import { notFound } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/products";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/store";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  return {
    title: p ? p.name : "Product not found",
    description: p?.description,
    alternates: { canonical: `/products/${slug}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <main id="main" className="section product-page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/${p.category}`}>{p.category}</Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <ProductDetail product={p} />
      <section className="related">
        <h2>A lovely little pairing.</h2>
        <div className="product-grid">
          {products
            .filter((x) => x.category !== p.category)
            .slice(0, 2)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
    </main>
  );
}
