import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Daytona preview URLs proxy to the dev server from another origin.
  allowedDevOrigins: ["*.proxy.daytona.works", "*.daytona.app"],
  // Daytona sandboxes report the host's CPU count; one worker avoids OOM kills in next build.
  experimental: { cpus: 1 },
};

export default nextConfig;
