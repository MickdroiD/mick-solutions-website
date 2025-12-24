/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "baserow.mick-solutions.ch",
      },
      {
        protocol: "https",
        hostname: "**.mick-solutions.ch",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Autoriser les images locales uploadées
    unoptimized: false,
  },
};

export default nextConfig;
