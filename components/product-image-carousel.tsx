"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { selectedVariant, type Product } from "@/lib/products";
import { registerCarousel } from "@/lib/carousel-scheduler";

export function ProductImageCarousel({
  product,
  onNavigate,
  compact = false,
  deferImage = false,
}: {
  product: Product;
  onNavigate?: () => void;
  compact?: boolean;
  deferImage?: boolean;
}) {
  const variant =
    product.variants.find((v) => v.availability !== "unavailable") ??
    selectedVariant(product);
  const images = variant.images.filter(
    (image, i, all) =>
      all.findIndex(
        (other) =>
          other.image === image.image &&
          !!other.detail === !!image.detail &&
          other.position === image.position,
      ) === i,
  );
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const ready = useRef(new Set<number>());
  const pending = useRef<number | null>(null);
  const gesture = useRef({ x: 0, y: 0, moved: false, until: 0 });
  const controller = useRef<ReturnType<typeof registerCarousel> | null>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(!deferImage);
  useEffect(() => {
    if (visible || !root.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [visible]);
  const [loaded, setLoaded] = useState([0]);
  const [failed, setFailed] = useState<number[]>([]);
  const valid = images.map((_, i) => i).filter((i) => !failed.includes(i));
  const state = useRef({ images, valid });
  useEffect(() => {
    state.current = { images, valid };
  });

  function prepare(index: number) {
    setLoaded((current) =>
      current.includes(index) ? current : [...current, index],
    );
  }
  function show(index: number) {
    const element = track.current;
    if (!element) return;
    if (!ready.current.has(index)) {
      pending.current = index;
      prepare(index);
      return;
    }
    pending.current = null;
    element.scrollTo({
      left: element.clientWidth * index,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function neighbour(direction: number) {
    const list = state.current.valid;
    return (
      list[
        (Math.max(0, list.indexOf(activeRef.current)) +
          direction +
          list.length) %
          list.length
      ] ?? 0
    );
  }
  const actions = useRef({ prepare, show, neighbour });
  useEffect(() => {
    actions.current = { prepare, show, neighbour };
  });
  useEffect(() => {
    if (!root.current || images.length < 2 || compact) return;
    const registration = registerCarousel(
      root.current,
      () => {
        if (state.current.valid.length > 1)
          actions.current.prepare(actions.current.neighbour(1));
      },
      () => {
        const next = actions.current.neighbour(1);
        if (state.current.valid.length > 1 && ready.current.has(next))
          actions.current.show(next);
      },
    );
    controller.current = registration;
    return () => {
      registration.destroy();
      controller.current = null;
    };
  }, [images.length, compact]);

  function manual(direction: number) {
    controller.current?.pause();
    show(neighbour(direction));
  }
  return (
    <div
      ref={root}
      className={`product-image-carousel${compact ? " compact-carousel" : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") controller.current?.pause(true);
      }}
      onPointerLeave={() => controller.current?.pause()}
      onFocusCapture={() => controller.current?.pause(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          controller.current?.pause();
      }}
    >
      <Link
        draggable={false}
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        onClick={(event) => {
          if (gesture.current.until > Date.now()) event.preventDefault();
          else onNavigate?.();
        }}
      >
        <div
          className="card-image-track"
          ref={track}
          onPointerDown={(event) => {
            gesture.current = {
              x: event.clientX,
              y: event.clientY,
              moved: false,
              until: 0,
            };
            controller.current?.pause(true);
          }}
          onPointerMove={(event) => {
            if (Math.abs(event.clientX - gesture.current.x) > 8)
              gesture.current.moved = true;
          }}
          onPointerUp={(event) => {
            const dx = event.clientX - gesture.current.x;
            if (gesture.current.moved) {
              gesture.current.until = Date.now() + 800;
              if (
                Math.abs(dx) > 30 &&
                Math.abs(dx) > Math.abs(event.clientY - gesture.current.y)
              )
                manual(dx < 0 ? 1 : -1);
            }
            controller.current?.pause();
          }}
          onPointerCancel={() => {
            gesture.current.until = Date.now() + 800;
            controller.current?.pause();
          }}
          onTouchStart={() => {
            prepare(neighbour(1));
            prepare(neighbour(-1));
          }}
          onScroll={(event) => {
            const el = event.currentTarget;
            const index = Math.max(
              0,
              Math.min(
                images.length - 1,
                Math.round(el.scrollLeft / el.clientWidth),
              ),
            );
            if (index !== activeRef.current) {
              activeRef.current = index;
              setActive(index);
              prepare(index);
            }
          }}
        >
          {images.map((image, index) => (
            <div className="card-image-slide" key={`${image.image}-${index}`}>
              {loaded.includes(index) && (
                <Image
                  draggable={false}
                  src={
                    !visible
                      ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                      : failed.includes(index)
                        ? "/images/fallback.svg"
                        : `/images/${image.image}.jpg`
                  }
                  alt={`${product.name}, ${variant.name}${image.detail ? ", detail crop" : ""}`}
                  fill
                  sizes={compact ? "80px" : "(max-width: 640px) 50vw, 25vw"}
                  loading="lazy"
                  fetchPriority="low"
                  className={image.detail ? "card-detail-image" : ""}
                  style={{ objectPosition: image.position ?? "center" }}
                  onLoad={(event) => {
                    if (!visible) return;
                    const img = event.currentTarget;
                    void img
                      .decode()
                      .catch(() => {})
                      .then(() => {
                        ready.current.add(index);
                        if (pending.current === index) show(index);
                      });
                  }}
                  onError={() => {
                    if (visible && !failed.includes(index)) {
                      setFailed((all) => [...all, index]);
                      if (activeRef.current === index && index !== 0) show(0);
                    }
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Link>
      {valid.length > 1 && !compact && (
        <>
          <div
            className="card-image-indicators"
            aria-label={`Image ${active + 1} of ${images.length}`}
          >
            {valid.length <= 5 ? (
              valid.map((index) => (
                <span
                  key={index}
                  className={index === active ? "active" : ""}
                />
              ))
            ) : (
              <span>
                {active + 1} / {images.length}
              </span>
            )}
          </div>
          <button
            className="card-image-arrow card-image-previous"
            aria-label={`Previous image of ${product.name}`}
            onClick={() => manual(-1)}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            className="card-image-arrow card-image-next"
            aria-label={`Next image of ${product.name}`}
            onClick={() => manual(1)}
          >
            <ChevronRight size={15} />
          </button>
        </>
      )}
    </div>
  );
}
