import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import {
  ShopByCategory,
  NewArrivals,
  EditorialCollection,
} from "@/components/collection-sections";
import { ArrowRight, PackageCheck, Eye, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/store";
import { products } from "@/lib/products";
export default function Home() {
  return (
    <main id="main">
      <CinematicHero />
      <ShopByCategory />
      <NewArrivals />
      <EditorialCollection />
      <section className="section">
        <div className="section-heading horizontal">
          <div>
            <h2>
              Handpicked <em>for you.</em>
            </h2>
            <p>A few little things we’re loving.</p>
          </div>
          <Link className="text-link" href="/new-arrivals">
            Discover more <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid handpicked">
          {["w1", "w5"]
            .flatMap((id) => products.filter((p) => p.id === id))
            .map((p) => (
              <ProductCard key={p.id} product={p} deferImage />
            ))}
        </div>
      </section>
      <section className="shopping-info" aria-label="Shopping information">
        <div>
          <Eye size={24} strokeWidth={1.3} />
          <span>Considered details</span>
        </div>
        <div>
          <ShoppingBag size={24} strokeWidth={1.3} />
          <span>Saved favourites</span>
        </div>
        <div>
          <PackageCheck size={24} strokeWidth={1.3} />
          <span>
            <Link href="/shipping">Delivery &amp; returns</Link>
          </span>
        </div>
      </section>
    </main>
  );
}
