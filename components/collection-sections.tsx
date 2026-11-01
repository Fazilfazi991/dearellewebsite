import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo } from "./image";
import { ProductCard } from "./store";
import { Reveal } from "./reveal";
import { products } from "@/lib/products";

type CategoryBannerProps = {
  category: "watches" | "bags";
  title: string;
  description: string;
  image: string;
  alt: string;
};
function CategoryBanner({
  category,
  title,
  description,
  image,
  alt,
}: CategoryBannerProps) {
  return (
    <Reveal>
      <Link
        className={`sculpted-category sculpted-${category}`}
        href={`/${category}`}
        aria-label={`Shop ${title}`}
      >
        <div className="sculpted-image">
          <Photo
            defer
            name={image}
            alt={alt}
            sizes="(max-width: 1100px) 90vw, 1000px"
            position={category === "bags" ? "center 30%" : "center"}
          />
        </div>
        <div className="sculpted-copy">
          <h3>{title}</h3>
          <p>{description}</p>
          <span className="sculpted-arrow" aria-hidden="true">
            <ArrowRight size={16} strokeWidth={1.3} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function ShopByCategory() {
  return (
    <section className="option2-categories" aria-labelledby="shop-categories">
      <svg
        className="category-clip-definitions"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="category-watch-curve" clipPathUnits="objectBoundingBox">
            <path d="M .16 .015 C .36 -.015 .71 .115 .90 .16 C .98 .18 1 .23 1 .35 L 1 .85 C 1 .96 .95 1 .87 .98 L .13 .78 C .035 .755 0 .68 0 .53 L 0 .28 C 0 .11 .045 .03 .16 .015 Z" />
          </clipPath>
          <clipPath id="category-bag-curve" clipPathUnits="objectBoundingBox">
            <path d="M .14 .015 C .35 -.01 .71 .12 .90 .17 C .98 .19 1 .24 1 .36 L 1 .85 C 1 .96 .95 1 .86 .99 L .13 .90 C .035 .89 0 .81 0 .66 L 0 .29 C 0 .12 .035 .03 .14 .015 Z" />
          </clipPath>
        </defs>
      </svg>
      <h2 id="shop-categories" className="sr-only">
        Shop by Category
      </h2>
      <div className="sculpted-grid">
        <CategoryBanner
          category="watches"
          title="Watches"
          description="For every moment you make yours."
          image="watch-category-stock"
          alt="Petite Dial watch with a rose-gold cushion case and ivory dial on cream silk."
        />
        <CategoryBanner
          category="bags"
          title="Bags"
          description="Carry a little more of you."
          image="bag-category-stock"
          alt="Oxblood textured top-handle bag in warm architectural light."
        />
      </div>
    </section>
  );
}

export function NewArrivals() {
  const arrivals = ["w1", "b1", "w4", "b9"].flatMap((id) =>
    products.filter((product) => product.id === id),
  );
  return (
    <section
      className="option2-arrivals"
      aria-labelledby="new-arrivals-heading"
    >
      <div className="option2-section-heading">
        <h2 id="new-arrivals-heading">New Arrivals</h2>
        <Link href="/new-arrivals">
          View all <ArrowRight size={16} strokeWidth={1.4} />
        </Link>
      </div>
      <div className="product-grid">
        {arrivals.map((p) => (
          <ProductCard key={p.id} product={p} deferImage />
        ))}
      </div>
    </section>
  );
}

export function EditorialCollection() {
  return (
    <section className="option2-editorial" aria-labelledby="details-heading">
      <div className="option2-editorial-photo">
        <Photo
          defer
          name="watch-editorial-stock"
          alt="Fashion image of a woman wearing the rose-gold Petite Dial watch with ivory tailoring."
          sizes="100vw"
        />
      </div>
      <div className="option2-editorial-copy">
        <h2 id="details-heading">
          Details
          <br />
          make it yours.
        </h2>
        <Link href="/watches">
          Shop Watches <ArrowRight size={16} strokeWidth={1.4} />
        </Link>
      </div>
    </section>
  );
}
