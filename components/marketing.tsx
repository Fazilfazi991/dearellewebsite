"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MARKETING_CHOICE, metaEvent, publicStorePath } from "@/lib/meta";

export function Marketing() {
  const path = usePathname();
  const [visible, setVisible] = useState(false);
  const lastPage = useRef("");
  useEffect(() => {
    function sync() {
      let choice: string | null = null;
      try {
        choice = localStorage.getItem(MARKETING_CHOICE);
      } catch {}
      setVisible(!choice);
      if (choice === "allow" && publicStorePath(path)) {
        if (lastPage.current !== path) {
          metaEvent("PageView");
          lastPage.current = path;
        }
      } else {
        window.fbq?.("consent", "revoke");
        lastPage.current = "";
      }
    }
    const open = () => setVisible(true);
    const contact = (event: MouseEvent) => {
      const link =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (link?.getAttribute("href")?.startsWith("https://wa.me/"))
        metaEvent("Contact", { content_category: "WhatsApp" });
    };
    sync();
    window.addEventListener("dearelle-privacy", open);
    window.addEventListener("storage", sync);
    document.addEventListener("click", contact);
    return () => {
      window.removeEventListener("dearelle-privacy", open);
      window.removeEventListener("storage", sync);
      document.removeEventListener("click", contact);
    };
  }, [path]);
  function choose(choice: "allow" | "decline") {
    try {
      localStorage.setItem(MARKETING_CHOICE, choice);
    } catch {}
    setVisible(false);
    if (choice === "allow") {
      metaEvent("PageView");
      lastPage.current = path;
      window.dispatchEvent(new Event("dearelle-marketing-allowed"));
    } else {
      window.fbq?.("consent", "revoke");
      lastPage.current = "";
    }
  }
  if (!visible || !publicStorePath(path)) return null;
  return (
    <aside className="marketing-choice" aria-label="Optional marketing cookies">
      <div>
        <strong>Your privacy, your choice.</strong>
        <p>
          Allow Meta cookies to help us measure shopping activity and improve
          our ads. Shopping works with either choice.{" "}
          <Link href="/privacy">Privacy policy</Link>
        </p>
      </div>
      <div className="marketing-actions">
        <button type="button" onClick={() => choose("decline")}>
          Decline
        </button>
        <button type="button" onClick={() => choose("allow")}>
          Allow marketing
        </button>
      </div>
    </aside>
  );
}
