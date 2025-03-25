import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_IS_PROXIED: process.env.NEXT_PUBLIC_IS_PROXIED,
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
