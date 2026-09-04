import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Required for standard Cloudflare Pages static hosting
  images: {
    unoptimized: true, // We already use Cloudinary for optimization; this prevents Next.js Node server errors
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
