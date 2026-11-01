import { spawnSync } from "node:child_process";
import { statSync, writeFileSync } from "node:fs";

// New Flow take; leave the approved prior masters and delivery files intact.
const source = "media/hero/source/accessories-v3.mp4";
function run(args) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-threads",
      "2",
      "-filter_complex_threads",
      "2",
      ...args,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error("Hero render failed");
}
const report = {};
for (const format of ["mobile", "desktop"]) {
  const stem = `public/videos/dearelle-hero-${format}-v3`;
  const framing =
    format === "mobile"
      ? "crop=ih/1.05:ih:(iw-ow)/2-70:0,scale=720:756"
      : "scale=1280:720";
  // Blend the tail into the first 0.3 seconds, then resume at that exact frame.
  // The 5.5-second result loops without a freeze or a hard camera jump.
  const filter = `[0:v]trim=start=0:duration=7.83,setpts=(PTS-STARTPTS)/1.35,fps=24,${framing},setsar=1,format=yuv420p,split=2[a][b];[a]trim=start=0.3,setpts=PTS-STARTPTS[body];[b]trim=end=0.3,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=0.3:offset=5.2[out]`;
  run([
    "-i",
    source,
    "-filter_complex",
    filter,
    "-map",
    "[out]",
    "-t",
    "5.5",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "22",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-g",
    "48",
    "-movflags",
    "+faststart",
    `${stem}.mp4`,
  ]);
  run([
    "-i",
    `${stem}.mp4`,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "80",
    `${stem}.webp`,
  ]);
  run(["-i", `${stem}.mp4`, "-frames:v", "1", "-q:v", "2", `${stem}.jpg`]);
  report[format] = Object.fromEntries(
    ["mp4", "webp", "jpg"].map((ext) => [ext, statSync(`${stem}.${ext}`).size]),
  );
}
writeFileSync(
  "media/hero/accessories-v3-assets.json",
  JSON.stringify({ duration: 5.5, audio: false, ...report }, null, 2) + "\n",
);
