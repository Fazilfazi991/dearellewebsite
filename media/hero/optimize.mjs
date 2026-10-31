import { spawnSync } from "node:child_process";
import { statSync, writeFileSync } from "node:fs";

// Delivery derivatives only: no trim, reframe, colour filter, or creative edit.
function ffmpeg(args) {
  const result = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], {
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error("FFmpeg failed");
}
const report = {};
for (const format of ["mobile", "desktop"]) {
  const stem = `public/videos/dearelle-hero-${format}-v2`;
  ffmpeg([
    "-i",
    `media/hero/masters/dearelle-hero-${format}-master.mp4`,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "25",
    "-profile:v",
    "high",
    "-level",
    "3.1",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "24",
    "-g",
    "48",
    "-keyint_min",
    "24",
    "-bf",
    "2",
    "-maxrate",
    format === "mobile" ? "1600k" : "2200k",
    "-bufsize",
    format === "mobile" ? "1600k" : "2200k",
    "-movflags",
    "+faststart",
    `${stem}.mp4`,
  ]);
  ffmpeg([
    "-i",
    `${stem}.mp4`,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "88",
    `${stem}.webp`,
  ]);
  ffmpeg(["-i", `${stem}.mp4`, "-frames:v", "1", "-q:v", "3", `${stem}.jpg`]);
  report[format] = Object.fromEntries(
    ["mp4", "webp", "jpg"].map((ext) => [ext, statSync(`${stem}.${ext}`).size]),
  );
}
writeFileSync(
  "media/hero/optimized-assets.json",
  JSON.stringify(report, null, 2) + "\n",
);
