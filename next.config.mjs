/** @type {import('next').NextConfig} */
const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === 'true';
const repo = 'fullstack-saas-analytics';

const nextConfig = {
  reactStrictMode: true,
  // When building the GitHub Pages demo we produce a fully static export.
  // The dashboard then reads from a bundled mock dataset (no server needed).
  ...(isStaticDemo
    ? {
        output: 'export',
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
