"use client";
import { useEffect, useRef } from "react";

/** Content is visible without JS. Motion never gates a link or image. */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reduced.matches || !("IntersectionObserver" in window))
      return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!reduced.matches)
          animation = element.animate(
            [
              { opacity: 0.82, transform: "translateY(8px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 280, easing: "cubic-bezier(.23,1,.32,1)" },
          );
        observer.disconnect();
      },
      { threshold: 0.18 },
    );
    const stop = () => {
      if (reduced.matches) animation?.cancel();
    };
    reduced.addEventListener("change", stop);
    observer.observe(element);
    return () => {
      observer.disconnect();
      animation?.cancel();
      reduced.removeEventListener("change", stop);
    };
  }, []);
  return (
    <div ref={ref} className="option2-reveal">
      {children}
    </div>
  );
}
