"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/products";
import { Photo } from "./image";

export function ProductGallery({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = variant.images.length;
  function go(index: number) {
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left: element.clientWidth * index,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div>
      <div
        className="gallery-frame"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${product.name}, ${variant.name} images`}
      >
        <div
          ref={track}
          className="product-gallery"
          tabIndex={0}
          aria-label="Product images. Swipe or use the arrow keys to explore."
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              go(
                Math.max(
                  0,
                  Math.min(
                    count - 1,
                    active + (event.key === "ArrowRight" ? 1 : -1),
                  ),
                ),
              );
            }
          }}
          onScroll={(event) => {
            const element = event.currentTarget;
            setActive(
              Math.max(
                0,
                Math.min(
                  count - 1,
                  Math.round(element.scrollLeft / element.clientWidth),
                ),
              ),
            );
          }}
        >
          {variant.images.map((image, index) => (
            <div
              key={`${variant.id}-${index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}${image.detail ? ", detail crop" : ""}`}
            >
              <Photo
                name={image.image}
                position={image.position}
                alt={`${image.detail ? "Detail crop of the same " : ""}Photograph of ${product.name}, ${variant.name}`}
                className={image.detail ? "detail-crop" : ""}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        {count > 1 && (
          <>
            <button
              className="gallery-arrow gallery-previous"
              aria-label="Previous product image"
              disabled={active === 0}
              onClick={() => go(active - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="gallery-arrow gallery-next"
              aria-label="Next product image"
              disabled={active === count - 1}
              onClick={() => go(active + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </>
        )}
        <span className="gallery-count" aria-live="polite" aria-atomic="true">
          {active + 1} / {count}
        </span>
      </div>
      <p className="small muted gallery-note">
        {variant.images[active]?.detail
          ? "Detail crop of the same image"
          : "Swipe or use arrows to explore"}
      </p>
    </div>
  );
}
