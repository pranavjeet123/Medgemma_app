/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@gradio/client"],
  },
};

export default nextConfig;
