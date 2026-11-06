import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Photos live in src/assets/photos; Next.js serves them resized for each screen.
    // WebP encodes many times faster than AVIF on the first request, at a similar size.
    formats: ["image/webp"],
    qualities: [70, 75],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
