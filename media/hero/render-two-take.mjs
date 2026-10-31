import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
process.chdir(root);
for (const p of ["public/videos", "media/hero/masters", "media/hero/review"])
  mkdirSync(p, { recursive: true });
function run(args) {
  const r = spawnSync(
    "ffmpeg",
    ["-nostdin", "-threads", "2", "-filter_complex_threads", "2", "-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("FFmpeg render failed");
}
for (const source of ["arrival", "detail"])
  if (!existsSync(`media/hero/source/${source}.mp4`))
    throw new Error(`Missing actual ${source} MP4`);
// Two actual generated takes; three editorial sections plus a brief return to the opening still.
const filter =
  "[0:v]split=3[a][c][l];[a]trim=start=0:end=3,setpts=PTS-STARTPTS,fps=24,scale=720:1280,setsar=1,format=yuv420p[a1];[1:v]trim=start=1:end=3.8,setpts=PTS-STARTPTS,fps=24,scale=-2:1280,crop=720:1280,setsar=1,format=yuv420p[b1];[c]trim=start=4.5:end=7.5,setpts=PTS-STARTPTS,fps=24,scale=720:1280,setsar=1,format=yuv420p[c1];[l]trim=start=0:end=0.041667,setpts=PTS-STARTPTS,fps=24,scale=720:1280,tpad=stop_mode=clone:stop_duration=0.5,setsar=1,format=yuv420p[l1];[a1][b1]xfade=transition=fade:duration=0.2:offset=2.8[ab];[ab][c1]xfade=transition=fade:duration=0.2:offset=5.4[abc];[abc][l1]xfade=transition=fade:duration=0.4:offset=8.0[out]";
run([
  "-i",
  "media/hero/source/arrival.mp4",
  "-i",
  "media/hero/source/detail.mp4",
  "-filter_complex",
  filter,
  "-map",
  "[out]",
  "-t",
  "8.4",
  "-an",
  "-c:v",
  "libx264",
  "-crf",
  "18",
  "-preset",
  "medium",
  "-movflags",
  "+faststart",
  "media/hero/masters/dearelle-hero-mobile-master.mp4",
]);
run([
  "-i",
  "media/hero/masters/dearelle-hero-mobile-master.mp4",
  "-filter_complex",
  "[0:v]split=2[full][detail];[full]scale=406:720,setsar=1[portrait];[detail]crop=720:600:0:560,scale=864:720,setsar=1,pad=874:720:0:0:color=0xFCF9F6[macro];[macro][portrait]hstack=inputs=2[out]",
  "-map",
  "[out]",
  "-an",
  "-c:v",
  "libx264",
  "-crf",
  "18",
  "-preset",
  "medium",
  "-movflags",
  "+faststart",
  "media/hero/masters/dearelle-hero-desktop-master.mp4",
]);
for (const format of ["mobile", "desktop"]) {
  const input = `media/hero/masters/dearelle-hero-${format}-master.mp4`;
  run([
    "-i",
    input,
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "high",
    "-crf",
    "24",
    "-preset",
    "medium",
    "-maxrate",
    format === "mobile" ? "1600k" : "2400k",
    "-bufsize",
    "4M",
    "-movflags",
    "+faststart",
    `public/videos/dearelle-hero-${format}.mp4`,
  ]);
  run([
    "-i",
    input,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "85",
    `public/videos/dearelle-hero-${format}.webp`,
  ]);
  run([
    "-i",
    input,
    "-vf",
    `fps=2,scale=${format === "mobile" ? 180 : 320}:-1,tile=6x3`,
    "-frames:v",
    "1",
    `media/hero/review/${format}-contact.jpg`,
  ]);
}
const report = {
  concept: true,
  duration: 8.4,
  sourceTakes: 2,
  creditBudget: 50,
  paidPurchases: 0,
  desktopTreatment:
    "Editorial diptych: macro crop plus undistorted portrait from the same real footage",
  assets: Object.fromEntries(
    ["mobile", "desktop"].map((f) => [
      f,
      {
        mp4Bytes: statSync(`public/videos/dearelle-hero-${f}.mp4`).size,
        posterBytes: statSync(`public/videos/dearelle-hero-${f}.webp`).size,
      },
    ]),
  ),
};
writeFileSync("media/hero/render-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

