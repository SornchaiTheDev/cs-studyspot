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
    ],
    // Allow unoptimized images to bypass Next.js image optimization
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXT_PUBLIC_IS_PROXIED: process.env.NEXT_PUBLIC_IS_PROXIED,
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
