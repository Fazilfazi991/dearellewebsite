"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Storefront = dynamic(() =>
  import("./store").then((module) => module.StoreProvider),
);

// The lookbook has no shopping shell or store state. Other routes retain theirs.
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/bag-edit" || pathname === "/bag-edit/") return children;
  return <Storefront>{children}</Storefront>;
}
