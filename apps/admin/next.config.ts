import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ['designation-forbes-webcams-accepting.trycloudflare.com'],
  // ... остальные настройки
};

export default nextConfig;
