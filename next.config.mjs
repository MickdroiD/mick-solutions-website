/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "baserow.mick-solutions.ch",
      },
    ],
  },
};

export default nextConfig;
