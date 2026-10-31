"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Menu,
  X,
  Heart,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { products, money, productVisual, type Product } from "@/lib/products";
import { addItem, subtotal, validCart, type CartItem } from "@/lib/cart";
import { Photo } from "./image";
type Store = {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (id: string, color: string, quantity: number) => void;
  open: () => void;
  wish: string[];
  toggleWish: (id: string) => void;
};
const Context = createContext<Store | null>(null);
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Store provider missing");
  return value;
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [wish, setWish] = useState<string[]>([]);
  const [panel, setPanel] = useState<"cart" | "menu" | "search" | null>(null);
  const [query, setQuery] = useState("");
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setItems(
          validCart(
            JSON.parse(localStorage.getItem("dearelle-v2-cart") ?? "[]"),
          ),
        );
        const saved = JSON.parse(
          localStorage.getItem("dearelle-v2-wish") ?? "[]",
        );
        setWish(
          Array.isArray(saved)
            ? saved.filter((v) => typeof v === "string")
            : [],
        );
      } catch {}
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("dearelle-v2-cart", JSON.stringify(items));
        localStorage.setItem("dearelle-v2-wish", JSON.stringify(wish));
      } catch {}
    }
  }, [items, wish, ready]);
  useEffect(() => {
    queueMicrotask(() => setPanel(null));
  }, [path]);
  useEffect(() => {
    if (panel) {
      lastTrigger.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
      lastTrigger.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [panel]);
  const update = (id: string, color: string, quantity: number) =>
    setItems((old) =>
      validCart(
        old.map((r) =>
          r.productId === id && r.color === color ? { ...r, quantity } : r,
        ),
      ),
    );
  return (
    <Context.Provider
      value={{
        items,
        add: (item) => {
          setItems((old) => addItem(old, item));
          setPanel("cart");
        },
        update,
        open: () => setPanel("cart"),
        wish,
        toggleWish: (id) =>
          setWish((old) =>
            old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
          ),
      }}
    >
      <div className="preview-banner">
        A little preview of what’s to come{" "}
        <span>— Demo store. No real orders.</span>
      </div>
      <header className="header">
        <div className="header-inner">
          <button
            className="icon mobile-menu"
            aria-label="Open menu"
            onClick={() => setPanel("menu")}
          >
            <Menu size={21} />
          </button>
          <Link
            href="/"
            className="wordmark brand-mark"
            aria-label="Dearelle home"
          >
            <Image
              src="/brand/dearelle-logo.png"
              alt="Dearelle — Your everyday little luxury."
              width={550}
              height={170}
              sizes="(max-width: 640px) 138px, 180px"
              loading="eager"
            />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/new-arrivals">New Arrivals</Link>
            <Link href="/watches">Watches</Link>
            <Link href="/bags">Bags</Link>
            <Link href="/about">Our Story</Link>
          </nav>
          <div className="header-actions">
            <button
              className="icon"
              aria-label="Search products"
              onClick={() => setPanel("search")}
            >
              <Search size={20} />
            </button>
            <button
              className="icon bag-button"
              aria-label={`Open shopping bag, ${items.reduce((n, r) => n + r.quantity, 0)} items`}
              onClick={() => setPanel("cart")}
            >
              <ShoppingBag size={20} />
              <span className="bag-count" aria-live="polite">
                {items.reduce((n, r) => n + r.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>
      {children}
      <Footer />
      <dialog
        ref={dialog}
        className={`drawer ${panel === "search" ? "search-drawer" : ""}`}
        onCancel={() => setPanel(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setPanel(null);
        }}
        aria-labelledby="panel-title"
      >
        <div className="drawer-top">
          <h2 id="panel-title">
            {panel === "cart"
              ? "Your shopping bag"
              : panel === "search"
                ? "Find your little luxury"
                : "Explore Dearelle"}
          </h2>
          <button
            className="icon"
            aria-label="Close panel"
            onClick={() => setPanel(null)}
          >
            <X />
          </button>
        </div>
        {panel === "menu" ? (
          <nav className="menu-links">
            {[
              ["New Arrivals", "new-arrivals"],
              ["Watches", "watches"],
              ["Bags", "bags"],
              ["Our Story", "about"],
            ].map(([label, url]) => (
              <Link key={url} href={`/${url}`} onClick={() => setPanel(null)}>
                {label}
                <ArrowRight size={19} />
              </Link>
            ))}
          </nav>
        ) : panel === "search" ? (
          <>
            <label className="search-field">
              <Search size={20} />
              <input
                autoFocus
                placeholder="Try watches, bags or gold…"
                aria-label="Search catalogue"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <p className="muted small">
              {query
                ? "Matching demo products"
                : "A few lovely places to start"}
            </p>
            <div className="search-results">
              {products
                .filter((p) =>
                  `${p.name} ${p.category} ${p.colors.map((c) => c.name).join(" ")}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((p) => (
                  <Link
                    onClick={() => setPanel(null)}
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="search-result"
                  >
                    <div className="tiny-photo">
                      <Photo
                        name={p.image}
                        alt={p.name}
                        position={p.imagePosition}
                      />
                    </div>
                    <div>
                      {p.name}
                      <small>{money(p.price)} · Demo price</small>
                    </div>
                    <ArrowRight size={18} />
                  </Link>
                ))}
            </div>
            {query &&
              !products.some((p) =>
                `${p.name} ${p.category} ${p.colors.map((c) => c.name).join(" ")}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              ) && <p>No matches yet. Try “bag” or “watch”.</p>}
          </>
        ) : (
          <CartContents close={() => setPanel(null)} />
        )}
      </dialog>
    </Context.Provider>
  );
}
export function CartContents({ close }: { close?: () => void }) {
  const { items, update } = useStore();
  return items.length ? (
    <>
      <p className="notice">
        Demo bag · Illustrative prices. Nothing can be purchased.
      </p>
      <div className="cart-lines">
        {items.map((item) => {
          const p = products.find((p) => p.id === item.productId)!;
          const visual = productVisual(p, item.color);
          return (
            <div className="cart-line" key={p.id + item.color}>
              <Link
                onClick={close}
                href={`/products/${p.slug}`}
                className="cart-photo"
              >
                <Photo
                  name={visual.image}
                  alt={`${p.name}, ${item.color}`}
                  position={visual.position}
                />
              </Link>
              <div>
                <Link href={`/products/${p.slug}`} onClick={close}>
                  {p.name}
                </Link>
                <p className="small muted">{item.color} · Demo</p>
                <strong>{money(p.price)}</strong>
                <div className="qty">
                  <button
                    aria-label={`Decrease ${p.name} quantity`}
                    onClick={() => update(p.id, item.color, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={item.quantity >= 10}
                    aria-label={`Increase ${p.name} quantity`}
                    onClick={() => update(p.id, item.color, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button
                className="icon"
                aria-label={`Remove ${p.name}`}
                onClick={() => update(p.id, item.color, 0)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="cart-summary">
        <div>
          <span>Demo subtotal</span>
          <strong>{money(subtotal(items))}</strong>
        </div>
        <p className="small muted">
          Shipping and taxes will be confirmed before launch.
        </p>
        <Link className="button full" onClick={close} href="/checkout">
          Explore demo checkout <ArrowRight size={17} />
        </Link>
        <button className="text-link full" onClick={close}>
          Continue exploring
        </button>
      </div>
    </>
  ) : (
    <div className="empty">
      <ShoppingBag size={40} strokeWidth={1} />
      <h3>A little room for something lovely.</h3>
      <p>Your shopping bag is empty.</p>
      <Link onClick={close} href="/new-arrivals" className="button">
        Explore the collection <ArrowRight size={17} />
      </Link>
    </div>
  );
}
export function ProductCard({
  product: p,
  deferImage = false,
}: {
  product: Product;
  deferImage?: boolean;
}) {
  const { wish, toggleWish } = useStore();
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link href={`/products/${p.slug}`} aria-label={`View ${p.name}`}>
          <Photo
            defer={deferImage}
            name={p.image}
            alt={`${p.imagery ? "AI-styled image" : "Representative photograph"} of ${p.name}`}
            position={p.imagePosition}
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </Link>
        <span className="demo-label">{p.imagery ? "AI STYLED" : "DEMO"}</span>
        <button
          className={`wish icon ${wish.includes(p.id) ? "selected" : ""}`}
          aria-label={`${wish.includes(p.id) ? "Remove" : "Save"} ${p.name} ${wish.includes(p.id) ? "from" : "to"} wishlist`}
          aria-pressed={wish.includes(p.id)}
          onClick={() => toggleWish(p.id)}
        >
          <Heart
            size={18}
            fill={wish.includes(p.id) ? "currentColor" : "none"}
          />
        </button>
        <Link className="card-explore" href={`/products/${p.slug}`}>
          Take a closer look <ArrowRight size={16} />
        </Link>
      </div>
      <div className="product-info">
        <div className="product-category">
          {p.category === "watches"
            ? "A MOMENT FOR YOU"
            : "YOUR EVERYDAY PLUS-ONE"}
        </div>
        <Link href={`/products/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <div className="product-bottom">
          <span>
            {money(p.price)} <small>demo price</small>
          </span>
          <div
            className="swatches"
            aria-label={p.colors.map((c) => c.name).join(", ")}
          >
            {p.colors.map((c) => (
              <span key={c.name} title={c.name} style={{ background: c.hex }} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="wordmark brand-mark">
            <Image
              src="/brand/dearelle-logo.png"
              alt="Dearelle — Your everyday little luxury."
              width={550}
              height={170}
              sizes="190px"
            />
          </Link>
          <p>
            Beautiful little luxuries,
            <br />
            made for everyday moments.
          </p>
        </div>
        <div>
          <h3>Find your favourite</h3>
          <Link href="/watches">Watches</Link>
          <Link href="/bags">Bags</Link>
          <Link href="/new-arrivals">New arrivals</Link>
        </div>
        <div>
          <h3>A little help</h3>
          <Link href="/contact">Contact & WhatsApp</Link>
          <Link href="/shipping">Shipping policy</Link>
          <Link href="/returns">Return policy</Link>
        </div>
        <div>
          <h3>Get to know us</h3>
          <Link href="/about">About Dearelle</Link>
          <Link href="/instagram">Instagram</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of use</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Dearelle V2</span>
        <span>Independent storefront preview · Demo catalogue</span>
        <span>Made for your everyday.</span>
      </div>
    </footer>
  );
}
export function Mounted({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return mounted ? children : null;
}
