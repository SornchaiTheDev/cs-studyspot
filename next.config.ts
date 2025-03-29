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
  rewrites: async () => {
    if (process.env.IS_PROXIED === "true") {
      return [
        {
          source: "/api/v1/:path*",
          destination: `/api/proxy/v1/:path*`,
        },
      ];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_URL}/v1/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
