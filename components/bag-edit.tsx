"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  Maximize2,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  bagEditLink,
  bagEnquiry,
  type LookbookBag,
  type LookbookVariant,
} from "@/lib/bag-edit-links";
import type { ProductImage } from "@/lib/products";
import { useBagLookbook } from "./use-bag-lookbook";

const price = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
const featuredBags = new Set(["b7", "b5"]);

function LookbookPhoto({
  image,
  alt,
  sizes,
  eager = false,
  priority = false,
  contain = false,
  onLoad,
}: {
  image: ProductImage;
  alt: string;
  sizes: string;
  eager?: boolean;
  priority?: boolean;
  contain?: boolean;
  onLoad?: () => void;
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
      fetchPriority={priority ? "high" : eager ? "auto" : "low"}
      style={{
        objectFit: contain ? "contain" : "cover",
        objectPosition: image.position ?? "center",
      }}
      onLoad={onLoad}
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
      /* Selection fallback for older in-app browsers. */
    }
  }
  const field = document.createElement("textarea");
  const previousFocus = document.activeElement as HTMLElement | null;
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
  (document.querySelector("dialog[open]") ?? document.body).append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  previousFocus?.focus({ preventScroll: true });
  return copied;
}

function WhatsAppIcon() {
  // WhatsApp glyph from Simple Icons (CC0): https://simpleicons.org/
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function BagImageViewer({
  bag,
  variant,
}: {
  bag: LookbookBag;
  variant: LookbookVariant;
}) {
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [gallery, setGallery] = useState({
    variant: variant.id,
    active: 0,
    zoomed: false,
    firstReady: false,
  });
  const matching = gallery.variant === variant.id;
  const active = matching ? gallery.active : 0;
  const zoomed = matching ? gallery.zoomed : false;
  const firstReady = matching ? gallery.firstReady : false;
  if (!matching)
    setGallery({
      variant: variant.id,
      active: 0,
      zoomed: false,
      firstReady: false,
    });
  const setActive = (index: number) =>
    setGallery((old) =>
      old.active === index ? old : { ...old, active: index },
    );
  const setZoomed = (value: boolean) =>
    setGallery((old) => ({ ...old, zoomed: value }));
  const setFirstReady = (value: boolean) =>
    setGallery((old) => ({ ...old, firstReady: value }));
  const count = variant.images.length;
  useLayoutEffect(() => {
    cancelAnimationFrame(frame.current);
    if (track.current) {
      track.current.style.removeProperty("scroll-snap-type");
      track.current.scrollLeft = 0;
    }
    return () => cancelAnimationFrame(frame.current);
  }, [variant.id]);
  function stopMovement() {
    cancelAnimationFrame(frame.current);
    track.current?.style.removeProperty("scroll-snap-type");
  }
  function move(offset: number) {
    const element = track.current;
    if (!element) return;
    stopMovement();
    const next = Math.min(count - 1, Math.max(0, active + offset));
    const target = next * element.clientWidth;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.scrollLeft = target;
      return;
    }
    const from = element.scrollLeft;
    const start = performance.now();
    element.style.scrollSnapType = "none";
    function tick(now: number) {
      const elapsed = Math.min(1, (now - start) / 300);
      element!.scrollLeft =
        from + (target - from) * (1 - Math.pow(1 - elapsed, 3));
      if (elapsed < 1) frame.current = requestAnimationFrame(tick);
      else element!.style.removeProperty("scroll-snap-type");
    }
    frame.current = requestAnimationFrame(tick);
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
        aria-roledescription={count > 1 ? "carousel" : undefined}
        aria-label="Bag photographs"
        tabIndex={count > 1 ? 0 : -1}
        inert={zoomed}
        aria-hidden={zoomed || undefined}
        onPointerDown={stopMovement}
        onWheel={stopMovement}
        onScroll={(event) => {
          const el = event.currentTarget;
          setActive(
            Math.min(
              count - 1,
              Math.max(0, Math.round(el.scrollLeft / el.clientWidth)),
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
                sizes="(min-width: 900px) 660px, 100vw"
                eager={
                  index === 0 || (firstReady && Math.abs(index - active) <= 1)
                }
                priority={index === 0}
                onLoad={index === 0 ? () => setFirstReady(true) : undefined}
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
      {count > 1 && (
        <span
          className="be-image-count"
          role="status"
          aria-label={`Photograph ${active + 1} of ${count}`}
        >
          {String(active + 1).padStart(2, "0")} <span>/</span>{" "}
          {String(count).padStart(2, "0")}
        </span>
      )}
      <button
        type="button"
        className="be-circle be-zoom-control"
        aria-label={zoomed ? "Return to gallery" : "Enlarge photograph"}
        aria-pressed={zoomed}
        onClick={() => setZoomed(!zoomed)}
      >
        {zoomed ? (
          <ZoomOut size={18} strokeWidth={1.4} />
        ) : (
          <ZoomIn size={18} strokeWidth={1.4} />
        )}
      </button>
    </section>
  );
}

function WhatsAppEnquiry({
  bag,
  variant,
  whatsappNumber,
}: {
  bag: LookbookBag;
  variant: LookbookVariant;
  whatsappNumber: string | null;
}) {
  const [notice, setNotice] = useState("");
  const relativeLink = bagEditLink(bag.slug, variant.id);
  const directLink =
    typeof window === "undefined"
      ? relativeLink
      : `${window.location.origin}${relativeLink}`;
  const message = bagEnquiry(bag, variant, directLink);
  async function copyEnquiry() {
    const ok = await copyText(message);
    setNotice(
      ok
        ? "Enquiry copied. Paste it into WhatsApp."
        : "Copy is unavailable. Use your browser’s share menu.",
    );
  }
  async function copyLink() {
    const ok = await copyText(directLink);
    setNotice(
      ok
        ? "Bag link copied. Share something lovely."
        : "Copy is unavailable. Use your browser’s share menu.",
    );
  }
  async function shareBag() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bag.name} — Dearelle`,
          text: `${variant.name} · ${price(variant.price)}`,
          url: directLink,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    await copyLink();
  }
  return (
    <footer
      className={`be-enquiry${whatsappNumber ? " be-enquiry-whatsapp" : ""}`}
    >
      <p className="be-favourite">
        Found your favourite? <span aria-hidden="true">♡</span>
      </p>
      {whatsappNumber ? (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
          className="be-ask"
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
          <span>Ask on WhatsApp ♡</span>
          <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />
        </a>
      ) : (
        <button type="button" className="be-ask" onClick={copyEnquiry}>
          <Copy size={18} />
          <span>Copy enquiry</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      )}
      <div className="be-share-actions">
        <button type="button" onClick={copyLink}>
          <Copy size={14} strokeWidth={1.4} />
          Copy link
        </button>
        <button type="button" onClick={shareBag}>
          <Share2 size={14} strokeWidth={1.4} />
          Share bag
        </button>
      </div>
      <p className="be-notice" role="status">
        {notice && (
          <>
            <Check size={12} aria-hidden="true" />
            {notice}
          </>
        )}
      </p>
    </footer>
  );
}

function BagQuickView({
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
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    const lastFocus =
      active instanceof HTMLElement && active !== document.body
        ? active
        : document.getElementById("be-collection-title");
    const scrollTop = window.scrollY;
    const body = document.body;
    const old = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const existingPadding =
      parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.position = "fixed";
    body.style.top = `-${scrollTop}px`;
    body.style.left = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.paddingRight = `${existingPadding + gutter}px`;
    const element = dialog.current;
    element?.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element?.close();
      Object.assign(body.style, old);
      window.scrollTo({ top: scrollTop, behavior: "instant" });
      lastFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      className="be-viewer"
      ref={dialog}
      aria-labelledby="be-viewer-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const element = event.currentTarget;
        const controls = Array.from(
          element.querySelectorAll<HTMLElement>(
            "a[href], button:not(:disabled), [tabindex]:not([tabindex='-1'])",
          ),
        ).filter(
          (control) =>
            control.tabIndex >= 0 &&
            !control.closest("[inert]") &&
            control.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === element)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="be-viewer-layout">
        <header className="be-viewer-header">
          <span className="be-viewer-brand">
            DEARELLE <span>The Bag Edit</span>
          </span>
          <button
            ref={closeButton}
            type="button"
            className="be-close"
            aria-label="Close bag viewer, back to the collection"
            onClick={onClose}
          >
            <span>Back to collection</span>
            <X size={21} strokeWidth={1.3} aria-hidden="true" />
          </button>
        </header>
        <BagImageViewer bag={bag} variant={variant} />
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
                    onClick={() => onColour(colour.id)}
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
        </div>
        <WhatsAppEnquiry
          key={variant.id}
          bag={bag}
          variant={variant}
          whatsappNumber={whatsappNumber}
        />
      </div>
    </dialog>
  );
}

function BagLookbookCard({
  bag,
  index,
  onOpen,
}: {
  bag: LookbookBag;
  index: number;
  onOpen: (bag: LookbookBag, colour: string) => void;
}) {
  const variant = bag.variants[0];
  const featured = featuredBags.has(bag.id);
  const image =
    (featured
      ? variant.images.find((image) => image.image.includes("model"))
      : null) ?? variant.images[0];
  return (
    <article
      className={`be-item${featured ? " be-item-featured" : ""}`}
      data-bag-id={bag.id}
    >
      <a
        href={bagEditLink(bag.slug, variant.id)}
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
          onOpen(bag, variant.id);
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
              {String(variant.images.length).padStart(2, "0")} photos
            </span>
          )}
          <span className="be-tile-open" aria-hidden="true">
            <Maximize2 size={13} strokeWidth={1.3} />
          </span>
        </div>
        <div className="be-tile-caption">
          <h3>{bag.name}</h3>
          <p>{price(variant.price)}</p>
        </div>
      </a>
    </article>
  );
}

export function BagEdit({
  bags,
  whatsappNumber,
}: {
  bags: LookbookBag[];
  whatsappNumber: string | null;
}) {
  const { selected, invalid, open, close, chooseColour } = useBagLookbook(bags);
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
            sizes="150px"
            loading="eager"
          />
        </Link>
      </header>
      <main id="main">
        <section className="be-intro" aria-labelledby="be-title">
          {heroImage && (
            <div className="be-cover">
              <LookbookPhoto
                image={{ ...heroImage, position: "50% 64%" }}
                alt={`${heroBag.name} in ${heroVariant.name}, styled with ivory tailoring`}
                eager
                priority
                sizes="(min-width: 1200px) 1120px, 100vw"
              />
            </div>
          )}
          <div className="be-intro-caption">
            <h1 id="be-title">THE BAG EDIT</h1>
            <p>A little collection of lovely things.</p>
            <span>Curated by Dearelle</span>
          </div>
        </section>
        <section
          className="be-collection"
          aria-labelledby="be-collection-title"
        >
          <div className="be-collection-heading">
            <h2 id="be-collection-title" tabIndex={-1}>
              Find your everyday.{" "}
              <Heart size={14} strokeWidth={1.25} aria-hidden="true" />
            </h2>
            <span>
              A closer look <ArrowUpRight size={13} />
            </span>
          </div>
          {invalid && (
            <p className="be-unavailable" role="status">
              This bag link is unavailable. Explore the collection below.
            </p>
          )}
          <div className="be-grid">
            {bags.map((bag, index) => (
              <BagLookbookCard
                key={bag.id}
                bag={bag}
                index={index}
                onOpen={open}
              />
            ))}
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
        <BagQuickView
          key={selected.bag.id}
          bag={selected.bag}
          variant={selected.variant}
          whatsappNumber={whatsappNumber}
          onClose={close}
          onColour={chooseColour}
        />
      )}
    </div>
  );
}
