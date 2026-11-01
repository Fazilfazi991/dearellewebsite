import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { shouldAutoplayFilm } from "../lib/hero-policy";
import { runInNewContext } from "node:vm";
import { HERO_BOOTSTRAP } from "../lib/hero-bootstrap";
test("film preserves user motion and network preferences", () => {
  assert.equal(shouldAutoplayFilm({ reducedMotion: true }), false);
  assert.equal(
    shouldAutoplayFilm({ reducedMotion: false, saveData: true }),
    false,
  );
  assert.equal(
    shouldAutoplayFilm({ reducedMotion: false, effectiveType: "slow-2g" }),
    false,
  );
  assert.equal(
    shouldAutoplayFilm({ reducedMotion: false, effectiveType: "2g" }),
    false,
  );
  assert.equal(
    shouldAutoplayFilm({ reducedMotion: false, effectiveType: "4g" }),
    true,
  );
  assert.equal(shouldAutoplayFilm({ reducedMotion: false }), true);
});
test("both hero MP4s exist with fast-start metadata and bounded payloads", () => {
  for (const format of ["mobile", "desktop"]) {
    const bytes = readFileSync(`public/videos/dearelle-hero-${format}-v3.mp4`);
    assert.ok(
      bytes.length < (format === "mobile" ? 2_500_000 : 4_000_000),
      `${format} payload must stay within the mobile-first delivery budget`,
    );
    const boxes: string[] = [];
    for (let offset = 0; offset + 8 <= bytes.length;) {
      const size = bytes.readUInt32BE(offset);
      boxes.push(bytes.toString("ascii", offset + 4, offset + 8));
      if (size < 8) break;
      offset += size;
    }
    assert.ok(boxes.includes("moov") && boxes.includes("mdat"));
    assert.ok(
      boxes.indexOf("moov") < boxes.indexOf("mdat"),
      "moov must precede media for fast start",
    );
    assert.ok(
      readFileSync(`public/videos/dearelle-hero-${format}-v3.webp`).length <
        150_000,
    );
  }
});

function bootstrap(
  options: {
    mobile?: boolean;
    reduced?: boolean;
    saveData?: boolean;
    effectiveType?: string;
    rejectPlay?: boolean;
  } = {},
) {
  const events: Record<string, () => void> = {};
  let frame: (() => void) | undefined;
  const requests: string[] = [];
  const video = {
    dataset: {
      mobileSrc: "mobile.mp4",
      desktopSrc: "desktop.mp4",
      mobilePoster: "mobile.webp",
      desktopPoster: "desktop.webp",
    } as Record<string, string>,
    poster: "",
    muted: false,
    readyState: 0,
    error: null as null | Error,
    set src(value: string) {
      requests.push(value);
    },
    addEventListener(name: string, handler: () => void) {
      events[name] = handler;
    },
    requestVideoFrameCallback(callback: () => void) {
      frame = callback;
    },
    play() {
      return options.rejectPlay
        ? Promise.reject(new Error("autoplay blocked"))
        : Promise.resolve();
    },
  };
  runInNewContext(HERO_BOOTSTRAP, {
    document: { getElementById: () => video },
    navigator: {
      connection: {
        saveData: options.saveData,
        effectiveType: options.effectiveType,
      },
    },
    matchMedia: (query: string) => ({
      matches: query.includes("reduced-motion")
        ? !!options.reduced
        : !!options.mobile,
    }),
  });
  return { video, requests, events, firstFrame: () => frame?.() };
}

test("parser startup requests only the matching variant before hydration", () => {
  const mobile = bootstrap({ mobile: true });
  assert.deepEqual(mobile.requests, ["mobile.mp4"]);
  assert.equal(mobile.video.poster, "mobile.webp");
  assert.equal(mobile.video.muted, true);
  assert.deepEqual(bootstrap().requests, ["desktop.mp4"]);
  for (const preference of [
    { reduced: true },
    { saveData: true },
    { effectiveType: "2g" },
    { effectiveType: "slow-2g" },
  ]) {
    const result = bootstrap(preference);
    assert.deepEqual(result.requests, []);
    assert.equal(result.video.poster, "desktop.webp");
  }
});

test("poster remains the visible layer until a decoded frame, including failure", async () => {
  const result = bootstrap({ rejectPlay: true });
  await Promise.resolve();
  assert.equal(result.video.dataset.ready, undefined);
  result.video.readyState = 2;
  result.events.playing();
  assert.equal(result.video.dataset.ready, undefined);
  result.firstFrame();
  assert.equal(result.video.dataset.ready, "true");
  result.video.error = new Error("network error");
  result.events.error();
  assert.equal(result.video.dataset.ready, "false");
});
