import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { shouldAutoplayFilm } from "../lib/hero-policy";
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
    const bytes = readFileSync(`public/videos/dearelle-hero-${format}.mp4`);
    assert.ok(
      bytes.length < 5_000_000,
      `${format} payload must stay below 5 MB`,
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
      readFileSync(`public/videos/dearelle-hero-${format}.webp`).length <
        300_000,
    );
  }
});
