import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "minio-s3",
      },
      {
        hostname: "minio-S3",
      },
      {
        hostname: "s3.sornchaithedev.com",
      },
    ],
    // Allow unoptimized images to bypass Next.js image optimization
    unoptimized: process.env.NODE_ENV === "development",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
