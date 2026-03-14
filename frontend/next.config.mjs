/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings won't fail the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors won't fail the build
    ignoreBuildErrors: true,
  },
  output: 'standalone',
};

export default nextConfig;
