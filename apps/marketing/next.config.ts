import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  // Configuration pour les assets statiques
  images: {
    unoptimized: false,
  },
  // Configuration pour le monorepo
  transpilePackages: [],
};

export default nextConfig;
