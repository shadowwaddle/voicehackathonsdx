import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Daytona preview URLs proxy to the dev server from another origin.
  allowedDevOrigins: ["*.proxy.daytona.works", "*.daytona.app"],
};

export default nextConfig;
