import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import {
  ShopByCategory,
  NewArrivals,
  EditorialCollection,
} from "@/components/collection-sections";
import {
  ArrowRight,
  ArrowUpRight,
  PackageCheck,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { Photo } from "@/components/image";
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
          {[products[3], products[0]].map((p) => (
            <ProductCard key={p.id} product={p} deferImage />
          ))}
        </div>
      </section>
      <section
        className="shopping-info"
        aria-label="Preview shopping information"
      >
        <div>
          <Eye size={24} strokeWidth={1.3} />
          <span>
            Thoughtfully presented
            <small>Explore every detail before you decide</small>
          </span>
        </div>
        <div>
          <ShoppingBag size={24} strokeWidth={1.3} />
          <span>
            A bag that remembers
            <small>Your demo favourites, saved on this device</small>
          </span>
        </div>
        <div>
          <PackageCheck size={24} strokeWidth={1.3} />
          <span>
            A little more to come
            <small>Shipping & returns confirmed before launch</small>
          </span>
        </div>
      </section>
      <section className="section journal">
        <div className="section-heading">
          <h2>
            A little everyday <em>inspiration.</em>
          </h2>
          <p>Our moodboard, made for your next “where did you get that?”</p>
        </div>
        <div className="moodboard">
          {["bag-cream", "hero", "watch-gold", "editorial"].map((name, i) => (
            <div key={name}>
              <Photo
                defer
                name={name}
                alt={`Brand inspiration moodboard, representative stock photography ${i + 1}`}
              />
            </div>
          ))}
        </div>
        <p className="catalogue-disclaimer">
          Editorial moodboard · Stock photography, not customer submissions.
        </p>
        <Link className="text-link" href="/instagram">
          Stay close to Dearelle <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}
