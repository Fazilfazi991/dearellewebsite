import { products, productPrice, selectedVariant } from "./products";

export const META_PIXEL_ID = "2358200315014695";
export const MARKETING_CHOICE = "dearelle-marketing-v1";
export function publicStorePath(path: string) {
  return (
    path === "/" ||
    /^\/(watches|bags|new-arrivals|about|contact|shipping|returns|privacy|terms|instagram|checkout)\/?$/.test(
      path,
    ) ||
    /^\/products\/[a-z0-9-]+\/?$/.test(path)
  );
}
export type MetaPayload = Record<
  string,
  | string
  | number
  | string[]
  | { id: string; quantity: number; item_price: number }[]
>;
type Pixel = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  loaded: boolean;
  version: string;
  callMethod?: (...args: unknown[]) => void;
  disablePushState: boolean;
};
declare global {
  interface Window {
    fbq?: Pixel;
    _fbq?: Pixel;
  }
}
export function marketingAllowed() {
  try {
    return (
      typeof window !== "undefined" &&
      /^(www\.)?dearelle\.in$/.test(location.hostname) &&
      publicStorePath(location.pathname) &&
      localStorage.getItem(MARKETING_CHOICE) === "allow"
    );
  } catch {
    return false;
  }
}
export function startPixel() {
  if (!marketingAllowed()) return;
  if (!window.fbq) {
    const pixel = function (...args: unknown[]) {
      if (pixel.callMethod) pixel.callMethod(...args);
      else pixel.queue.push(args);
    } as Pixel;
    pixel.queue = [];
    pixel.loaded = true;
    pixel.version = "2.0";
    pixel.disablePushState = true;
    window.fbq = window._fbq = pixel;
    pixel("set", "autoConfig", false, META_PIXEL_ID);
    pixel("init", META_PIXEL_ID);
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq("consent", "grant");
}
export function metaEvent(
  name: string,
  payload: MetaPayload = {},
  eventId?: string,
) {
  if (!marketingAllowed()) return;
  try {
    if (eventId && sessionStorage.getItem(`meta:${eventId}`)) return;
    startPixel();
    window.fbq?.(
      "track",
      name,
      payload,
      ...(eventId ? [{ eventID: eventId }] : []),
    );
    if (eventId) sessionStorage.setItem(`meta:${eventId}`, "1");
  } catch {
    /* Marketing must never interrupt shopping. */
  }
}
export function productEvent(
  id: string,
  color?: string,
  quantity = 1,
): MetaPayload {
  const p = products.find((p) => p.id === id);
  if (!p) return {};
  const v = selectedVariant(p, color);
  return {
    content_ids: [v.sku],
    content_type: "product",
    content_name: p.name,
    content_category: p.category,
    currency: "INR",
    value: productPrice(p, v.id) * quantity,
    contents: [{ id: v.sku, quantity, item_price: productPrice(p, v.id) }],
  };
}
