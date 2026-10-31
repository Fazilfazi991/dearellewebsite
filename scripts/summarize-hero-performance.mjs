import { readFileSync, writeFileSync } from "node:fs";
const folder = ".impeccable/review/performance";
const samples = [];
for (const network of ["fast4g", "slow4g"])
  for (const phase of ["before", "after"])
    for (const cache of ["cold", "warm"]) {
      const d = JSON.parse(
        readFileSync(`${folder}/final-${phase}-${network}-${cache}.json`),
      );
      samples.push({
        phase,
        network,
        cache,
        navigation: d.navigation.type,
        posterReadyMs: d.posterReady,
        lcpMs: d.lcp?.time,
        firstFrameMs: d.firstFrame,
        cls: d.cls,
        resourceTransferBytes: d.resources.reduce(
          (sum, r) => sum + r.transferSize,
          0,
        ),
        waterfall: d.resources.map((r) => ({
          url: r.name,
          startMs: r.startTime,
          responseMs: r.responseStart,
          endMs: r.responseEnd,
          transferBytes: r.transferSize,
          cache: r.deliveryType,
          status: r.responseStatus,
        })),
      });
    }
writeFileSync(
  "media/hero/performance-results.json",
  JSON.stringify(
    {
      date: "2026-10-31",
      conditions: {
        browser:
          "Chromium in Codex in-app browser on Windows, mobile viewport 390x844",
        cpu: "unthrottled",
        transport:
          "local HTTP/1.1, identity encoding, fair aggregate bandwidth proxy; not native DevTools or physical mobile tests",
        fast4g: { downloadMbps: 9, latencyMs: 60 },
        slow4g: { downloadMbps: 1.6, latencyMs: 150 },
        baseline: "isolated production build of commit 1f27c47, port 3006",
        after: "optimized production build, port 3001",
        sampleCount:
          "one observed cold and warm run per condition; cold uses a fresh origin",
        limitations:
          "Local proxy timing excludes public internet/CDN/TLS conditions and CPU throttling. Warm media Resource Timing transfer sizes can include cached range validation; do not treat them as billing-level byte counts.",
      },
      samples,
    },
    null,
    2,
  ) + "\n",
);
