"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
export function Photo({
  name,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 700px",
  position = "center",
  defer = false,
}: {
  name: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  position?: string;
  defer?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(!defer);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (visible || !image.current) return;
    if (!("IntersectionObserver" in window)) {
      queueMicrotask(() => setVisible(true));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(image.current);
    return () => observer.disconnect();
  }, [visible]);
  return (
    <>
      <Image
        ref={image}
        src={
          !visible
            ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            : failed
              ? "/images/fallback.svg"
              : `/images/${name}.jpg`
        }
        aria-hidden={!visible || undefined}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectPosition: position }}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        className={className}
        onError={() => {
          if (visible) setFailed(true);
        }}
      />
      {defer && (
        <noscript>
          <Image
            src={`/images/${name}.jpg`}
            alt={alt}
            fill
            sizes={sizes}
            className={className}
            style={{ objectPosition: position }}
          />
        </noscript>
      )}
    </>
  );
}
