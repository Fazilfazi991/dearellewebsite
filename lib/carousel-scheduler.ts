type Entry = {
  element: HTMLElement;
  visible: boolean;
  pausedUntil: number;
  lastPlayed: number;
  prepare: () => void;
  advance: () => void;
};

const entries = new Map<HTMLElement, Entry>();
let observer: IntersectionObserver | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let cleanup: (() => void) | undefined;

export function autoplayAllowed(
  reduced: boolean,
  saveData: boolean,
  hidden: boolean,
) {
  return !reduced && !saveData && !hidden;
}

// One timer and one visibility observer serve every listing, including search.
export function registerCarousel(
  element: HTMLElement,
  prepare: () => void,
  advance: () => void,
) {
  const entry: Entry = {
    element,
    visible: false,
    pausedUntil: 0,
    lastPlayed: 0,
    prepare,
    advance,
  };
  entries.set(element, entry);
  if (!observer) {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & {
          saveData?: boolean;
          effectiveType?: string;
        };
      }
    ).connection;
    const allowed = () =>
      autoplayAllowed(
        motion.matches,
        !!connection?.saveData ||
          /(^|-)2g$/.test(connection?.effectiveType ?? ""),
        document.hidden,
      );
    const schedule = () => {
      clearTimeout(timer);
      if (!allowed() || ![...entries.values()].some((e) => e.visible)) return;
      timer = setTimeout(() => {
        const candidates = [...entries.values()].filter(
          (e) => e.visible && e.pausedUntil < Date.now(),
        );
        candidates.sort((a, b) => {
          const distance = (e: Entry) =>
            Math.abs(
              e.element.getBoundingClientRect().top +
                e.element.clientHeight / 2 -
                innerHeight / 2,
            );
          return distance(a) - distance(b);
        });
        const pool = candidates.slice(0, innerWidth < 641 ? 2 : 4);
        pool.sort((a, b) => a.lastPlayed - b.lastPlayed);
        const next = pool[0];
        next?.prepare();
        timer = setTimeout(() => {
          if (
            next &&
            allowed() &&
            next.visible &&
            next.pausedUntil < Date.now() &&
            entries.has(next.element)
          ) {
            next.advance();
            next.lastPlayed = Date.now();
          }
          schedule();
        }, 650);
      }, 2850);
    };
    observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const item = entries.get(record.target as HTMLElement);
          if (item)
            item.visible =
              record.isIntersecting && record.intersectionRatio >= 0.35;
        }
        schedule();
      },
      { threshold: [0, 0.35] },
    );
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", schedule);
    connection?.addEventListener("change", schedule);
    cleanup = () => {
      clearTimeout(timer);
      observer?.disconnect();
      observer = undefined;
      document.removeEventListener("visibilitychange", schedule);
      motion.removeEventListener("change", schedule);
      connection?.removeEventListener("change", schedule);
    };
  }
  observer.observe(element);
  return {
    pause: (held = false) => {
      entry.pausedUntil = held ? Infinity : Date.now() + 8000;
    },
    destroy: () => {
      observer?.unobserve(element);
      entries.delete(element);
      if (!entries.size) {
        cleanup?.();
        cleanup = undefined;
      }
    },
  };
}
