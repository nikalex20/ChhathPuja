import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode for safer React patterns
  reactStrictMode: true,
  // Output standalone for clean production builds
  output: "standalone",
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
