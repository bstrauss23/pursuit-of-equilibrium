import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [256, 320, 420, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
    qualities: [30, 35, 40, 45, 50, 58, 60, 65, 70, 72, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "dweb.link",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.transientlabs.xyz",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
