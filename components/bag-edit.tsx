"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  bagEditLink,
  bagEnquiry,
  resolveBagLink,
  type LookbookBag,
  type LookbookVariant,
} from "@/lib/bag-edit-links";
import type { ProductImage } from "@/lib/products";

const price = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
const featuredBags = new Set(["b7", "b5"]);
const subscribeToLink = (listener: () => void) => {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
};
const currentSearch = () => window.location.search;
const emptySearch = () => "";

function changeBagLink(href: string, replace = false) {
  window.history[replace ? "replaceState" : "pushState"]({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function LookbookPhoto({
  image,
  alt,
  sizes,
  eager = false,
  contain = false,
}: {
  image: ProductImage;
  alt: string;
  sizes: string;
  eager?: boolean;
  contain?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className="be-photo-error" role="status">
        Photograph unavailable.<span>Refresh the page to retry.</span>
      </span>
    );
  return (
    <Image
      src={`/images/${image.image}.jpg`}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      style={{
        objectFit: contain ? "contain" : "cover",
        objectPosition: image.position ?? "center",
      }}
      onError={() => setFailed(true)}
    />
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* Older embedded browsers use the selection fallback. */
    }
  }
  const field = document.createElement("textarea");
  const previousFocus = document.activeElement as HTMLElement | null;
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
  // Stay inside the active dialog's focus boundary.
  (document.querySelector("dialog[open]") ?? document.body).append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  previousFocus?.focus({ preventScroll: true });
  return copied;
}

function PhotoGallery({
  bag,
  variant,
}: {
  bag: LookbookBag;
  variant: LookbookVariant;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const count = variant.images.length;
  function move(offset: number) {
    const element = track.current;
    if (!element) return;
    const next = Math.min(count - 1, Math.max(0, active + offset));
    element.scrollTo({
      left: next * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <section
      className="be-gallery"
      aria-label={`${bag.name}, ${variant.name} photographs`}
    >
      {zoomed && (
        <div
          className="be-zoom"
          tabIndex={0}
          aria-label="Enlarged photograph. Scroll to explore."
        >
          <div className="be-zoom-photo">
            <Image
              src={`/images/${variant.images[active].image}.jpg`}
              alt={`${bag.name}, ${variant.name}, enlarged photograph`}
              fill
              sizes="200vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
      <div
        className="be-gallery-track"
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label="Bag photographs"
        tabIndex={0}
        inert={zoomed}
        aria-hidden={zoomed || undefined}
        onScroll={(event) => {
          const element = event.currentTarget;
          setActive(
            Math.min(
              count - 1,
              Math.max(0, Math.round(element.scrollLeft / element.clientWidth)),
            ),
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {variant.images.map((image, index) => (
          <div
            className="be-slide"
            key={image.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
          >
            <button
              type="button"
              className="be-photo-tap"
              tabIndex={index === active ? 0 : -1}
              aria-label={`Enlarge photograph ${index + 1}`}
              onClick={() => setZoomed(true)}
            >
              <LookbookPhoto
                image={image}
                alt={`${bag.name}, ${variant.name} — ${image.image.includes("model") ? "styled view" : "product view"}`}
                contain
                sizes="(min-width: 900px) 65vw, 100vw"
                eager={index === 0}
              />
            </button>
          </div>
        ))}
      </div>
      {count > 1 && !zoomed && (
        <div className="be-gallery-arrows">
          <button
            type="button"
            className="be-circle"
            aria-label="Previous photograph"
            disabled={active === 0}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={19} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            className="be-circle"
            aria-label="Next photograph"
            disabled={active === count - 1}
            onClick={() => move(1)}
          >
            <ChevronRight size={19} strokeWidth={1.4} />
          </button>
        </div>
      )}
      <span
        className="be-image-count"
        role="status"
        aria-label={`Photograph ${active + 1} of ${count}`}
      >
        {active + 1} / {count}
      </span>
      <button
        type="button"
        className="be-circle be-zoom-control"
        aria-label={zoomed ? "Return to gallery" : "Enlarge photograph"}
        aria-pressed={zoomed}
        onClick={() => setZoomed(!zoomed)}
      >
        {zoomed ? (
          <ZoomOut size={19} strokeWidth={1.4} />
        ) : (
          <ZoomIn size={19} strokeWidth={1.4} />
        )}
      </button>
    </section>
  );
}

function BagViewer({
  bag,
  variant,
  whatsappNumber,
  onClose,
  onColour,
}: {
  bag: LookbookBag;
  variant: LookbookVariant;
  whatsappNumber: string | null;
  onClose: () => void;
  onColour: (id: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const lastFocus = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    const oldOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element?.close();
      document.body.style.overflow = oldOverflow;
      lastFocus?.focus({ preventScroll: true });
    };
  }, []);
  async function copyDetails() {
    const copied = await copyText(
      `${bagEnquiry(bag, variant)}\n${window.location.origin}${bagEditLink(bag.id, variant.id)}`,
    );
    setNotice(
      copied
        ? "Bag details copied."
        : "Copy is unavailable. Use your browser’s share menu.",
    );
  }
  async function copyLink() {
    const copied = await copyText(
      `${window.location.origin}${bagEditLink(bag.id, variant.id)}`,
    );
    setNotice(
      copied
        ? "Bag link copied."
        : "Copy is unavailable. Use your browser’s share menu.",
    );
  }
  async function shareBag() {
    const url = `${window.location.origin}${bagEditLink(bag.id, variant.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bag.name} — Dearelle`,
          text: `${variant.name} · ${price(variant.price)}`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    await copyLink();
  }
  return (
    <dialog
      className="be-viewer"
      ref={dialog}
      aria-labelledby="be-viewer-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="be-viewer-layout">
        <header className="be-viewer-header">
          <span>
            The Bag Edit <span className="be-viewer-by">by Dearelle</span>
          </span>
          <button
            ref={closeButton}
            type="button"
            className="be-icon"
            aria-label="Close bag viewer"
            onClick={onClose}
          >
            <X size={23} strokeWidth={1.3} />
          </button>
        </header>
        <PhotoGallery key={variant.id} bag={bag} variant={variant} />
        <div className="be-viewer-info">
          <div className="be-viewer-product">
            <h2 id="be-viewer-title">{bag.name}</h2>
            <p>{price(variant.price)}</p>
          </div>
          <div className="be-colour-section">
            <p className="be-colour-name">{variant.name}</p>
            {bag.variants.length > 1 && (
              <div className="be-colours" role="group" aria-label="Bag colour">
                {bag.variants.map((colour) => (
                  <button
                    type="button"
                    key={colour.id}
                    aria-pressed={variant.id === colour.id}
                    onClick={() => {
                      setNotice("");
                      onColour(colour.id);
                    }}
                  >
                    <span
                      className="be-swatch"
                      style={{ backgroundColor: colour.swatch }}
                    />
                    {colour.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="be-enquiry">
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(bagEnquiry(bag, variant))}`}
                className="be-ask"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask about this bag <ArrowUpRight size={18} strokeWidth={1.5} />
              </a>
            ) : (
              <button type="button" className="be-ask" onClick={copyDetails}>
                Copy bag details <Copy size={17} />
              </button>
            )}
            <div className="be-share-actions">
              <button type="button" onClick={copyLink}>
                <Copy size={15} strokeWidth={1.4} />
                Copy link
              </button>
              <button type="button" onClick={shareBag}>
                <Share2 size={15} strokeWidth={1.4} />
                Share bag
              </button>
            </div>
            <p className="be-notice" role="status">
              {notice}
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function BagEdit({
  bags,
  whatsappNumber,
}: {
  bags: LookbookBag[];
  whatsappNumber: string | null;
}) {
  const search = useSyncExternalStore(
    subscribeToLink,
    currentSearch,
    emptySearch,
  );
  const selected = resolveBagLink(bags, search);
  const invalid = new URLSearchParams(search).has("bag") && !selected;
  const heroBag = bags.find((bag) => bag.id === "b8") ?? bags[0];
  const heroVariant = heroBag?.variants[0];
  const heroImage =
    heroVariant?.images.find((image) => image.image.includes("model")) ??
    heroVariant?.images[0];
  return (
    <div className="bag-edit">
      <header className="be-header">
        <Link href="/bag-edit" aria-label="Dearelle Bag Edit">
          <Image
            src="/brand/dearelle-logo.png"
            alt="Dearelle — Your everyday little luxury."
            width={550}
            height={170}
            sizes="156px"
            loading="eager"
          />
        </Link>
        <span>THE COLLECTION</span>
      </header>
      <main id="main">
        <section className="be-intro" aria-labelledby="be-title">
          {heroImage && (
            <div className="be-cover">
              <LookbookPhoto
                image={{ ...heroImage, position: "50% 64%" }}
                alt={`${heroBag.name} in ${heroVariant.name}, styled with ivory tailoring`}
                eager
                sizes="(min-width: 1200px) 1120px, 100vw"
              />
            </div>
          )}
          <div className="be-intro-caption">
            <h1 id="be-title">THE BAG EDIT</h1>
            <p>A curated collection by Dearelle.</p>
          </div>
        </section>
        <section
          className="be-collection"
          aria-labelledby="be-collection-title"
        >
          <div className="be-collection-heading">
            <h2 id="be-collection-title">Find your everyday.</h2>
            <span>
              Tap a bag to explore <ArrowUpRight size={13} />
            </span>
          </div>
          {invalid && (
            <p className="be-unavailable" role="status">
              This bag link is unavailable. Explore the collection below.
            </p>
          )}
          <div className="be-grid">
            {bags.map((bag, index) => {
              const variant = bag.variants[0];
              const featured = featuredBags.has(bag.id);
              const image =
                (featured
                  ? variant.images.find((image) =>
                      image.image.includes("model"),
                    )
                  : null) ?? variant.images[0];
              return (
                <article
                  key={bag.id}
                  className={`be-item${featured ? " be-item-featured" : ""}`}
                  data-bag-id={bag.id}
                >
                  <a
                    href={bagEditLink(bag.id, variant.id)}
                    className="be-bag-link"
                    aria-label={`Explore ${bag.name}, ${price(variant.price)}`}
                    onClick={(event) => {
                      if (
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      changeBagLink(bagEditLink(bag.id, variant.id));
                    }}
                  >
                    <div className="be-tile-image">
                      <LookbookPhoto
                        image={image}
                        alt={`${bag.name}, ${variant.name}`}
                        sizes={
                          featured
                            ? "(min-width: 900px) 800px, 100vw"
                            : "(min-width: 900px) 400px, 50vw"
                        }
                        eager={index < 2}
                      />
                      {variant.images.length > 1 && (
                        <span
                          className="be-photo-count"
                          aria-label={`${variant.images.length} photographs`}
                        >
                          {variant.images.length} photos
                        </span>
                      )}
                    </div>
                    <div className="be-tile-caption">
                      <h3>{bag.name}</h3>
                      <p>{price(variant.price)}</p>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        </section>
        <footer className="be-footer">
          <p>
            A little luxury, <em>every day.</em>
          </p>
          <span>DEARELLE</span>
          <a href="#be-title">
            Back to the edit <ArrowUpRight size={14} />
          </a>
        </footer>
      </main>
      {selected && (
        <BagViewer
          key={selected.bag.id}
          bag={selected.bag}
          variant={selected.variant}
          whatsappNumber={whatsappNumber}
          onClose={() => changeBagLink("/bag-edit", true)}
          onColour={(id) =>
            changeBagLink(bagEditLink(selected.bag.id, id), true)
          }
        />
      )}
    </div>
  );
}
