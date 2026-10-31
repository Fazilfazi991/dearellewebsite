import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
process.chdir(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
);
for (const p of ["public/videos", "media/hero/masters", "media/hero/review"])
  mkdirSync(p, { recursive: true });
function run(args) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-nostdin",
      "-threads",
      "2",
      "-filter_complex_threads",
      "2",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      ...args,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error("FFmpeg render failed");
}
for (const s of ["arrival", "detail", "signature"])
  if (!existsSync(`media/hero/source/${s}.mp4`))
    throw new Error(`Missing actual ${s} MP4`);
for (const format of ["mobile", "desktop"]) {
  const portrait = format === "mobile";
  const normal = portrait ? "scale=-2:1280,crop=720:1280" : "scale=1280:720";
  const signatureNormal = portrait
    ? "scale=-2:1280,crop=720:1280:'min(iw-ow,max(0,iw*0.61-ow/2))':0"
    : normal;
  const finish = "fps=24,setsar=1,settb=AVTB,format=yuv420p";
  const opening = portrait ? "arrival" : "signature";
  const closeStart = portrait ? 0 : 4.5;
  const graph = `[0:v]split=2[a][l];[a]trim=start=0:end=3,setpts=PTS-STARTPTS,${normal},${finish}[a1];[1:v]trim=start=1:end=3.8,setpts=PTS-STARTPTS,${normal},${finish}[b1];[2:v]trim=start=${closeStart}:end=${closeStart + 3},setpts=PTS-STARTPTS,${signatureNormal},${finish}[c1];[l]trim=start=0:end=0.041667,setpts=PTS-STARTPTS,${normal},${finish},tpad=stop_mode=clone:stop_duration=0.5[l1];[a1][b1]xfade=transition=fade:duration=0.2:offset=2.8[ab];[ab][c1]xfade=transition=fade:duration=0.2:offset=5.4[abc];[abc][l1]xfade=transition=fade:duration=0.4:offset=8.0[out]`;
  const master = `media/hero/masters/dearelle-hero-${format}-master.mp4`;
  run([
    "-i",
    `media/hero/source/${opening}.mp4`,
    "-i",
    "media/hero/source/detail.mp4",
    "-i",
    "media/hero/source/signature.mp4",
    "-filter_complex",
    graph,
    "-map",
    "[out]",
    "-t",
    "8.4",
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-threads",
    "2",
    "-movflags",
    "+faststart",
    master,
  ]);
  run([
    "-i",
    master,
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
    "-threads",
    "2",
    "-maxrate",
    portrait ? "1600k" : "2400k",
    "-bufsize",
    "4M",
    "-movflags",
    "+faststart",
    `public/videos/dearelle-hero-${format}.mp4`,
  ]);
  run([
    "-i",
    master,
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
    master,
    "-vf",
    `fps=2,scale=${portrait ? 180 : 320}:-1,tile=6x3`,
    "-frames:v",
    "1",
    `media/hero/review/${format}-contact.jpg`,
  ]);
}
const report = {
  concept: true,
  duration: 8.4,
  sourceTakes: 3,
  creditsUsed: 50,
  creditBudget: 50,
  paidPurchases: 0,
  desktopTreatment:
    "Full-frame landscape edit from the landscape signature and watch-detail takes; no stretched portrait footage",
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
