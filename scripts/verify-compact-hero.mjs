// Local, isolated browser verification. Never connects to the owner's Chrome profile.
import { createRequire } from "node:module";
import * as fs from "node:fs";
import * as path from "node:path";
const runtimeRequire = createRequire(import.meta.url);
const { chromium } = await import(runtimeRequire.resolve("playwright"));
(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log("Isolated browser ready");
  const out = path.resolve(".impeccable/review/hero-v3");
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  for (const width of [360, 375, 390, 414, 1440]) {
    console.log(`Checking ${width}px`);
    const context = await browser.newContext({
      viewport: { width, height: width === 1440 ? 1000 : 812 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3183/", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    const video = page.locator("#campaign-video");
    await page.waitForFunction(
      () => document.querySelector("video").readyState >= 2,
      { timeout: 30000 },
    );
    await page.getByRole("button", { name: "Pause campaign film" }).click();
    await page.getByRole("button", { name: "Play campaign film" }).waitFor();
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".sculpted-image img")]
        .filter((i) => i.getBoundingClientRect().top < innerHeight)
        .every(
          (i) =>
            i.complete &&
            i.naturalWidth > 1 &&
            !i.currentSrc.startsWith("data:"),
        ),
    );
    await page.evaluate(() => document.fonts.ready);
    await video.evaluate((v) => {
      v.currentTime = 2;
    });
    await page.waitForFunction(
      () => {
        const v = document.querySelector("video");
        return !v.seeking && Math.abs(v.currentTime - 2) < 0.15;
      },
      { timeout: 30000 },
    );
    const metrics = await page.evaluate(() => {
      const v = document.querySelector("video");
      const film = document
        .querySelector(".campaign-film")
        .getBoundingClientRect();
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        filmWidth: film.width,
        filmHeight: film.height,
        duration: v.duration,
        source: v.currentSrc,
        ready: v.dataset.ready,
        muted: v.muted,
        link: document
          .querySelector(".campaign-caption a")
          .getAttribute("href"),
      };
    });
    if (
      metrics.scrollWidth > width ||
      metrics.duration > 6 ||
      metrics.link !== "/new-arrivals"
    )
      throw new Error(JSON.stringify(metrics));
    await page.screenshot({
      path: path.join(out, `homepage-${width}.jpg`),
      fullPage: false,
      quality: 90,
    });
    await page.getByRole("button", { name: "Play campaign film" }).click();
    await page.waitForFunction(() => !document.querySelector("video").paused);
    await page.getByRole("button", { name: "Pause campaign film" }).click();
    results.push({ ...metrics, playbackControl: true });
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3183/", { waitUntil: "domcontentloaded" });
  await page.locator(".campaign-poster img").evaluate(async (i) => {
    if (!i.complete) await i.decode();
  });
  const reduced = await page
    .locator("video")
    .evaluate((v) => ({ source: v.currentSrc, paused: v.paused }));
  if (reduced.source || !reduced.paused)
    throw new Error("Reduced motion loaded the film automatically");
  await page.screenshot({
    path: path.join(out, "reduced-motion-375.jpg"),
    quality: 90,
  });
  fs.writeFileSync(
    path.join(out, "checks.json"),
    JSON.stringify({ viewports: results, reducedMotion: reduced }, null, 2),
  );
  console.log(JSON.stringify({ viewports: results, reducedMotion: reduced }));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
