"use client";

import Image from "next/image";
import { shouldAutoplayFilm } from "@/lib/hero-policy";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const regionRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const region = regionRef.current;
    if (!video || !region) return;
    const mobile = window.matchMedia("(max-width: 640px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection })
      .connection;
    const conservative = () =>
      !shouldAutoplayFilm({
        reducedMotion: reduced.matches,
        saveData: connection?.saveData,
        effectiveType: connection?.effectiveType,
      });
    let wantsPlayback = !conservative();
    let visible = true;
    let disposed = false;
    const sync = () => {
      const format = mobile.matches ? "mobile" : "desktop";
      const src = `/videos/dearelle-hero-${format}.mp4`;
      video.poster = `/videos/dearelle-hero-${format}.webp`;
      if (video.getAttribute("src") && video.getAttribute("src") !== src) {
        video.removeAttribute("src");
        video.load();
      }
      if (!visible || document.hidden || !wantsPlayback) {
        video.pause();
        return;
      }
      if (video.getAttribute("src") !== src) {
        video.src = src;
        video.load();
      }
      video.muted = true;
      void video.play().catch(() => {
        if (!disposed) setPlaying(false);
      });
    };
    const preferenceChange = () => {
      wantsPlayback = !conservative();
      sync();
    };
    toggleRef.current = () => {
      wantsPlayback = video.paused;
      sync();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(region);
    mobile.addEventListener("change", sync);
    reduced.addEventListener("change", preferenceChange);
    connection?.addEventListener("change", preferenceChange);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      observer.disconnect();
      mobile.removeEventListener("change", sync);
      reduced.removeEventListener("change", preferenceChange);
      connection?.removeEventListener("change", preferenceChange);
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);

  return (
    <section
      className="cinematic-hero"
      ref={regionRef}
      aria-labelledby="campaign-title"
    >
      <h1 id="campaign-title" className="sr-only">
        Dearelle watches and handbags
      </h1>
      <div className="campaign-film">
        <picture className="campaign-poster">
          <source
            media="(max-width: 640px)"
            srcSet="/videos/dearelle-hero-mobile.webp"
          />
          <Image
            src="/videos/dearelle-hero-desktop.webp"
            alt="Concept fashion film: an adult South Asian woman in ivory tailoring with an unbranded chocolate handbag and gold watch."
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        <video
          ref={videoRef}
          className={failed ? "campaign-video unavailable" : "campaign-video"}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label="The Dearelle Edit. Silent AI concept fashion film featuring fictional accessories."
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        >
          Your browser can display the campaign still above.
        </video>
        {!failed && (
          <button
            className="campaign-pause"
            onClick={() => toggleRef.current()}
            aria-label={playing ? "Pause campaign film" : "Play campaign film"}
            aria-pressed={playing}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            <span>{playing ? "Pause" : "Play"}</span>
          </button>
        )}
      </div>
      <div className="campaign-caption">
        <Link href="/new-arrivals">
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
