import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the default Next.js badge so it does not sit on the mobile nav.
  // Compile and runtime errors still surface in the terminal and overlay.
  devIndicators: false,
};

export default nextConfig;
