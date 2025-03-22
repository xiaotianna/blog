import type { NextConfig } from "next";
const isGithubActions = process.env.GITHUB_ACTIONS || false
let assetPrefix = ''
let basePath = ''

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, '') || ''
  if (repo) {
    assetPrefix = `/${repo}/`
    basePath = `/${repo}`
  } else {
    assetPrefix = ''
    basePath = ''
  }
}

const nextConfig: NextConfig = {
  assetPrefix: assetPrefix,
  basePath: basePath,
};

export default nextConfig;
