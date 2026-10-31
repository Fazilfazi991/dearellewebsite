"use client";
import Image from "next/image";
import { useState } from "react";
export function Photo({
  name,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 700px",
  position = "center",
}: {
  name: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  position?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed ? "/images/fallback.svg" : `/images/${name}.jpg`}
      alt={alt}
      fill
      sizes={sizes}
      style={{ objectPosition: position }}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
