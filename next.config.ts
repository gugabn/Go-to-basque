import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// This app lives inside another repo (chefbook-nextjs) that has its own
// lockfile, so pin Turbopack's root to this directory — otherwise Next infers
// the parent as the workspace root.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
