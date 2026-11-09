import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Daytona preview URLs proxy to the dev server from another origin.
  allowedDevOrigins: ["*.proxy.daytona.works", "*.daytona.app"],
  // Daytona sandboxes report the host's CPU count; one worker avoids OOM kills in next build.
  experimental: { cpus: 1 },
  // GitHub Pages build: plain files under a sub-path, with app/api left out.
  ...(process.env.NEXT_PUBLIC_STATIC_SITE === "1"
    ? { output: "export" as const, trailingSlash: true, basePath: process.env.NEXT_PUBLIC_BASE_PATH }
    : {}),
};

export default nextConfig;
