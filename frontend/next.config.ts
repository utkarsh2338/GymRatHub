import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles all dependencies for self-contained Docker image
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      // Cloudinary CDN for progress photos
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
