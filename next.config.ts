import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      ...["/api/:path*", "/orders/:path*", "/admin/:path*"].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      })),
      ...["mobile", "desktop"].flatMap((format) =>
        ["v2", "v3", "v4"].flatMap((version) =>
          ["mp4", "webp", "jpg"].map((extension) => ({
            source: `/videos/dearelle-hero-${format}-${version}.${extension}`,
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
            ],
          })),
        ),
      ),
      ...["editorial", "everyday"].map((font) => ({
        source: `/fonts/${font}.woff2`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      })),
    ];
  },
};
export default config;
