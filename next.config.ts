import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/karthik-portfolio" : "";

const nextConfig: NextConfig = {
  ...(isGithubPages && {
    output: "export",
    basePath,
    trailingSlash: true,
  }),
  images: {
    unoptimized: isGithubPages,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DEPLOY_TARGET: isGithubPages ? "github-pages" : "vercel",
  },
};

export default nextConfig;
