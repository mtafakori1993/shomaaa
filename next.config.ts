import type { NextConfig } from "next";

const WP = process.env.WORDPRESS_URL ?? "http://localhost:8089";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [96, 160, 240, 320],
    qualities: [60, 75, 82],
    minimumCacheTTL: 86400,
  },
  // Product images live in the WooCommerce media library; serve them same-origin through the storefront.
  async rewrites() {
    return [{ source: "/wp-content/uploads/:path*", destination: `${WP}/wp-content/uploads/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
